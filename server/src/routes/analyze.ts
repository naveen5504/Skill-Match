import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';

import { extractTextFromPDF } from '../services/pdfService';
import { analyzeResumesWithRAG } from '../services/ragService';

export const analyzeRouter = Router();

const storage = multer.memoryStorage();

const pdfFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are accepted.'));
  }
};

const upload = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per file
});

// Helper: delete files after processing to keep uploads/ clean (No-op for memory storage)
const cleanUp = (_files: Express.Multer.File[]) => {
  // Files are kept in memory and garbage-collected automatically
};

// ── POST /api/upload-jd ───────────────────────────────────────────────────────
/**
 * Accepts a JSON body { jdText: string } OR a single PDF file upload.
 * Returns: { jdText: string }
 */
analyzeRouter.post(
  '/upload-jd',
  upload.single('jdFile'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let jdText = '';

      if (req.file) {
        // PDF upload path
        const buffer = req.file.buffer;
        jdText = await extractTextFromPDF(buffer);
        cleanUp([req.file]);
      } else if (req.body?.jdText) {
        // Plain text path
        jdText = req.body.jdText as string;
      } else {
        res.status(400).json({ error: 'Provide either a jdFile (PDF) or jdText in the request body.' });
        return;
      }

      if (!jdText.trim()) {
        res.status(422).json({ error: 'Could not extract text from the JD. Please check the file.' });
        return;
      }

      res.json({ jdText });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/upload-resumes ──────────────────────────────────────────────────
/**
 * Accepts up to 20 PDF files (field name: "resumes").
 * Extracts text from each and returns: { resumes: [{ fileName, textLength }] }
 * Actual text is returned only in /api/analyze.
 */
analyzeRouter.post(
  '/upload-resumes',
  upload.array('resumes', 20),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No resume files uploaded.' });
        return;
      }

      const summaries = await Promise.all(
        files.map(async (f) => {
          const buffer = f.buffer;
          const text = await extractTextFromPDF(buffer);
          return { fileName: f.originalname, textLength: text.length };
        })
      );

      cleanUp(files);
      res.json({ resumes: summaries, count: files.length });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST /api/analyze ─────────────────────────────────────────────────────────
/**
 * Main analysis endpoint.
 * Accepts: multipart/form-data with:
 *   - jdText (text field) OR jdFile (PDF field)
 *   - resumes[] (multiple PDF files)
 *
 * Returns: { candidates: CandidateAnalysis[] } sorted by matchScore descending.
 */
analyzeRouter.post(
  '/analyze',
  upload.fields([
    { name: 'jdFile', maxCount: 1 },
    { name: 'resumes', maxCount: 20 },
  ]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const uploadedFiles: Express.Multer.File[] = [];

    try {
      const fields = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

      // ── 1. Extract JD text ─────────────────────────────────────────────────
      let jdText: string = req.body?.jdText || '';

      if (fields?.jdFile?.[0]) {
        const jdFile = fields.jdFile[0];
        uploadedFiles.push(jdFile);
        const buffer = jdFile.buffer;
        jdText = await extractTextFromPDF(buffer);
      }

      if (!jdText.trim()) {
        res.status(400).json({ error: 'Job description is required (jdText or jdFile).' });
        return;
      }

      // ── 2. Extract resume texts ────────────────────────────────────────────
      const resumeFiles = fields?.resumes || [];
      if (resumeFiles.length === 0) {
        res.status(400).json({ error: 'At least one resume file is required.' });
        return;
      }
      uploadedFiles.push(...resumeFiles);

      const resumes = await Promise.all(
        resumeFiles.map(async (f) => {
          const buffer = f.buffer;
          const text = await extractTextFromPDF(buffer);
          return { fileName: f.originalname, text };
        })
      );

      // ── 3. Analyze with RAG Pipeline (local Ollama) ─────────────────────────
      const candidates = await analyzeResumesWithRAG(jdText, resumes);

      // ── 4. Respond ────────────────────────────────────────────────────────
      res.json({ candidates, count: candidates.length });
    } catch (err) {
      next(err);
    } finally {
      // Always clean up uploaded temp files
      cleanUp(uploadedFiles);
    }
  }
);

import pdfParse from 'pdf-parse';

/**
 * Extracts plain text from a PDF buffer using pdf-parse.
 * Returns an empty string (rather than throwing) for graceful degradation.
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    // Normalise whitespace: collapse excessive newlines and spaces
    return data.text
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {2,}/g, ' ')
      .trim();
  } catch (err) {
    console.warn('⚠️  PDF parse warning:', (err as Error).message);
    return ''; // Graceful degradation – Gemini will note missing content
  }
}

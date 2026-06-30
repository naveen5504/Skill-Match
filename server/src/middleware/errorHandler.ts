import { Request, Response, NextFunction } from 'express';

/**
 * Global Express error handling middleware.
 * Catches any errors passed via next(err) and returns a clean JSON response.
 */
export const errorHandler = (
  err: Error & { status?: number },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('❌ Error:', err.message);

  const status = err.status || 500;
  const message = err.message || 'An unexpected error occurred';

  // Handle Ollama connection errors
  if (message.includes('ECONNREFUSED') || message.includes('Ollama')) {
    res.status(503).json({
      error: 'Local AI (Ollama) is not reachable. Make sure Ollama is running on your machine.',
    });
    return;
  }

  // Handle PDF parse errors
  if (message.includes('pdf') || message.includes('PDF')) {
    res.status(422).json({
      error: 'Could not parse one or more PDF files. Ensure files are valid PDFs.',
    });
    return;
  }

  res.status(status).json({ error: message });
};

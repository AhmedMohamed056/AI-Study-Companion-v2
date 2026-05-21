import pdf from 'pdf-parse/lib/pdf-parse.js';

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    if (buffer.length === 0) {
      throw new Error('Empty file');
    }

    if (buffer.length > 50 * 1024 * 1024) {
      throw new Error('File too large (max 50MB)');
    }

    const timeout = 30000; // 30 seconds
    const result = await Promise.race([
      pdf(buffer),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('PDF extraction timeout')), timeout)
      ),
    ]);

    const data = result as any;
    const text = data.text || '';

    if (text.length < 100) {
      throw new Error('This PDF appears to be scanned. Please upload a text-based PDF.');
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
    throw error;
  }
}

export function validatePDFFile(file: Express.Multer.File): void {
  if (!file) {
    throw new Error('No file provided');
  }

  if (file.mimetype !== 'application/pdf') {
    throw new Error('File must be a PDF');
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('File too large (max 50MB)');
  }
}

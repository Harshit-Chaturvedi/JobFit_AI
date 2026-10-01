import { Request, Response } from "express";
import { PDFParse } from "pdf-parse";

export async function parseResume(req: Request, res: Response): Promise<void> {
  let parser: PDFParse | null = null;

  try {
    if (!req.file) {
      res.status(400).json({ error: "No PDF file uploaded." });
      return;
    }

    parser = new PDFParse({ data: req.file.buffer });
    const textResult = await parser.getText();
    const text = textResult.text?.trim();

    if (!text || text.length === 0) {
      res.status(422).json({
        error:
          "Could not extract text from the PDF. The file may be image-based or empty.",
      });
      return;
    }

    res.status(200).json({
      text,
      pages: textResult.pages?.length ?? 0,
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error("[resumeController] PDF parse error:", error);
    res.status(500).json({
      error: "Failed to parse the PDF file. Please ensure it is a valid PDF.",
    });
  } finally {
    if (parser) {
      await parser.destroy().catch(() => {});
    }
  }
}

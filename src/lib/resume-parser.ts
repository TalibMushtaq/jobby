import "server-only";

import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import { toTitleCase } from "@/lib/utils";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function isAllowedResumeType(fileType: string) {
  return ALLOWED_MIME_TYPES.has(fileType);
}

export function deriveResumeTitle(fileName: string) {
  return toTitleCase(
    fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-]+/g, " ")
      .trim(),
  );
}

export async function extractResumeText(input: {
  fileBuffer: Buffer;
  fileType: string;
  fileName?: string;
}) {
  if (!isAllowedResumeType(input.fileType)) {
    throw new Error("Unsupported file type. Please upload PDF or DOCX resumes.");
  }

  if (input.fileType === "application/pdf") {
    const parser = new PDFParse({
      data: new Uint8Array(input.fileBuffer),
    });
    try {
      const parsed = await parser.getText();
      return parsed.text?.trim() ?? "";
    } finally {
      await parser.destroy();
    }
  }

  const parsed = await mammoth.extractRawText({
    buffer: input.fileBuffer,
  });

  return parsed.value.trim();
}

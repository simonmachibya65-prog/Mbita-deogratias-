import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  // Auth check
  const res = new NextResponse();
  const session = await getIronSession<SessionData>(request, res, sessionOptions);
  if (!session.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    let extractedText = "";
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === "text/plain") {
      extractedText = buffer.toString("utf8");
    } else if (file.type === "application/pdf") {
      // Use pdf-parse for reliable PDF text extraction
      const pdfParse = (await import("pdf-parse")).default;
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else {
      // Use mammoth for DOCX text extraction
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    }

    // Clean up extracted text
    extractedText = extractedText
      .replace(/\r\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+/g, " ")
      .trim();

    if (!extractedText) {
      return NextResponse.json(
        { error: "Could not extract text from the document. The file may be scanned/image-based or empty." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      text: extractedText,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
    });
  } catch (err) {
    console.error("Plagiarism extract error:", err);
    return NextResponse.json({ error: "Failed to process the document." }, { status: 500 });
  }
}

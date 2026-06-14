import { NextRequest, NextResponse } from "next/server";
import { storeImage } from "@/lib/images";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json({ error: "Empty file" }, { status: 400 });
    }

    if (buffer.length > 500_000) {
      return NextResponse.json(
        { error: "Image too large after compression" },
        { status: 400 }
      );
    }

    const id = await storeImage(buffer, file.type || "image/jpeg");

    return NextResponse.json({ url: `/api/images/${id}` });
  } catch (error) {
    console.error("POST /api/upload:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

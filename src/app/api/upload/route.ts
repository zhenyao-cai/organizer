import { NextRequest, NextResponse } from "next/server";
import { storeImage } from "@/lib/gridfs";
import { compressImage } from "@/lib/compress-image";
import { randomUUID } from "crypto";

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
    const raw = Buffer.from(bytes);
    const compressed = await compressImage(raw);

    const filename = `${randomUUID()}.jpg`;
    const id = await storeImage(compressed, filename, "image/jpeg");

    return NextResponse.json({ url: `/api/images/${id}` });
  } catch (error) {
    console.error("POST /api/upload:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

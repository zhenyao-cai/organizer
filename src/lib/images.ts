import { StoredImage } from "@/models/StoredImage";
import { connectDB } from "./mongodb";

function toBuffer(data: unknown): Buffer | null {
  if (!data) return null;
  if (Buffer.isBuffer(data)) return data;
  // MongoDB Binary from .lean() — Buffer.from(binary) gives 0 bytes!
  if (
    typeof data === "object" &&
    data !== null &&
    "buffer" in data &&
    (data as { buffer: ArrayBuffer }).buffer
  ) {
    return Buffer.from((data as { buffer: ArrayBuffer }).buffer);
  }
  return null;
}

export async function storeImage(
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await connectDB();
  const doc = await StoredImage.create({ data: buffer, contentType });
  return doc._id.toString();
}

export async function fetchImage(id: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  await connectDB();
  const doc = await StoredImage.findById(id).lean();
  if (!doc) return null;

  const buffer = toBuffer(doc.data);
  if (!buffer || buffer.length === 0) return null;

  return {
    buffer,
    contentType: doc.contentType || "image/jpeg",
  };
}

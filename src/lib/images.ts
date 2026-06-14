import { StoredImage } from "@/models/StoredImage";
import { connectDB } from "./mongodb";

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
  if (!doc?.data) return null;
  return {
    buffer: Buffer.from(doc.data),
    contentType: doc.contentType || "image/jpeg",
  };
}

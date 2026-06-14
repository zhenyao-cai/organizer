import mongoose from "mongoose";
import { GridFSBucket, ObjectId } from "mongodb";
import { connectDB } from "./mongodb";

function getBucket(): GridFSBucket {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database not connected");
  }
  return new GridFSBucket(db, { bucketName: "images" });
}

export async function storeImage(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await connectDB();
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      metadata: { contentType },
    });
    stream.on("error", reject);
    stream.on("finish", () => resolve(stream.id.toString()));
    stream.end(buffer);
  });
}

export async function fetchImage(id: string): Promise<{
  stream: NodeJS.ReadableStream;
  contentType: string;
} | null> {
  if (!ObjectId.isValid(id)) return null;

  await connectDB();
  const bucket = getBucket();
  const objectId = new ObjectId(id);

  const files = await bucket.find({ _id: objectId }).toArray();
  if (files.length === 0) return null;

  const contentType =
    (files[0].metadata as { contentType?: string } | undefined)?.contentType ||
    "image/jpeg";

  return {
    stream: bucket.openDownloadStream(objectId),
    contentType,
  };
}

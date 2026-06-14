/** Tiny thumbnails — hundreds of photos stay small in MongoDB. */
const MAX_SIDE = 180;
const JPEG_QUALITY = 0.22;

export async function compressImageFile(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;

  if (width > MAX_SIDE || height > MAX_SIDE) {
    const scale = MAX_SIDE / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not process image");
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Compression failed"));
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

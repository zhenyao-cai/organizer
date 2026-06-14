import sharp from "sharp";

/** Tiny, low-quality JPEG — fine for "where is this?" reference photos. */
const MAX_SIDE = 320;
const JPEG_QUALITY = 38;

export async function compressImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(MAX_SIDE, MAX_SIDE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: JPEG_QUALITY,
      mozjpeg: true,
    })
    .toBuffer();
}

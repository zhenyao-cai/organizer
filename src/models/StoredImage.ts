import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStoredImage extends Document {
  data: Buffer;
  contentType: string;
  createdAt: Date;
}

const StoredImageSchema = new Schema<IStoredImage>(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, default: "image/jpeg" },
  },
  { timestamps: true }
);

export const StoredImage: Model<IStoredImage> =
  mongoose.models.StoredImage ||
  mongoose.model<IStoredImage>("StoredImage", StoredImageSchema);

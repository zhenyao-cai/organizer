import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPlace extends Document {
  name: string;
  icon: string;
  parentId: mongoose.Types.ObjectId | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PlaceSchema = new Schema<IPlace>(
  {
    name: { type: String, required: true, trim: true },
    icon: { type: String, default: "Box" },
    parentId: { type: Schema.Types.ObjectId, ref: "Place", default: null },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

PlaceSchema.index({ parentId: 1 });
PlaceSchema.index({ name: "text" });

export const Place: Model<IPlace> =
  mongoose.models.Place || mongoose.model<IPlace>("Place", PlaceSchema);

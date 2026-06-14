import mongoose, { Schema, Document, Model } from "mongoose";

export interface IItem extends Document {
  name: string;
  description: string;
  tags: string[];
  starred: boolean;
  placeId: mongoose.Types.ObjectId;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<IItem>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    tags: { type: [String], default: [] },
    starred: { type: Boolean, default: false },
    placeId: { type: Schema.Types.ObjectId, ref: "Place", required: true },
    imageUrl: { type: String, default: null },
  },
  { timestamps: true }
);

ItemSchema.index({ placeId: 1 });
ItemSchema.index({ name: "text", description: "text", tags: "text" });
ItemSchema.index({ starred: 1 });
ItemSchema.index({ tags: 1 });

export const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  pricePerRose: number;
  bouquetPrice: number;
  originalPricePerRose: number;
  originalBouquetPrice: number;
  discount: number;
  category: string;
  image: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    pricePerRose: { type: Number, required: true },
    bouquetPrice: { type: Number, required: true },
    originalPricePerRose: { type: Number, required: true },
    originalBouquetPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    category: { type: String, required: true },
    image: { type: String, default: null },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
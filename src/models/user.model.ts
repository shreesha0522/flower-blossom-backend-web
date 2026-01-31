import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    role: {
      type: String, 
      enum: ["user", "admin"],
      default: "user"
    }
  }, 
  {
    timestamps: true
  }
);

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date,
  updatedAt: Date
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
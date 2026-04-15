import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  _id: string; // Auth0 ID or custom string
  name: string;
  email: string;
  phone?: string; // Optional phone field
  auth0Id?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: false,
      default: "",
    },
    auth0Id: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

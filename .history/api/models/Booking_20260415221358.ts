import mongoose, { Schema, Document } from "mongoose";

export interface IBooking extends Document {
  userId: string; // Auth0 user ID
  turfId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  paymentId?: string;
  paymentStatus: "pending" | "completed" | "failed";
  checkoutRequestId?: string;
  mpesaPhone?: string;
  mpesaReceiptNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: String,
      required: true,
    },
    turfId: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Time must be in HH:MM format"],
    },
    endTime: {
      type: String,
      required: true,
      match: [/^\d{2}:\d{2}$/, "Time must be in HH:MM format"],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    checkoutRequestId: {
      type: String,
      unique: true,
      sparse: true,
    },
    mpesaPhone: {
      type: String,
      match: [/^254\d{9}$/, "Must be valid M-Pesa phone format"],
    },
    mpesaReceiptNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

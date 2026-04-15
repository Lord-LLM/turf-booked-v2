import { connectToDatabase } from "../../db";
import { Booking } from "../../models/Booking";
import { Payment } from "../../models/Payment";
import { User } from "../../models/User";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, turfId, date, startTime, endTime, totalAmount, paymentId } =
    req.body;

  // Validate required fields
  if (
    !userId ||
    !turfId ||
    !date ||
    !startTime ||
    !endTime ||
    !totalAmount ||
    !paymentId
  ) {
    return res.status(400).json({
      error: "Missing required fields: userId, turfId, date, startTime, endTime, totalAmount, paymentId",
    });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify payment exists
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Create new booking
    const booking = new Booking({
      userId,
      turfId,
      date: new Date(date),
      startTime,
      endTime,
      totalAmount,
      paymentId,
    });

    await booking.save();

    // Populate references before returning
    await booking.populate("paymentId");
    await booking.populate("userId", "name email phone");

    return res.status(201).json({
      success: true,
      booking,
      message: "Booking created successfully",
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      error: "Failed to create booking",
      details: error.message,
    });
  }
}

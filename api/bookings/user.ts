import { connectToDatabase } from "../db";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { User } from "../models/User";

export default async function handler(req: any, res: any) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId } = req.query;

  // Validate userId is provided
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Find all bookings for the user and populate payment data
    const bookings = await Booking.find({ userId })
      .populate("paymentId", "mpesaReceiptNumber phoneNumber amount status")
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    // If no bookings found, return empty array
    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        success: true,
        bookings: [],
        message: "No bookings found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return res.status(500).json({
      error: "Failed to fetch bookings",
      details: error.message,
    });
  }
}

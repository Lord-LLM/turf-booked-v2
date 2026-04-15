import { connectToDatabase } from "../../../db.js";
import { Booking } from "../../../models/Booking.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { bookingId } = req.query;

  if (!bookingId) {
    return res.status(400).json({ error: "Booking ID is required" });
  }

  try {
    await connectToDatabase();

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Return the booking status (from paymentStatus field)
    return res.status(200).json({
      status: booking.paymentStatus, // pending, completed, or failed
      booking: {
        id: booking._id,
        amount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        mpesaReceiptNumber: booking.mpesaReceiptNumber,
      },
    });
  } catch (error: any) {
    console.error("Error fetching booking status:", error);
    return res.status(500).json({
      error: "Failed to fetch booking status",
      details: error.message,
    });
  }
}

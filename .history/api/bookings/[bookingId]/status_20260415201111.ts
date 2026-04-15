import { connectToDatabase } from "../../../db";
import { Booking } from "../../../models/Booking";
import { Payment } from "../../../models/Payment";

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
    const booking = await Booking.findById(bookingId).populate("paymentId");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Get payment status
    const payment = await Payment.findById(booking.paymentId);

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    // Return the payment status
    return res.status(200).json({
      status: payment.status.toLowerCase(),
      booking: {
        id: booking._id,
        amount: booking.totalAmount,
      },
      payment: {
        id: payment._id,
        status: payment.status,
        mpesaReceiptNumber: payment.mpesaReceiptNumber,
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

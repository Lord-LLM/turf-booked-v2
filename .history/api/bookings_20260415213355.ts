import { connectToDatabase } from "./db.js";
import { Booking } from "./models/Booking.js";
import { User } from "./models/User.js";

export default async function handler(req: any, res: any) {
  const { bookingId } = req.query;

  if (req.method === "GET") {
    // Get booking status or user bookings
    if (bookingId) {
      // GET /api/bookings/[bookingId]?action=status
      return await getBookingStatus(bookingId, res);
    } else {
      // GET /api/bookings?userId=xxx (get user's bookings)
      return await getUserBookings(req, res);
    }
  } else if (req.method === "POST") {
    // POST /api/bookings (create booking)
    return await createBooking(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function getBookingStatus(bookingId: string, res: any) {
  try {
    await connectToDatabase();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    return res.status(200).json({
      status: booking.paymentStatus,
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

async function getUserBookings(req: any, res: any) {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await connectToDatabase();

    const bookings = await Booking.find({ userId }).populate("paymentId");

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return res.status(500).json({
      error: "Failed to fetch bookings",
      details: error.message,
    });
  }
}

async function createBooking(req: any, res: any) {
  try {
    const { userId, turfId, date, startTime, endTime, totalAmount } = req.body;

    if (!userId || !turfId || !date || !startTime || !endTime || !totalAmount) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const booking = new Booking({
      userId,
      turfId,
      date: new Date(date),
      startTime,
      endTime,
      totalAmount,
      paymentStatus: "pending",
    });

    await booking.save();

    return res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        totalAmount: booking.totalAmount,
      },
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return res.status(500).json({
      error: "Failed to create booking",
      details: error.message,
    });
  }
}

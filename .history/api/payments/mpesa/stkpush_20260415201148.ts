import { connectToDatabase } from "../../db";
import { Booking } from "../../models/Booking";
import { Payment } from "../../models/Payment";
import { User } from "../../models/User";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    name,
    email,
    mpesaPhone,
    turfId,
    turfName,
    bookingDate,
    startTime,
    endTime,
    guests,
    totalAmount,
  } = req.body;

  // Validate required fields
  if (
    !name ||
    !email ||
    !mpesaPhone ||
    !turfId ||
    !bookingDate ||
    !startTime ||
    !endTime ||
    !totalAmount
  ) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  // Validate M-Pesa phone format
  const mpesaPhoneRegex = /^254\d{9}$/;
  if (!mpesaPhoneRegex.test(mpesaPhone)) {
    return res.status(400).json({
      error: "Invalid M-Pesa phone format. Must be 2547XXXXXXXX",
    });
  }

  try {
    await connectToDatabase();

    // Step 1: Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        phone: mpesaPhone,
      });
      await user.save();
    }

    // Step 2: Create payment record (initially Pending)
    const payment = new Payment({
      mpesaReceiptNumber: `STK-${Date.now()}`, // Temporary receipt, will be updated with actual M-Pesa receipt
      phoneNumber: mpesaPhone,
      amount: totalAmount,
      status: "Pending",
    });
    await payment.save();

    // Step 3: Create booking record
    const booking = new Booking({
      userId: user._id,
      turfId,
      date: new Date(bookingDate),
      startTime,
      endTime,
      totalAmount,
      paymentId: payment._id,
    });
    await booking.save();

    // Step 4: In a real application, here you would:
    // 1. Call M-Pesa API to initiate STK Push
    // 2. Handle the response with checkout RequestId
    // For now, we'll simulate a successful STK push initiation
    
    // Simulate M-Pesa STK Push
    console.log(`[M-Pesa STK Push] Initiating payment for ${mpesaPhone}, Amount: KSh ${totalAmount}`);

    // TODO: Integrate with actual M-Pesa API
    // const mpesaResponse = await initiateSTKPush({
    //   phoneNumber: mpesaPhone,
    //   amount: totalAmount,
    //   accountReference: `TURF-${booking._id}`,
    //   transactionDesc: `Turf Booking - ${turfName}`,
    // });

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      message: "STK Push initiated. Please check your phone.",
      booking: {
        id: booking._id,
        amount: totalAmount,
        phoneNumber: mpesaPhone,
      },
    });
  } catch (error: any) {
    console.error("Error initiating STK push:", error);
    return res.status(500).json({
      error: "Failed to initiate payment",
      details: error.message,
    });
  }
}

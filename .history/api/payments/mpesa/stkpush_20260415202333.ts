import { connectToDatabase } from "../../db";
import { Booking } from "../../models/Booking";
import { User } from "../../models/User";
import { getMpesaAccessToken, generateMpesaPassword, generateTimestamp } from "../../utils/mpesaAuth";
import "dotenv/config";

const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const NGROK_URL = process.env.NGROK_URL;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mpesaPhone, amount, turfId, userId, turfName } = req.body;

  // Validate required fields
  if (!mpesaPhone || !amount || !turfId || !userId) {
    return res.status(400).json({
      error: "Missing required fields: mpesaPhone, amount, turfId, userId",
    });
  }

  // Validate M-Pesa phone format (254XXXXXXXXX)
  const mpesaPhoneRegex = /^254\d{9}$/;
  if (!mpesaPhoneRegex.test(mpesaPhone)) {
    return res.status(400).json({
      error: "Invalid M-Pesa phone format. Must be 2547XXXXXXXX",
    });
  }

  // Validate amount
  if (amount < 1 || !Number.isInteger(amount)) {
    return res.status(400).json({
      error: "Amount must be a positive integer",
    });
  }

  try {
    // Connect to database
    await connectToDatabase();

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate timestamp and password
    const timestamp = generateTimestamp();
    const password = generateMpesaPassword(timestamp);

    // Get M-Pesa access token
    const accessToken = await getMpesaAccessToken();

    // Prepare STK Push request payload
    const stkPushPayload = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.floor(amount), // Ensure integer
      PartyA: mpesaPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: mpesaPhone,
      CallBackURL: `${NGROK_URL}/api/payments/mpesa/callback`,
      AccountReference: "TurfBooked",
      TransactionDesc: `Turf Booking - ${turfName || "Booking"}`,
    };

    console.log("[STK Push] Sending request to Safaricom:", {
      BusinessShortCode: stkPushPayload.BusinessShortCode,
      Amount: stkPushPayload.Amount,
      PartyA: stkPushPayload.PartyA,
      TransactionDesc: stkPushPayload.TransactionDesc,
    });

    // Send STK Push request to Safaricom
    const stkResponse = await fetch(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(stkPushPayload),
      }
    );

    const stkData = await stkResponse.json();

    console.log("[STK Push] Safaricom response:", {
      ResponseCode: stkData.ResponseCode,
      CheckoutRequestID: stkData.CheckoutRequestID,
    });

    // Check if STK Push was successful
    if (stkData.ResponseCode !== "0") {
      console.error("[STK Push] Failed:", stkData.ResponseDescription);
      return res.status(400).json({
        error: stkData.ResponseDescription || "STK Push initiation failed",
      });
    }

    // Create booking in database with pending payment status
    const booking = new Booking({
      userId,
      turfId,
      date: new Date(), // Will be updated with actual date if needed
      startTime: "00:00", // Placeholder
      endTime: "00:00", // Placeholder
      totalAmount: amount,
      paymentStatus: "pending",
      checkoutRequestId: stkData.CheckoutRequestID,
      mpesaPhone,
    });

    await booking.save();

    console.log("[STK Push] Booking created:", {
      bookingId: booking._id,
      checkoutRequestId: stkData.CheckoutRequestID,
    });

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      checkoutRequestId: stkData.CheckoutRequestID,
      message: "STK Push initiated. Please check your phone.",
      mpesaRequestId: stkData.MerchantRequestID,
    });
  } catch (error: any) {
    console.error("[STK Push] Error:", error.message);
    return res.status(500).json({
      error: "Failed to initiate STK Push",
      details: error.message,
    });
  }
}


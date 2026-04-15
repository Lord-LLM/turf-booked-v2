import { connectToDatabase } from "./db.js";
import { Booking } from "./models/Booking.js";
import { Payment } from "./models/Payment.js";
import {
  getMpesaAccessToken,
  generateMpesaPassword,
  generateTimestamp,
} from "./utils/mpesaAuth.js";

export default async function handler(req: any, res: any) {
  const { action } = req.query;

  if (req.method === "POST") {
    if (action === "stkpush") {
      return await initiateStkPush(req, res);
    } else {
      // Default POST is callback
      return await handleCallback(req, res);
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}

async function initiateStkPush(req: any, res: any) {
  try {
    const { bookingId, phoneNumber, amount } = req.body;

    if (!bookingId || !phoneNumber || !amount) {
      return res.status(400).json({
        error: "Missing required fields: bookingId, phoneNumber, amount",
      });
    }

    // Validate phone number format (254XXXXXXXXX)
    const phoneRegex = /^254\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        error: "Invalid phone format. Use format: 254XXXXXXXXX",
      });
    }

    await connectToDatabase();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const timestamp = generateTimestamp();
    const password = generateMpesaPassword(timestamp);
    const accessToken = await getMpesaAccessToken();

    const stkPushUrl =
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    // Determine the callback URL based on environment
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.CALLBACK_URL || "https://turf-booked-v2.vercel.app";

    const callBackURL = `${baseUrl}/api/mpesa`;

    console.log(`[M-Pesa] STK Push Callback URL: ${callBackURL}`);

    const stkPushPayload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: phoneNumber,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phoneNumber,
      CallBackURL: callBackURL,
      AccountReference: bookingId,
      TransactionDesc: `Turf Booking ${bookingId}`,
    };

    const stkPushResponse = await fetch(stkPushUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(stkPushPayload),
    });

    const responseData = await stkPushResponse.json();

    if (
      responseData.ResponseCode === "0" ||
      responseData.ResponseCode === "0000"
    ) {
      const checkoutRequestId = responseData.CheckoutRequestID;

      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "processing",
        checkoutRequestId,
        mpesaPhone: phoneNumber,
      });

      return res.status(200).json({
        success: true,
        message: "STK Push sent successfully",
        checkoutRequestId,
      });
    } else {
      return res.status(400).json({
        error: "Failed to initiate STK Push",
        details: responseData,
      });
    }
  } catch (error: any) {
    console.error("Error initiating STK Push:", error);
    return res.status(500).json({
      error: "Failed to initiate STK Push",
      details: error.message,
    });
  }
}

async function handleCallback(req: any, res: any) {
  // Immediately return 200 to prevent Safaricom retries
  console.log("[M-Pesa] Callback received from Safaricom");
  res.status(200).json({ success: true });

  // Process asynchronously (after response is sent)
  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      console.error("[M-Pesa] Invalid callback payload:", JSON.stringify(req.body));
      return;
    }

    const stkCallback = Body.stkCallback;
    const { CheckoutRequestID, ResultCode, CallbackMetadata } = stkCallback;

    console.log(`[M-Pesa] Processing callback for CheckoutRequestID: ${CheckoutRequestID}`);
    console.log(`[M-Pesa] Result Code: ${ResultCode}`);

    await connectToDatabase();

    const booking = await Booking.findOne({ checkoutRequestId: CheckoutRequestID });

    if (!booking) {
      console.error(`[M-Pesa] ❌ Booking not found for CheckoutRequestID: ${CheckoutRequestID}`);
      return;
    }

    if (ResultCode === 0) {
      // Payment successful
      console.log(`[M-Pesa] ✅ Payment successful for booking ${booking._id}`);
      
      const callbackMetadata = CallbackMetadata?.Item || [];

      let mpesaReceiptNumber = "";
      let phoneNumber = "";
      let amount = 0;

      for (const item of callbackMetadata) {
        if (item.Name === "MpesaReceiptNumber") {
          mpesaReceiptNumber = item.Value;
        }
        if (item.Name === "PhoneNumber") {
          phoneNumber = item.Value;
        }
        if (item.Name === "Amount") {
          amount = item.Value;
        }
      }

      console.log(`[M-Pesa] Receipt: ${mpesaReceiptNumber}, Amount: ${amount}, Phone: ${phoneNumber}`);

      // Create payment record
      const payment = new Payment({
        mpesaReceiptNumber,
        phoneNumber,
        amount,
        status: "Completed",
      });

      await payment.save();
      console.log(`[M-Pesa] Payment record created: ${payment._id}`);

      // Update booking with payment details
      await Booking.findByIdAndUpdate(booking._id, {
        paymentStatus: "completed",
        mpesaReceiptNumber,
        paymentId: payment._id,
      });

      console.log(`[M-Pesa] ✅ Booking ${booking._id} marked as completed`);
    } else {
      // Payment failed
      console.error(`[M-Pesa] ❌ Payment failed for booking ${booking._id} with ResultCode: ${ResultCode}`);
      
      await Booking.findByIdAndUpdate(booking._id, {
        paymentStatus: "failed",
      });

      console.log(`[M-Pesa] Booking ${booking._id} marked as failed`);
    }
  } catch (error: any) {
    console.error("[M-Pesa] ❌ Error processing callback:", error.message);
    console.error("[M-Pesa] Stack trace:", error.stack);
  }
}

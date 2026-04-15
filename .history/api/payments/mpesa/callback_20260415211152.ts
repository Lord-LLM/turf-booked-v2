import { connectToDatabase } from "../../db.js";
import { Booking } from "../../models/Booking.js";

/**
 * M-Pesa STK Push Callback Handler
 * 
 * CRITICAL: This endpoint MUST return 200 OK immediately to prevent Safaricom retry loops.
 * Process the callback data asynchronously if needed.
 * 
 * Expected callback structure from Safaricom:
 * {
 *   "Body": {
 *     "stkCallback": {
 *       "MerchantRequestID": "...",
 *       "CheckoutRequestID": "...",
 *       "ResultCode": 0,
 *       "ResultDesc": "The service request is processed successfully.",
 *       "CallbackMetadata": {
 *         "Item": [
 *           { "Name": "Amount", "Value": 1.0 },
 *           { "Name": "MpesaReceiptNumber", "Value": "OGQ11Z1V60" },
 *           { "Name": "TransactionDate", "Value": 20191122110300 },
 *           { "Name": "PhoneNumber", "Value": 254708374149 }
 *         ]
 *       }
 *     }
 *   }
 * }
 */

export default async function handler(req: any, res: any) {
  // CRITICAL: Always return 200 OK immediately to prevent webhook retry loops
  if (req.method !== "POST") {
    return res.status(405).json({ ResultCode: 1, ResultDesc: "Method not allowed" });
  }

  console.log("[M-Pesa Callback] Received webhook from Safaricom");

  try {
    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      console.error("[M-Pesa Callback] Invalid callback structure");
      return res.status(200).json({ ResultCode: 1, ResultDesc: "Invalid payload" });
    }

    const stkCallback = Body.stkCallback;
    const checkoutRequestId = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    console.log("[M-Pesa Callback] Processing:", {
      CheckoutRequestID: checkoutRequestId,
      ResultCode: resultCode,
      ResultDesc: resultDesc,
    });

    // IMPORTANT: Return 200 OK to Safaricom immediately
    // Process the actual update asynchronously
    res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });

    // Continue processing asynchronously (this won't block the response)
    processCallbackAsync(checkoutRequestId, resultCode, stkCallback).catch((error) => {
      console.error("[M-Pesa Callback] Error processing async update:", error);
    });
  } catch (error: any) {
    console.error("[M-Pesa Callback] Error:", error.message);
    // Still return 200 OK to prevent retries
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
  }
}

async function processCallbackAsync(
  checkoutRequestId: string,
  resultCode: number,
  stkCallback: any
) {
  try {
    await connectToDatabase();

    // Find booking by checkoutRequestId
    const booking = await Booking.findOne({ checkoutRequestId });

    if (!booking) {
      console.warn("[M-Pesa Callback] Booking not found for CheckoutRequestID:", checkoutRequestId);
      return;
    }

    if (resultCode === 0) {
      // Payment successful
      console.log("[M-Pesa Callback] Payment successful for booking:", booking._id);

      // Extract callback metadata
      const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];
      const metadata: any = {};

      callbackMetadata.forEach((item: any) => {
        metadata[item.Name] = item.Value;
      });

      console.log("[M-Pesa Callback] Metadata extracted:", {
        Amount: metadata.Amount,
        MpesaReceiptNumber: metadata.MpesaReceiptNumber,
        PhoneNumber: metadata.PhoneNumber,
        TransactionDate: metadata.TransactionDate,
      });

      // Update booking with payment confirmation
      booking.paymentStatus = "completed";
      booking.mpesaReceiptNumber = metadata.MpesaReceiptNumber;
      await booking.save();

      console.log("[M-Pesa Callback] Booking updated successfully:", {
        bookingId: booking._id,
        paymentStatus: "completed",
        mpesaReceiptNumber: metadata.MpesaReceiptNumber,
      });
    } else {
      // Payment failed
      console.log("[M-Pesa Callback] Payment failed - ResultCode:", resultCode);
      console.log("[M-Pesa Callback] ResultDesc:", stkCallback.ResultDesc);

      booking.paymentStatus = "failed";
      await booking.save();

      console.log("[M-Pesa Callback] Booking marked as failed:", booking._id);
    }
  } catch (error: any) {
    console.error("[M-Pesa Callback] Error processing callback:", error.message);
  }
}

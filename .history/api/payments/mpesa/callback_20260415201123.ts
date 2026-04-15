import { connectToDatabase } from "../../../db";
import { Payment } from "../../../models/Payment";

/**
 * M-Pesa Payment Callback Webhook
 * 
 * This endpoint receives callbacks from M-Pesa when a payment is completed.
 * In production, you would:
 * 1. Verify the callback signature
 * 2. Update the payment status based on the result code
 * 3. Trigger any post-payment workflows (e.g., send confirmation email)
 * 
 * For now, this is a placeholder that demonstrates the structure.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    const { Body } = req.body;

    if (!Body) {
      return res.status(400).json({ error: "Invalid callback format" });
    }

    const result = Body.stkCallback;

    // Extract data from M-Pesa callback
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = result;

    // ResultCode 0 = Success, other codes indicate failure
    const isSuccessful = ResultCode === 0;

    let mpesaReceiptNumber = "";
    let amount = 0;

    if (isSuccessful && CallbackMetadata) {
      // Extract M-Pesa receipt and amount from metadata
      const items = CallbackMetadata.Item || [];
      items.forEach((item: any) => {
        if (item.Name === "MpesaReceiptNumber") {
          mpesaReceiptNumber = item.Value;
        }
        if (item.Name === "Amount") {
          amount = item.Value;
        }
      });
    }

    // Find and update the payment record
    // In production, you'd search by CheckoutRequestID or MerchantRequestID
    if (isSuccessful && mpesaReceiptNumber) {
      await Payment.findOneAndUpdate(
        { mpesaReceiptNumber: `STK-${MerchantRequestID}` },
        {
          status: "Completed",
          mpesaReceiptNumber,
        }
      );

      console.log(`[M-Pesa Callback] Payment completed: ${mpesaReceiptNumber}`);
    } else {
      await Payment.findOneAndUpdate(
        { mpesaReceiptNumber: `STK-${MerchantRequestID}` },
        {
          status: "Failed",
        }
      );

      console.log(`[M-Pesa Callback] Payment failed: ${ResultDesc}`);
    }

    // Acknowledge receipt of the callback
    return res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Accepted",
    });
  } catch (error: any) {
    console.error("Error processing M-Pesa callback:", error);
    return res.status(500).json({
      error: "Failed to process callback",
    });
  }
}

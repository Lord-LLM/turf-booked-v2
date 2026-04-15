import { connectToDatabase } from "../../db";
import { Payment } from "../../models/Payment";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { mpesaReceiptNumber, phoneNumber, amount } = req.body;

  // Validate required fields
  if (!mpesaReceiptNumber || !phoneNumber || !amount) {
    return res.status(400).json({
      error: "Missing required fields: mpesaReceiptNumber, phoneNumber, amount",
    });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Check if payment with this receipt already exists
    const existingPayment = await Payment.findOne({ mpesaReceiptNumber });
    if (existingPayment) {
      return res.status(409).json({ error: "Payment with this receipt number already exists" });
    }

    // Create new payment (defaults to 'Pending' status)
    const payment = new Payment({
      mpesaReceiptNumber,
      phoneNumber,
      amount,
    });

    await payment.save();

    return res.status(201).json({
      success: true,
      payment,
      message: "Payment created successfully",
    });
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return res.status(500).json({
      error: "Failed to create payment",
      details: error.message,
    });
  }
}

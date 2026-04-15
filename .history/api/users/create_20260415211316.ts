import { connectToDatabase } from "../db.js";
import { User } from "../models/User.js";

export default async function handler(req: any, res: any) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, auth0Id } = req.body;

  // Validate required fields
  if (!name || !email || !phone) {
    return res.status(400).json({
      error: "Missing required fields: name, email, phone",
    });
  }

  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "User with this email already exists" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      phone,
      ...(auth0Id && { auth0Id }),
    });

    await user.save();

    return res.status(201).json({
      success: true,
      user,
      message: "User created successfully",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    return res.status(500).json({
      error: "Failed to create user",
      details: error.message,
    });
  }
}

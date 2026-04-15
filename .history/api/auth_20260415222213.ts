import { connectToDatabase } from "./db.js";
import { User } from "./models/User.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const action = req.query.action || "signin";
  const { email, name, phone, auth0Id } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    await connectToDatabase();

    if (action === "signup") {
      // Signup logic
      if (!name || !phone) {
        return res.status(400).json({ error: "Name and phone are required for signup" });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Use auth0Id if provided, otherwise generate a unique ID
      const userId = auth0Id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newUser = new User({
        _id: userId,
        name,
        email,
        phone,
        auth0Id,
      });

      await newUser.save();

      return res.status(201).json({
        success: true,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
        },
      });
    } else if (action === "signin") {
      // Signin logic
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.status(200).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
      });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    return res.status(500).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
}

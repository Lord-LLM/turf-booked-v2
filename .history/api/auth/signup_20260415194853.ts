import { connectToDatabase } from "../db";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { name, email, password, phone } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      error: "Missing required fields: name, email, password, phone.",
    });
  }

  try {
    const db = await connectToDatabase();
    const users = db.collection("users");

    // Check if user already exists
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // Create new user (in production, hash the password with bcryptjs)
    const result = await users.insertOne({
      name,
      email,
      password,
      phone,
      createdAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      userId: result.insertedId,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Failed to create account." });
  }
}

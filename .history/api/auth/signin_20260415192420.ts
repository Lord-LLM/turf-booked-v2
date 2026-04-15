import { connectToDatabase } from "../db";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Missing required fields: email, password.",
    });
  }

  try {
    const db = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // In production, use bcryptjs to verify hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ error: "Failed to authenticate." });
  }
}

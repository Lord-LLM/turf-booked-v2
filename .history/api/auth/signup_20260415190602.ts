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

  // SIMULATED SIGNUP - Accepts any credentials for testing
  try {
    const userId = "mock_" + Date.now();

    return res.status(201).json({
      success: true,
      userId: userId,
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Failed to create account." });
  }
}
  }
}

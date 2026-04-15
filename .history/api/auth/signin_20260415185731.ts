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

  // SIMULATED LOGIN - Accepts any credentials for testing
  try {
    // Create a mock user object from the provided email
    const user = {
      id: "mock_" + Date.now(),
      name: email.split("@")[0], // Use part of email as name
      email: email,
      phone: "N/A",
    };

    return res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Signin error:", error);
    return res.status(500).json({ error: "Failed to authenticate." });
  }
}

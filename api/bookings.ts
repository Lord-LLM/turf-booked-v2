import { connectToDatabase } from "./db";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const body = req.body;

  if (!body || typeof body !== "object") {
    return res.status(400).json({ error: "Invalid request body." });
  }

  const { name, email, turfId, bookingDate, startTime, endTime, guests } = body;

  if (!name || !email || !turfId || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({
      error: "Missing required booking fields: name, email, turfId, bookingDate, startTime, endTime.",
    });
  }

  try {
    const db = await connectToDatabase();
    const bookings = db.collection("bookings");

    const result = await bookings.insertOne({
      name,
      email,
      turfId,
      bookingDate,
      startTime,
      endTime,
      guests: guests ?? 1,
      createdAt: new Date(),
    });

    return res.status(201).json({ success: true, bookingId: result.insertedId });
  } catch (error) {
    console.error("Booking save error:", error);
    return res.status(500).json({ error: "Failed to save booking." });
  }
}

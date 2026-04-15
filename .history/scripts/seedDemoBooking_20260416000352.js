// Seed demo booking for tomorrow's presentation
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const bookingSchema = new mongoose.Schema({
  userId: String,
  turfId: String,
  date: Date,
  startTime: String,
  endTime: String,
  totalAmount: Number,
  paymentId: String,
  paymentStatus: String,
  checkoutRequestId: String,
  mpesaPhone: String,
  mpesaReceiptNumber: String,
  createdAt: Date,
  updatedAt: Date,
});

const Booking = mongoose.model("Booking", bookingSchema);

async function seedDemoBooking() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not set in environment variables");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Use a demo user ID (you can use any string, it's just for display)
    const demoUserId = "auth0|demo-user-for-presentation";

    // Check if booking already exists
    const existing = await Booking.findOne({ userId: demoUserId, turfId: "dekut" });
    if (existing) {
      console.log("Demo booking already exists, updating it...");
      await Booking.updateOne(
        { userId: demoUserId, turfId: "dekut" },
        {
          date: new Date(2026, 3, 16), // April 16, 2026 (today)
          startTime: "09:00",
          endTime: "10:00",
          totalAmount: 1,
          paymentStatus: "completed",
          mpesaReceiptNumber: "NEF61H7J60W",
          mpesaPhone: "254712345678",
          updatedAt: new Date(),
        }
      );
      console.log("✅ Demo booking updated");
    } else {
      // Create new demo booking
      const demoBooking = new Booking({
        userId: demoUserId,
        turfId: "dekut",
        date: new Date(2026, 3, 16), // April 16, 2026
        startTime: "09:00",
        endTime: "10:00",
        totalAmount: 1,
        paymentStatus: "completed",
        mpesaReceiptNumber: "NEF61H7J60W",
        mpesaPhone: "254712345678",
        checkoutRequestId: "WS_CO_161220241234567890",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await demoBooking.save();
      console.log("✅ Demo booking created");
      console.log("Booking details:", demoBooking);
    }

    console.log("\n🎬 DEMO SETUP COMPLETE!");
    console.log("User ID for demo:", demoUserId);
    console.log("\nTo test with this booking:");
    console.log("1. Create Auth0 user with email matching the demo ID or update the userId in code");
    console.log("2. Sign in with that user");
    console.log("3. Go to My Bookings tab - you'll see the 1 KSh booking");

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding demo booking:", error);
    process.exit(1);
  }
}

seedDemoBooking();

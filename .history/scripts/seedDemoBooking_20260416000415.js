// Seed demo booking for tomorrow's presentation
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = "mongodb+srv://katuienock_db_user:MPwlGrXlnM2oJod5%40turf.mvegn6w.mongodb.net/?appName=Turf";

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
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Use a demo user ID (this will be replaced with the actual Auth0 user ID after sign-in)
    const demoUserId = "auth0|demo-user-presentation-2026";

    // Delete any existing demo booking first
    await Booking.deleteOne({ userId: demoUserId, turfId: "dekut" });
    console.log("Cleared any existing demo bookings");

    // Create new demo booking for 9-10 AM today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const demoBooking = new Booking({
      userId: demoUserId,
      turfId: "dekut",
      date: today,
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
    console.log("✅ Demo booking created!");
    console.log("\n📋 Booking Details:");
    console.log("  User ID:", demoUserId);
    console.log("  Turf: DeKUT Green Pitch (dekut)");
    console.log("  Date:", today.toLocaleDateString());
    console.log("  Time: 09:00 - 10:00");
    console.log("  Amount: KSh 1");
    console.log("  Status: Completed");
    console.log("  Receipt: NEF61H7J60W");

    console.log("\n🎬 DEMO READY FOR PRESENTATION!");
    console.log("\nTo view this booking:");
    console.log("1. Sign in with Auth0");
    console.log("2. Go to My Bookings tab");
    console.log("3. You'll see the 1 KSh booking for 9-10 AM");

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding demo booking:", error.message);
    process.exit(1);
  }
}

seedDemoBooking();

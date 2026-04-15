import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Global cache for mongoose connection (persists across cold starts on Vercel)
let cached: CachedConnection = (global as any).mongoose || { conn: null, promise: null };

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Prevent Mongoose from buffering commands when connection is unavailable
mongoose.set("bufferCommands", false);

export async function connectToDatabase() {
  // If already connected, return the cached connection immediately
  if (cached.conn) {
    console.log("Using cached MongoDB connection");
    return cached.conn;
  }

  // If connection is being established, wait for it (prevent duplicate connection attempts)
  if (!cached.promise) {
    console.log("Establishing new MongoDB connection...");
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000, // Fail fast after 5 seconds instead of hanging for 30
        socketTimeoutMS: 5000, // Close sockets after 5 seconds of inactivity
        maxPoolSize: 10, // Limit connection pool for serverless
        minPoolSize: 0, // Start with no connections, create as needed
      })
      .then(() => {
        console.log("MongoDB connection established successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
        cached.promise = null; // Reset promise on failure so next call retries
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connection ready");
  } catch (error: any) {
    cached.promise = null;
    console.error("Failed to connect to MongoDB:", error.message);
    throw new Error(
      `Database connection failed: ${error.message}. Check MONGODB_URI and network connectivity.`
    );
  }

  return cached.conn;
}
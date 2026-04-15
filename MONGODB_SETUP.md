# MongoDB & Mongoose Integration Guide

## Overview
This guide documents the MongoDB setup for the Turf-Booked application using Mongoose with connection caching for Vercel serverless deployment.

## Installation
Dependencies have been installed:
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variable management

## Database Architecture

### Collections (No Turf Collection)
The database contains three main collections: **Users**, **Bookings**, and **Payments**. Turfs are hardcoded on the frontend.

### 1. User Schema (`api/models/User.ts`)
```typescript
{
  name: String (required),
  email: String (required, unique, lowercase),
  phone: String (required),
  auth0Id: String (optional, for Auth0 integration),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 2. Payment Schema (`api/models/Payment.ts`)
```typescript
{
  mpesaReceiptNumber: String (required, unique),
  phoneNumber: String (required),
  amount: Number (required, min: 0),
  status: String (enum: "Pending", "Completed", "Failed", default: "Pending"),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### 3. Booking Schema (`api/models/Booking.ts`)
```typescript
{
  userId: ObjectId (ref: User, required),
  turfId: String (required, links to hardcoded frontend turf ID),
  date: Date (required),
  startTime: String (required, HH:MM format),
  endTime: String (required, HH:MM format),
  totalAmount: Number (required, min: 0),
  paymentId: ObjectId (ref: Payment, required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Connection Management (`api/db.ts`)

The database connection uses connection caching to optimize performance on Vercel:

### Features:
- **Connection Caching**: Reuses existing connections across serverless function invocations
- **Error Handling**: Graceful error handling with proper cleanup
- **Optimized Options**: Uses `bufferCommands: false` for serverless environments
- **Environment Variable**: Reads `MONGODB_URI` from `.env`

### Usage:
```typescript
import { connectToDatabase } from "../db";

export default async function handler(req: any, res: any) {
  await connectToDatabase();
  // Your database operations here
}
```

## API Endpoints

### 1. Create User (`api/users/create.ts`)
**POST** `/api/users/create`

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+254712345678",
  "auth0Id": "optional_auth0_id"
}
```

Response:
```json
{
  "success": true,
  "user": { ...userData },
  "message": "User created successfully"
}
```

### 2. Create Payment (`api/payments/create.ts`)
**POST** `/api/payments/create`

Request body:
```json
{
  "mpesaReceiptNumber": "LJ123456789",
  "phoneNumber": "+254712345678",
  "amount": 1500
}
```

Response:
```json
{
  "success": true,
  "payment": { ...paymentData },
  "message": "Payment created successfully"
}
```

### 3. Create Booking (`api/bookings/create.ts`)
**POST** `/api/bookings/create`

Request body:
```json
{
  "userId": "mongodb_user_id",
  "turfId": "hardcoded_turf_id",
  "date": "2026-04-20T00:00:00Z",
  "startTime": "14:00",
  "endTime": "15:30",
  "totalAmount": 1500,
  "paymentId": "mongodb_payment_id"
}
```

Response:
```json
{
  "success": true,
  "booking": { ...bookingData },
  "message": "Booking created successfully"
}
```

### 4. Get User Bookings (`api/bookings/user.ts`)
**GET** `/api/bookings/user?userId=mongodb_user_id`

Response:
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "booking_id",
      "userId": { ...userData },
      "turfId": "turf_id",
      "date": "2026-04-20T00:00:00Z",
      "startTime": "14:00",
      "endTime": "15:30",
      "totalAmount": 1500,
      "paymentId": { ...paymentData },
      "createdAt": "2026-04-15T10:30:00Z",
      "updatedAt": "2026-04-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

## Usage Example

### Complete Flow:
1. **Create a User**
   ```bash
   curl -X POST http://localhost:5173/api/users/create \
     -H "Content-Type: application/json" \
     -d '{"name":"John","email":"john@example.com","phone":"+254712345678"}'
   ```

2. **Create a Payment**
   ```bash
   curl -X POST http://localhost:5173/api/payments/create \
     -H "Content-Type: application/json" \
     -d '{"mpesaReceiptNumber":"LJ123456789","phoneNumber":"+254712345678","amount":1500}'
   ```

3. **Create a Booking**
   ```bash
   curl -X POST http://localhost:5173/api/bookings/create \
     -H "Content-Type: application/json" \
     -d '{"userId":"USER_ID","turfId":"turf1","date":"2026-04-20T00:00:00Z","startTime":"14:00","endTime":"15:30","totalAmount":1500,"paymentId":"PAYMENT_ID"}'
   ```

4. **Fetch User Bookings**
   ```bash
   curl http://localhost:5173/api/bookings/user?userId=USER_ID
   ```

## Environment Variables

Add to `.env`:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?appName=database
```

## Key Features

- ✅ **TypeScript Support**: Full type safety with interfaces for all models
- ✅ **Validation**: Built-in schema validation for all fields
- ✅ **Relationships**: Proper document references between collections
- ✅ **Timestamps**: Automatic `createdAt` and `updatedAt` fields
- ✅ **Connection Caching**: Optimized for serverless (Vercel)
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Scalable**: Ready for production deployment

## Common Queries

### Find user by email:
```typescript
const user = await User.findOne({ email: "john@example.com" });
```

### Find all bookings for a user:
```typescript
const bookings = await Booking.find({ userId })
  .populate("paymentId")
  .populate("userId");
```

### Update payment status:
```typescript
await Payment.findByIdAndUpdate(paymentId, { status: "Completed" });
```

### Delete a booking:
```typescript
await Booking.findByIdAndDelete(bookingId);
```

## Troubleshooting

### Connection errors:
- Verify `MONGODB_URI` is set in `.env`
- Check MongoDB Atlas network access settings
- Ensure your IP address is whitelisted

### Validation errors:
- Check field types match the schema
- Email must be unique and in valid format
- Time must be in HH:MM format
- Amount must be positive

## Next Steps

1. Integrate Auth0 to auto-populate `auth0Id` on signup
2. Add payment status webhook from M-Pesa
3. Implement booking cancellation logic
4. Add booking history and analytics

# Turf-Booked API Consolidation Summary

## Overview
Successfully consolidated 11+ individual API endpoints into 3 unified serverless functions to comply with Vercel Hobby tier's 12-function limit.

## Consolidated API Endpoints

### 1. Authentication (`api/auth.ts`)
**Purpose**: Unified authentication endpoint combining signin and signup

**Operations**:
- `POST /api/auth?action=signin` - User login
  - Request: `{ email, password }`
  - Response: `{ success: true, user: { id, email, name, phone } }`

- `POST /api/auth?action=signup` - User registration
  - Request: `{ name, email, password, phone }`
  - Response: `{ success: true, user: { id, email, name, phone } }`

**Error Handling**:
- 400: Validation errors (missing fields, invalid format)
- 404: User not found (signin)
- 409: Duplicate email (signup)
- 500: Database errors

---

### 2. Bookings Management (`api/bookings.ts`)
**Purpose**: Complete booking lifecycle management

**Operations**:

#### Create Booking
- `POST /api/bookings` - Create new booking
  - Request: `{ userId, turfId, date, startTime, endTime, totalAmount }`
  - Response: `{ success: true, booking: { id, totalAmount } }`

#### Get User Bookings
- `GET /api/bookings?userId=xxx` - Fetch all bookings for a user
  - Response: `{ success: true, bookings: [ { id, turfId, date, paymentStatus, ... } ] }`

#### Get Booking Status
- `GET /api/bookings?bookingId=xxx` - Poll for payment status
  - Response: `{ status: "pending|processing|completed|failed", booking: { ... } }`

**Features**:
- User validation before booking creation
- Booking state management (pending → processing → completed/failed)
- Real-time polling support via GET with bookingId

---

### 3. M-Pesa Payments (`api/mpesa.ts`)
**Purpose**: Complete payment processing with M-Pesa STK Push and callbacks

**Operations**:

#### Initiate STK Push
- `POST /api/mpesa?action=stkpush` - Initiate payment prompt
  - Request: `{ bookingId, phoneNumber, amount }`
  - Response: `{ success: true, checkoutRequestId }`
  - Phone format validation: `254XXXXXXXXX` (Kenya format)

#### Handle Payment Callback
- `POST /api/mpesa` - Webhook handler for M-Pesa callbacks
  - Returns: `200 OK` immediately (async processing)
  - Updates booking status and creates payment record
  - Updates booking with M-Pesa receipt number on success

**Features**:
- Real Safaricom Daraja API integration (Sandbox mode)
- OAuth token caching (3595 seconds)
- Immediate 200 OK to prevent Safaricom retry loops
- Async payment confirmation processing
- Comprehensive error handling

---

## API Function Consolidation Details

### Before Consolidation (~11 functions)
```
api/auth/signin.ts
api/auth/signup.ts
api/bookings/create.ts
api/bookings/user.ts
api/bookings/[bookingId]/status.ts
api/payments/create.ts
api/payments/mpesa/stkpush.ts
api/payments/mpesa/callback.ts
api/users/create.ts
[Other utility functions...]
```

### After Consolidation (3 functions)
```
api/auth.ts
api/bookings.ts
api/mpesa.ts
```

### Supporting Modules (Not counted as functions)
```
api/db.ts - Mongoose connection with caching
api/models/User.ts - User schema
api/models/Booking.ts - Booking schema
api/models/Payment.ts - Payment schema
api/models/index.ts - Model exports
api/utils/mpesaAuth.ts - M-Pesa token management
```

---

## Frontend Integration Points

### BookTurf Component Updates (`src/pages/BookTurf.tsx`)
Updated to use consolidated API endpoints:

1. **Create Booking**
   ```typescript
   POST /api/bookings
   Body: { userId, turfId, date, startTime, endTime, totalAmount }
   ```

2. **Initiate Payment**
   ```typescript
   POST /api/mpesa?action=stkpush
   Body: { bookingId, phoneNumber, amount }
   ```

3. **Poll Payment Status**
   ```typescript
   GET /api/bookings?bookingId={bookingId}
   Response: { status: "completed|failed|pending" }
   ```

---

## Database Schema

### User Model
- `_id`: ObjectId
- `email`: String (unique)
- `name`: String
- `phone`: String
- `password`: String (hashed)
- `auth0Id`: String (optional)
- `createdAt`: Date
- `updatedAt`: Date

### Booking Model
- `_id`: ObjectId
- `userId`: ObjectId (ref: User)
- `turfId`: String
- `date`: Date
- `startTime`: String
- `endTime`: String
- `totalAmount`: Number
- `paymentStatus`: "pending" | "processing" | "completed" | "failed"
- `checkoutRequestId`: String (unique)
- `mpesaPhone`: String
- `mpesaReceiptNumber`: String (unique)
- `paymentId`: ObjectId (ref: Payment)
- `createdAt`: Date
- `updatedAt`: Date

### Payment Model
- `_id`: ObjectId
- `mpesaReceiptNumber`: String (unique)
- `phoneNumber`: String
- `amount`: Number
- `status`: "Pending" | "Completed" | "Failed"
- `createdAt`: Date
- `updatedAt`: Date

---

## Vercel Deployment

### Function Count
- **Before**: ~11 individual endpoints
- **After**: 3 consolidated endpoints
- **Status**: ✅ Well under 12-function Hobby tier limit

### Serverless Configuration
- Runtime: Node.js 18+
- Environment Variables (in Vercel Dashboard):
  - `MONGODB_URI` - MongoDB Atlas connection
  - `MPESA_CONSUMER_KEY` - Safaricom credentials
  - `MPESA_CONSUMER_SECRET` - Safaricom credentials
  - `MPESA_PASSKEY` - M-Pesa passkey
  - `MPESA_SHORTCODE` - M-Pesa business code
  - `CALLBACK_URL` - Webhook callback URL
  - `AUTH0_DOMAIN` - Auth0 tenant
  - `AUTH0_CLIENT_ID` - Auth0 application

### ES Module Configuration
- All local imports use `.js` extensions for Vercel compatibility
- Database connection cached globally for serverless reuse
- Async processing for non-blocking operations

---

## Usage Examples

### 1. User Signup
```bash
curl -X POST https://turf-booked-v2.vercel.app/api/auth?action=signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "254712345678",
    "password": "secure_password"
  }'
```

### 2. Create Booking
```bash
curl -X POST https://turf-booked-v2.vercel.app/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_id_here",
    "turfId": "turf_1",
    "date": "2024-04-20",
    "startTime": "10:00",
    "endTime": "11:00",
    "totalAmount": 1000
  }'
```

### 3. Initiate M-Pesa Payment
```bash
curl -X POST "https://turf-booked-v2.vercel.app/api/mpesa?action=stkpush" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking_id_here",
    "phoneNumber": "254712345678",
    "amount": 1000
  }'
```

### 4. Poll Payment Status
```bash
curl https://turf-booked-v2.vercel.app/api/bookings?bookingId=booking_id_here
```

---

## Benefits of Consolidation

1. **Vercel Compliance**: Reduced from 11+ functions to 3, well under 12-function Hobby limit
2. **Improved Performance**: Fewer cold starts, shared dependencies
3. **Maintainability**: Related operations grouped logically
4. **Cost Efficiency**: Lower function invocation count
5. **Simplified Routing**: Clear query parameters and HTTP methods distinguish operations

---

## Testing Endpoints

### Local Testing (Port 5173)
```bash
# Vite dev server with allowedHosts configured for ngrok
npm run dev
# Tunnel with: ngrok http 5173
```

### Vercel Preview Deployment
- Auto-deployed on push
- Check deployment status: https://vercel.com/lord-llm/turf-booked-v2

### Production
- Requires Auth0 domain update for production callback URLs
- Requires M-Pesa production credentials from Safaricom
- Change `CALLBACK_URL` to production domain

---

## Next Steps for Production

1. **Auth0 Production Setup**
   - Register production domain with Auth0
   - Update callback URLs in Auth0 dashboard
   - Update `AUTH0_DOMAIN` in Vercel

2. **M-Pesa Production Credentials**
   - Request production credentials from Safaricom
   - Update `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET` in Vercel
   - Change API endpoint from sandbox to production

3. **Testing**
   - Full end-to-end testing of payment flow
   - Load testing for concurrent bookings
   - Error scenario testing

4. **Monitoring**
   - Set up Vercel analytics
   - Enable error tracking (e.g., Sentry)
   - Monitor M-Pesa callback failures

---

## Troubleshooting

### Payment Not Confirming
- Check M-Pesa callback URL in Vercel env variables
- Verify webhook receiving logs in Vercel Functions
- Ensure booking exists before STK Push initiation

### Database Connection Issues
- Verify MONGODB_URI in Vercel dashboard
- Check MongoDB Atlas IP whitelist includes Vercel IPs
- Review connection pool settings for serverless

### Auth Failures
- Verify Auth0 redirect URIs match deployment URL
- Check Auth0_DOMAIN and AUTH0_CLIENT_ID are correct
- Ensure Auth0 tenant allows ngrok for testing

---

**Last Updated**: April 15, 2025
**Status**: ✅ Consolidation Complete - Ready for Vercel Deployment

# M-Pesa STK Push Integration Guide

## Overview
This guide documents the M-Pesa STK Push payment integration for the Turf-Booked booking system.

## Architecture

### Frontend Flow (BookTurf.tsx)
1. User enters booking details (name, email, guests)
2. User enters M-Pesa phone number (format: `2547XXXXXXXX`)
3. User clicks "Pay KSh [amount] with M-Pesa"
4. Component validates form and initiates STK Push
5. Loading state with message: "Please check your phone. Enter your M-Pesa PIN..."
6. Component polls `/api/bookings/{bookingId}/status` every 3 seconds
7. On success: Green success screen with "Payment Successful! Booking Confirmed"
8. On failure: Red error screen with option to retry

### Backend Flow

#### 1. STK Push Initiation (`/api/payments/mpesa/stkpush`)
**POST** `/api/payments/mpesa/stkpush`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "mpesaPhone": "254712345678",
  "turfId": "turf1",
  "turfName": "DeKUT Green Pitch",
  "bookingDate": "2026-04-20",
  "startTime": "14:00",
  "endTime": "15:00",
  "guests": 4,
  "totalAmount": 1950
}
```

**Process:**
1. Validates all required fields and M-Pesa phone format
2. Creates or finds existing User by email
3. Creates Payment record (status: "Pending")
4. Creates Booking record linking to User and Payment
5. **[TODO]** Calls M-Pesa API to initiate STK Push (see Integration section)
6. Returns bookingId for polling

**Response:**
```json
{
  "success": true,
  "bookingId": "65abc123def456ghi789",
  "message": "STK Push initiated. Please check your phone.",
  "booking": {
    "id": "65abc123def456ghi789",
    "amount": 1950,
    "phoneNumber": "254712345678"
  }
}
```

#### 2. Booking Status Polling (`/api/bookings/{bookingId}/status`)
**GET** `/api/bookings/{bookingId}/status`

**Response (Payment Pending):**
```json
{
  "status": "pending",
  "booking": {
    "id": "65abc123def456ghi789",
    "amount": 1950
  },
  "payment": {
    "id": "65def789abc123ghi456",
    "status": "Pending",
    "mpesaReceiptNumber": "STK-1712100000"
  }
}
```

**Response (Payment Completed):**
```json
{
  "status": "completed",
  "booking": {
    "id": "65abc123def456ghi789",
    "amount": 1950
  },
  "payment": {
    "id": "65def789abc123ghi456",
    "status": "Completed",
    "mpesaReceiptNumber": "LJ123456789"
  }
}
```

#### 3. M-Pesa Callback Webhook (`/api/payments/mpesa/callback`)
**POST** `/api/payments/mpesa/callback`

Receives callbacks from M-Pesa when payment succeeds or fails.
Updates Payment status and triggers any post-payment workflows.

## Database Schema Updates

### Payment Model
Tracks M-Pesa transactions:
- `mpesaReceiptNumber`: M-Pesa receipt (updated on callback)
- `phoneNumber`: Customer phone number
- `amount`: Payment amount in KSh
- `status`: "Pending" | "Completed" | "Failed"
- `createdAt`: Payment creation time
- `updatedAt`: Last update time

### Booking Model
Links bookings to payments:
- `userId`: Reference to User
- `turfId`: Hardcoded frontend turf ID
- `date`: Booking date
- `startTime`: Booking start time (HH:MM)
- `endTime`: Booking end time (HH:MM)
- `totalAmount`: Total booking cost
- `paymentId`: Reference to Payment
- `createdAt`: Booking creation time
- `updatedAt`: Last update time

## Frontend Component Features

### Validation
- **Name**: Required, non-empty
- **Email**: Required, valid email format
- **M-Pesa Phone**: Required, format `2547XXXXXXXX` (exactly 12 digits starting with 254)
- **Guests**: 1-10 (default: 1)

### States
1. **Idle**: Form displayed, ready for input
2. **Processing**: Loading spinner, "Please check your phone" message
3. **Success**: Green screen with booking confirmation, button to view bookings
4. **Failed**: Red screen with error message, retry button

### Error Handling
- Invalid M-Pesa format: Shows "Invalid format. Use 2547XXXXXXXX"
- Failed validation: Shows inline error messages
- Network errors: Toast notification with error details
- Payment failure: Shows error state with retry option

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/mpesa/stkpush` | POST | Initiate STK Push payment |
| `/api/bookings/{bookingId}/status` | GET | Poll payment status |
| `/api/payments/mpesa/callback` | POST | Receive M-Pesa payment callbacks |
| `/api/users/create` | POST | Create user |
| `/api/bookings/create` | POST | Create booking |
| `/api/bookings/user` | GET | Get user's bookings |

## Integration with M-Pesa API

### TODO: Implement M-Pesa Integration

Currently, the STK Push endpoint has a placeholder for M-Pesa API integration.

To complete the integration, you'll need to:

1. **Get M-Pesa Credentials**
   - Register with Safaricom Business Portal
   - Get your Business Shortcode, Consumer Key, and Consumer Secret
   - Set up Callback URLs in your M-Pesa application

2. **Add Environment Variables**
   ```env
   MPESA_CONSUMER_KEY=your_consumer_key
   MPESA_CONSUMER_SECRET=your_consumer_secret
   MPESA_BUSINESS_SHORTCODE=your_business_shortcode
   MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
   MPESA_ENV=sandbox|production
   ```

3. **Implement M-Pesa Token Generation**
   ```typescript
   async function getMpesaToken() {
     const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
     const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
       headers: { 'Authorization': `Basic ${auth}` }
     });
     return (await response.json()).access_token;
   }
   ```

4. **Implement STK Push Call**
   ```typescript
   async function initiateSTKPush(options: {
     phoneNumber: string;
     amount: number;
     accountReference: string;
     transactionDesc: string;
   }) {
     const token = await getMpesaToken();
     const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
     const password = Buffer.from(
       `${MPESA_BUSINESS_SHORTCODE}${MPESA_PASSKEY}${timestamp}`
     ).toString('base64');

     const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
       method: 'POST',
       headers: {
         'Authorization': `Bearer ${token}`,
         'Content-Type': 'application/json'
       },
       body: JSON.stringify({
         BusinessShortCode: MPESA_BUSINESS_SHORTCODE,
         Password: password,
         Timestamp: timestamp,
         TransactionType: 'CustomerPayBillOnline',
         Amount: Math.round(options.amount),
         PartyA: options.phoneNumber,
         PartyB: MPESA_BUSINESS_SHORTCODE,
         PhoneNumber: options.phoneNumber,
         CallBackURL: MPESA_CALLBACK_URL,
         AccountReference: options.accountReference,
         TransactionDesc: options.transactionDesc
       })
     });
     return response.json();
   }
   ```

5. **Update stkpush.ts Endpoint**
   Replace the TODO section in `api/payments/mpesa/stkpush.ts` with actual M-Pesa API call

## Testing

### Manual Testing
1. Fill in booking form with:
   - Name: "Test User"
   - Email: "test@example.com"
   - M-Pesa Phone: "254712345678"
   - Guests: 2
2. Click "Pay with M-Pesa"
3. Check console logs for STK push initiation
4. Observe loading state
5. Test polling by manually updating payment status in MongoDB

### M-Pesa Sandbox Testing
- Use Safaricom test numbers: `254708374149`, `254702141823`, etc.
- Use test PIN: `1234`
- Test various scenarios: success, timeout, insufficient funds, etc.

## Security Considerations

1. **Phone Number Validation**: Always validate M-Pesa phone format (254...)
2. **Callback Verification**: In production, verify M-Pesa callback signatures
3. **HTTPS Only**: All M-Pesa communications must use HTTPS
4. **Environment Variables**: Never commit API keys/secrets to version control
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Amount Validation**: Always verify booking amount matches payment amount
7. **Idempotency**: Handle duplicate callbacks gracefully

## Common Issues & Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid M-Pesa phone format" | Phone number doesn't match `254XXXXXXXXX` | Ensure format is exactly 12 digits starting with 254 |
| Payment stuck on "Pending" | Polling timeout or callback not received | Check M-Pesa callback URL is accessible |
| Duplicate payments | Network retry or race condition | Implement idempotency keys |
| "User not found" when viewing booking | User wasn't created before booking | Ensure user creation happens in STK push endpoint |

## Next Steps

1. Register for M-Pesa Business Portal
2. Set up sandbox environment
3. Implement M-Pesa token generation
4. Implement STK Push API call
5. Test with sandbox credentials
6. Set up payment confirmation emails
7. Add booking history page
8. Implement payment refund logic
9. Add payment receipts/invoices
10. Deploy to production

## References
- M-Pesa STK Push Documentation: https://developer.safaricom.co.ke/
- Kenya Phone Number Format: +254-XXX-XXXXXX
- Turf-Booked Booking System: See `/src/pages/BookTurf.tsx`

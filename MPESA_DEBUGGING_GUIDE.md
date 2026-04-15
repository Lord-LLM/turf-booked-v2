# M-Pesa Payment Callback & Polling Debug Guide

## Complete Flow (with logs you should see)

### 1. **User Clicks "Pay KSh X with M-Pesa"** ➡️ Browser Console
```
[BookTurf] 🎯 Creating booking...
[BookTurf] 📝 Booking created with ID: <bookingId>
[BookTurf] 📱 Initiating STK Push...
[BookTurf] ⏳ STK Push successful - waiting for PIN entry
[BookTurf] 🔄 Poll attempt 1/100
```

### 2. **User Enters M-Pesa PIN** ➡️ Vercel Logs
```
[M-Pesa] ✅ Callback received from Safaricom
[M-Pesa] Callback request body: {
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "...",
      "CheckoutRequestID": "<SAME_AS_BOOKING_checkoutRequestId>",
      "ResultCode": 0,
      "ResultDesc": "The service request has been processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "MpesaReceiptNumber", "Value": "NEF61H7J60W" },
          { "Name": "Phone", "Value": "254712345678" },
          { "Name": "Amount", "Value": "1" }
        ]
      }
    }
  }
}

[M-Pesa] Processing callback for CheckoutRequestID: <CheckoutRequestID>
[M-Pesa] Result Code: 0 (0 = success, non-zero = failure)
[M-Pesa] Found booking: <bookingId>
[M-Pesa] Receipt: NEF61H7J60W, Amount: 1, Phone: 254712345678
[M-Pesa] ✅ Payment record created: <paymentId>
[M-Pesa] ✅ Booking <bookingId> marked as completed. New status: completed
```

### 3. **Frontend Polling Detects Status Change** ➡️ Browser Console
```
[BookTurf] 🔄 Poll attempt 5/100
[BookTurf] 🔄 Polling status for booking <bookingId>
[BookTurf] Status received: "completed" | Full response: {
  "status": "completed",
  "booking": {
    "id": "<bookingId>",
    "amount": 1,
    "paymentStatus": "completed",
    "mpesaReceiptNumber": "NEF61H7J60W"
  }
}
[BookTurf] ✅ Payment confirmed! Status changed to 'completed'
[BookTurf] Receipt: NEF61H7J60W
[BookTurf] ✅ Stopped polling interval
✅ Payment successful! Booking confirmed. (toast notification)
```

---

## Debugging Checklist

### ❌ If you DON'T see "[M-Pesa] ✅ Callback received" in Vercel logs:

1. **Safaricom is not calling your endpoint**
   - Check M-Pesa callback URL in `/api/mpesa.ts` initialization:
     ```
     [M-Pesa] STK Push Callback URL: https://turf-booked-v2.vercel.app/api/mpesa
     ```
   - **MUST** be your Vercel URL, NOT localhost or old ngrok address
   - Verify in `process.env.VERCEL_URL` is set in Vercel Dashboard

2. **Sandbox vs Production credentials mismatch**
   - Ensure all M-Pesa credentials in `.env` are from SAME environment
   - ConsumerKey and ConsumerSecret MUST match BusinessShortCode environment
   - If using sandbox: `https://sandbox.safaricom.co.ke/`
   - If using production: `https://api.safaricom.co.ke/`

3. **Test with Safaricom's test numbers**
   - Sandbox test phone: `254708374149`
   - Amount should be small (1 KSh works)

### ❌ If you see callback but "Booking not found" error:

1. **CheckoutRequestID mismatch**
   - In Vercel logs, look for:
     ```
     [M-Pesa] Processing callback for CheckoutRequestID: <X>
     [M-Pesa] ❌ Booking not found for CheckoutRequestID: <X>
     ```
   - This means the `checkoutRequestId` saved during STK Push doesn't match callback
   
   **Fix:**
   - Check `/api/mpesa.ts` STK Push section updates booking:
     ```typescript
     await Booking.findByIdAndUpdate(bookingId, {
       paymentStatus: "processing",
       checkoutRequestId,  // ← THIS must be saved
       mpesaPhone: phoneNumber,
     });
     ```

2. **Database connection issue**
   - Look for connection timeout errors in logs
   - Verify MongoDB connection string in `.env`

### ❌ If callback succeeds but polling never shows "completed":

1. **Database not actually being updated**
   - In Vercel logs, you should see:
     ```
     [M-Pesa] ✅ Payment record created: <paymentId>
     [M-Pesa] ✅ Booking <bookingId> marked as completed. New status: completed
     ```
   - If this log is missing, the database write failed

2. **Polling endpoint returns wrong status**
   - Check browser console logs:
     ```
     [BookTurf] Status received: "processing"  // ← should be "completed"
     ```
   - This means database update succeeded but polling query didn't read it

### ❌ If frontend shows "Processing" screen forever:

1. **Polling reached 5-minute timeout**
   - Browser console will show:
     ```
     [BookTurf] ⏱️ Polling timeout reached
     ```
   - This means callback was NEVER received

2. **Payment actually succeeded but callback delayed**
   - Check M-Pesa account balance (money was deducted)
   - Wait 5+ minutes and refresh `/mybookings` page
   - Status might update after polling stops

---

## How to Check Vercel Logs in Real-Time

1. **Option A: Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select `turf-booked-v2` project
   - Click "Logs" tab
   - Search for `[M-Pesa]` or `[BookTurf]`

2. **Option B: CLI (requires setup)**
   ```bash
   vercel logs
   ```

3. **Option C: During local testing with ngrok**
   ```bash
   ngrok http 5173  # or your dev port
   # Update CALLBACK_URL in .env to ngrok URL
   # Frontend requests appear in Vercel Function logs
   ```

---

## Test Scenario: Quick Payment Test

### Setup:
1. Deploy changes to Vercel (git push)
2. Wait 30 seconds for deployment
3. Open https://turf-booked-v2.vercel.app
4. Sign in with Auth0
5. Navigate to booking page

### Test Payment:
1. Select **DeKUT Green Pitch** (1 KSh)
2. Select any date/time
3. Enter phone: `254708374149` (Safaricom test number)
4. Click "Pay KSh 1 with M-Pesa"
5. **DO NOT enter PIN** - just observe if STK prompt appears

### Observe:
- **Browser**: Watch console for `[BookTurf]` logs
- **Vercel**: Go to Logs tab, search `[M-Pesa]`
- **Phone**: Should see STK push prompt in 5-10 seconds
- **Phone**: If you see prompt, payment flow is working

### If STK prompt appears = Your integration is ✅ WORKING
- Money is being deducted when PIN is entered
- Check logs to verify callback processing

---

## Common Issues & Fixes

| Issue | Logs to Check | Solution |
|-------|--------------|----------|
| "STK prompt never appears" | `[M-Pesa] STK Push Callback URL` | Verify callback URL is correct |
| "Money deducted but status doesn't update" | `[M-Pesa] ❌ Callback received but booking not found` | Fix CheckoutRequestID saving |
| "Callback received but payment shows failed" | `[M-Pesa] Result Code: <non-zero>` | User cancelled PIN entry |
| "Payment shows completed but MyBookings empty" | Check if `/api/bookings?userId=xxx` returns bookings | Verify userId is being sent correctly |

---

## Key Environment Variables (Vercel Dashboard)

```
VERCEL_URL=turf-booked-v2.vercel.app (auto-set by Vercel)
MPESA_CONSUMER_KEY=xxxxx
MPESA_CONSUMER_SECRET=xxxxx
MPESA_SHORTCODE=123456
MPESA_PASSKEY=xxxxx
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_AUTH0_DOMAIN=your-domain.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=xxxxx
AUTH0_SECRET=xxxxx
```

**CRITICAL:** All secrets must have `.trim()` applied in code to remove hidden whitespace from paste operations.

---

## Payment States in Database

When you query a booking, `paymentStatus` will be one of:

- `"pending"` - Initial state (user hasn't started payment)
- `"processing"` - STK Push sent, waiting for PIN entry
- `"completed"` - Payment successful, money deducted
- `"failed"` - Payment rejected (user cancelled or insufficient funds)

Polling listens for transitions: `"processing"` → `"completed"` or `"failed"`

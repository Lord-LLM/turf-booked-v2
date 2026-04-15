# M-Pesa Booking Flow - Quick Reference

## Component: `BookTurf.tsx`

### User Enters Booking Details
```
┌─────────────────────────────────┐
│  Date & Time Selection          │
├─────────────────────────────────┤
│  Name: [________________]        │
│  Email: [________________]       │
│  Guests: [1] [2] [3] ...        │
│  M-Pesa: [2547XXXXXXXX]         │
│          (Format: 2547XXXXXXXX) │
│                                 │
│  [Pay KSh 1950 with M-Pesa]    │
└─────────────────────────────────┘
```

### Validation Rules
- **Name**: Required, non-empty
- **Email**: Required, valid format
- **M-Pesa Phone**: Required, exactly format `2547XXXXXXXX`
  - Must start with 254
  - Must be exactly 12 digits total
- **Guests**: 1-10 (auto-filled to 1)

### Valid M-Pesa Phone Numbers
✓ `254712345678` ← Correct
✓ `254701234567` ← Correct
✗ `0712345678` ← Wrong (missing 254)
✗ `+254712345678` ← Wrong (has + sign)
✗ `254712345` ← Wrong (too short)

## Payment Processing Flow

```
User Clicks "Pay"
    ↓
Form Validation
    ↓
    ├─ Invalid? → Show inline errors
    └─ Valid? → Continue
    ↓
POST /api/payments/mpesa/stkpush
    ↓
Backend Creates:
  • User (if new)
  • Payment (status: Pending)
  • Booking
    ↓
Returns: { bookingId, message }
    ↓
Show Loading State
"Please check your phone..."
    ↓
Start Polling
GET /api/bookings/{bookingId}/status
(every 3 seconds)
    ↓
    ├─ status: "pending" → Continue polling
    ├─ status: "completed" → Show SUCCESS
    └─ status: "failed" → Show FAILURE
```

## UI States

### 1. IDLE (Form)
- User fills form
- Button: "Pay KSh 1950 with M-Pesa"
- Shows inline validation errors

### 2. PROCESSING (Loading)
- Spinner animation
- Message: "Please check your phone. Enter your M-Pesa PIN to complete the payment of KSh 1,950 to DeKUT Green Pitch."
- Form hidden
- Cannot interact

### 3. SUCCESS (Green)
- Large checkmark icon
- "Payment Successful! Booking Confirmed"
- Message: "Confirmation details sent to: [email]"
- Button: "View My Bookings"
- → Navigates to `/turfs`

### 4. FAILED (Red)
- Alert icon
- "Payment Failed"
- Message: "The M-Pesa payment could not be processed. Please check your phone and try again."
- Button: "Try Again"
- → Resets form to IDLE state

## Key Component Functions

### `validateMpesaPhone(phone: string): boolean`
Validates that phone matches format: `254\d{9}$`

### `validateForm(): boolean`
Checks all fields, sets error state

### `handleBook(): void`
1. Validates form
2. Calls `/api/payments/mpesa/stkpush`
3. Sets state to "processing"
4. Starts polling interval

### `pollBookingStatus(bookingId: string): void`
1. Fetches `/api/bookings/{bookingId}/status`
2. Checks payment status
3. Updates state accordingly
4. Stops polling on "completed" or "failed"

### `handleRetry(): void`
Resets form to IDLE state for retry

### `handleViewBookings(): void`
Navigates to `/turfs` page

## Backend Endpoints

### POST `/api/payments/mpesa/stkpush`
**Input:**
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

**Output (Success):**
```json
{
  "success": true,
  "bookingId": "65abc123...",
  "message": "STK Push initiated. Please check your phone."
}
```

**Output (Error):**
```json
{
  "error": "Invalid M-Pesa phone format. Must be 2547XXXXXXXX"
}
```

### GET `/api/bookings/{bookingId}/status`
**Output (Pending):**
```json
{
  "status": "pending",
  "booking": { "id": "...", "amount": 1950 },
  "payment": { "id": "...", "status": "Pending" }
}
```

**Output (Completed):**
```json
{
  "status": "completed",
  "booking": { "id": "...", "amount": 1950 },
  "payment": { "id": "...", "status": "Completed", "mpesaReceiptNumber": "LJ123456789" }
}
```

**Output (Failed):**
```json
{
  "status": "failed",
  "booking": { "id": "...", "amount": 1950 },
  "payment": { "id": "...", "status": "Failed" }
}
```

## Testing Quick Commands

### Test STK Push
```bash
curl -X POST http://localhost:5173/api/payments/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test",
    "email":"test@test.com",
    "mpesaPhone":"254712345678",
    "turfId":"turf1",
    "turfName":"Test Turf",
    "bookingDate":"2026-04-20",
    "startTime":"14:00",
    "endTime":"15:00",
    "guests":2,
    "totalAmount":1950
  }'
```

### Test Status Poll
```bash
# Replace 65abc123... with actual bookingId from STK push response
curl http://localhost:5173/api/bookings/65abc123.../status
```

## Error Messages

| Scenario | Error Message |
|----------|---------------|
| Missing M-Pesa phone | "M-Pesa phone is required" |
| Invalid format | "Invalid format. Use 2547XXXXXXXX" |
| Invalid email | "Invalid email format" |
| Missing name | "Name is required" |
| Network error | Toast: "[error message]" |
| Payment failed | Red screen: "Payment Failed" |

## Performance Notes

- Polling interval: 3 seconds (can be adjusted)
- Timeout: Component removes polling on unmount
- Memory: Ref-based cleanup prevents memory leaks
- Animations: Smooth transitions with Framer Motion

## Common Issues

| Issue | Solution |
|-------|----------|
| "Booking not found" | Ensure STK push succeeded and returned bookingId |
| Stuck on loading | Check backend API is running and reachable |
| Phone format rejected | Remove +, spaces, use exactly: 2547XXXXXXXX |
| Polling never completes | Check M-Pesa callback is updating payment status |

## Files Involved

- **Frontend**: `src/pages/BookTurf.tsx`
- **Backend STK**: `api/payments/mpesa/stkpush.ts`
- **Backend Status**: `api/bookings/[bookingId]/status.ts`
- **Backend Callback**: `api/payments/mpesa/callback.ts`
- **Models**: `api/models/{User,Payment,Booking}.ts`
- **DB**: `api/db.ts`

## Next Integration Steps

1. Get M-Pesa sandbox credentials
2. Add env variables: `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, etc.
3. Implement `getMpesaToken()` function
4. Replace STK push placeholder with real API call
5. Test with sandbox credentials
6. Deploy to production
7. Use production M-Pesa credentials

See `MPESA_INTEGRATION.md` for full details.

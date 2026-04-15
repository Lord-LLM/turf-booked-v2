# M-Pesa Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables Setup

Create `.env.production`:
```bash
# M-Pesa Production Credentials (from Safaricom)
MPESA_CONSUMER_KEY=your_production_consumer_key
MPESA_CONSUMER_SECRET=your_production_consumer_secret
MPESA_SHORTCODE=your_production_shortcode
MPESA_PASSKEY=your_production_passkey

# Production Webhook URL
NGROK_URL=https://turf-booked.vercel.app
# OR your custom domain

# MongoDB Production
MONGODB_URI=mongodb+srv://...

# Auth0 Production (if different)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_production_client_id
```

### 2. Code Changes for Production

#### File: `api/utils/mpesaAuth.ts`

Change OAuth endpoints:
```typescript
// BEFORE (Sandbox)
const tokenUrl = "https://sandbox.safaricom.co.ke/oauth/v1/generate";
const authHeader = `Basic ${Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64")}`;

// AFTER (Production)
const tokenUrl = "https://api.safaricom.co.ke/oauth/v1/generate";
const authHeader = `Basic ${Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64")}`;
```

#### File: `api/payments/mpesa/stkpush.ts`

Change STK Push endpoint:
```typescript
// BEFORE (Sandbox)
const stkResponse = await fetch(
  "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(stkPushPayload),
  }
);

// AFTER (Production)
const stkResponse = await fetch(
  "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(stkPushPayload),
  }
);
```

### 3. Vercel Deployment

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy
```bash
# First time
vercel

# Subsequent updates
vercel --prod
```

#### Step 3: Add Environment Variables in Vercel Dashboard

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add all M-Pesa credentials:
   - `MPESA_CONSUMER_KEY`
   - `MPESA_CONSUMER_SECRET`
   - `MPESA_SHORTCODE`
   - `MPESA_PASSKEY`
   - `NGROK_URL` (your Vercel domain)
   - `MONGODB_URI`

#### Step 4: Redeploy

```bash
vercel --prod
```

### 4. Safaricom Production Onboarding

1. **Request Production Access**
   - Email: developer-support@safaricom.co.ke
   - Include: Business details, use case, estimated volume
   - Safaricom will provide production credentials

2. **IP Whitelisting** (if required)
   - Get Vercel deployment IP
   - Add to Safaricom whitelist
   - Vercel IPs: Check Vercel deployment logs

3. **Callback URL Registration**
   - Safaricom may require callback URL pre-registration
   - Use: `https://your-domain.com/api/payments/mpesa/callback`
   - Update if domain changes

4. **SSL Certificate**
   - Vercel provides free SSL/TLS
   - ✅ Already secure with HTTPS

### 5. Testing Before Production

#### Sandbox Final Test Checklist
- [ ] M-Pesa phone validation working (254712345678)
- [ ] STK Push successfully returns CheckoutRequestID
- [ ] Callback webhook returns 200 OK immediately
- [ ] Database updates with receipt number
- [ ] Frontend polling detects completion
- [ ] Success screen displays with receipt number
- [ ] Failed payment sets status to "failed"
- [ ] Error handling works for invalid credentials

#### Production Test with Real Numbers
- [ ] Test with single real transaction
- [ ] Verify receipt number matches M-Pesa
- [ ] Verify webhook callback is received
- [ ] Check database records are correct
- [ ] Verify user receives payment confirmation

## Rollback Plan

If issues occur in production:

### 1. Immediate Rollback
```bash
# Revert to previous deployment
vercel --prod rollback

# Or redeploy from git
git checkout <previous-commit>
vercel --prod
```

### 2. Disable Payments Temporarily
```typescript
// In api/payments/mpesa/stkpush.ts
export default async function handler(req: any, res: any) {
  return res.status(503).json({
    error: "Payments temporarily disabled for maintenance"
  });
}
```

### 3. Emergency Webhook Redirect
If callback URL changes:
1. Update `NGROK_URL` in Vercel
2. Redeploy
3. Safaricom will send callbacks to new URL

## Monitoring & Debugging

### 1. Check Vercel Logs

```bash
# View real-time logs
vercel logs <deployment-url>

# Or in Vercel dashboard:
# Project → Deployments → Click deployment → Logs
```

### 2. Database Monitoring

```bash
# MongoDB Atlas Dashboard
# 1. Go to https://cloud.mongodb.com/
# 2. Select your cluster
# 3. Collections → Look for:
#    - Bookings with paymentStatus: "pending" (should be few)
#    - Bookings with paymentStatus: "completed"
#    - CheckoutRequestID values

# Query example:
# db.bookings.find({ paymentStatus: "pending" }).count()
# If growing, payments may be stuck
```

### 3. Safaricom API Status

```bash
# Check Safaricom sandbox/production status
# Visit: https://developer.safaricom.co.ke/status

# Common issues:
# - OAuth token endpoint down
# - STK Push endpoint down
# - Firewall blocking requests
```

### 4. Error Logs to Watch

```
[STK Push] Failed: error_code
→ Check Safaricom documentation for error code

[STK Push] Safaricom response: ResponseCode: "0"
→ Success! Check bookingId was created

[M-Pesa Callback] Booking not found for CheckoutRequestID
→ Webhook received but booking not in database (data sync issue)

[M-Pesa Callback] Error processing callback
→ Database write failed (check MongoDB connection)
```

## Common Issues & Solutions

### Issue 1: "Invalid Credentials" from Safaricom

**Symptoms:** 400 Bad Request, credentials error
**Cause:** Wrong Consumer Key/Secret
**Fix:**
1. Verify credentials from Safaricom portal
2. Check .env file (no spaces, exact copy)
3. Redeploy to Vercel
4. Check logs for exact error message

### Issue 2: "Invalid Password" from Safaricom

**Symptoms:** 401 Unauthorized, password error
**Cause:** Incorrect password encoding
**Fix:**
1. Verify MPESA_PASSKEY from Safaricom
2. Check timestamp format is YYYYMMDDHHmmss
3. Verify base64 encoding: `shortcode + passkey + timestamp`
4. Check server time is synchronized

### Issue 3: Webhook Not Received

**Symptoms:** Payment completed on phone but frontend still polling
**Cause:** Callback URL wrong or firewall issue
**Fix:**
1. Check NGROK_URL in .env (must be exact)
2. Verify callback URL in STK Push payload
3. Check firewall allows incoming webhooks
4. Ask Safaricom to verify callback endpoint

### Issue 4: "Booking Not Found" in Callback

**Symptoms:** Callback received but database not updated
**Cause:** CheckoutRequestID mismatch or database lag
**Fix:**
1. Verify CheckoutRequestID saved correctly in booking
2. Check MongoDB connection is working
3. Add retry logic for database operations
4. Increase callback processing timeout

### Issue 5: High Latency on STK Push

**Symptoms:** STK Push response takes >1 second
**Cause:** Token regeneration, network latency
**Fix:**
1. Token caching should prevent regeneration
2. Check if cache is working (logs should show cache hit)
3. Verify Safaricom OAuth endpoint is responsive
4. Consider implementing request timeout (e.g., 30 seconds)

## Performance Optimization

### 1. Reduce Token Regeneration

Current: Token cached for 3595 seconds
- ✅ Already optimized

### 2. Database Connection Pooling

Already implemented in `api/db.ts`:
```typescript
// Connection is cached and reused across invocations
// ✅ Already optimized for Vercel
```

### 3. Webhook Processing Timeout

Add timeout to callback processing:
```typescript
// In api/payments/mpesa/callback.ts
processCallbackAsync(...).catch(error => {
  console.error("[M-Pesa Callback] Error:", error);
  // CRITICAL: Already sent 200 OK, so error won't affect user
});
```

## Security Considerations

### 1. Webhook Signature Verification

Optional: Verify callback authenticity:
```typescript
// Safaricom may include signature header
// Verify before processing
const signature = req.headers['x-safaricom-signature'];
// Verify signature using Safaricom public key
```

### 2. Rate Limiting

Add rate limiting for STK Push endpoint:
```typescript
// Prevent abuse
// Max 10 requests per minute per user
```

### 3. Input Validation

✅ Already implemented:
- M-Pesa phone format validated
- Amount validated (positive integer)
- User existence checked
- CheckoutRequestID uniqueness enforced

### 4. HTTPS Only

✅ Already enforced:
- Vercel provides free SSL/TLS
- All API calls use HTTPS

## Support Contacts

- **Safaricom Developer Support**: developer-support@safaricom.co.ke
- **Safaricom Developer Portal**: https://developer.safaricom.co.ke/
- **Vercel Support**: https://vercel.com/support
- **MongoDB Support**: https://support.mongodb.com/

## Deployment Summary

1. ✅ Code changes (OAuth/STK Push endpoints)
2. ✅ Environment variables added to Vercel
3. ✅ Get production credentials from Safaricom
4. ✅ Update callback URL with Safaricom
5. ✅ Deploy to Vercel (`vercel --prod`)
6. ✅ Test with real payment
7. ✅ Monitor logs for errors
8. ✅ Go live!

---

**Ready for Production**: Yes ✅
**Estimated Deployment Time**: 30 minutes
**Rollback Time**: < 5 minutes

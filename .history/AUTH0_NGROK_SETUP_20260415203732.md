# Auth0 Ngrok Configuration - Quick Steps

## Your Ngrok URL
Replace `feb9-102-0-16-184.ngrok-free.app` with your actual current ngrok URL from the terminal.

## Auth0 Dashboard Update

1. Go to: https://manage.auth0.com/
2. Click: **Applications** → Your App (Turf-Booked)
3. Scroll to: **Application URIs** section

### Update These Three Fields

**Allowed Callback URLs:**
```
http://localhost:5173, https://feb9-102-0-16-184.ngrok-free.app
```

**Allowed Logout URLs:**
```
http://localhost:5173, https://feb9-102-0-16-184.ngrok-free.app
```

**Allowed Web Origins:**
```
http://localhost:5173, https://feb9-102-0-16-184.ngrok-free.app
```

4. Click **Save Changes** at the bottom

## Why This Works

- **Callback URLs**: Where Auth0 returns AFTER user logs in
- **Logout URLs**: Where Auth0 returns AFTER user logs out
- **Web Origins**: Which domains can call Auth0 APIs

Your React app now uses `window.location.origin` to dynamically redirect, so it works from:
- ✅ `http://localhost:5173` (local dev)
- ✅ `https://your-ngrok-url.ngrok-free.app` (ngrok testing)
- ✅ `https://turf-booked.vercel.app` (production)

As long as you add them to Auth0's allowed list!

## After Saving

1. Go back to your ngrok URL in the browser
2. Refresh the page
3. Click "Sign In"
4. You should now be redirected to Auth0 login
5. After logging in, you'll be redirected back to your ngrok URL
6. Success! ✅

---

**Note**: Each time you restart ngrok and get a new URL, add it to Auth0's allowed list. For production, you'll only need to add your actual domain.

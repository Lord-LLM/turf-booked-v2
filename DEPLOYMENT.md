# turf-booked Deployment Guide

## Environment Variables

Set these in Vercel dashboard:

- `MONGODB_URI`: Your MongoDB connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`
  - Get from: MongoDB Atlas → Connect → Copy connection string

- `MONGODB_DB`: Database name (default: `turf-booked`)

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your GitHub repository: `Lord-LLM/turf-booked`
   - Vercel auto-detects settings from `vercel.json`

3. **Set Environment Variables**
   - In Vercel project settings → Environment Variables
   - Add `MONGODB_URI` (your MongoDB Atlas connection string)
   - Add `MONGODB_DB` = `turf-booked`

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your API routes will be at `/api/bookings`, `/api/auth/signup`, `/api/auth/signin`

## API Endpoints (After Deploy)

- `POST /api/bookings` — Save turf booking
- `POST /api/auth/signup` — Create user account
- `POST /api/auth/signin` — Login user

## Frontend Features

- **Home** (`/`) — Landing page
- **Browse Turfs** (`/turfs`) — All available turfs
- **Book Turf** (`/book/:id`) — Book specific turf (requires MongoDB)
- **Sign Up** (`/signup`) — Create account (requires MongoDB)
- **Sign In** (`/signin`) — Login (requires MongoDB)
- **How It Works** (`/how-it-works`) — Info page

## Local Testing

```bash
npm run dev
```

Then call your local API:
```bash
curl -X POST http://localhost:5173/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","phone":"+254712345678","password":"password123"}'
```

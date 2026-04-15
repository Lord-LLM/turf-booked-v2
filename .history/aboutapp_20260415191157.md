# Turf-Booked Project Overview

## Project Description
**Turf-Booked** is a web application for browsing and booking sports turfs (artificial turf fields). It's built with modern React technologies and provides users with a platform to discover available turfs and make bookings.

---

## Core Technologies
- **Frontend**: React + TypeScript + Vite (fast build tool)
- **Styling**: Tailwind CSS + shadcn-ui (pre-built accessible components)
- **Animation**: Framer Motion
- **State Management**: TanStack React Query
- **Backend**: Node.js API endpoints
- **Forms**: React Hook Form + Zod validation

---

## Project Structure & Relationships

### `src/` - Frontend Application

#### Pages (`src/pages/`)
Main page components that represent different routes in the application.

| File | Purpose | Relationships |
|---|---|---|
| `Index.tsx` | Landing/home page | Shows featured turfs, hero section, call-to-action |
| `AboutTurfs.tsx` | Browse all turfs page | Displays turf listings and filtering options |
| `BookTurf.tsx` | Turf booking/details page | Called from TurfCard with turf ID parameter |
| `HowItWorksPage.tsx` | Instructions/guide page | Linked from Navbar and home page |
| `SignIn.tsx` | User login form | Calls `/api/auth/signin`, stores user to localStorage |
| `SignUp.tsx` | User registration form | Calls `/api/auth/signup`, redirects to signin after success |
| `NotFound.tsx` | 404 error page | Fallback route for invalid URLs |

#### Components (`src/components/`)
Reusable UI components used across pages.

| File | Purpose | Used In |
|---|---|---|
| `Navbar.tsx` | Navigation header with links | Every page (via layout) |
| `Footer.tsx` | Footer section | Every page (via layout) |
| `HeroSection.tsx` | Landing banner with CTA | Index page |
| `FeaturedTurfs.tsx` | Carousel of featured turfs | Index page |
| `TurfCard.tsx` | Individual turf display card | AboutTurfs, FeaturedTurfs |
| `HowItWorks.tsx` | Process explanation section | Index page |
| `ThemeToggle.tsx` | Light/dark mode switcher button | Navbar |
| `theme-provider.tsx` | Theme context and provider | App.tsx (wraps entire app) |
| `ui/` | shadcn-ui components (30+ components) | All other components (button, input, dialog, etc.) |

#### Data & Utilities

| Folder/File | Purpose |
|---|---|
| `data/turfs.ts` | Mock turf listings data |
| `hooks/use-toast.ts` | Toast notification hook |
| `hooks/use-mobile.tsx` | Mobile device detection hook |
| `lib/utils.ts` | CSS class merging and utility functions |

#### Core Files

| File | Purpose |
|---|---|
| `App.tsx` | Main app component - defines all routes and global providers |
| `main.tsx` | Application entry point - mounts App to DOM |
| `index.css` | Global styles |
| `App.css` | App-specific styles |
| `vite-env.d.ts` | Vite environment type definitions |

---

### `api/` - Backend API Endpoints

Backend endpoints that handle business logic and database operations.

| File | Purpose | Called By | Response |
|---|---|---|---|
| `auth/signin.ts` | User login endpoint | SignIn page | Returns user object or error message |
| `auth/signup.ts` | User registration endpoint | SignUp page | Returns userId and success message or error |
| `bookings.ts` | Booking operations | BookTurf page | Booking confirmation or error |
| `db.ts` | Database connection manager | All auth/booking endpoints | MongoDB connection instance |

**Note**: Auth endpoints currently use simulated login (accepts any credentials for testing).

---

### Configuration Files

| File | Purpose |
|---|---|
| `vite.config.ts` | Vite build tool configuration |
| `vitest.config.ts` | Vitest testing framework setup |
| `tsconfig.json` | TypeScript compiler settings |
| `tsconfig.app.json` | App-specific TypeScript settings |
| `tsconfig.node.json` | Node-specific TypeScript settings |
| `tailwind.config.ts` | Tailwind CSS customization and theme |
| `postcss.config.js` | CSS post-processing configuration |
| `eslint.config.js` | Code quality and style rules |
| `components.json` | shadcn-ui configuration |
| `package.json` | Project dependencies and npm scripts |
| `index.html` | HTML entry point for the app |
| `bun.lockb` | Bun package manager lock file |
| `vercel.json` | Vercel deployment configuration |

---

## User Flow & Navigation

```
User Visits App
    ↓
Index Page (Landing/Home)
    ├─ Hero Section
    ├─ Featured Turfs Carousel
    ├─ How It Works Section
    │
    ├─ "Browse Turfs" Button → AboutTurfs Page
    │   └─ View all available turfs
    │       └─ Click turf card → BookTurf Page
    │           └─ View details & book
    │
    ├─ "Sign Up" Link → SignUp Page
    │   └─ Create new account
    │       └─ Redirects to SignIn
    │
    └─ "Sign In" Link → SignIn Page
        └─ Enter credentials (simulated - any email/password works)
            └─ Redirects to AboutTurfs (turfs page)

HowItWorksPage
    └─ Accessible via "How It Works" link in Navbar
```

---

## Key Features

### 1. **Authentication**
- User sign-up and login pages
- Session management with localStorage
- Currently uses simulated login (accepts any credentials for testing)

### 2. **Turf Browsing**
- View all available turfs with details (price, location, amenities)
- Featured turfs carousel on home page
- Individual turf cards with booking links

### 3. **Booking System**
- Reserve turfs for specific dates and times
- API endpoint to handle bookings

### 4. **Theme Management**
- Toggle between light and dark modes
- System theme detection
- Persistent theme preferences

### 5. **Responsive Design**
- Mobile-friendly interface
- Works seamlessly on desktop and tablet
- Mobile detection hook for conditional rendering

---

## Component Relationships Diagram

```
App (Router & Global Providers)
├─ Theme Provider
├─ React Query Provider
├─ Tooltip Provider
└─ Routes
    ├─ Index Page
    │   ├─ Navbar
    │   ├─ HeroSection
    │   ├─ FeaturedTurfs
    │   │   └─ TurfCard (multiple)
    │   ├─ HowItWorks
    │   └─ Footer
    │
    ├─ AboutTurfs Page
    │   ├─ Navbar
    │   ├─ TurfCard (multiple)
    │   └─ Footer
    │
    ├─ BookTurf Page
    │   ├─ Navbar
    │   ├─ Booking Form
    │   └─ Footer
    │
    ├─ HowItWorksPage
    │   ├─ Navbar
    │   ├─ HowItWorks Component
    │   └─ Footer
    │
    ├─ SignUp Page
    │   ├─ Navbar
    │   ├─ Registration Form
    │   └─ Footer
    │
    ├─ SignIn Page
    │   ├─ Navbar
    │   ├─ Login Form
    │   └─ Footer
    │
    └─ NotFound Page
```

---

## Available NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server with hot reloading |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run lint` | Run ESLint to check code quality |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |

---

## How Data Flows

### Login Flow
1. User enters email/password on SignIn page
2. Form submission → POST request to `/api/auth/signin`
3. API simulates authentication (accepts any credentials)
4. Returns mock user object with id, name, email, phone
5. Frontend stores user in localStorage
6. Redirect to `/turfs` page

### Signup Flow
1. User fills signup form on SignUp page
2. Form submission → POST request to `/api/auth/signup`
3. API simulates account creation
4. Returns userId
5. Redirect to SignIn page

### Booking Flow
1. User selects turf and clicks "Book"
2. Navigate to BookTurf page with turf ID
3. User fills booking form (dates, times, etc.)
4. Form submission → POST request to `/api/bookings`
5. API processes booking
6. Display confirmation

---

## Technologies Summary

| Category | Technologies |
|---|---|
| **Runtime** | Node.js, Vite |
| **Language** | TypeScript, JavaScript |
| **UI Framework** | React 19+ |
| **Styling** | Tailwind CSS, PostCSS |
| **Component Library** | shadcn-ui (Radix UI based) |
| **Animation** | Framer Motion |
| **Forms** | React Hook Form, Zod |
| **State Management** | TanStack React Query |
| **Routing** | React Router |
| **Notifications** | Sonner, React Toaster |
| **Icons** | Lucide React |
| **Database** | MongoDB (optional backend) |
| **Testing** | Vitest |
| **Linting** | ESLint |
| **Deployment** | Vercel |
| **Package Manager** | Bun |

---

## Deployment

The project is configured for deployment on **Vercel**. See `vercel.json` for deployment settings.

---

## Notes

- The project is currently using **simulated authentication** that accepts any email/password combination for testing purposes
- All UI components are from shadcn-ui, which is built on Radix UI for accessibility
- The application uses TypeScript for type safety throughout
- The project follows modern React patterns with hooks and functional components

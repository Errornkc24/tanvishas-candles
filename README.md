# Tanvisha's Candles

Full-stack storefront split into a React/Vite frontend, an Express API, and shared database contracts. Supabase remains the Auth/Postgres provider, but this app uses its own Supabase project rather than Lovable-managed services. No Docker setup is included.

## Project layout

```text
frontend/
  src/app/                 App, router, providers, customer/admin route guards
  src/pages/               Route-level pages grouped by customer and admin areas
  src/components/layout/   Site header/footer, background, reveal effects
  src/components/shop/     Cart, product, address, stock, order components
  src/components/ui/       Shared shadcn UI
  src/context/             Auth and cart providers
  src/hooks/               Page and feature hooks
  src/services/            Frontend data and API service boundaries
  src/lib/                 Supabase browser client and pure helpers
  src/types/               Frontend type exports
  src/styles/              Global stylesheet
backend/
  src/app.ts               Express app and middleware
  src/server.ts            Local HTTP listener
  src/routes/              API route registration
  src/modules/             Feature modules with routes/controllers/services/repos/schemas
  src/middleware/          Authentication and error handling
  src/lib/                 Supabase REST forwarding and server clients
shared/src/                Supabase database types and shared order/payment contracts
supabase/migrations/       Empty schema, RLS policies, and database functions
```

TanStack Router and TanStack Query have been removed. React Router handles navigation and SWR handles request caching. Frontend data access lives in `services/`; database traffic goes through Express and retains the user's JWT so Supabase RLS and `auth.uid()` keep enforcing access. Supabase Auth and realtime subscriptions use the browser SDK. Payment credentials and signature verification stay in the backend.

## Local development

1. Create a Supabase project you control.
2. Apply the SQL files in `supabase/migrations/` in order, or link the folder with the Supabase CLI and run `supabase db push`.
3. Copy `frontend/.env.example` to `frontend/.env.local` and set the project's URL and anon key. Leave `VITE_API_URL` empty locally.
4. Copy `backend/.env.example` to `backend/.env` and set the same Supabase URL and anon key, plus the service-role secret. Add Razorpay keys to enable online payments.
5. Install root, frontend, and backend dependencies with `npm install` in each directory.
6. From this directory run `npm run dev`. The frontend is served at `http://localhost:5173` and `/api` requests are proxied to Express at `http://localhost:3001`.

Keep the service-role key in `backend/.env` or the backend deployment environment. Never prefix it with `VITE_`.

## Vercel deployment

Create separate Vercel projects from this repository with Root Directories `frontend` and `backend`. The frontend uses the Vite SPA rewrite in `frontend/vercel.json`; Vercel detects the Express app from `backend/src/index.ts`.

Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` in the frontend project. Set `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `CORS_ORIGIN` in the backend project. `VITE_API_URL` should point to the backend origin and `CORS_ORIGIN` should include the storefront origin.

## Database setup

The migrations create an empty schema with the store's tables, policies, triggers, admin roles, and transactional order/stock functions. They do not copy customer accounts, products, or order history. Configure email and Google OAuth redirect URLs in the new Supabase project; users will sign in to that project.

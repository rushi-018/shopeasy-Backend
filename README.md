# Shopeasy Backend

Express API for products, payments, uploads, and web scraping (Amazon/Flipkart via axios+cheerio with resilient fallbacks). Designed for serverless deployment on Vercel.

Links
- Repo: https://github.com/rushi-018/shopeasy-Backend
- Frontend repo: https://github.com/rushi-018/Shopeasy-Frontend

## Tech
- Node.js, Express
- axios + cheerio scraping with user-agent rotation and fallbacks
- Optional MongoDB via Mongoose (can be disabled)
- Razorpay integration (optional)
- Cloudinary uploads (optional)

## Project structure
- `src/server.js` (serverless entry), `server.js` (optional local entry)
- `src/app.js` Express app setup
- `src/routes/` route modules (auth, products, scraper, payments, uploads, stores, profile)
- `src/controllers/` business logic per domain
- `src/services/webScraperService.js` scraping implementation
- `src/middleware/` auth, validation, error handler, upload
- `vercel.json` serverless config (routes all traffic to `src/server.js`)
- `env.example` sample env keys

## Prerequisites
- Node.js 18+ and npm

## Environment variables
Copy `env.example` to `.env` and set values as needed:
```
# Core
PORT=5000
NODE_ENV=development

# Optional database
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>

# Auth (if using JWT-secured routes)
JWT_SECRET=your-strong-secret

# Razorpay (optional)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxx

# Cloudinary (optional uploads)
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

Notes:
- For serverless/Vercel, set these in Project → Settings → Environment Variables.
- If you’re not using MongoDB, keep `connectDB()` disabled and routes that require DB should be treated as demo endpoints.

## Local development
```bash
# from this folder
npm install
npm run dev   # nodemon src/server.js on :5000
```
Base URL (local): `http://localhost:5000/api`

## Key endpoints (scraper)
- `GET /api/scraper/status` health/status JSON
- `GET /api/scraper/trending?limit=8` trending products (live > fallback)
- `GET /api/scraper/search?q=iphone&limit=10` search by query

Other route groups exist (products, payments, uploads, stores, auth). See `src/routes/` for exact paths.

## CORS
CORS headers are set centrally to allow cross-origin requests:
- Access-Control-Allow-Origin: `*`
- Access-Control-Allow-Methods: `GET, POST, PUT, DELETE, PATCH, OPTIONS`
- Access-Control-Allow-Headers: `Origin, X-Requested-With, Content-Type, Accept, Authorization`
- Preflight `OPTIONS` requests return `200`.

If you need restricted origins in production, add your frontend domain(s) explicitly and remove the wildcard.

## Scraper behavior
- Primary: axios + cheerio scraping of Amazon/Flipkart with:
  - Rotating user agents, realistic headers, rate limiting
  - Multiple selectors for robustness
- Fallback: tries `dummyjson.com` API, then local mock data
- Responses include a `mode` or `isMock` indicator so the UI can show status (live vs fallback).

## Payments (optional)
- Razorpay order creation and verification supported if keys are present.
- Ensure you trim or correctly set `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` in env and do not log secrets.

## Uploads (optional)
- Cloudinary config in `src/config/cloudinary.js`
- Requires the three Cloudinary env variables.

## Deployment (Vercel)
- Create a dedicated Vercel project for the backend (separate from frontend).
- Project root: this repo
- The included `vercel.json` routes all requests to `src/server.js` (serverless).
- Do NOT call `app.listen()` inside serverless entry; export the Express app.
- Set env vars in Vercel Project → Settings → Environment Variables.
- Deployment Protection:
  - Disable “Vercel Authentication: Standard Protection” for Production (and Preview while testing)
  - Otherwise, requests return 401 HTML instead of reaching Express and CORS headers won’t apply.

## Verify
1) Open: `https://<your-backend>.vercel.app/api/scraper/status`
   - Should return JSON with `success: true` (not an HTML page).
2) From the frontend app, check DevTools console for the “API Base URL” log and ensure it matches your backend domain.

## Troubleshooting
- 401 Unauthorized or HTML response: Disable Deployment Protection on the backend project.
- CORS errors: Confirm requests hit the backend (JSON response), not a rewrite/auth page.
- Scraping returns fallback only: Sites may throttle; try different query or wait. Fallbacks ensure the UI keeps working.

## Scripts
- `npm run dev` Run development server on port 5000
- `npm run start` Run server (non-nodemon)
- `npm run seed` Seed demo products (if DB is enabled and script is configured)

## License
MIT

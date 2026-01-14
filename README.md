## Resident Dashboard Prototype (Next.js + Tailwind)

Resident-facing dashboard prototype for retirement / assisted-living communities.

### Features

- **Senior-friendly UI**: large text, high contrast, simple layout
- **Dashboard (`/`)**:
  - Clock + date at the top
  - Today’s meals (breakfast/lunch/dinner)
  - Today’s events/activities
  - Photo slideshow (uses `public/photos/`)
- **Admin editor (`/admin`)**:
  - Password protected via `ADMIN_PASSWORD`
  - Edits meals/events/photos and saves to **localStorage** (demo/MVP)
- **Single JSON source of truth**: `data/dashboard.json` (safe to bundle/read on the frontend)

## Getting Started

### Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### Admin password (local)

Create a `.env.local` file:

```bash
ADMIN_PASSWORD=change-me
```

Then open `http://localhost:3000/admin` and enter the password to unlock editing.

> Note: Admin edits are stored in **localStorage**, so they are per-device/per-browser for demo purposes.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

### Deploying

- Push this repo to GitHub and import it into Vercel.
- In **Project Settings → Environment Variables**, add:
  - `ADMIN_PASSWORD` = your chosen admin password
- Deploy.

### Content editing & storage

- **Base content** lives in `data/dashboard.json` and is bundled for safe static reading.
- **Edits from `/admin`** are saved to localStorage key `resident-dashboard:data:v1`.
- For a real system (Firebase / API / multi-home support), replace the localStorage save/load with a backend write/read.

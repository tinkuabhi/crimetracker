# Backend

The backend is an Express API. It can persist incidents to MongoDB Atlas and falls back to an in-memory store when `MONGODB_URI` is not configured.

## Commands

From the repository root:

```bash
npm run dev:backend
npm run lint --workspace backend
npm run build --workspace backend
```

The API listens on port `3000` by default. Override it with `PORT`.

## Configuration

Copy `.env.example` to `.env` and configure only the values you need:

- `MONGODB_URI`: optional MongoDB Atlas connection string.
- `GEMINI_API_KEY`: required for Gemini-backed ingestion.
- `BACKEND_API_URL`: target endpoint for `ai_fetcher.py`; default is `http://localhost:3000/records`.

## AI fetcher

`ai_fetcher.py` is a one-run Python task. It fetches/normalizes incidents and posts them to the API. In Kubernetes, package it in its own image and run it as a `CronJob`; it is not an HTTP service.

Supply `GEMINI_API_KEY` and `BACKEND_API_URL` through Kubernetes Secrets/environment variables. Do not put either credential into an image.

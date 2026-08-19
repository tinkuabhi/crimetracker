# Frontend

The frontend is a React 19 single-page application built with Vite and Tailwind CSS.

## Commands

Run these from the repository root:

```bash
npm run dev:frontend
npm run lint --workspace frontend
npm run build --workspace frontend
```

Vite serves the app locally and proxies `/api` and `/records` to the backend at `http://localhost:3000`.

## Production deployment

Build output is written to `frontend/dist`. Serve it from a static web server such as Nginx. Configure that server or your Kubernetes Ingress to forward `/api` and `/records` requests to the backend service.

The application uses relative API paths, so this routing is required in production.

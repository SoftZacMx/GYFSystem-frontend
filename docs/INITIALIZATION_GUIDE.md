# Files Manager Frontend — Initialization Guide

This document is for **AI agents** and **developers** to configure and deploy the frontend from scratch. Follow the steps in order.

---

## Purpose

- **Project:** Web UI for Files Manager (documents, students, users, events, notifications, company).
- **Stack:** React 19, TypeScript, Vite, Tailwind CSS.
- **Goal:** Run the app locally and build for production. The frontend consumes the Files Manager API (backend).

---

## Prerequisites

- **Node.js** 18+ (LTS).
- **npm** (or compatible package manager).
- **Files Manager API** running and reachable (default: `http://localhost:3000`).

---

## Step-by-step setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

- Copy the example file: `cp .env.example .env`
- Edit `.env`:

| Variable | Required | Default | Notes |
|----------|----------|---------|--------|
| `VITE_API_URL` | No | `http://localhost:3000` | Base URL of the backend API (no trailing slash). |

The app uses `import.meta.env.VITE_API_URL` (see `src/lib/env.ts`). All client env vars must be prefixed with `VITE_`.

### 3. Run in development

```bash
npm run dev
```

Opens the dev server (default: http://localhost:5173). Use an existing API user to log in.

### 4. Build for production

```bash
npm run build
```

Output is in `dist/`. Serve that folder with any static host (Nginx, Vercel, Netlify, etc.).

### 5. Preview production build locally (optional)

```bash
npm run preview
```

Serves the `dist/` folder locally to test the production build.

---

## Scripts reference

| Script | Description |
|--------|--------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + Vite build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Run ESLint |

---

## Deployment checklist

1. Set `VITE_API_URL` to the production API URL (e.g. `https://api.example.com`) **at build time**. Vite inlines env vars at build, so the same `dist/` is tied to that API URL unless you use runtime config.
2. Build: `npm run build`.
3. Deploy the contents of `dist/` to a static hosting service or web server.
4. Ensure the API allows the frontend origin in CORS (`CORS_ORIGIN` on the backend).

---

## Project structure (reference)

- `src/lib` — API client, env helpers.
- `src/types` — Shared TypeScript types.
- `src/contexts` — React context (Auth, Theme).
- `src/pages` — Route pages (Login, Dashboard, Users, Students, Documents, etc.).
- `src/components` — Reusable UI and layout (Layout, ProtectedRoute, ThemePicker, etc.).
- `src/theme` — Theming (e.g. color palette, localStorage persistence).

---

## Troubleshooting

- **Network/CORS errors when calling the API:** Check `VITE_API_URL` and that the backend `CORS_ORIGIN` includes the frontend origin (e.g. `http://localhost:5173` in dev).
- **Login fails or 401:** Ensure the API is running and the user exists; the client sends JWT in `Authorization: Bearer <token>`.

---

## Related docs

- **Frontend spec and conventions:** `docs/FRONTEND_PROMPT.md`
- **README:** `../README.md`

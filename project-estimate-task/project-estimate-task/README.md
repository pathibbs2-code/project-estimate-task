# Project-Estimate-Task

Sutton Flooring's shared job board — Residential, Commercial, Task, Ryan
Review, and Sent Complete, with automation, due-date alarms, notes, and file
attachments.

This version runs standalone (no Claude.ai dependency): a static front end
(`index.html`) talks to a small API (`/api`) backed by a Neon Postgres
database, all hosted for free on Vercel.

## Structure

- `index.html` — the entire app (unchanged from the original, aside from
  swapping its storage calls).
- `storage-shim.js` — replaces Claude's built-in `window.storage` with calls
  to our own `/api/kv` endpoints. This is the only reason the app works
  outside Claude.ai at all.
- `api/kv.js` — get / set / delete a single key.
- `api/kv-list.js` — list keys by prefix.
- `lib/db.js` — shared Postgres connection, using the `DATABASE_URL`
  environment variable.

## Environment variables (set in Vercel, not in this repo)

- `DATABASE_URL` — your Neon connection string.

## Local development

```
npm install
vercel dev
```

(Requires the Vercel CLI: `npm i -g vercel`, and a `.env.local` file with
`DATABASE_URL=...` for local testing.)

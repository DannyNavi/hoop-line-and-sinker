# Hoop, Line & Sinker

AI-assisted basketball shooting training coached against form models for **Klay Thompson**, **Stephen Curry**, and **Damian Lillard**.

**Live demo:** [https://hoop-line-and-sinker.vercel.app](https://hoop-line-and-sinker.vercel.app)

Design language inspired by [Ellipsus](https://ellipsus.com/#introduction).

## Form models

The coaching engine in `src/lib/formModels.ts` scores each rep on eight pillars (base, gather, set point, alignment, guide hand, release, follow-through, landing). Ideal pose bands, cues, and drills differ per athlete:

- **Klay** — catch-and-shoot purity
- **Steph** — one-motion fluidity
- **Dame** — logo power / step-back rise

Pick a model on `/train`. Sinker returns cues + a matching drill. Logged reps are saved in **session history** on-device (`localStorage`).

## Live pose + video upload

`/train` supports:

1. **Live camera** — MediaPipe Pose in the browser
2. **Upload clip** — analyze a local video with the same pose → form pipeline

Pose analysis stays **on-device** (privacy + latency). Persistence uses a **Spring Boot** API:

- `POST /api/videos` — multipart upload
- `GET /api/videos` — list saved clips
- `GET /api/videos/{id}/file` — stream the file

## Stack

- Next.js (App Router), TypeScript, Tailwind, Framer Motion
- MediaPipe Tasks Vision (browser)
- Spring Boot 3 (Java 21) video API

## Run locally

### Frontend

```bash
npm install
npm run dev
```

- `/` — marketing site
- `/train` — live coaching + upload

Optional: point the UI at your API with `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8080`).

### Spring video API

```bash
cd backend
mvn spring-boot:run
```

API listens on `http://localhost:8080`. Upload still works for local analysis if the API is offline; Spring is only required to **persist** clips.

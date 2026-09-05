# Hoop, Line & Sinker

AI-assisted basketball shooting training coached against form models for **Klay Thompson**, **Stephen Curry**, and **Damian Lillard**.

**Live demo:** [https://hoop-line-and-sinker.vercel.app](https://hoop-line-and-sinker.vercel.app)

Design language inspired by [Ellipsus](https://ellipsus.com/#introduction).

## Form models

The coaching engine in `src/lib/formModels.ts` scores each rep on eight pillars (base, gather, set point, alignment, guide hand, release, follow-through, landing). Ideal pose bands, cues, and drills differ per athlete:

- **Klay** — catch-and-shoot purity
- **Steph** — one-motion fluidity
- **Dame** — logo power / step-back rise

Pick a model on `/train`. Sinker returns cues + a matching drill.

## Live pose tracking

`/train` runs **MediaPipe Pose** in the browser, estimates joints from your webcam, and maps them onto the selected checklist. Log make/miss after a rep to score the pose buffer.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion

## Run locally

```bash
npm install
npm run dev
```

- `/` — marketing site
- `/train` — live coaching session

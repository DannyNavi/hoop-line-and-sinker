# Hoop, Line & Sinker

AI-assisted basketball shooting training — film your reps, get live form feedback, and build a cleaner release.

Design language inspired by [Ellipsus](https://ellipsus.com/#introduction): editorial serif headlines, cream paper surfaces, dark letter-field hero, pill CTAs, and hand-drawn accents.

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

Open [http://localhost:3000](http://localhost:3000).

- `/` — marketing site
- `/train` — interactive coaching session demo (log makes/misses for live AI cues)

## Publish to GitHub

This workspace has no GitHub auth. From your machine:

```bash
gh auth login
cd arc
gh repo create hoop-line-and-sinker --public --source=. --remote=origin --push
```

## Product sketch

- Live form overlay from court camera
- AI coach cues tied to your tendencies
- Session metrics: makes, form score, focus notes
- Adaptive drills (warm-up → pressure → recap)

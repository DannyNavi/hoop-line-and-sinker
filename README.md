# Hoop, Line & Sinker

AI-assisted basketball shooting training coached against a **Klay Thompson form model**.

Design language inspired by [Ellipsus](https://ellipsus.com/#introduction). Form model distilled from published breakdowns of Thompson's catch-and-shoot jumper.

## Klay form model

The coaching engine in `src/lib/klayModel.ts` scores each rep on eight pillars:

1. Wide base
2. Compact dip
3. High set point
4. Straight line / elbow in
5. Quiet guide hand
6. Relaxed release
7. Efficient follow-through
8. Vertical land

Sinker returns cues + a matching drill. This is a rules/rubric coach (not a neural net). Live pose video can later map into the same checklist.

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
- `/train` — Klay-model coaching session (log makes/misses)

## Repo

https://github.com/DannyNavi/hoop-line-and-sinker

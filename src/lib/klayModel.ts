/**
 * Klay Thompson form model
 * ---------------------------
 * Coaching rubric distilled from published breakdowns of Thompson's jumper:
 * wide balanced base, quick compact dip to the hip, high set point before lift,
 * elbow in / hand under the ball, quiet guide hand, relaxed wrist release,
 * efficient follow-through, and vertical land without drift.
 *
 * This is a rules + cue engine (not a neural net). Live pose video can later
 * map into the same checklist scores.
 */

export type FormPillar =
  | "base"
  | "gather"
  | "setPoint"
  | "alignment"
  | "guideHand"
  | "release"
  | "followThrough"
  | "landing";

export type Severity = "focus" | "good" | "fix";

export type FormCue = {
  pillar: FormPillar;
  title: string;
  detail: string;
  severity: Severity;
  /** Ideal Klay target for this cue */
  klayTarget: string;
};

export type PillarScore = {
  pillar: FormPillar;
  label: string;
  score: number;
  target: string;
};

export const KLAY_MODEL = {
  id: "klay-thompson-v1",
  athlete: "Klay Thompson",
  tagline: "Catch. Dip. Rise. Splash.",
  summary:
    "Modeled on Thompson's catch-and-shoot jumper: wide base, quick hip dip, high forehead set point, elbow in, quiet guide hand, and a relaxed four-finger release.",
  pillars: [
    {
      id: "base" as const,
      label: "Wide base",
      target: "Feet outside shoulders, flexed, ready on the catch",
    },
    {
      id: "gather" as const,
      label: "Compact dip",
      target: "Quick bounce to waist / hip — load power, no wasted motion",
    },
    {
      id: "setPoint" as const,
      label: "High set point",
      target: "Ball at forehead, ~90° elbow, set before feet leave the floor",
    },
    {
      id: "alignment" as const,
      label: "Straight line",
      target: "Hand under center of ball, elbow in, slight shooting-shoulder turn",
    },
    {
      id: "guideHand" as const,
      label: "Quiet guide hand",
      target: "Off-hand shelves then clears before the wrist snap",
    },
    {
      id: "release" as const,
      label: "Relaxed release",
      target: "Soft wrist, middle/ring dominate, high elbow finish",
    },
    {
      id: "followThrough" as const,
      label: "Efficient follow-through",
      target: "Brief hold — fingers to rim, no tense freeze-frame",
    },
    {
      id: "landing" as const,
      label: "Vertical land",
      target: "Wide landing, little forward / fade drift",
    },
  ],
};

export const KLAY_CUES: FormCue[] = [
  {
    pillar: "base",
    title: "Widen the base",
    detail:
      "Feet looked narrow on the catch. Klay anchors outside shoulder-width so contact can’t knock the line off.",
    severity: "fix",
    klayTarget: "Wide, flexed stance before the rise",
  },
  {
    pillar: "base",
    title: "Ready feet",
    detail:
      "You were still settling when the ball arrived. Hop into a live base so the catch is already a shot load.",
    severity: "focus",
    klayTarget: "Hop / plant into a flexed catch",
  },
  {
    pillar: "gather",
    title: "Quicker dip",
    detail:
      "Dip stalled at the thigh. Bring it to the hip as a bounce, then go — Klay’s gather is a snap, not a wind-up.",
    severity: "fix",
    klayTarget: "Waist/hip dip as a quick bounce",
  },
  {
    pillar: "gather",
    title: "Clean gather path",
    detail:
      "Ball floated high left on the catch. Steer it to the right hip so the lift stays on one vertical track.",
    severity: "focus",
    klayTarget: "Dip to shooting-side hip for a straight rise",
  },
  {
    pillar: "setPoint",
    title: "Set before lift",
    detail:
      "You left the ground before the ball hit forehead height. Hit the set point first — then jump through the shot.",
    severity: "fix",
    klayTarget: "Set point reached before feet leave",
  },
  {
    pillar: "setPoint",
    title: "Raise the window",
    detail:
      "Set point sat at the chin. Bring it to forehead with a 90° elbow so the release clears closeouts.",
    severity: "focus",
    klayTarget: "Forehead set, elbow ~90°",
  },
  {
    pillar: "alignment",
    title: "Elbow in",
    detail:
      "Elbow flared on the rise. Tuck it under the ball so force goes through the middle — Klay’s line stays tight.",
    severity: "fix",
    klayTarget: "Elbow under ball, slight shoulder turn",
  },
  {
    pillar: "alignment",
    title: "Hand under the ball",
    detail:
      "Palm looked behind the ball. Slide under center so the push is straight through, not around.",
    severity: "focus",
    klayTarget: "Shooting hand centered under the ball",
  },
  {
    pillar: "guideHand",
    title: "Guide hand off early",
    detail:
      "Off-hand stayed on the ball into the snap and tugged left. Shelf it, then clear before the wrist breaks.",
    severity: "fix",
    klayTarget: "Guide hand clear before wrist snap",
  },
  {
    pillar: "guideHand",
    title: "Quiet shelf",
    detail:
      "Guide hand looked sticky. Keep it soft on the side — balance only — then get it out of the way.",
    severity: "focus",
    klayTarget: "Soft shelf, zero push on release",
  },
  {
    pillar: "release",
    title: "Relax the wrist",
    detail:
      "Wrist locked stiff at release. Klay’s finish has bounce — tension kills rotation and arc.",
    severity: "fix",
    klayTarget: "Relaxed wrist with natural finger curl",
  },
  {
    pillar: "release",
    title: "High elbow finish",
    detail:
      "Elbow never cleared the brow. Finish higher so the ball leaves on a softer Splash-Brothers arc.",
    severity: "focus",
    klayTarget: "Elbow above eyebrow on release",
  },
  {
    pillar: "followThrough",
    title: "Don’t freeze the pose",
    detail:
      "You held the goose-neck forever. A short, clean hold is enough — extra tension creeps into the next catch.",
    severity: "focus",
    klayTarget: "Brief, efficient follow-through",
  },
  {
    pillar: "followThrough",
    title: "Fingers to the rim",
    detail:
      "Hand peeled off sideways. Finish with fingers pointing at the rim for a beat after release.",
    severity: "fix",
    klayTarget: "Fingers down the line to the hoop",
  },
  {
    pillar: "landing",
    title: "Land on balance",
    detail:
      "You drifted forward on the land. Jump up, land wide — same spot — so the shot stays on plane.",
    severity: "fix",
    klayTarget: "Vertical jump, wide balanced landing",
  },
  {
    pillar: "landing",
    title: "No fade",
    detail:
      "Hips leaked backward at release. Stay stacked over the base like Klay’s catch-and-shoot rise.",
    severity: "focus",
    klayTarget: "Stack hips under shoulders through release",
  },
  {
    pillar: "base",
    title: "Splash base",
    detail:
      "Wide stance, flexed hips, quiet upper body. That’s a Klay catch — live feet, ready to rise.",
    severity: "good",
    klayTarget: "Wide ready base on the catch",
  },
  {
    pillar: "release",
    title: "Pure release",
    detail:
      "Relaxed wrist, elbow high, guide hand gone. Rotation looked true — keep that same snap.",
    severity: "good",
    klayTarget: "Soft, high, on-line release",
  },
  {
    pillar: "setPoint",
    title: "Set point locked",
    detail:
      "Ball hit the forehead window before lift. That timing is the Thompson catch-and-shoot cheat code.",
    severity: "good",
    klayTarget: "Set before leaving the floor",
  },
];

export const KLAY_DRILLS = [
  {
    name: "Hip-dip freethrows",
    focus: "gather",
    reps: "10 makes",
    note: "Catch high, dip to hip, rise — no pause at the bottom.",
  },
  {
    name: "Wing catch-and-shoot",
    focus: "base",
    reps: "5 spots × 5",
    note: "Hop into a wide base on the catch. Feet ready before the ball arrives.",
  },
  {
    name: "Closeout risers",
    focus: "setPoint",
    reps: "8 makes",
    note: "Hit forehead set point before leaving the floor. Beat the closeout with timing, not rush.",
  },
  {
    name: "One-hand form finishes",
    focus: "guideHand",
    reps: "15",
    note: "Guide hand off early. Feel a soft shelf, then clear.",
  },
];

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Score a synthetic rep against the Klay rubric. */
export function scoreRepAgainstKlay(made: boolean, prior = 80): {
  formScore: number;
  pillars: PillarScore[];
  cue: FormCue;
} {
  const noise = () => Math.round((Math.random() - 0.4) * 10);
  const madeBoost = made ? 4 : -6;

  const pillars: PillarScore[] = KLAY_MODEL.pillars.map((p) => ({
    pillar: p.id,
    label: p.label,
    score: clamp(72 + Math.round(Math.random() * 24) + (made ? 3 : -2), 55, 99),
    target: p.target,
  }));

  const weakest = [...pillars].sort((a, b) => a.score - b.score)[0];
  const pool = KLAY_CUES.filter((c) =>
    made && Math.random() > 0.55
      ? c.severity === "good"
      : c.pillar === weakest.pillar && c.severity !== "good",
  );
  const fallback = KLAY_CUES.filter((c) =>
    made ? c.severity === "good" : c.severity !== "good",
  );
  const cue = (pool.length ? pool : fallback)[
    Math.floor(Math.random() * (pool.length ? pool.length : fallback.length))
  ];

  const avg =
    pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length;
  const formScore = clamp(
    Math.round(avg * 0.7 + prior * 0.3 + madeBoost + noise() * 0.2),
    60,
    99,
  );

  return { formScore, pillars, cue };
}

export function pickKlayDrill(pillar?: FormPillar) {
  const matches = pillar
    ? KLAY_DRILLS.filter((d) => d.focus === pillar)
    : KLAY_DRILLS;
  const list = matches.length ? matches : KLAY_DRILLS;
  return list[Math.floor(Math.random() * list.length)];
}

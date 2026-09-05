/**
 * Shooter form models
 * -------------------
 * Rules/cue engines for elite jumpers. Live MediaPipe pose maps into the same
 * pillar checklist; ideal bands differ per athlete.
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

export type ShooterId = "klay" | "steph" | "dame";

export type FormCue = {
  pillar: FormPillar;
  title: string;
  detail: string;
  severity: Severity;
  /** Ideal target for this cue (shown as "Target · …") */
  ideal: string;
  /** @deprecated alias for UI that still reads klayTarget */
  klayTarget?: string;
};

export type PillarScore = {
  pillar: FormPillar;
  label: string;
  score: number;
  target: string;
};

export type PillarDef = {
  id: FormPillar;
  label: string;
  target: string;
};

export type Drill = {
  name: string;
  focus: FormPillar;
  reps: string;
  note: string;
};

/** Ideal pose bands used by the live scorer (wristHeight 0–1.4, baseWidth ratio, elbow °). */
export type PoseIdeals = {
  baseWidth: { ideal: number; lo: number; hi: number };
  dipHeight: { ideal: number; lo: number; hi: number };
  setHeight: { ideal: number; lo: number; hi: number };
  setElbow: { ideal: number; lo: number; hi: number };
  releaseElbow: { ideal: number; lo: number; hi: number };
  releaseHeight: { ideal: number; lo: number; hi: number };
  followHeight: { ideal: number; lo: number; hi: number };
  guideClearance: { ideal: number; lo: number; hi: number };
  landDrift: { ideal: number; lo: number; hi: number };
};

export type ShooterModel = {
  id: ShooterId;
  athlete: string;
  shortName: string;
  tagline: string;
  summary: string;
  accent: string;
  pillars: PillarDef[];
  cues: FormCue[];
  drills: Drill[];
  pose: PoseIdeals;
};

function cue(
  pillar: FormPillar,
  title: string,
  detail: string,
  severity: Severity,
  ideal: string,
): FormCue {
  return { pillar, title, detail, severity, ideal, klayTarget: ideal };
}

const SHARED_LABELS: Record<FormPillar, string> = {
  base: "Base",
  gather: "Gather / dip",
  setPoint: "Set point",
  alignment: "Alignment",
  guideHand: "Guide hand",
  release: "Release",
  followThrough: "Follow-through",
  landing: "Landing",
};

function pillars(
  targets: Record<FormPillar, string>,
): PillarDef[] {
  return (Object.keys(SHARED_LABELS) as FormPillar[]).map((id) => ({
    id,
    label: SHARED_LABELS[id],
    target: targets[id],
  }));
}

export const KLAY_MODEL: ShooterModel = {
  id: "klay",
  athlete: "Klay Thompson",
  shortName: "Klay",
  tagline: "Catch. Dip. Rise. Splash.",
  summary:
    "Catch-and-shoot purity: wide base, quick hip dip, forehead set before lift, quiet guide hand, relaxed release, vertical land.",
  accent: "#1D4ED8",
  pillars: pillars({
    base: "Feet outside shoulders, flexed, ready on the catch",
    gather: "Quick bounce to waist / hip — load power, no wasted motion",
    setPoint: "Ball at forehead, ~90° elbow, set before feet leave",
    alignment: "Hand under ball, elbow in, slight shooting-shoulder turn",
    guideHand: "Off-hand shelves then clears before the wrist snap",
    release: "Soft wrist, middle/ring dominate, high elbow finish",
    followThrough: "Brief hold — fingers to rim, no tense freeze",
    landing: "Wide landing, little forward / fade drift",
  }),
  pose: {
    baseWidth: { ideal: 1.25, lo: 0.95, hi: 1.7 },
    dipHeight: { ideal: 0.42, lo: 0.28, hi: 0.55 },
    setHeight: { ideal: 0.78, lo: 0.62, hi: 0.95 },
    setElbow: { ideal: 95, lo: 70, hi: 125 },
    releaseElbow: { ideal: 155, lo: 120, hi: 175 },
    releaseHeight: { ideal: 1.0, lo: 0.8, hi: 1.35 },
    followHeight: { ideal: 0.85, lo: 0.55, hi: 1.2 },
    guideClearance: { ideal: 0.08, lo: 0.02, hi: 0.22 },
    landDrift: { ideal: 0.02, lo: 0, hi: 0.1 },
  },
  cues: [
    cue("base", "Widen the base", "Feet looked narrow on the catch. Klay anchors outside shoulder-width so contact can’t knock the line off.", "fix", "Wide, flexed stance before the rise"),
    cue("base", "Ready feet", "You were still settling when the ball arrived. Hop into a live base so the catch is already a shot load.", "focus", "Hop / plant into a flexed catch"),
    cue("base", "Splash base", "Wide stance, flexed hips, quiet upper body. That’s a Klay catch — live feet, ready to rise.", "good", "Wide ready base on the catch"),
    cue("gather", "Quicker dip", "Dip stalled at the thigh. Bring it to the hip as a bounce, then go — Klay’s gather is a snap, not a wind-up.", "fix", "Waist/hip dip as a quick bounce"),
    cue("gather", "Clean gather path", "Ball floated high left on the catch. Steer it to the right hip so the lift stays on one vertical track.", "focus", "Dip to shooting-side hip for a straight rise"),
    cue("setPoint", "Set before lift", "You left the ground before the ball hit forehead height. Hit the set point first — then jump through the shot.", "fix", "Set point reached before feet leave"),
    cue("setPoint", "Raise the window", "Set point sat at the chin. Bring it to forehead with a 90° elbow so the release clears closeouts.", "focus", "Forehead set, elbow ~90°"),
    cue("setPoint", "Set point locked", "Ball hit the forehead window before lift. That timing is the Thompson catch-and-shoot cheat code.", "good", "Set before leaving the floor"),
    cue("alignment", "Elbow in", "Elbow flared on the rise. Tuck it under the ball so force goes through the middle — Klay’s line stays tight.", "fix", "Elbow under ball, slight shoulder turn"),
    cue("alignment", "Hand under the ball", "Palm looked behind the ball. Slide under center so the push is straight through, not around.", "focus", "Shooting hand centered under the ball"),
    cue("guideHand", "Guide hand off early", "Off-hand stayed on the ball into the snap and tugged left. Shelf it, then clear before the wrist breaks.", "fix", "Guide hand clear before wrist snap"),
    cue("guideHand", "Quiet shelf", "Guide hand looked sticky. Keep it soft on the side — balance only — then get it out of the way.", "focus", "Soft shelf, zero push on release"),
    cue("release", "Relax the wrist", "Wrist locked stiff at release. Klay’s finish has bounce — tension kills rotation and arc.", "fix", "Relaxed wrist with natural finger curl"),
    cue("release", "High elbow finish", "Elbow never cleared the brow. Finish higher so the ball leaves on a softer Splash-Brothers arc.", "focus", "Elbow above eyebrow on release"),
    cue("release", "Pure release", "Relaxed wrist, elbow high, guide hand gone. Rotation looked true — keep that same snap.", "good", "Soft, high, on-line release"),
    cue("followThrough", "Don’t freeze the pose", "You held the goose-neck forever. A short, clean hold is enough — extra tension creeps into the next catch.", "focus", "Brief, efficient follow-through"),
    cue("followThrough", "Fingers to the rim", "Hand peeled off sideways. Finish with fingers pointing at the rim for a beat after release.", "fix", "Fingers down the line to the hoop"),
    cue("landing", "Land on balance", "You drifted forward on the land. Jump up, land wide — same spot — so the shot stays on plane.", "fix", "Vertical jump, wide balanced landing"),
    cue("landing", "No fade", "Hips leaked backward at release. Stay stacked over the base like Klay’s catch-and-shoot rise.", "focus", "Stack hips under shoulders through release"),
  ],
  drills: [
    { name: "Hip-dip freethrows", focus: "gather", reps: "10 makes", note: "Catch high, dip to hip, rise — no pause at the bottom." },
    { name: "Wing catch-and-shoot", focus: "base", reps: "5 spots × 5", note: "Hop into a wide base on the catch. Feet ready before the ball arrives." },
    { name: "Closeout risers", focus: "setPoint", reps: "8 makes", note: "Hit forehead set point before leaving the floor. Beat the closeout with timing, not rush." },
    { name: "One-hand form finishes", focus: "guideHand", reps: "15", note: "Guide hand off early. Feel a soft shelf, then clear." },
  ],
};

export const STEPH_MODEL: ShooterModel = {
  id: "steph",
  athlete: "Stephen Curry",
  shortName: "Steph",
  tagline: "Quick. Fluid. Unlimited.",
  summary:
    "One-motion fluidity: compact gather, lightning set-to-release, high soft arc, balance through movement and off-dribble rises.",
  accent: "#046A38",
  pillars: pillars({
    base: "Live feet — hop or 1-2 into balance, even on the move",
    gather: "Ultra-compact dip; transfer dribble energy straight into the shot",
    setPoint: "High, quick set — almost no pause before the snap",
    alignment: "Elbow under, shoulders level; line stays clean off movement",
    guideHand: "Barely there — soft shelf, gone before the wrist breaks",
    release: "Instant snap, high arc, soft rotation; elbow finishes above eye",
    followThrough: "Loose goose-neck, quick reset for the next action",
    landing: "Stay playable — hop/step-back okay if hips stay under control",
  }),
  pose: {
    baseWidth: { ideal: 1.15, lo: 0.85, hi: 1.55 },
    dipHeight: { ideal: 0.38, lo: 0.22, hi: 0.5 },
    setHeight: { ideal: 0.82, lo: 0.65, hi: 1.05 },
    setElbow: { ideal: 92, lo: 65, hi: 120 },
    releaseElbow: { ideal: 160, lo: 125, hi: 178 },
    releaseHeight: { ideal: 1.05, lo: 0.85, hi: 1.4 },
    followHeight: { ideal: 0.88, lo: 0.55, hi: 1.25 },
    guideClearance: { ideal: 0.1, lo: 0.03, hi: 0.25 },
    landDrift: { ideal: 0.04, lo: 0, hi: 0.16 },
  },
  cues: [
    cue("base", "Stay on live feet", "Feet looked stuck. Steph hops into the shot — keep the base alive so range and rhythm travel with you.", "fix", "Hop / 1-2 into a balanced rise"),
    cue("base", "Balance through the move", "You spun off your line on the gather. Keep the inside foot quiet so the rise stays on plane.", "focus", "Controlled hop into the shot pocket"),
    cue("base", "Curry base", "Live feet, quiet chest, ready hips. That’s a Steph gather — already loading before the catch finishes.", "good", "Movement into a balanced base"),
    cue("gather", "Tighten the dip", "Dip got long and slow. Curry’s gather is tiny — load and go in one piece.", "fix", "Compact one-motion gather"),
    cue("gather", "Link dribble to shot", "You paused between the gather and the rise. Blend them — energy from the last dribble feeds the release.", "focus", "No pause between gather and lift"),
    cue("setPoint", "Faster to the window", "Ball lingered at the shoulder. Get it to the high set and snap — Steph doesn’t camp there.", "fix", "High set with almost no dwell"),
    cue("setPoint", "Keep the set high", "Release started low. Bring the pocket up so deep range still clears the contest.", "focus", "High quick set point"),
    cue("setPoint", "Seamless set", "Set-to-release looked like one motion. That’s the Curry cheat code — keep that tempo.", "good", "One-motion set and snap"),
    cue("alignment", "Elbow under on the move", "Elbow flared when you came off the bounce. Tuck it so the ball stays on the shooting line.", "fix", "Elbow under through movement"),
    cue("alignment", "Level the shoulders", "Trail shoulder dipped. Square the chest through the rise so the arc stays true.", "focus", "Level shoulders into release"),
    cue("guideHand", "Clear sooner", "Guide hand lingered into the snap. Steph’s off-hand is gone early — soft shelf only.", "fix", "Guide hand off before the snap"),
    cue("guideHand", "Feather the shelf", "Off-hand pressed. Light touch on the side — balance, never push.", "focus", "Feather-light guide hand"),
    cue("release", "Snap it", "Release looked muscled. Relax the wrist and let the fingers whip — soft, high rotation.", "fix", "Quick soft wrist snap"),
    cue("release", "Finish above the eye", "Elbow stalled mid-face. Drive it higher for that Curry arc.", "focus", "Elbow finishes above the eye"),
    cue("release", "Unlimited release", "Quick, soft, high. Rotation looked pure — same snap on the next one.", "good", "High soft one-motion release"),
    cue("followThrough", "Loose finish", "You punched the follow-through. Keep it floppy — hold a beat, then hunt the next play.", "focus", "Relaxed goose-neck, quick reset"),
    cue("followThrough", "Don’t yank it down", "Hand cut across the ball. Finish fingers-to-rim even on the move.", "fix", "Fingers down the line"),
    cue("landing", "Stay playable", "You stuck the land and died. Steph stays springy — land ready to move.", "focus", "Athletic land, ready for next action"),
    cue("landing", "Control the hop", "Step-back drifted too far offline. Sell the space, but keep hips under the shot.", "fix", "Controlled hop / step-back land"),
  ],
  drills: [
    { name: "One-motion form to freethrow", focus: "gather", reps: "10 makes", note: "No pause at the set — dip straight into the snap." },
    { name: "Transition pull-ups", focus: "base", reps: "8 each side", note: "1-2 into the shot off a dribble. Live feet, quiet chest." },
    { name: "Deep rhythm threes", focus: "release", reps: "5 spots × 4", note: "Same quick snap from the logo step-in. Soft arc, high elbow." },
    { name: "Guide-hand only finishes", focus: "guideHand", reps: "12", note: "Shelf then clear early. Feel zero push from the off-hand." },
  ],
};

export const DAME_MODEL: ShooterModel = {
  id: "dame",
  athlete: "Damian Lillard",
  shortName: "Dame",
  tagline: "Step back. Rise up. Logo.",
  summary:
    "Logo power: strong wide base, decisive gather into elevation, high release over contests, fearless range with a clean finish.",
  accent: "#E03A3E",
  pillars: pillars({
    base: "Strong, wide platform — especially on the step-back",
    gather: "Decisive load into the legs; sit into power without dragging the ball",
    setPoint: "High pocket to shoot over length; rise into the release",
    alignment: "Strong shooting line; slight fade okay if elbow stays under",
    guideHand: "Firm shelf early, then fully off — no thumb drag on deep ones",
    release: "Aggressive high release, full extension, heavy rotation",
    followThrough: "Hold the pose on deep looks — sell the finish",
    landing: "Own the step-back land; hips under even when you create space",
  }),
  pose: {
    baseWidth: { ideal: 1.35, lo: 1.05, hi: 1.85 },
    dipHeight: { ideal: 0.48, lo: 0.32, hi: 0.62 },
    setHeight: { ideal: 0.85, lo: 0.68, hi: 1.1 },
    setElbow: { ideal: 100, lo: 75, hi: 130 },
    releaseElbow: { ideal: 165, lo: 130, hi: 178 },
    releaseHeight: { ideal: 1.1, lo: 0.88, hi: 1.45 },
    followHeight: { ideal: 0.9, lo: 0.6, hi: 1.3 },
    guideClearance: { ideal: 0.09, lo: 0.02, hi: 0.24 },
    landDrift: { ideal: 0.06, lo: 0, hi: 0.2 },
  },
  cues: [
    cue("base", "Widen for power", "Base looked narrow for a Dame rise. Sit wider — especially on step-backs — so range comes from the floor.", "fix", "Wide strong base into elevation"),
    cue("base", "Plant the step-back", "Trail foot never claimed space. Stab the step-back foot, then rise from a platform.", "focus", "Step-back into a planted base"),
    cue("base", "Logo base", "Wide, strong, unbothered. That’s Dame’s platform — ready to rise from deep.", "good", "Strong wide shooting base"),
    cue("gather", "Load the legs", "Gather stayed high and arm-y. Sit into the hips so deep range is leg-driven.", "fix", "Hip load into the rise"),
    cue("gather", "Don’t drag the gather", "Ball swung long across the body. Keep the gather tight while the legs load.", "focus", "Tight gather, heavy legs"),
    cue("setPoint", "Get it up", "Pocket sat too low vs a contest. Dame gets it high — rise into a high set.", "fix", "High set over the closeout"),
    cue("setPoint", "Rise through the set", "You set flat-footed. Jump into the pocket so elevation and release arrive together.", "focus", "Elevate through the set point"),
    cue("setPoint", "Dame window", "High pocket, on time, above the help. Keep that logo set.", "good", "High elevated set point"),
    cue("alignment", "Elbow through the fade", "Elbow leaked on the fade. Keep it under the ball even when you lean.", "fix", "Elbow under on step-back fades"),
    cue("alignment", "Strong shooting line", "Ball drifted across your face. Stay on the strong-side line for deep strength.", "focus", "Strong-side vertical line"),
    cue("guideHand", "No thumb drag", "Off-hand thumb looked involved on the deep snap. Shelf, then fully off.", "fix", "Guide hand clear — no thumb"),
    cue("guideHand", "Firm then gone", "Shelf was mushy. Be firm early for control, then get it out of the way.", "focus", "Firm shelf, clean clear"),
    cue("release", "Full extension", "You short-armed the deep look. Extend through — Dame finishes long.", "fix", "Full high release extension"),
    cue("release", "Put spin on it", "Ball looked flat. Whip the fingers for heavier rotation on logo range.", "focus", "Strong finger rotation"),
    cue("release", "Logo release", "High, extended, fearless. That’s the Dame finish — keep trusting it.", "good", "High extended deep release"),
    cue("followThrough", "Hold the deep ones", "You cut the follow-through short from range. Hold the pose a beat longer on logos.", "focus", "Longer hold on deep shots"),
    cue("followThrough", "Finish tall", "Shoulders collapsed after release. Stay tall through the finish.", "fix", "Tall extended follow-through"),
    cue("landing", "Own the space", "Step-back land was soft and narrow. Claim the footprint you created.", "fix", "Planted step-back landing"),
    cue("landing", "Hips under the fade", "Fade pulled your hips out. Create space, but keep the shot stacked.", "focus", "Hips under even on fades"),
  ],
  drills: [
    { name: "Step-back freethrow line", focus: "base", reps: "10 makes", note: "Stab the step-back foot, wide base, then rise. Same platform every time." },
    { name: "Logo progressive", focus: "release", reps: "make 3 from each hash out", note: "Full extension and heavy rotation as range grows." },
    { name: "Contested high-pocket rises", focus: "setPoint", reps: "8", note: "Partner close out late. Get the ball to a high set and elevate through it." },
    { name: "Power gather into pull-up", focus: "gather", reps: "8 each side", note: "Sit into the hips on the gather, keep the ball tight, rise strong." },
  ],
};

export const FORM_MODELS: ShooterModel[] = [KLAY_MODEL, STEPH_MODEL, DAME_MODEL];

export function getShooterModel(id: ShooterId): ShooterModel {
  return FORM_MODELS.find((m) => m.id === id) ?? KLAY_MODEL;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function scoreRepAgainstModel(
  model: ShooterModel,
  made: boolean,
  prior = 80,
): { formScore: number; pillars: PillarScore[]; cue: FormCue } {
  const noise = () => Math.round((Math.random() - 0.4) * 10);
  const madeBoost = made ? 4 : -6;

  const pillars: PillarScore[] = model.pillars.map((p) => ({
    pillar: p.id,
    label: p.label,
    score: clamp(72 + Math.round(Math.random() * 24) + (made ? 3 : -2), 55, 99),
    target: p.target,
  }));

  const weakest = [...pillars].sort((a, b) => a.score - b.score)[0];
  const pool = model.cues.filter((c) =>
    made && Math.random() > 0.55
      ? c.severity === "good"
      : c.pillar === weakest.pillar && c.severity !== "good",
  );
  const fallback = model.cues.filter((c) =>
    made ? c.severity === "good" : c.severity !== "good",
  );
  const cue = (pool.length ? pool : fallback)[
    Math.floor(Math.random() * (pool.length ? pool.length : fallback.length))
  ];

  const avg = pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length;
  const formScore = clamp(
    Math.round(avg * 0.7 + prior * 0.3 + madeBoost + noise() * 0.2),
    60,
    99,
  );

  return { formScore, pillars, cue };
}

export function pickModelDrill(model: ShooterModel, pillar?: FormPillar) {
  const matches = pillar
    ? model.drills.filter((d) => d.focus === pillar)
    : model.drills;
  const list = matches.length ? matches : model.drills;
  return list[Math.floor(Math.random() * list.length)];
}

/** Back-compat helpers */
export const KLAY_CUES = KLAY_MODEL.cues;
export const KLAY_DRILLS = KLAY_MODEL.drills;
export function scoreRepAgainstKlay(made: boolean, prior = 80) {
  return scoreRepAgainstModel(KLAY_MODEL, made, prior);
}
export function pickKlayDrill(pillar?: FormPillar) {
  return pickModelDrill(KLAY_MODEL, pillar);
}

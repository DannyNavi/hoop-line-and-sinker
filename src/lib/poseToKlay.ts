import {
  KLAY_CUES,
  KLAY_MODEL,
  type FormCue,
  type FormPillar,
  type PillarScore,
} from "@/lib/klayModel";
import {
  angleDeg,
  clamp,
  dist,
  inferShootingSide,
  mid,
  POSE,
  scoreBand,
  sideJoints,
  visible,
  type Landmark,
} from "@/lib/poseGeometry";

export type ShotPhase = "idle" | "gather" | "set" | "release" | "follow" | "land";

export type PoseFrame = {
  t: number;
  landmarks: Landmark[];
};

export type LiveMetrics = {
  phase: ShotPhase;
  side: "left" | "right";
  elbowAngle: number | null;
  kneeAngle: number | null;
  wristHeight: number | null;
  baseWidth: number | null;
  guideSeparation: number | null;
};

export type LiveKlayResult = {
  formScore: number;
  pillars: PillarScore[];
  cue: FormCue;
  metrics: LiveMetrics;
  phase: ShotPhase;
};

function makePillar(pillar: FormPillar, score: number): PillarScore {
  const meta = KLAY_MODEL.pillars.find((p) => p.id === pillar)!;
  return {
    pillar,
    label: meta.label,
    score: clamp(Math.round(score), 30, 99),
    target: meta.target,
  };
}

function pickCue(pillar: FormPillar, score: number, made: boolean): FormCue {
  const wantGood = made && score >= 85;
  const pool = KLAY_CUES.filter((c) =>
    wantGood
      ? c.severity === "good" && c.pillar === pillar
      : c.pillar === pillar && c.severity !== "good",
  );
  const fallback = KLAY_CUES.filter((c) =>
    wantGood ? c.severity === "good" : c.pillar === pillar,
  );
  const list = pool.length ? pool : fallback.length ? fallback : KLAY_CUES;
  return list[Math.floor(Math.random() * list.length)];
}

function wristHeightNorm(landmarks: Landmark[], wristIdx: number): number | null {
  const wrist = landmarks[wristIdx];
  const nose = landmarks[POSE.nose];
  const ankleL = landmarks[POSE.leftAnkle];
  const ankleR = landmarks[POSE.rightAnkle];
  if (!visible(wrist) || !nose) return null;
  const ankle =
    visible(ankleL) && visible(ankleR)
      ? mid(ankleL!, ankleR!)
      : visible(ankleL)
        ? ankleL!
        : visible(ankleR)
          ? ankleR!
          : null;
  if (!ankle) return null;
  const span = Math.max(ankle.y - nose.y, 0.05);
  return clamp((ankle.y - wrist.y) / span, 0, 1.4);
}

export function computeLiveMetrics(
  landmarks: Landmark[],
  phase: ShotPhase = "idle",
): LiveMetrics {
  const side = inferShootingSide(landmarks);
  const j = sideJoints(side);
  const shoulder = landmarks[j.shoulder];
  const elbow = landmarks[j.elbow];
  const wrist = landmarks[j.wrist];
  const hip = landmarks[j.hip];
  const knee = landmarks[j.knee];
  const ankle = landmarks[j.ankle];
  const guide = landmarks[j.guideWrist];
  const lShoulder = landmarks[POSE.leftShoulder];
  const rShoulder = landmarks[POSE.rightShoulder];
  const lAnkle = landmarks[POSE.leftAnkle];
  const rAnkle = landmarks[POSE.rightAnkle];

  const elbowAngle =
    visible(shoulder) && visible(elbow) && visible(wrist)
      ? angleDeg(shoulder!, elbow!, wrist!)
      : null;
  const kneeAngle =
    visible(hip) && visible(knee) && visible(ankle)
      ? angleDeg(hip!, knee!, ankle!)
      : null;

  let baseWidth: number | null = null;
  if (visible(lShoulder) && visible(rShoulder) && visible(lAnkle) && visible(rAnkle)) {
    const shoulderW = dist(lShoulder!, rShoulder!);
    const ankleW = dist(lAnkle!, rAnkle!);
    baseWidth = shoulderW > 1e-4 ? ankleW / shoulderW : null;
  }

  return {
    phase,
    side,
    elbowAngle,
    kneeAngle,
    wristHeight: wristHeightNorm(landmarks, j.wrist),
    baseWidth,
    guideSeparation: visible(wrist) && visible(guide) ? dist(wrist!, guide!) : null,
  };
}

export function inferPhaseFromHeights(heights: number[]): ShotPhase {
  if (heights.length < 4) return "idle";
  const recent = heights.slice(-12);
  const last = recent[recent.length - 1];
  const prev = recent[Math.max(0, recent.length - 4)];
  const min = Math.min(...recent);
  const max = Math.max(...recent);
  const rising = last > prev + 0.04;
  const falling = last < prev - 0.04;

  if (max - min < 0.08) return "idle";
  if (last < min + 0.12 && falling) return "gather";
  if (last > 0.55 && last < 0.82 && rising) return "set";
  if (last >= 0.82 && rising) return "release";
  if (last >= 0.75 && !rising) return "follow";
  if (falling && last < 0.55) return "land";
  return "idle";
}

function indexNearPhase(heights: number[], target: ShotPhase): number {
  if (!heights.length) return 0;
  if (target === "gather") {
    let best = 0;
    let bestV = Infinity;
    heights.forEach((h, i) => {
      if (h < bestV) {
        bestV = h;
        best = i;
      }
    });
    return best;
  }
  if (target === "set") {
    let best = Math.floor(heights.length * 0.45);
    let bestDist = Infinity;
    heights.forEach((h, i) => {
      const d = Math.abs(h - 0.72);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    return best;
  }
  if (target === "release" || target === "follow") {
    let best = heights.length - 1;
    let bestV = -Infinity;
    heights.forEach((h, i) => {
      if (h > bestV) {
        bestV = h;
        best = i;
      }
    });
    return best;
  }
  return heights.length - 1;
}

export function scorePoseShot(
  frames: PoseFrame[],
  made: boolean,
  prior = 80,
): LiveKlayResult {
  if (!frames.length) {
    const pillars = KLAY_MODEL.pillars.map((p) => makePillar(p.id, 70));
    return {
      formScore: 70,
      pillars,
      cue: pickCue("base", 70, made),
      metrics: {
        phase: "idle",
        side: "right",
        elbowAngle: null,
        kneeAngle: null,
        wristHeight: null,
        baseWidth: null,
        guideSeparation: null,
      },
      phase: "idle",
    };
  }

  const side = inferShootingSide(frames[frames.length - 1].landmarks);
  const j = sideJoints(side);
  const heights = frames.map((f) => wristHeightNorm(f.landmarks, j.wrist) ?? 0.35);
  const phase = inferPhaseFromHeights(heights);

  const gather = frames[indexNearPhase(heights, "gather")];
  const set = frames[indexNearPhase(heights, "set")];
  const release = frames[indexNearPhase(heights, "release")];
  const land = frames[frames.length - 1];

  const mGather = computeLiveMetrics(gather.landmarks, "gather");
  const mSet = computeLiveMetrics(set.landmarks, "set");
  const mRelease = computeLiveMetrics(release.landmarks, "release");
  const mLand = computeLiveMetrics(land.landmarks, "land");

  const base = scoreBand(mSet.baseWidth ?? mGather.baseWidth ?? 1.1, 1.25, 0.95, 1.7);
  const dip = scoreBand(mGather.wristHeight ?? 0.4, 0.42, 0.28, 0.55);
  const setPoint = scoreBand(mSet.wristHeight ?? 0.65, 0.78, 0.62, 0.95);
  const alignment = scoreBand(mSet.elbowAngle ?? 100, 95, 70, 125);

  const sepSet = mSet.guideSeparation ?? 0.08;
  const sepRel = mRelease.guideSeparation ?? sepSet;
  const guideHand = scoreBand(sepRel - sepSet, 0.08, 0.02, 0.22);

  const releaseScore = clamp(
    scoreBand(mRelease.elbowAngle ?? 140, 155, 120, 175) * 0.5 +
      scoreBand(mRelease.wristHeight ?? 0.9, 1.0, 0.8, 1.35) * 0.5,
    35,
    99,
  );
  const follow = scoreBand(
    mLand.wristHeight ?? mRelease.wristHeight ?? 0.7,
    0.85,
    0.55,
    1.2,
  );

  const landBase = scoreBand(mLand.baseWidth ?? 1.2, 1.25, 0.9, 1.7);
  const ankleSetL = set.landmarks[POSE.leftAnkle];
  const ankleSetR = set.landmarks[POSE.rightAnkle];
  const ankleLandL = land.landmarks[POSE.leftAnkle];
  const ankleLandR = land.landmarks[POSE.rightAnkle];
  const ankleSet =
    visible(ankleSetL) && visible(ankleSetR)
      ? mid(ankleSetL!, ankleSetR!)
      : set.landmarks[j.ankle];
  const ankleLand =
    visible(ankleLandL) && visible(ankleLandR)
      ? mid(ankleLandL!, ankleLandR!)
      : land.landmarks[j.ankle];
  const drift =
    visible(ankleSet) && visible(ankleLand)
      ? Math.abs(ankleLand!.y - ankleSet!.y)
      : 0.04;
  const landing = clamp(landBase * 0.55 + scoreBand(drift, 0.02, 0, 0.12) * 0.45, 35, 99);

  const pillars: PillarScore[] = [
    makePillar("base", base),
    makePillar("gather", dip),
    makePillar("setPoint", setPoint),
    makePillar("alignment", alignment),
    makePillar("guideHand", guideHand),
    makePillar("release", releaseScore),
    makePillar("followThrough", follow),
    makePillar("landing", landing),
  ];

  const avg = pillars.reduce((s, p) => s + p.score, 0) / pillars.length;
  const formScore = clamp(Math.round(avg * 0.75 + prior * 0.25 + (made ? 3 : -4)), 40, 99);
  const weakest = [...pillars].sort((a, b) => a.score - b.score)[0];

  return {
    formScore,
    pillars,
    cue: pickCue(weakest.pillar, weakest.score, made),
    metrics: { ...mRelease, phase },
    phase,
  };
}

export function previewPillarsFromPose(landmarks: Landmark[]): {
  pillars: PillarScore[];
  metrics: LiveMetrics;
} {
  const metrics = computeLiveMetrics(landmarks);
  return {
    metrics,
    pillars: [
      makePillar("base", scoreBand(metrics.baseWidth ?? 1.1, 1.25, 0.95, 1.7)),
      makePillar("gather", scoreBand(metrics.wristHeight ?? 0.45, 0.42, 0.25, 0.6)),
      makePillar("setPoint", scoreBand(metrics.wristHeight ?? 0.6, 0.78, 0.55, 1.05)),
      makePillar("alignment", scoreBand(metrics.elbowAngle ?? 100, 95, 70, 130)),
      makePillar("guideHand", scoreBand(metrics.guideSeparation ?? 0.1, 0.12, 0.04, 0.25)),
      makePillar("release", scoreBand(metrics.elbowAngle ?? 140, 155, 110, 175)),
      makePillar("followThrough", scoreBand(metrics.wristHeight ?? 0.7, 0.85, 0.5, 1.2)),
      makePillar("landing", scoreBand(metrics.baseWidth ?? 1.1, 1.25, 0.9, 1.7)),
    ],
  };
}

import {
  KLAY_MODEL,
  type FormCue,
  type FormPillar,
  type PillarScore,
  type ShooterModel,
} from "@/lib/formModels";
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

export type LiveFormResult = {
  formScore: number;
  pillars: PillarScore[];
  cue: FormCue;
  metrics: LiveMetrics;
  phase: ShotPhase;
};

/** @deprecated alias */
export type LiveKlayResult = LiveFormResult;

function makePillar(model: ShooterModel, pillar: FormPillar, score: number): PillarScore {
  const meta = model.pillars.find((p) => p.id === pillar)!;
  return {
    pillar,
    label: meta.label,
    score: clamp(Math.round(score), 30, 99),
    target: meta.target,
  };
}

function pickCue(
  model: ShooterModel,
  pillar: FormPillar,
  score: number,
  made: boolean,
): FormCue {
  const wantGood = made && score >= 85;
  const pool = model.cues.filter((c) =>
    wantGood
      ? c.severity === "good" && c.pillar === pillar
      : c.pillar === pillar && c.severity !== "good",
  );
  const fallback = model.cues.filter((c) =>
    wantGood ? c.severity === "good" : c.pillar === pillar,
  );
  const list = pool.length ? pool : fallback.length ? fallback : model.cues;
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

export type ShotReadiness = {
  ok: boolean;
  reason?: "need_pose" | "need_motion" | "too_soon";
  detail: string;
  wristRange: number;
  frameCount: number;
};

/**
 * Require a real rise in the shooting wrist — standing still / spam clicks
 * should not produce a scored rep.
 */
export function evaluateShotReadiness(
  frames: PoseFrame[],
  opts?: { minFrames?: number; minWristRange?: number },
): ShotReadiness {
  const minFrames = opts?.minFrames ?? 12;
  const minWristRange = opts?.minWristRange ?? 0.16;

  if (frames.length < minFrames) {
    return {
      ok: false,
      reason: "need_pose",
      detail: "Get fully in frame, then take a shot before logging.",
      wristRange: 0,
      frameCount: frames.length,
    };
  }

  const side = inferShootingSide(frames[frames.length - 1].landmarks);
  const wristIdx = sideJoints(side).wrist;
  const heights = frames
    .map((f) => wristHeightNorm(f.landmarks, wristIdx))
    .filter((h): h is number => h != null);

  if (heights.length < minFrames) {
    return {
      ok: false,
      reason: "need_pose",
      detail: "Pose is incomplete — face the camera with your shooting arm visible.",
      wristRange: 0,
      frameCount: frames.length,
    };
  }

  const wristRange = Math.max(...heights) - Math.min(...heights);
  if (wristRange < minWristRange) {
    return {
      ok: false,
      reason: "need_motion",
      detail: "No shot motion detected. Dip and rise, then log make/miss.",
      wristRange,
      frameCount: frames.length,
    };
  }

  return {
    ok: true,
    detail: "Shot motion captured.",
    wristRange,
    frameCount: frames.length,
  };
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
  model: ShooterModel = KLAY_MODEL,
): LiveFormResult {
  if (!frames.length) {
    const pillars = model.pillars.map((p) => makePillar(model, p.id, 70));
    return {
      formScore: 70,
      pillars,
      cue: pickCue(model, "base", 70, made),
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

  const pose = model.pose;
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

  const base = scoreBand(
    mSet.baseWidth ?? mGather.baseWidth ?? pose.baseWidth.ideal,
    pose.baseWidth.ideal,
    pose.baseWidth.lo,
    pose.baseWidth.hi,
  );
  const dip = scoreBand(
    mGather.wristHeight ?? pose.dipHeight.ideal,
    pose.dipHeight.ideal,
    pose.dipHeight.lo,
    pose.dipHeight.hi,
  );
  const setPoint = scoreBand(
    mSet.wristHeight ?? pose.setHeight.ideal,
    pose.setHeight.ideal,
    pose.setHeight.lo,
    pose.setHeight.hi,
  );
  const alignment = scoreBand(
    mSet.elbowAngle ?? pose.setElbow.ideal,
    pose.setElbow.ideal,
    pose.setElbow.lo,
    pose.setElbow.hi,
  );

  const sepSet = mSet.guideSeparation ?? pose.guideClearance.ideal;
  const sepRel = mRelease.guideSeparation ?? sepSet;
  const guideHand = scoreBand(
    sepRel - sepSet,
    pose.guideClearance.ideal,
    pose.guideClearance.lo,
    pose.guideClearance.hi,
  );

  const releaseScore = clamp(
    scoreBand(
      mRelease.elbowAngle ?? pose.releaseElbow.ideal,
      pose.releaseElbow.ideal,
      pose.releaseElbow.lo,
      pose.releaseElbow.hi,
    ) *
      0.5 +
      scoreBand(
        mRelease.wristHeight ?? pose.releaseHeight.ideal,
        pose.releaseHeight.ideal,
        pose.releaseHeight.lo,
        pose.releaseHeight.hi,
      ) *
        0.5,
    35,
    99,
  );
  const follow = scoreBand(
    mLand.wristHeight ?? mRelease.wristHeight ?? pose.followHeight.ideal,
    pose.followHeight.ideal,
    pose.followHeight.lo,
    pose.followHeight.hi,
  );

  const landBase = scoreBand(
    mLand.baseWidth ?? pose.baseWidth.ideal,
    pose.baseWidth.ideal,
    pose.baseWidth.lo * 0.95,
    pose.baseWidth.hi,
  );
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
      : pose.landDrift.ideal;
  const landing = clamp(
    landBase * 0.55 +
      scoreBand(drift, pose.landDrift.ideal, pose.landDrift.lo, pose.landDrift.hi) * 0.45,
    35,
    99,
  );

  const pillars: PillarScore[] = [
    makePillar(model, "base", base),
    makePillar(model, "gather", dip),
    makePillar(model, "setPoint", setPoint),
    makePillar(model, "alignment", alignment),
    makePillar(model, "guideHand", guideHand),
    makePillar(model, "release", releaseScore),
    makePillar(model, "followThrough", follow),
    makePillar(model, "landing", landing),
  ];

  const avg = pillars.reduce((s, p) => s + p.score, 0) / pillars.length;
  const formScore = clamp(Math.round(avg * 0.75 + prior * 0.25 + (made ? 3 : -4)), 40, 99);
  const weakest = [...pillars].sort((a, b) => a.score - b.score)[0];

  return {
    formScore,
    pillars,
    cue: pickCue(model, weakest.pillar, weakest.score, made),
    metrics: { ...mRelease, phase },
    phase,
  };
}

export function previewPillarsFromPose(
  landmarks: Landmark[],
  model: ShooterModel = KLAY_MODEL,
): {
  pillars: PillarScore[];
  metrics: LiveMetrics;
} {
  const metrics = computeLiveMetrics(landmarks);
  const pose = model.pose;
  return {
    metrics,
    pillars: [
      makePillar(
        model,
        "base",
        scoreBand(metrics.baseWidth ?? pose.baseWidth.ideal, pose.baseWidth.ideal, pose.baseWidth.lo, pose.baseWidth.hi),
      ),
      makePillar(
        model,
        "gather",
        scoreBand(metrics.wristHeight ?? pose.dipHeight.ideal, pose.dipHeight.ideal, pose.dipHeight.lo, pose.dipHeight.hi),
      ),
      makePillar(
        model,
        "setPoint",
        scoreBand(metrics.wristHeight ?? pose.setHeight.ideal, pose.setHeight.ideal, pose.setHeight.lo, pose.setHeight.hi),
      ),
      makePillar(
        model,
        "alignment",
        scoreBand(metrics.elbowAngle ?? pose.setElbow.ideal, pose.setElbow.ideal, pose.setElbow.lo, pose.setElbow.hi),
      ),
      makePillar(
        model,
        "guideHand",
        scoreBand(
          metrics.guideSeparation ?? pose.guideClearance.ideal,
          pose.guideClearance.ideal,
          pose.guideClearance.lo,
          pose.guideClearance.hi,
        ),
      ),
      makePillar(
        model,
        "release",
        scoreBand(
          metrics.elbowAngle ?? pose.releaseElbow.ideal,
          pose.releaseElbow.ideal,
          pose.releaseElbow.lo,
          pose.releaseElbow.hi,
        ),
      ),
      makePillar(
        model,
        "followThrough",
        scoreBand(
          metrics.wristHeight ?? pose.followHeight.ideal,
          pose.followHeight.ideal,
          pose.followHeight.lo,
          pose.followHeight.hi,
        ),
      ),
      makePillar(
        model,
        "landing",
        scoreBand(metrics.baseWidth ?? pose.baseWidth.ideal, pose.baseWidth.ideal, pose.baseWidth.lo, pose.baseWidth.hi),
      ),
    ],
  };
}

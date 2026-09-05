/** Shared landmark geometry for MediaPipe Pose (33 landmarks). */

export type Landmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
};

export const POSE = {
  nose: 0,
  leftEye: 2,
  rightEye: 5,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
  leftHeel: 29,
  rightHeel: 30,
  leftFootIndex: 31,
  rightFootIndex: 32,
} as const;

export function visible(lm: Landmark | undefined, min = 0.4) {
  return !!lm && (lm.visibility ?? 1) >= min;
}

export function dist(a: Landmark, b: Landmark) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Interior angle at B in degrees (A-B-C). */
export function angleDeg(a: Landmark, b: Landmark, c: Landmark) {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const cross = abx * cby - aby * cbx;
  let deg = Math.abs((Math.atan2(cross, dot) * 180) / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

export function mid(a: Landmark, b: Landmark): Landmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  };
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Peak at ideal; soft falloff outside [lo, hi]. */
export function scoreBand(value: number, ideal: number, lo: number, hi: number) {
  if (value >= lo && value <= hi) {
    const span = Math.max(ideal - lo, hi - ideal, 1e-6);
    return clamp(100 - (Math.abs(value - ideal) / span) * 35, 55, 99);
  }
  if (value < lo) return clamp(55 - (lo - value) * 90, 30, 70);
  return clamp(55 - (value - hi) * 90, 30, 70);
}

export type ShootingSide = "left" | "right";

export function inferShootingSide(landmarks: Landmark[]): ShootingSide {
  const lw = landmarks[POSE.leftWrist];
  const rw = landmarks[POSE.rightWrist];
  if (!visible(lw) && visible(rw)) return "right";
  if (!visible(rw) && visible(lw)) return "left";
  if (!lw || !rw) return "right";
  return lw.y <= rw.y ? "left" : "right";
}

export function sideJoints(side: ShootingSide) {
  if (side === "right") {
    return {
      shoulder: POSE.rightShoulder,
      elbow: POSE.rightElbow,
      wrist: POSE.rightWrist,
      hip: POSE.rightHip,
      knee: POSE.rightKnee,
      ankle: POSE.rightAnkle,
      guideWrist: POSE.leftWrist,
      guideElbow: POSE.leftElbow,
      guideShoulder: POSE.leftShoulder,
    };
  }
  return {
    shoulder: POSE.leftShoulder,
    elbow: POSE.leftElbow,
    wrist: POSE.leftWrist,
    hip: POSE.leftHip,
    knee: POSE.leftKnee,
    ankle: POSE.leftAnkle,
    guideWrist: POSE.rightWrist,
    guideElbow: POSE.rightElbow,
    guideShoulder: POSE.rightShoulder,
  };
}

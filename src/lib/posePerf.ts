/** Mobile-oriented pose loop tuning. */

export function isMobileClient() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function isIosClient() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/** Prefer lighter capture on phones — 720p+ + pose is what stutters Safari. */
export function cameraConstraints(facing: "user" | "environment"): MediaTrackConstraints {
  const mobile = isMobileClient();
  return {
    facingMode: { ideal: facing },
    width: { ideal: mobile ? 640 : 1280 },
    height: { ideal: mobile ? 480 : 720 },
    frameRate: { ideal: mobile ? 24 : 30, max: mobile ? 24 : 30 },
  };
}

export function poseDelegate(): "GPU" | "CPU" {
  // iOS WebGL + MediaPipe GPU is often janky; CPU is steadier on phones.
  return isMobileClient() ? "CPU" : "GPU";
}

/** Min ms between MediaPipe detects. */
export function detectIntervalMs() {
  return isMobileClient() ? 70 : 33;
}

/** Min ms between React UI pose updates. */
export function uiUpdateIntervalMs() {
  return isMobileClient() ? 150 : 80;
}

/** Cap canvas draw size so we don't blit full camera frames every tick. */
export function canvasDrawSize(videoWidth: number, videoHeight: number) {
  const maxW = isMobileClient() ? 480 : 960;
  const vw = videoWidth || 640;
  const vh = videoHeight || 480;
  const scale = Math.min(1, maxW / vw);
  return {
    width: Math.max(1, Math.round(vw * scale)),
    height: Math.max(1, Math.round(vh * scale)),
  };
}

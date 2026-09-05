"use client";

import { useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { PillarScore } from "@/lib/klayModel";
import type { Landmark } from "@/lib/poseGeometry";
import { inferShootingSide, sideJoints } from "@/lib/poseGeometry";
import {
  inferPhaseFromHeights,
  previewPillarsFromPose,
  type LiveMetrics,
  type PoseFrame,
  type ShotPhase,
} from "@/lib/poseToKlay";

type PoseCameraProps = {
  active: boolean;
  onLiveUpdate: (data: {
    pillars: PillarScore[];
    metrics: LiveMetrics;
    phase: ShotPhase;
  }) => void;
  onBuffer: (frames: PoseFrame[]) => void;
};

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";

export function PoseCamera({ active, onLiveUpdate, onBuffer }: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const bufferRef = useRef<PoseFrame[]>([]);
  const heightsRef = useRef<number[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "denied">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;

    async function setup() {
      try {
        setStatus("loading");
        const vision = await FilesetResolver.forVisionTasks(WASM_URL);
        const landmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.4,
          minPosePresenceConfidence: 0.4,
          minTrackingConfidence: 0.4,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus("ready");
        tickLoop();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Camera / model failed";
        const lower = msg.toLowerCase();
        setStatus(lower.includes("permission") || lower.includes("denied") ? "denied" : "error");
        setErrorMsg(msg);
      }
    }

    function tickLoop() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !canvas || !landmarker) return;

      const tick = () => {
        rafRef.current = requestAnimationFrame(tick);
        if (!active || video.readyState < 2) return;
        if (video.currentTime === lastVideoTimeRef.current) return;
        lastVideoTimeRef.current = video.currentTime;

        const now = performance.now();
        const result = landmarker.detectForVideo(video, now);
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const pose = result.landmarks?.[0];
        if (!pose) return;

        const landmarks: Landmark[] = pose.map((p) => ({
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility,
        }));

        const draw = new DrawingUtils(ctx);
        draw.drawLandmarks(result.landmarks[0], { radius: 3, color: "#56C87C" });
        draw.drawConnectors(result.landmarks[0], PoseLandmarker.POSE_CONNECTIONS, {
          color: "#FBFBF9",
          lineWidth: 2,
        });

        const preview = previewPillarsFromPose(landmarks);
        const side = inferShootingSide(landmarks);
        const wristIdx = sideJoints(side).wrist;
        const wrist = landmarks[wristIdx];
        const nose = landmarks[0];
        const ankleL = landmarks[27];
        const ankleR = landmarks[28];
        let wh = 0.4;
        if (wrist && nose && ankleL && ankleR) {
          const ankleY = (ankleL.y + ankleR.y) / 2;
          const span = Math.max(ankleY - nose.y, 0.05);
          wh = Math.min(1.4, Math.max(0, (ankleY - wrist.y) / span));
        }
        heightsRef.current = [...heightsRef.current.slice(-40), wh];
        const phase = inferPhaseFromHeights(heightsRef.current);

        const frame: PoseFrame = { t: now, landmarks };
        bufferRef.current = [...bufferRef.current.slice(-90), frame];
        onBuffer(bufferRef.current);
        onLiveUpdate({
          pillars: preview.pillars,
          metrics: { ...preview.metrics, phase },
          phase,
        });
      };

      rafRef.current = requestAnimationFrame(tick);
    }

    if (active) void setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-ink-soft">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover opacity-0"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-soft/90 text-sm text-paper/70">
          Loading Klay pose model…
        </div>
      )}
      {status === "denied" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-soft/95 p-6 text-center text-sm text-paper/80">
          Camera permission denied. Allow camera access to run live Klay form tracking.
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-soft/95 p-6 text-center text-sm text-paper/80">
          Pose model failed to load. {errorMsg}
        </div>
      )}
    </div>
  );
}

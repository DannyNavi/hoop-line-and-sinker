"use client";

import { useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { PillarScore, ShooterModel } from "@/lib/formModels";
import { KLAY_MODEL } from "@/lib/formModels";
import { POSE_MODEL_URL, POSE_WASM_URL } from "@/lib/mediapipeConfig";
import type { Landmark } from "@/lib/poseGeometry";
import { inferShootingSide, sideJoints } from "@/lib/poseGeometry";
import {
  canvasDrawSize,
  detectIntervalMs,
  poseDelegate,
  uiUpdateIntervalMs,
} from "@/lib/posePerf";
import {
  inferPhaseFromHeights,
  previewPillarsFromPose,
  type LiveMetrics,
  type PoseFrame,
  type ShotPhase,
} from "@/lib/poseToKlay";

type PoseVideoProps = {
  active: boolean;
  src: string | null;
  model?: ShooterModel;
  onLiveUpdate: (data: {
    pillars: PillarScore[];
    metrics: LiveMetrics;
    phase: ShotPhase;
  }) => void;
  onBuffer: (frames: PoseFrame[]) => void;
};

export function PoseVideo({
  active,
  src,
  model = KLAY_MODEL,
  onLiveUpdate,
  onBuffer,
}: PoseVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const drawingRef = useRef<DrawingUtils | null>(null);
  const modelRef = useRef(model);
  const activeRef = useRef(active);
  const rafRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastDetectAtRef = useRef(0);
  const lastUiAtRef = useRef(0);
  const bufferRef = useRef<PoseFrame[]>([]);
  const heightsRef = useRef<number[]>([]);
  const onLiveUpdateRef = useRef(onLiveUpdate);
  const onBufferRef = useRef(onBuffer);

  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    onLiveUpdateRef.current = onLiveUpdate;
  }, [onLiveUpdate]);

  useEffect(() => {
    onBufferRef.current = onBuffer;
  }, [onBuffer]);

  useEffect(() => {
    let cancelled = false;
    const detectEvery = detectIntervalMs();
    const uiEvery = uiUpdateIntervalMs();

    async function setup() {
      if (!src) {
        setStatus("idle");
        return;
      }

      try {
        setStatus("loading");
        bufferRef.current = [];
        heightsRef.current = [];
        lastVideoTimeRef.current = -1;
        onBufferRef.current([]);

        if (!landmarkerRef.current) {
          const vision = await FilesetResolver.forVisionTasks(POSE_WASM_URL);
          let landmarker: PoseLandmarker;
          try {
            landmarker = await PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: POSE_MODEL_URL,
                delegate: poseDelegate(),
              },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.4,
              minPosePresenceConfidence: 0.4,
              minTrackingConfidence: 0.4,
            });
          } catch {
            landmarker = await PoseLandmarker.createFromOptions(vision, {
              baseOptions: {
                modelAssetPath: POSE_MODEL_URL,
                delegate: "CPU",
              },
              runningMode: "VIDEO",
              numPoses: 1,
              minPoseDetectionConfidence: 0.4,
              minPosePresenceConfidence: 0.4,
              minTrackingConfidence: 0.4,
            });
          }
          if (cancelled) {
            landmarker.close();
            return;
          }
          landmarkerRef.current = landmarker;
        }

        const video = videoRef.current;
        if (!video) return;
        video.src = src;
        video.load();
        await video.play().catch(() => {
          /* autoplay may require a click — controls are visible */
        });
        if (cancelled) return;
        setStatus("ready");
        tickLoop();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Video pose failed";
        setStatus("error");
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
        if (!activeRef.current || video.readyState < 2 || video.paused) return;
        if (video.currentTime === lastVideoTimeRef.current) return;

        const now = performance.now();
        if (now - lastDetectAtRef.current < detectEvery) return;
        lastDetectAtRef.current = now;
        lastVideoTimeRef.current = video.currentTime;

        const result = landmarker.detectForVideo(video, now);
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        const { width: dw, height: dh } = canvasDrawSize(
          video.videoWidth || 640,
          video.videoHeight || 480,
        );
        if (canvas.width !== dw || canvas.height !== dh) {
          canvas.width = dw;
          canvas.height = dh;
          drawingRef.current = new DrawingUtils(ctx);
        }
        if (!drawingRef.current) drawingRef.current = new DrawingUtils(ctx);

        ctx.clearRect(0, 0, dw, dh);
        ctx.drawImage(video, 0, 0, dw, dh);

        const pose = result.landmarks?.[0];
        if (!pose) return;

        const landmarks: Landmark[] = pose.map((p) => ({
          x: p.x,
          y: p.y,
          z: p.z,
          visibility: p.visibility,
        }));

        const drawable = landmarks.map((p) => ({
          x: p.x,
          y: p.y,
          z: p.z ?? 0,
          visibility: p.visibility ?? 1,
        }));
        drawingRef.current.drawLandmarks(drawable, { radius: 2, color: "#56C87C" });
        drawingRef.current.drawConnectors(drawable, PoseLandmarker.POSE_CONNECTIONS, {
          color: "#FBFBF9",
          lineWidth: 1.5,
        });

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
        const nextBuffer =
          bufferRef.current.length >= 90
            ? [...bufferRef.current.slice(-89), frame]
            : [...bufferRef.current, frame];
        bufferRef.current = nextBuffer;
        onBufferRef.current(nextBuffer);

        if (now - lastUiAtRef.current >= uiEvery) {
          lastUiAtRef.current = now;
          const preview = previewPillarsFromPose(landmarks, modelRef.current);
          onLiveUpdateRef.current({
            pillars: preview.pillars,
            metrics: { ...preview.metrics, phase },
            phase,
          });
        }
      };

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    void setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      const video = videoRef.current;
      if (video) {
        video.pause();
        video.removeAttribute("src");
        video.load();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => {
    return () => {
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      drawingRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-ink-soft">
      <video
        ref={videoRef}
        className="absolute inset-0 z-10 h-full w-full object-contain"
        playsInline
        controls
        muted
        loop
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-20 h-full w-full object-contain opacity-90"
      />

      {status === "idle" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink-soft/90 p-6 text-center text-sm text-paper/70">
          Upload a shooting clip to analyze form with MediaPipe.
        </div>
      )}
      {status === "loading" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink-soft/90 text-sm text-paper/70">
          Loading pose model for video…
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink-soft/95 p-6 text-center text-sm text-paper/80">
          Could not analyze video. {errorMsg}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DrawingUtils,
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";
import type { PillarScore, ShooterModel } from "@/lib/formModels";
import { KLAY_MODEL } from "@/lib/formModels";
import type { Landmark } from "@/lib/poseGeometry";
import { inferShootingSide, sideJoints } from "@/lib/poseGeometry";
import { POSE_MODEL_URL, POSE_WASM_URL } from "@/lib/mediapipeConfig";
import {
  cameraConstraints,
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

type Facing = "user" | "environment";

type PoseCameraProps = {
  active: boolean;
  model?: ShooterModel;
  onLiveUpdate: (data: {
    pillars: PillarScore[];
    metrics: LiveMetrics;
    phase: ShotPhase;
  }) => void;
  onBuffer: (frames: PoseFrame[]) => void;
};

export function PoseCamera({
  active,
  model = KLAY_MODEL,
  onLiveUpdate,
  onBuffer,
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const drawingRef = useRef<DrawingUtils | null>(null);
  const modelRef = useRef(model);
  const rafRef = useRef(0);
  const lastVideoTimeRef = useRef(-1);
  const lastDetectAtRef = useRef(0);
  const lastUiAtRef = useRef(0);
  const bufferRef = useRef<PoseFrame[]>([]);
  const heightsRef = useRef<number[]>([]);
  const onLiveUpdateRef = useRef(onLiveUpdate);
  const onBufferRef = useRef(onBuffer);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "denied">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [facing, setFacing] = useState<Facing>("user");
  const [canFlip, setCanFlip] = useState(false);
  const [switching, setSwitching] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const facingRef = useRef<Facing>("user");
  const activeRef = useRef(active);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    facingRef.current = facing;
  }, [facing]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    onLiveUpdateRef.current = onLiveUpdate;
  }, [onLiveUpdate]);

  useEffect(() => {
    onBufferRef.current = onBuffer;
  }, [onBuffer]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const refreshFlipAvailability = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      setCanFlip(
        cams.length > 1 || /mobile|android|iphone|ipad/i.test(navigator.userAgent),
      );
    } catch {
      setCanFlip(true);
    }
  }, []);

  const startStream = useCallback(
    async (nextFacing: Facing) => {
      stopStream();
      bufferRef.current = [];
      heightsRef.current = [];
      lastVideoTimeRef.current = -1;
      onBufferRef.current([]);

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: cameraConstraints(nextFacing),
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: nextFacing },
        });
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stream.getTracks().forEach((t) => t.stop());
        throw new Error("Video element missing");
      }
      video.srcObject = stream;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      await video.play();
      await refreshFlipAvailability();
    },
    [refreshFlipAvailability, stopStream],
  );

  const flipCamera = useCallback(async () => {
    if (switching || status !== "ready") return;
    const next: Facing = facingRef.current === "user" ? "environment" : "user";
    setSwitching(true);
    try {
      await startStream(next);
      setFacing(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not switch camera";
      setErrorMsg(msg);
      setStatus("error");
    } finally {
      setSwitching(false);
    }
  }, [startStream, status, switching]);

  useEffect(() => {
    let cancelled = false;
    const detectEvery = detectIntervalMs();
    const uiEvery = uiUpdateIntervalMs();

    async function createLandmarker(delegate: "GPU" | "CPU") {
      const vision = await FilesetResolver.forVisionTasks(POSE_WASM_URL);
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: POSE_MODEL_URL,
          delegate,
        },
        runningMode: "VIDEO",
        numPoses: 1,
        minPoseDetectionConfidence: 0.4,
        minPosePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });
    }

    async function setup() {
      try {
        setStatus("loading");
        let landmarker: PoseLandmarker;
        try {
          landmarker = await createLandmarker(poseDelegate());
        } catch {
          landmarker = await createLandmarker("CPU");
        }
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;

        await startStream(facingRef.current);
        if (cancelled) return;
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
        if (!activeRef.current || video.readyState < 2) return;
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

        const mirror = facingRef.current === "user";
        if (mirror) {
          ctx.save();
          ctx.translate(dw, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(video, 0, 0, dw, dh);
          ctx.restore();
        } else {
          ctx.drawImage(video, 0, 0, dw, dh);
        }

        const pose = result.landmarks?.[0];
        if (!pose) return;

        const landmarks: Landmark[] = pose.map((p) => ({
          x: mirror ? 1 - p.x : p.x,
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
        const nextBuffer = bufferRef.current.length >= 90
          ? [...bufferRef.current.slice(-89), frame]
          : [...bufferRef.current, frame];
        bufferRef.current = nextBuffer;
        onBufferRef.current(nextBuffer);

        // Throttle React updates — these were the main mobile stutter source.
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

      rafRef.current = requestAnimationFrame(tick);
    }

    if (active) void setup();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
      drawingRef.current = null;
      stopStream();
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
        autoPlay
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover" />

      {status === "ready" && (
        <button
          type="button"
          onClick={() => void flipCamera()}
          disabled={switching || !canFlip}
          title={canFlip ? "Switch front / rear camera" : "Only one camera detected"}
          className="absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-paper backdrop-blur-md transition hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {switching ? "Switching…" : facing === "user" ? "Rear camera" : "Front camera"}
        </button>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-soft/90 text-sm text-paper/70">
          Loading pose model…
        </div>
      )}
      {status === "denied" && (
        <div className="absolute inset-0 flex items-center justify-center bg-ink-soft/95 p-6 text-center text-sm text-paper/80">
          Camera permission denied. Allow camera access to run live form tracking.
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

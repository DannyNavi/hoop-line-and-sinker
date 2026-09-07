"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PoseCamera } from "@/components/PoseCamera";
import { PoseVideo } from "@/components/PoseVideo";
import {
  FORM_MODELS,
  getShooterModel,
  pickModelDrill,
  type FormCue,
  type PillarScore,
  type ShooterId,
} from "@/lib/formModels";
import {
  evaluateShotReadiness,
  scorePoseShot,
  type LiveMetrics,
  type PoseFrame,
  type ShotPhase,
} from "@/lib/poseToKlay";
type Cue = FormCue & { id: number };
type SourceMode = "live" | "video";

export default function TrainPage() {
  const [shooterId, setShooterId] = useState<ShooterId>("klay");
  const model = useMemo(() => getShooterModel(shooterId), [shooterId]);

  const [sourceMode, setSourceMode] = useState<SourceMode>("live");
  const [reps, setReps] = useState(0);
  const [makes, setMakes] = useState(0);
  const [formScore, setFormScore] = useState(82);
  const [recording, setRecording] = useState(true);
  const [phase, setPhase] = useState<ShotPhase>("idle");
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [pillars, setPillars] = useState<PillarScore[]>(() =>
    model.pillars.map((p) => ({
      pillar: p.id,
      label: p.label,
      score: 80,
      target: p.target,
    })),
  );
  const [drill, setDrill] = useState(() => pickModelDrill(model));
  const [cues, setCues] = useState<Cue[]>([
    {
      id: 0,
      pillar: "base",
      title: "Pose model ready",
      detail:
        "Use the live camera or choose a video. Sinker maps joints onto the selected shooter’s checklist.",
      severity: "good",
      ideal: model.tagline,
      klayTarget: model.tagline,
    },
  ]);

  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bufferRef = useRef<PoseFrame[]>([]);
  const lastLogAtRef = useRef(0);
  const lastLogWallRef = useRef(0);
  const [logArmed, setLogArmed] = useState(true);
  const [logHint, setLogHint] = useState(
    "Shoot in frame, then log — Sinker only scores real shot motion.",
  );

  const pct = useMemo(
    () => (reps === 0 ? 0 : Math.round((makes / reps) * 100)),
    [makes, reps],
  );
  const weakest = useMemo(
    () => [...pillars].sort((a, b) => a.score - b.score)[0],
    [pillars],
  );


  useEffect(() => {
    return () => {
      if (localVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(localVideoUrl);
    };
  }, [localVideoUrl]);

  function selectShooter(id: ShooterId) {
    const next = getShooterModel(id);
    setShooterId(id);
    setPillars(
      next.pillars.map((p) => ({
        pillar: p.id,
        label: p.label,
        score: 80,
        target: p.target,
      })),
    );
    setDrill(pickModelDrill(next));
    setCues([
      {
        id: Date.now(),
        pillar: "base",
        title: `${next.shortName} model loaded`,
        detail: next.summary,
        severity: "good",
        ideal: next.tagline,
        klayTarget: next.tagline,
      },
    ]);
    setFormScore(82);
    bufferRef.current = [];
  }

  const onLiveUpdate = useCallback(
    (data: { pillars: PillarScore[]; metrics: LiveMetrics; phase: ShotPhase }) => {
      if (!recording) return;
      setPillars(data.pillars);
      setMetrics(data.metrics);
      setPhase(data.phase);
    },
    [recording],
  );

  const onBuffer = useCallback((frames: PoseFrame[]) => {
    bufferRef.current = frames;
  }, []);

  function switchMode(mode: SourceMode) {
    setSourceMode(mode);
    bufferRef.current = [];
    lastLogAtRef.current = 0;
    setLogHint(
      mode === "live"
        ? "Shoot in frame, then log — Sinker only scores real shot motion."
        : "Play the clip through a shot, then log make/miss.",
    );
  }

  function clearChosenVideo() {
    if (localVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(localVideoUrl);
    setLocalVideoUrl(null);
    setLocalFileName(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    switchMode("live");
  }

  function handleFilePicked(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setFileError("Please choose a video file (mp4, webm, mov).");
      return;
    }

    if (localVideoUrl?.startsWith("blob:")) URL.revokeObjectURL(localVideoUrl);
    const blobUrl = URL.createObjectURL(file);
    setLocalVideoUrl(blobUrl);
    setLocalFileName(file.name);
    setFileError(null);
    switchMode("video");
    bufferRef.current = [];
    lastLogAtRef.current = 0;
    setCues((prev) => [
      {
        id: Date.now(),
        pillar: "base",
        title: "Clip loaded",
        detail: `Analyzing “${file.name}” locally with MediaPipe — nothing is uploaded.`,
        severity: "good",
        ideal: "Local clip ready",
        klayTarget: "Local clip ready",
      } satisfies Cue,
      ...prev,
    ].slice(0, 5));
  }

  function takeShot(made: boolean) {
    const wallNow = Date.now();
    if (!logArmed || wallNow - (lastLogWallRef.current || 0) < 1500) {
      setLogHint("Wait a beat — take another shot before logging again.");
      return;
    }

    const frames = bufferRef.current.filter((f) => f.t > lastLogAtRef.current);
    const readiness = evaluateShotReadiness(frames);
    if (!readiness.ok) {
      setLogHint(readiness.detail);
      const rejectCue: Cue = {
        id: Date.now(),
        pillar: "base",
        title: readiness.reason === "need_motion" ? "No shot yet" : "Pose needed",
        detail: readiness.detail,
        severity: "focus",
        ideal: "Full body in frame · clear dip-to-release",
        klayTarget: "Full body in frame · clear dip-to-release",
      };
      setCues((prev) => [rejectCue, ...prev].slice(0, 5));
      return;
    }

    const result = scorePoseShot(frames, made, formScore, model);

    lastLogAtRef.current = performance.now();
    lastLogWallRef.current = wallNow;
    setLogArmed(false);
    window.setTimeout(() => setLogArmed(true), 1500);

    setReps((r) => r + 1);
    if (made) setMakes((m) => m + 1);
    setFormScore(result.formScore);
    setPillars(result.pillars);
    setCues((prev) => [{ ...result.cue, id: Date.now() }, ...prev].slice(0, 5));
    setDrill(pickModelDrill(model, result.cue.pillar));
    setLogHint(`Scored against ${model.shortName}. Take another shot, then log.`);
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="serif text-[1.1rem] tracking-[-0.03em]">
            hoop line &amp; sinker
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink-muted sm:inline">
              {sourceMode === "live" ? "Live pose" : "Chosen clip"} · {model.athlete}
            </span>
            {sourceMode === "live" && (
              <button
                type="button"
                onClick={() => setRecording((v) => !v)}
                className="pill pill-outline px-4 py-2"
              >
                {recording ? "Pause camera" : "Resume camera"}
              </button>
            )}
            <Link href="/" className="font-semibold text-ink-muted hover:text-ink">
              Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="sketch-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-5 py-4 text-sm text-ink-muted">
            <span>
              {sourceMode === "live" ? "Court camera" : "Chosen video"} · MediaPipe →{" "}
              {model.shortName}
            </span>
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${recording ? "bg-green" : "bg-ink-faint"}`}
              />
              {recording ? `Live · ${phase}` : "Paused"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-5 py-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/*"
              className="hidden"
              onChange={(e) => handleFilePicked(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink-muted hover:border-ink/40 hover:text-ink"
            >
              Choose video
            </button>
            {sourceMode === "video" && (
              <button
                type="button"
                onClick={clearChosenVideo}
                className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink-muted hover:border-ink/40 hover:text-ink"
              >
                Back to camera
              </button>
            )}
            {FORM_MODELS.map((m) => {
              const selected = m.id === shooterId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => selectShooter(m.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    selected
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 bg-paper text-ink-muted hover:border-ink/40 hover:text-ink"
                  }`}
                >
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: selected ? "currentColor" : m.accent }}
                  />
                  {m.shortName}
                </button>
              );
            })}
          </div>

          {(fileError || localFileName) && (
            <div className="border-b border-ink/10 px-5 py-2 text-xs text-ink-faint">
              {fileError
                ? fileError
                : localFileName
                  ? `Loaded locally · ${localFileName} (not uploaded)`
                  : null}
            </div>
          )}

          <div className="relative min-h-[400px] p-5 sm:min-h-[520px]">
            <div className="absolute inset-5">
              {sourceMode === "live" ? (
                <PoseCamera
                  active={recording}
                  model={model}
                  onLiveUpdate={onLiveUpdate}
                  onBuffer={onBuffer}
                />
              ) : (
                <PoseVideo
                  active={recording}
                  src={localVideoUrl}
                  model={model}
                  onLiveUpdate={onLiveUpdate}
                  onBuffer={onBuffer}
                />
              )}
            </div>
            <div className="pointer-events-none absolute bottom-8 left-8 right-8 z-10 flex flex-wrap gap-2">
              <Chip>Base {pillars.find((p) => p.pillar === "base")?.score ?? "—"}</Chip>
              <Chip>Set {pillars.find((p) => p.pillar === "setPoint")?.score ?? "—"}</Chip>
              <Chip>
                Elbow{" "}
                {metrics?.elbowAngle != null ? `${Math.round(metrics.elbowAngle)}°` : "—"}
              </Chip>
              <Chip>{metrics?.side === "left" ? "L" : "R"} hand</Chip>
            </div>
          </div>


          <div className="relative z-10 flex flex-wrap gap-3 border-t border-ink/10 px-5 py-4">
            <button
              type="button"
              onClick={() => takeShot(true)}
              disabled={!logArmed}
              className="pill pill-dark disabled:cursor-not-allowed disabled:opacity-45"
            >
              Log make
            </button>
            <button
              type="button"
              onClick={() => takeShot(false)}
              disabled={!logArmed}
              className="pill pill-outline disabled:cursor-not-allowed disabled:opacity-45"
            >
              Log miss
            </button>
            <p className="self-center text-xs text-ink-faint">{logHint}</p>
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Reps" value={String(reps)} />
            <Metric label="Make %" value={`${pct}%`} />
            <Metric label={`${model.shortName} fit`} value={String(formScore)} />
          </div>

          <div className="sketch-card p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <p className="hand-note text-sm">Form model</p>
                <p className="serif mt-1 text-xl">{model.athlete}</p>
              </div>
              <p className="text-xs font-medium text-ink-faint">{model.tagline}</p>
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">{model.summary}</p>
            <div className="mt-4 space-y-2">
              {pillars.map((p) => (
                <div key={p.pillar}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink-muted">{p.label}</span>
                    <span className="font-semibold">{p.score}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-paper-mute">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: model.accent }}
                      initial={false}
                      animate={{ width: `${p.score}%` }}
                      transition={{ duration: 0.35 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sketch-card flex-1 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                S
              </div>
              <div>
                <p className="font-semibold">Sinker</p>
                <p className="text-sm text-ink-faint">
                  {sourceMode === "live" ? "Live pose" : "Chosen clip"} → {model.shortName} cues
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {cues.map((cue) => (
                  <motion.article
                    key={cue.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-ink/10 bg-paper-soft p-4"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          cue.severity === "good"
                            ? "bg-green"
                            : cue.severity === "fix"
                              ? "bg-coral"
                              : "bg-amber"
                        }`}
                      />
                      <h3 className="text-sm font-semibold">{cue.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-ink-muted">{cue.detail}</p>
                    <p className="mt-2 text-[11px] text-ink-faint">
                      Target · {cue.ideal ?? cue.klayTarget}
                    </p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="sketch-card p-5">
            <p className="hand-note text-sm">{model.shortName} drill</p>
            <p className="serif mt-1 text-xl">{drill.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{drill.note}</p>
            <p className="mt-3 text-xs font-medium text-ink-faint">
              {drill.reps}
              {weakest ? ` · focusing ${weakest.label.toLowerCase()}` : ""}
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="sketch-card px-3 py-4 text-center">
      <p className="text-[11px] font-medium text-ink-faint">{label}</p>
      <p className="serif mt-1 text-2xl tracking-tight">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] text-paper/85 backdrop-blur-md">
      {children}
    </span>
  );
}

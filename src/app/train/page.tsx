"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PoseCamera } from "@/components/PoseCamera";
import {
  KLAY_MODEL,
  pickKlayDrill,
  scoreRepAgainstKlay,
  type FormCue,
  type PillarScore,
} from "@/lib/klayModel";
import {
  scorePoseShot,
  type LiveMetrics,
  type PoseFrame,
  type ShotPhase,
} from "@/lib/poseToKlay";

type Cue = FormCue & { id: number };

export default function TrainPage() {
  const [reps, setReps] = useState(0);
  const [makes, setMakes] = useState(0);
  const [formScore, setFormScore] = useState(82);
  const [recording, setRecording] = useState(true);
  const [phase, setPhase] = useState<ShotPhase>("idle");
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [pillars, setPillars] = useState<PillarScore[]>(
    KLAY_MODEL.pillars.map((p) => ({
      pillar: p.id,
      label: p.label,
      score: 80,
      target: p.target,
    })),
  );
  const [drill, setDrill] = useState(() => pickKlayDrill());
  const [cues, setCues] = useState<Cue[]>([
    {
      id: 0,
      pillar: "base",
      title: "Pose model ready",
      detail:
        "Allow the camera, stand so your full body is visible, then shoot. Sinker maps your joints onto Klay's checklist.",
      severity: "good",
      klayTarget: KLAY_MODEL.tagline,
    },
  ]);

  const bufferRef = useRef<PoseFrame[]>([]);

  const pct = useMemo(
    () => (reps === 0 ? 0 : Math.round((makes / reps) * 100)),
    [makes, reps],
  );
  const weakest = useMemo(
    () => [...pillars].sort((a, b) => a.score - b.score)[0],
    [pillars],
  );

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

  function takeShot(made: boolean) {
    const frames = bufferRef.current;
    const result =
      frames.length >= 8
        ? scorePoseShot(frames, made, formScore)
        : (() => {
            const synthetic = scoreRepAgainstKlay(made, formScore);
            return {
              formScore: synthetic.formScore,
              pillars: synthetic.pillars,
              cue: synthetic.cue,
            };
          })();

    setReps((r) => r + 1);
    if (made) setMakes((m) => m + 1);
    setFormScore(result.formScore);
    setPillars(result.pillars);
    setCues((prev) => [{ ...result.cue, id: Date.now() }, ...prev].slice(0, 5));
    setDrill(pickKlayDrill(result.cue.pillar));
    bufferRef.current = bufferRef.current.slice(-15);
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
              Live pose · {KLAY_MODEL.athlete}
            </span>
            <button
              type="button"
              onClick={() => setRecording((v) => !v)}
              className="pill pill-outline px-4 py-2"
            >
              {recording ? "Pause camera" : "Resume camera"}
            </button>
            <Link href="/" className="font-semibold text-ink-muted hover:text-ink">
              Exit
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="sketch-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4 text-sm text-ink-muted">
            <span>Court camera · MediaPipe pose → Klay model</span>
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${recording ? "bg-green" : "bg-ink-faint"}`}
              />
              {recording ? `Live · ${phase}` : "Paused"}
            </span>
          </div>

          <div className="relative min-h-[400px] p-5 sm:min-h-[520px]">
            <div className="absolute inset-5">
              <PoseCamera
                active={recording}
                onLiveUpdate={onLiveUpdate}
                onBuffer={onBuffer}
              />
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
            <button type="button" onClick={() => takeShot(true)} className="pill pill-dark">
              Log make
            </button>
            <button type="button" onClick={() => takeShot(false)} className="pill pill-outline">
              Log miss
            </button>
            <p className="self-center text-xs text-ink-faint">
              Shoot in frame, then log — Sinker scores the pose buffer against Klay.
            </p>
          </div>
        </section>

        <aside className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Reps" value={String(reps)} />
            <Metric label="Make %" value={`${pct}%`} />
            <Metric label="Klay fit" value={String(formScore)} />
          </div>

          <div className="sketch-card p-5">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <p className="hand-note text-sm">Form model</p>
                <p className="serif mt-1 text-xl">{KLAY_MODEL.athlete}</p>
              </div>
              <p className="text-xs font-medium text-ink-faint">{KLAY_MODEL.tagline}</p>
            </div>
            <p className="text-sm leading-relaxed text-ink-muted">{KLAY_MODEL.summary}</p>
            <div className="mt-4 space-y-2">
              {pillars.map((p) => (
                <div key={p.pillar}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-ink-muted">{p.label}</span>
                    <span className="font-semibold">{p.score}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-paper-mute">
                    <motion.div
                      className="h-full rounded-full bg-ink"
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
                <p className="text-sm text-ink-faint">Live pose → Klay cues</p>
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
                    <p className="mt-2 text-[11px] text-ink-faint">Target · {cue.klayTarget}</p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="sketch-card p-5">
            <p className="hand-note text-sm">Klay drill</p>
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

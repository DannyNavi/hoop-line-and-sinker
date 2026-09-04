"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Cue = {
  id: number;
  title: string;
  detail: string;
  severity: "focus" | "good" | "fix";
};

const CUES: Omit<Cue, "id">[] = [
  {
    title: "Guide hand quiet",
    detail: "Your off-hand is pushing left on the release. Keep it as a shelf until set point.",
    severity: "fix",
  },
  {
    title: "Elbow under ball",
    detail: "Elbow drifted outside the line. Tuck it under before the upward press.",
    severity: "focus",
  },
  {
    title: "Hold the follow-through",
    detail: "Wrist is collapsing early. Freeze the goose-neck until the ball hits rim.",
    severity: "fix",
  },
  {
    title: "Clean base",
    detail: "Feet set square to the hoop. Balance looked locked on that make.",
    severity: "good",
  },
  {
    title: "Shorter dip",
    detail: "Dip depth increased under fatigue. Keep the gather compact for the next five.",
    severity: "focus",
  },
];

export default function TrainPage() {
  const [reps, setReps] = useState(0);
  const [makes, setMakes] = useState(0);
  const [formScore, setFormScore] = useState(82);
  const [recording, setRecording] = useState(true);
  const [cues, setCues] = useState<Cue[]>([
    {
      id: 0,
      title: "Ready when you are",
      detail: "Take a shot. Arc will read your form and drop a cue for the next rep.",
      severity: "good",
    },
  ]);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => {
      setFormScore((s) => Math.min(98, Math.max(70, s + (Math.random() > 0.5 ? 1 : -1))));
    }, 1800);
    return () => clearInterval(timer);
  }, [recording]);

  const pct = useMemo(() => (reps === 0 ? 0 : Math.round((makes / reps) * 100)), [makes, reps]);

  function takeShot(made: boolean) {
    const cue = CUES[Math.floor(Math.random() * CUES.length)];
    setReps((r) => r + 1);
    if (made) setMakes((m) => m + 1);
    setFormScore((s) => Math.min(98, Math.max(68, s + (made ? 2 : -3) + Math.round(Math.random() * 2))));
    setCues((prev) => [{ ...cue, id: Date.now() }, ...prev].slice(0, 4));
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="display text-[1.35rem] font-extrabold tracking-[-0.05em]">
          Arc
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <button
            type="button"
            onClick={() => setRecording((v) => !v)}
            className="rounded-full border border-line bg-bg-elevated px-4 py-2 font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            {recording ? "Pause camera" : "Resume camera"}
          </button>
          <Link href="/" className="font-semibold text-ink-muted hover:text-ink">
            Exit
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="overflow-hidden rounded-[28px] border border-line bg-[#171a18] shadow-[0_30px_80px_rgba(17,17,17,0.12)]">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 text-sm text-white/55">
            <span>Court camera · AI form overlay</span>
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${recording ? "bg-[#6dffa8]" : "bg-white/30"}`}
              />
              {recording ? "Live" : "Paused"}
            </span>
          </div>

          <div className="relative min-h-[420px] p-5 sm:min-h-[520px]">
            <div
              className="absolute inset-5 overflow-hidden rounded-2xl"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 60% 35%, rgba(196,92,38,0.28), transparent 55%), linear-gradient(180deg, #24302a, #121513)",
              }}
            >
              <div className="noise" />
              <svg viewBox="0 0 640 480" className="absolute inset-0 h-full w-full" aria-hidden>
                <ellipse cx="320" cy="410" rx="240" ry="34" fill="rgba(196,92,38,0.28)" />
                <rect x="488" y="78" width="9" height="140" rx="2" fill="rgba(255,255,255,0.3)" />
                <path
                  d="M470 78 h46 a20 20 0 0 1 0 40 h-46 a20 20 0 0 1 0 -40 z"
                  fill="none"
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="4"
                />
                {recording && (
                  <>
                    <path
                      className="draw-arc"
                      d="M150 360 C 250 300, 340 140, 500 100"
                      stroke="#9dffc4"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <g stroke="rgba(255,255,255,0.6)" strokeWidth="1.6">
                      <circle cx="260" cy="190" r="5" fill="rgba(255,255,255,0.85)" />
                      <circle cx="278" cy="235" r="5" fill="rgba(255,255,255,0.85)" />
                      <circle cx="300" cy="278" r="5" fill="rgba(255,255,255,0.85)" />
                      <circle cx="318" cy="328" r="5" fill="rgba(255,255,255,0.85)" />
                      <path d="M260 190 L278 235 L300 278 L318 328" />
                      <path d="M278 235 L240 255" />
                      <path d="M278 235 L314 250" />
                    </g>
                  </>
                )}
              </svg>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <Chip>Elbow 94°</Chip>
                <Chip>Knee bend 118°</Chip>
                <Chip>Release {formScore > 85 ? "on arc" : "flat"}</Chip>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/8 px-5 py-4">
            <button
              type="button"
              onClick={() => takeShot(true)}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Log make
            </button>
            <button
              type="button"
              onClick={() => takeShot(false)}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Log miss
            </button>
          </div>
        </section>

        <aside className="flex flex-col gap-6">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Reps" value={String(reps)} />
            <Metric label="Make %" value={`${pct}%`} />
            <Metric label="Form" value={String(formScore)} />
          </div>

          <div className="flex-1 rounded-[28px] border border-line bg-bg-elevated p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                A
              </div>
              <div>
                <p className="font-semibold">Arc Coach</p>
                <p className="text-sm text-ink-faint">Live session notes</p>
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
                    className="rounded-2xl border border-line bg-white/70 p-4"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          cue.severity === "good"
                            ? "bg-accent"
                            : cue.severity === "fix"
                              ? "bg-court"
                              : "bg-[#d4a017]"
                        }`}
                      />
                      <h3 className="text-sm font-semibold">{cue.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed text-ink-muted">{cue.detail}</p>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-bg-elevated p-5">
            <p className="text-sm font-semibold">Today’s focus</p>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              Keep the guide hand quiet through release. Five wing catch-and-shoots, then
              move back if form stays above 85.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-line bg-bg-elevated px-3 py-4 text-center">
      <p className="text-[11px] font-medium text-ink-faint">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur-md">
      {children}
    </span>
  );
}

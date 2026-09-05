"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  KLAY_MODEL,
  pickKlayDrill,
  scoreRepAgainstKlay,
  type FormCue,
  type PillarScore,
} from "@/lib/klayModel";

type Cue = FormCue & { id: number };

export default function TrainPage() {
  const [reps, setReps] = useState(0);
  const [makes, setMakes] = useState(0);
  const [formScore, setFormScore] = useState(82);
  const [recording, setRecording] = useState(true);
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
      title: "Klay model online",
      detail:
        "Sinker is scoring you against Thompson's catch-and-shoot checklist. Take a shot to get your first cue.",
      severity: "good",
      klayTarget: KLAY_MODEL.tagline,
    },
  ]);

  const pct = useMemo(
    () => (reps === 0 ? 0 : Math.round((makes / reps) * 100)),
    [makes, reps],
  );

  const weakest = useMemo(
    () => [...pillars].sort((a, b) => a.score - b.score)[0],
    [pillars],
  );

  function takeShot(made: boolean) {
    const result = scoreRepAgainstKlay(made, formScore);
    setReps((r) => r + 1);
    if (made) setMakes((m) => m + 1);
    setFormScore(result.formScore);
    setPillars(result.pillars);
    setCues((prev) => [{ ...result.cue, id: Date.now() }, ...prev].slice(0, 5));
    setDrill(pickKlayDrill(result.cue.pillar));
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
              Model · {KLAY_MODEL.athlete}
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
            <span>Court camera · Klay form overlay</span>
            <span className="inline-flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${recording ? "bg-green" : "bg-ink-faint"}`}
              />
              {recording ? "Live" : "Paused"}
            </span>
          </div>

          <div className="relative min-h-[400px] p-5 sm:min-h-[480px]">
            <div className="absolute inset-5 overflow-hidden rounded-2xl bg-ink-soft">
              <svg viewBox="0 0 640 480" className="absolute inset-0 h-full w-full" aria-hidden>
                <ellipse
                  cx="320"
                  cy="410"
                  rx="240"
                  ry="34"
                  fill="none"
                  stroke="#FBFBF9"
                  strokeWidth="1.5"
                  opacity="0.35"
                />
                <rect
                  x="488"
                  y="78"
                  width="9"
                  height="140"
                  rx="2"
                  fill="#FBFBF9"
                  opacity="0.35"
                />
                <path
                  d="M470 78 h46 a20 20 0 0 1 0 40 h-46 a20 20 0 0 1 0 -40 z"
                  fill="none"
                  stroke="#FBFBF9"
                  strokeWidth="4"
                  opacity="0.45"
                />
                <path d="M80 90 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill="#FE6862" />
                <path
                  d="M560 320 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 z"
                  fill="#DC78FF"
                />
                {recording && (
                  <>
                    <path
                      d="M150 360 C 250 300, 340 140, 500 100"
                      stroke="#56C87C"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="6 8"
                      fill="none"
                    />
                    <g stroke="#FBFBF9" strokeWidth="1.6" opacity="0.8">
                      <circle cx="260" cy="190" r="5" fill="#FBFBF9" />
                      <circle cx="278" cy="235" r="5" fill="#FBFBF9" />
                      <circle cx="300" cy="278" r="5" fill="#FBFBF9" />
                      <circle cx="318" cy="328" r="5" fill="#FBFBF9" />
                      <path d="M260 190 L278 235 L300 278 L318 328" />
                      <path d="M278 235 L240 255" />
                      <path d="M278 235 L314 250" />
                    </g>
                    {/* Klay set-point marker */}
                    <circle cx="268" cy="150" r="10" stroke="#DC78FF" strokeWidth="1.5" fill="none" opacity="0.7" />
                    <text x="284" y="146" fill="#DC78FF" fontSize="11" opacity="0.85">
                      set
                    </text>
                  </>
                )}
              </svg>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <Chip>Base {pillars.find((p) => p.pillar === "base")?.score ?? "—"}</Chip>
                <Chip>Set {pillars.find((p) => p.pillar === "setPoint")?.score ?? "—"}</Chip>
                <Chip>Release {formScore > 85 ? "Klay-like" : "flat"}</Chip>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 border-t border-ink/10 px-5 py-4">
            <button type="button" onClick={() => takeShot(true)} className="pill pill-dark">
              Log make
            </button>
            <button type="button" onClick={() => takeShot(false)} className="pill pill-outline">
              Log miss
            </button>
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
              {pillars.slice(0, 5).map((p) => (
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
                      transition={{ duration: 0.45 }}
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
                <p className="text-sm text-ink-faint">Coaching to the Klay model</p>
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

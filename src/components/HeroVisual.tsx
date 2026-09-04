"use client";

import { motion } from "framer-motion";

export function HeroVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
      className="relative mx-auto mt-10 w-full max-w-5xl px-4 sm:mt-14 sm:px-6"
    >
      <div className="float-y relative overflow-hidden rounded-[28px] border border-line bg-[#1a1d1b] shadow-[0_40px_100px_rgba(17,17,17,0.18)]">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 55% 40%, rgba(196,92,38,0.35), transparent 60%), linear-gradient(180deg, #2a322e 0%, #141816 100%)",
          }}
        />
        <div className="noise" />

        <div className="relative grid min-h-[420px] grid-cols-1 lg:min-h-[520px] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative flex flex-col p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between text-xs font-medium text-white/55">
              <span>Live form capture</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6dffa8]" />
                Recording
              </span>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/25">
              <CourtSilhouette />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 640 420"
                fill="none"
                aria-hidden
              >
                <path
                  className="draw-arc"
                  d="M120 320 C 220 280, 320 120, 470 90"
                  stroke="#9dffc4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="470" cy="90" r="7" fill="#9dffc4" />
                <circle
                  cx="470"
                  cy="90"
                  r="18"
                  className="pulse-ring origin-center"
                  stroke="#9dffc4"
                  strokeWidth="1.5"
                  fill="none"
                />
                <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.5">
                  <circle cx="248" cy="168" r="5" fill="rgba(255,255,255,0.8)" />
                  <circle cx="268" cy="210" r="5" fill="rgba(255,255,255,0.8)" />
                  <circle cx="292" cy="248" r="5" fill="rgba(255,255,255,0.8)" />
                  <circle cx="310" cy="292" r="5" fill="rgba(255,255,255,0.8)" />
                  <path d="M248 168 L268 210 L292 248 L310 292" />
                  <path d="M268 210 L232 228" />
                  <path d="M268 210 L302 224" />
                  <path d="M292 248 L270 275" />
                  <path d="M292 248 L320 268" />
                </g>
              </svg>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <MetricChip label="Elbow angle" value="92°" tone="good" />
                <MetricChip label="Release height" value="7'2&quot;" tone="good" />
                <MetricChip label="Follow-through" value="Hold +0.4s" tone="warn" />
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-5 sm:p-7 lg:border-l lg:border-t-0">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
                A
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Arc Coach</p>
                <p className="text-xs text-white/50">Reading your last 12 reps</p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-white/80">
              <p className="rounded-2xl bg-white/8 p-4">
                Your guide hand is peeling early. Keep it on the ball through the set point,
                then finish with a quieter wrist on the balance hand.
              </p>
              <p className="rounded-2xl bg-white/5 p-4 text-white/65">
                Dip depth looks consistent. Next set: five catch-and-shoots from the right
                wing, hold the follow-through until the ball hits net.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Makes" value="18/25" />
              <Stat label="Form score" value="86" />
              <Stat label="Streak" value="4" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn";
}) {
  return (
    <div className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[11px] text-white/85 backdrop-blur-md">
      <span className="text-white/50">{label}</span>{" "}
      <span className={tone === "good" ? "text-[#9dffc4]" : "text-[#ffd39a]"}>{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3">
      <p className="text-[11px] text-white/45">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight text-white">{value}</p>
    </div>
  );
}

function CourtSilhouette() {
  return (
    <svg
      viewBox="0 0 640 420"
      className="absolute inset-0 h-full w-full opacity-40"
      aria-hidden
    >
      <ellipse cx="320" cy="360" rx="220" ry="28" fill="rgba(196,92,38,0.35)" />
      <rect x="470" y="70" width="8" height="120" rx="2" fill="rgba(255,255,255,0.35)" />
      <path
        d="M454 70 h40 a18 18 0 0 1 0 36 h-40 a18 18 0 0 1 0 -36 z"
        fill="none"
        stroke="rgba(255,255,255,0.45)"
        strokeWidth="4"
      />
      <path
        d="M478 106 v18"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="2"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

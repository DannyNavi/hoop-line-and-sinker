"use client";

import { motion } from "framer-motion";

const glyphs = [
  { ch: "a", top: "12%", left: "8%", size: "3.5rem", delay: "0s" },
  { ch: "r", top: "22%", left: "78%", size: "4.5rem", delay: "1.2s" },
  { ch: "c", top: "68%", left: "12%", size: "5rem", delay: "0.4s" },
  { ch: "%", top: "18%", left: "42%", size: "2.8rem", delay: "2s" },
  { ch: "3", top: "74%", left: "70%", size: "3.2rem", delay: "0.8s" },
  { ch: "°", top: "48%", left: "88%", size: "3rem", delay: "1.6s" },
  { ch: "o", top: "58%", left: "30%", size: "2.4rem", delay: "2.4s" },
];

export function FloatingGlyphs() {
  return (
    <>
      {glyphs.map((g) => (
        <span
          key={`${g.ch}-${g.left}`}
          className="float-glyph"
          style={{
            top: g.top,
            left: g.left,
            fontSize: g.size,
            animationDelay: g.delay,
          }}
        >
          {g.ch}
        </span>
      ))}
    </>
  );
}

export function HeroVisual() {
  return (
    <div className="relative mx-auto mt-10 w-full max-w-5xl px-4 sm:mt-14 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        className="sketch-card relative overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.22)]"
      >
        <div className="grid min-h-[420px] lg:min-h-[500px] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative border-b border-ink/10 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex items-center justify-between text-xs font-medium text-ink-muted">
              <span>Live form capture</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-3 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-coral" />
                Recording
              </span>
            </div>

            <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden rounded-2xl bg-ink-soft sm:min-h-[360px]">
              <CourtSketch />
              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 640 420"
                fill="none"
                aria-hidden
              >
                <path
                  d="M120 320 C 220 280, 320 120, 470 90"
                  stroke="#56C87C"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                />
                <circle cx="470" cy="90" r="6" fill="#56C87C" />
                <g stroke="#FBFBF9" strokeWidth="1.6" opacity="0.85">
                  <circle cx="248" cy="168" r="4.5" fill="#FBFBF9" />
                  <circle cx="268" cy="210" r="4.5" fill="#FBFBF9" />
                  <circle cx="292" cy="248" r="4.5" fill="#FBFBF9" />
                  <circle cx="310" cy="292" r="4.5" fill="#FBFBF9" />
                  <path d="M248 168 L268 210 L292 248 L310 292" />
                  <path d="M268 210 L232 228" />
                  <path d="M268 210 L302 224" />
                  <path d="M292 248 L270 275" />
                  <path d="M292 248 L320 268" />
                </g>
              </svg>

              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <Tag>Wide base</Tag>
                <Tag>Set · forehead</Tag>
                <Tag tone="warn">Guide hand late</Tag>
              </div>

              <div className="absolute left-[18%] top-[38%]">
                <Cursor color="#FBFBF9" label="you" />
              </div>
              <div className="absolute right-[28%] top-[22%]">
                <Cursor color="#DC78FF" label="coach" />
              </div>
            </div>
          </div>

          <div className="flex flex-col p-5 sm:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-paper">
                S
              </div>
              <div>
                <p className="text-sm font-semibold">Sinker</p>
                <p className="text-xs text-ink-faint">Klay model · last 12 reps</p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-relaxed text-ink-muted">
              <p className="rounded-2xl border border-ink/10 bg-paper-soft p-4">
                Guide hand stayed on the ball into the snap. Klay clears it early — shelf,
                then off, before the wrist breaks.
              </p>
              <p className="rounded-2xl border border-dashed border-ink/15 p-4">
                Dip looks compact. Next set: five wing catch-and-shoots — hit forehead set
                point before you leave the floor.
              </p>
            </div>

            <div className="mt-auto grid grid-cols-3 gap-3 pt-6">
              <Stat label="Makes" value="18/25" />
              <Stat label="Klay fit" value="86" />
              <Stat label="Streak" value="4" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Tag({
  children,
  tone = "ok",
}: {
  children: React.ReactNode;
  tone?: "ok" | "warn";
}) {
  return (
    <span className="rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] text-paper backdrop-blur-md">
      <span className={tone === "ok" ? "text-green" : "text-amber"}>{children}</span>
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 px-3 py-3">
      <p className="text-[11px] text-ink-faint">{label}</p>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function Cursor({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex flex-col items-start">
      <svg width="18" height="22" viewBox="0 0 18 22" fill="none" aria-hidden>
        <path
          d="M1 1 L1 17 L5.5 13.5 L9.5 21 L12 19.5 L8 12 L14 12 Z"
          fill={color}
          stroke="#0C0C0D"
          strokeWidth="1"
        />
      </svg>
      <span
        className="mt-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-ink"
        style={{ background: color }}
      >
        {label}
      </span>
    </div>
  );
}

function CourtSketch() {
  return (
    <svg
      viewBox="0 0 640 420"
      className="absolute inset-0 h-full w-full opacity-45"
      aria-hidden
    >
      <ellipse
        cx="320"
        cy="360"
        rx="220"
        ry="28"
        fill="none"
        stroke="#FBFBF9"
        strokeWidth="1.5"
      />
      <rect x="470" y="70" width="7" height="120" rx="1" fill="#FBFBF9" opacity="0.5" />
      <path
        d="M454 70 h40 a18 18 0 0 1 0 36 h-40 a18 18 0 0 1 0 -36 z"
        fill="none"
        stroke="#FBFBF9"
        strokeWidth="3"
      />
      <path d="M90 80 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill="#FE6862" />
      <path
        d="M560 300 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 z"
        fill="#DC78FF"
      />
      <path d="M160 250 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 z" fill="#56C87C" />
    </svg>
  );
}

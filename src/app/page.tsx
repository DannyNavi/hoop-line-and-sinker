"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { FloatingGlyphs, HeroVisual } from "@/components/HeroVisual";
import { FORM_MODELS } from "@/lib/formModels";

const fade = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  return (
    <div className="overflow-x-hidden bg-paper">
      <Nav />

      <section className="hero-dark relative overflow-hidden text-paper">
        <FloatingGlyphs />
        <div className="relative z-10 mx-auto max-w-4xl px-5 pb-8 pt-16 text-center sm:px-8 sm:pt-24">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 text-sm font-medium tracking-wide text-paper/55"
          >
            Form models · Klay · Steph · Dame
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="serif text-[2.75rem] text-paper sm:text-6xl md:text-7xl"
          >
            Catch. Dip. Rise. Splash.
            <span className="cursor-blink" aria-hidden />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.08 }}
            className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-paper/65 sm:text-lg"
          >
            Train your jumper against Klay, Steph, or Dame — live pose cues matched to each
            shooter’s checklist.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.14 }}
            className="mt-9"
          >
            <Link href="/train" className="pill pill-light">
              Test it out
            </Link>
          </motion.div>
        </div>

        <div className="relative z-10 pb-4 sm:pb-8">
          <HeroVisual />
        </div>

        <svg
          viewBox="0 0 1440 48"
          className="relative z-10 mt-10 block w-full"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0 24 C 240 0, 480 48, 720 24 S 1200 0, 1440 24 L1440 48 L0 48 Z"
            fill="#fbfbf9"
          />
        </svg>
      </section>

      <section
        id="introduction"
        className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8 sm:py-28"
      >
        <motion.div {...fade}>
          <p className="hand-note mb-4 text-lg">Pick your form model.</p>
          <h2 className="serif text-3xl text-ink sm:text-5xl">
            Coached like the greats shoot
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
            Every cue maps to a real jumper&apos;s checklist — Splash purity, Curry fluidity, or
            Dame logo power — so feedback stays specific, not generic.
          </p>
        </motion.div>
      </section>

      <section id="form" className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="grid gap-5 md:grid-cols-3">
          {FORM_MODELS.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="sketch-card relative p-7"
            >
              <Sparkle className="absolute right-5 top-5" color={item.accent} />
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                {item.shortName}
              </p>
              <h3 className="serif mt-2 text-2xl text-ink">{item.athlete}</h3>
              <p className="mt-1 text-sm font-medium text-ink">{item.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.summary}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="bg-blue text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <motion.div {...fade} className="mx-auto max-w-2xl text-center">
            <h2 className="serif text-3xl sm:text-5xl">Form notes that write themselves</h2>
            <p className="mt-4 text-base text-paper/75 sm:text-lg">
              Hoop, Line & Sinker turns every session into a readable recap — so tomorrow&apos;s warm-up starts
              smarter than today&apos;s.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { k: "Release path", v: "On arc", note: "held for 0.4s" },
              { k: "Guide hand", v: "Quiet", note: "after cue #3" },
              { k: "Base", v: "Square", note: "91 form score" },
            ].map((card) => (
              <div
                key={card.k}
                className="rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm"
              >
                <p className="text-sm text-paper/65">{card.k}</p>
                <p className="serif mt-2 text-3xl">{card.v}</p>
                <p className="mt-2 text-sm text-paper/55">{card.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="principles" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div {...fade}>
            <p className="hand-note mb-3 text-lg">Your shot is YOURS.</p>
            <h2 className="serif text-3xl text-ink sm:text-5xl">
              A principled alternative — by shooters, for shooters
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted sm:text-lg">
              Athletes should own their film and feedback — not feed it into a black box that
              invents form tips from nowhere.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-ink-muted">
              <li className="flex gap-3">
                <span className="mt-1 text-coral">✦</span>
                Feedback grounded in{" "}
                <span className="wavy-underline font-medium text-ink">your</span> reps, not
                generic drills.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-accent">✦</span>
                No generative highlight reels that rewrite what you actually did.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 text-green">✦</span>
                Built with coaches who still rebound in the gym.
              </li>
            </ul>
          </motion.div>

          <motion.div {...fade} className="sketch-card relative overflow-hidden p-8 sm:p-10">
            <HoopSketch />
            <p className="serif relative z-10 mt-8 text-2xl text-ink sm:text-3xl">
              “More than any other single habit, deliberate shooting has transformed athletic
              confidence.”
            </p>
            <p className="relative z-10 mt-4 text-sm text-ink-faint">— Hoop, Line & Sinker notes</p>
          </motion.div>
        </div>
      </section>

      <section id="session" className="border-y border-line bg-paper-soft">
        <div className="mx-auto grid max-w-6xl gap-px bg-line sm:grid-cols-3">
          {[
            {
              title: "Warm-up lane",
              body: "Form shoots up close while Sinker calibrates your baseline.",
            },
            {
              title: "Pressure sets",
              body: "Make-or-move ladders with live cues when your release drifts.",
            },
            {
              title: "Session recap",
              body: "A short film of best and worst reps, plus tomorrow's focus.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-paper-soft px-7 py-10">
              <h3 className="serif text-2xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hero-dark relative overflow-hidden text-paper">
        <FloatingGlyphs />
        <div className="relative z-10 mx-auto max-w-3xl px-5 py-24 text-center sm:px-8 sm:py-32">
          <motion.div {...fade}>
            <h2 className="serif text-3xl sm:text-5xl">
              Get started — shoot away
              <span className="cursor-blink" aria-hidden />
            </h2>
            <p className="mx-auto mt-5 max-w-md text-paper/60">
              Open the court camera, take ten shots, and get your first form read in under a
              minute.
            </p>
            <Link href="/train" className="pill pill-light mt-8">
              Test it out
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-line bg-paper px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="serif text-xl">hoop line &amp; sinker</p>
          <p className="text-sm text-ink-faint">
            AI-assisted shooting training. Design inspired by{" "}
            <a
              href="https://ellipsus.com/#introduction"
              className="underline underline-offset-2"
            >
              Ellipsus
            </a>
            .
          </p>
        </div>
      </footer>
    </div>
  );
}

function Sparkle({ className, color }: { className?: string; color: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M9 1 l1.5 5.5 L16 8 l-5.5 1.5 L9 15 l-1.5 -5.5 L2 8 l5.5 -1.5 Z"
        fill={color}
      />
    </svg>
  );
}

function HoopSketch() {
  return (
    <svg viewBox="0 0 320 160" className="w-full opacity-80" aria-hidden>
      <path
        d="M40 120 C 80 40, 240 40, 280 120"
        fill="none"
        stroke="#0C0C0D"
        strokeWidth="1.5"
        strokeDasharray="4 6"
      />
      <ellipse
        cx="160"
        cy="48"
        rx="36"
        ry="14"
        fill="none"
        stroke="#0C0C0D"
        strokeWidth="2"
      />
      <path d="M160 62 v40" stroke="#0C0C0D" strokeWidth="1.5" />
      <path d="M120 130 h80" stroke="#0C0C0D" strokeWidth="1.5" />
      <path
        d="M70 30 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 z"
        fill="#FE6862"
      />
      <path d="M250 70 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1 z" fill="#DC78FF" />
      <path
        d="M200 110 l1.2 3.5 3.5 1.2 -3.5 1.2 -1.2 3.5 -1.2 -3.5 -3.5 -1.2 3.5 -1.2 z"
        fill="#56C87C"
      />
    </svg>
  );
}

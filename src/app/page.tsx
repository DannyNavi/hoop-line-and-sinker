"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Nav } from "@/components/Nav";
import { HeroVisual } from "@/components/HeroVisual";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.35 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      <section className="hero-atmosphere relative min-h-[100svh]">
        <div className="noise" />
        <Nav />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col px-5 pb-8 pt-6 text-center sm:px-8 sm:pt-10">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="display mx-auto mb-5 text-5xl font-extrabold tracking-[-0.06em] text-ink sm:text-6xl md:text-7xl"
          >
            Arc
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="display mx-auto max-w-3xl text-3xl font-bold tracking-[-0.045em] text-ink sm:text-4xl md:text-[3.25rem]"
          >
            A shooting coach that
            <br className="hidden sm:block" /> actually sees your form
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            Film your reps. Arc reads release, balance, and follow-through — then coaches the
            next set in plain language.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href="/train"
              className="rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Start a session
            </Link>
            <a
              href="#coach"
              className="rounded-full border border-line bg-white/50 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-white"
            >
              See how it coaches
            </a>
          </motion.div>
        </div>

        <HeroVisual />
      </section>

      <section id="coach" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
            An AI that knows your shot.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Not generic tips. Arc remembers your tendencies across sessions and tightens the
            cue that actually moves your make percentage.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            {
              name: "Riley",
              role: "Form",
              note: "Flagged early dip on your free throws and queued a one-motion drill.",
            },
            {
              name: "Kai",
              role: "Rhythm",
              note: "Matched your catch-to-release timing against last week’s best set.",
            },
            {
              name: "Nova",
              role: "Range",
              note: "Moved you back two feet after five clean makes from the nail.",
            },
          ].map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="rounded-[24px] border border-line bg-bg-elevated p-6"
            >
              <div className="mb-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
                  {agent.name[0]}
                </div>
                <div>
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-sm text-ink-faint">{agent.role}</p>
                </div>
              </div>
              <p className="text-[15px] leading-relaxed text-ink-muted">{agent.note}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="form" className="relative overflow-hidden border-y border-line bg-bg-elevated">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 60% at 85% 40%, var(--court-glow), transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:py-32">
          <motion.div {...fadeUp}>
            <h2 className="display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
              See the shot as a system.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted sm:text-lg">
              Pose landmarks, release arc, and foot plant — laid out so you can feel the fix
              before you take the next rep.
            </p>
          </motion.div>

          <motion.div
            {...fadeUp}
            className="soft-panel relative overflow-hidden rounded-[28px] p-6 sm:p-8"
          >
            <div className="mb-6 flex items-center justify-between text-sm">
              <span className="font-semibold">Release breakdown</span>
              <span className="text-ink-faint">Rep 14 · right wing</span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Base & balance", value: 91 },
                { label: "Gather to set", value: 84 },
                { label: "Release path", value: 88 },
                { label: "Follow-through", value: 76 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-ink-muted">{row.label}</span>
                    <span className="font-semibold">{row.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-bg-soft">
                    <motion.div
                      className="h-full rounded-full bg-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="session" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <h2 className="display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
            Train like the gym is listening.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted sm:text-lg">
            Guided sessions adapt mid-set. Miss three in a row with the same flaw — Arc
            shortens the cue and changes the drill.
          </p>
        </motion.div>

        <motion.div
          {...fadeUp}
          className="mx-auto mt-14 grid max-w-4xl gap-px overflow-hidden rounded-[28px] border border-line bg-line sm:grid-cols-3"
        >
          {[
            {
              title: "Warm-up lane",
              body: "Form shoots at close range while Arc calibrates your baseline.",
            },
            {
              title: "Pressure sets",
              body: "Make-or-move ladders with live cues when your release drifts.",
            },
            {
              title: "Session recap",
              body: "A short film of your best and worst reps, plus tomorrow’s focus.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-bg-elevated p-7">
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.body}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <section className="border-t border-line">
        <div className="hero-atmosphere relative mx-auto max-w-6xl overflow-hidden px-5 py-24 text-center sm:px-8 sm:py-28">
          <div className="noise" />
          <motion.div {...fadeUp} className="relative">
            <h2 className="display text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
              Ready when you are.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-ink-muted">
              Open the court camera, take ten shots, and get your first form read in under a
              minute.
            </p>
            <Link
              href="/train"
              className="mt-8 inline-flex rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              Start free
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-line px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="display text-lg font-extrabold tracking-[-0.05em]">Arc</p>
          <p className="text-sm text-ink-faint">
            AI-assisted basketball shooting training. Design inspired by Fabric.
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";

export function Nav() {
  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
      <Link href="/" className="display text-[1.35rem] font-extrabold tracking-[-0.05em]">
        Arc
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-ink-muted md:flex">
        <a href="#coach" className="transition-colors hover:text-ink">
          Coach
        </a>
        <a href="#form" className="transition-colors hover:text-ink">
          Form
        </a>
        <a href="#session" className="transition-colors hover:text-ink">
          Sessions
        </a>
      </nav>
      <div className="flex items-center gap-3">
        <Link
          href="/train"
          className="hidden text-sm font-semibold text-ink-muted transition-colors hover:text-ink sm:inline"
        >
          Sign in
        </Link>
        <Link
          href="/train"
          className="rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start free
        </Link>
      </div>
    </header>
  );
}

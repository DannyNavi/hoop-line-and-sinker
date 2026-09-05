import Link from "next/link";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="serif text-[1.05rem] leading-none tracking-[-0.03em] text-ink sm:text-[1.2rem]">
          hoop line &amp; sinker
        </Link>

        <nav className="hidden items-center gap-7 text-[0.92rem] font-medium text-ink md:flex">
          <a href="#introduction" className="transition-opacity hover:opacity-65">
            Features
          </a>
          <a href="#form" className="transition-opacity hover:opacity-65">
            Form
          </a>
          <a href="#principles" className="transition-opacity hover:opacity-65">
            Principles
          </a>
          <a href="#session" className="transition-opacity hover:opacity-65">
            Sessions
          </a>
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/train"
            className="pill pill-outline hidden px-4 py-2 text-sm sm:inline-flex"
          >
            Log in
          </Link>
          <Link href="/train" className="pill pill-dark px-4 py-2 text-sm">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}

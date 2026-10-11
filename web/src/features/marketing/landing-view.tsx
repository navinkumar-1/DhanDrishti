import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

export function LandingView() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-[20px] font-bold">
          <LogoMark />
          DhanDrishti
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/trust" className="text-[14px] font-semibold text-text-secondary">
            How we handle data
          </Link>
          <Link href="/login" className="text-[14px] font-semibold text-primary">
            Log in
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-16">
        <section className="py-12">
          <p className="text-[13px] font-semibold text-primary">धनदृष्टि</p>
          <h1 className="mt-2 max-w-xl text-[40px] leading-[46px] font-bold tracking-tight">One clear view of everything you own</h1>
          <p className="mt-3 max-w-lg text-[16px] text-text-secondary">Know what you own, where you own it, and what it means.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup" className="inline-flex h-11 items-center rounded-[10px] bg-primary px-4 font-semibold text-white">
              Get started
            </Link>
            <Link href="/login" className="inline-flex h-11 items-center rounded-[10px] border border-border bg-surface px-4 font-semibold">
              Log in
            </Link>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["Several brokers", "Holdings sit in more than one login."],
            ["More than one depository", "The same ISIN can appear in CDSL and NSDL."],
            ["Unfamiliar instruments", "REITs, InvITs and bonds need a plain explanation."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-[14px] border border-border bg-surface p-5">
              <h2 className="font-semibold">{title}</h2>
              <p className="mt-2 text-[14px] text-text-secondary">{body}</p>
            </article>
          ))}
        </section>
        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-[22px] font-bold">How it works</h2>
            <ol className="mt-3 space-y-2 text-[14px]">
              <li>1. Connect, upload, or open the sample.</li>
              <li>2. Combine accounts without counting the same units twice.</li>
              <li>3. Read the source behind every number.</li>
              <li>4. Try an illustrative what-if. It does not place an order.</li>
            </ol>
          </div>
          <div className="rounded-[14px] border border-border bg-surface p-5">
            <p className="text-[13px] text-text-secondary">Same shares, two reports</p>
            <p className="mt-2 text-[15px]">Demat A reports 12. Demat B reports 8. A statement lists 20.</p>
            <p className="mt-3 text-[14px] text-text-secondary">Adding every line would say 40.</p>
            <p className="mt-1 text-[22px] font-bold text-primary">DhanDrishti counts 20.</p>
          </div>
        </section>
        <section className="mt-10 grid gap-3 sm:grid-cols-4">
          {["Read-only", "Consent-based", "Source on every number", "Not investment advice"].map((item) => (
            <Link key={item} href="/trust" className="rounded-[14px] border border-border bg-surface px-4 py-3 text-[14px] font-semibold">
              {item}
            </Link>
          ))}
        </section>
      </main>
      <footer className="border-t border-border py-6 text-center text-[12px] text-text-tertiary">
        DhanDrishti explains investments. It is not investment advice.
      </footer>
    </div>
  );
}

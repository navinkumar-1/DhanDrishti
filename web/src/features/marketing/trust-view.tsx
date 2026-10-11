import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

const sections = [
  {
    title: "What read-only means",
    body: "DhanDrishti does not place orders, move money, or show a buy or sell control. Connecting a broker, in the product design, is a read of holdings only.",
  },
  {
    title: "How consent works",
    body: "A live broker login happens on the broker's page. This app does not ask for your broker password or OTP. In this build, live brokers that need partner access say so, and the demo adapter loads synthetic holdings.",
  },
  {
    title: "What we store",
    body: "The demo keeps a session flag in this browser so the sample portfolio stays loaded. It does not store a CAS password, a full PAN, or a broker access token. Account numbers in the sample are masked.",
  },
  {
    title: "How numbers are produced",
    body: "Totals, shares and scenario results come from the fixture engine. The screen formats them. Explanations sit beside the numbers. The assistant says when a question is not in the imported data.",
  },
  {
    title: "What this product is not",
    body: "It is not investment advice and it is not an approved FIU. Simulations are labeled illustrative. Demo names, ISINs and amounts are synthetic.",
  },
];

export function TrustView() {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <LogoMark />
          DhanDrishti
        </Link>
        <Link href="/start" className="text-[14px] font-semibold text-primary">
          Get started
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-6 pb-16">
        <h1 className="text-[32px] font-bold">How we handle data</h1>
        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[14px] border border-border bg-surface p-5">
              <h2 className="text-[18px] font-semibold">{section.title}</h2>
              <p className="mt-2 text-[14px] leading-6 text-text-secondary">{section.body}</p>
            </article>
          ))}
        </div>
        <table className="mt-6 w-full overflow-hidden rounded-[14px] border border-border bg-surface text-left text-[14px]">
          <thead className="bg-surface-muted text-[13px] text-text-secondary">
            <tr>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Kept?</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Normalized holdings", "Yes, for the session"],
              ["Broker password or OTP", "No"],
              ["CAS PDF password", "No"],
              ["Full PAN", "No"],
              ["Broker access token", "No, not in the browser"],
            ].map(([item, kept]) => (
              <tr key={item} className="border-t border-border">
                <td className="px-4 py-3">{item}</td>
                <td className="px-4 py-3">{kept}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

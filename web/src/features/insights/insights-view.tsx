import Link from "next/link";
import { Card, PageHeader } from "@/components/ui/primitives";

const items = [
  { href: "/concentration", title: "Concentration map", teaser: "42 % in banking" },
  { href: "/connections", title: "Hidden Connections", teaser: "4 holdings, 1 company" },
  { href: "/follow-money", title: "Follow my money", teaser: "From account to issuer to cash flow" },
  { href: "/risk", title: "Risk insights", teaser: "7 observations, one stress test" },
  { href: "/cashflow", title: "Cash-flow calendar", teaser: "Scheduled, announced, estimated, received" },
];

export function InsightsView() {
  return (
    <div>
      <PageHeader title="Insights" subtitle="Descriptions of the imported portfolio. Not a judgement." />
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-[14px] border border-border bg-surface p-5">
            <h2 className="text-[18px] font-semibold">{item.title}</h2>
            <p className="mt-1 text-[14px] text-text-secondary">{item.teaser}</p>
          </Link>
        ))}
      </div>
      <Card className="mt-4 text-[12px] text-text-tertiary">Educational, not investment advice.</Card>
    </div>
  );
}

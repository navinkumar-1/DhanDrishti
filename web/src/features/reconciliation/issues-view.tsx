"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/data/badges";
import { Card, PageHeader } from "@/components/ui/primitives";
import { tx, useI18n } from "@/lib/i18n";
import { useIssues } from "@/lib/query/hooks";
import { useSession } from "@/store/session-store";
import { useUi } from "@/store/ui-store";
import type { IssueType } from "@/types/domain";

const tabs: Array<{ id: "all" | IssueType; label: string }> = [
  { id: "all", label: "All" },
  { id: "mismatch", label: "Needs review" },
  { id: "pending_settlement", label: "Pending settlement" },
  { id: "unrecognized", label: "Unrecognized" },
  { id: "missing_price", label: "Missing price" },
];

export function IssuesView() {
  const { t, language } = useI18n();
  const issues = useIssues();
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("all");
  const openEvidence = useUi((state) => state.openEvidence);
  const reviewed = useSession((state) => state.reviewedIssueIds);
  const markReviewed = useSession((state) => state.markReviewed);

  if (!issues.data) return <div className="skeleton h-64 rounded-[14px]" />;
  const rows = issues.data.filter((issue) => (tab === "all" ? true : issue.type === tab || (tab === "mismatch" && issue.type === "mismatch")));

  return (
    <div>
      <PageHeader title={t("issues.title")} subtitle="Two reports of one holding are not two holdings." />
      <div className="mb-4 flex gap-2 overflow-x-auto border-b border-border">
        {tabs.map((item) => (
          <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`h-10 shrink-0 px-3 text-[14px] ${tab === item.id ? "border-b-2 border-primary font-semibold text-primary" : "text-text-secondary"}`}>
            {item.label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? <p className="rounded-[14px] border border-border bg-surface p-8 text-center">{t("issues.empty")}</p> : null}
      <div className="space-y-3">
        {rows.map((issue) => (
          <Card key={issue.id}>
            <button type="button" className="flex w-full items-start justify-between gap-3 text-left" onClick={() => issue.isin && openEvidence(issue.isin)}>
              <span>
                <span className="block font-semibold">{issue.name}</span>
                <span className="text-[13px] text-text-secondary">{issue.sourcesLine}</span>
                <span className="mt-1 block text-[14px]">{tx(language, issue.explanation)}</span>
              </span>
              {issue.status ? <StatusBadge status={issue.status} /> : null}
            </button>
            {issue.id === "issue-coastal" ? (
              <button type="button" className="mt-3 text-[14px] font-semibold text-primary" onClick={() => markReviewed(issue.id)}>
                {reviewed.includes(issue.id) ? t("issues.recorded") : t("issues.checked")}
              </button>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}

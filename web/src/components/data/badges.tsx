import { AlertCircle, CheckCircle2, CircleDot, Clock, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AssetClass, ReconStatus } from "@/types/domain";

const statusStyle: Record<ReconStatus, string> = {
  matched: "bg-positive-bg text-positive",
  single_source: "bg-single-bg text-single",
  pending_settlement: "bg-warning-bg text-warning",
  needs_review: "bg-danger-bg text-danger",
};

const statusIcon = {
  matched: CheckCircle2,
  single_source: CircleDot,
  pending_settlement: Clock,
  needs_review: AlertCircle,
};

export function StatusBadge({ status }: { status: ReconStatus }) {
  const { t } = useI18n();
  const Icon = statusIcon[status];
  const label =
    status === "matched"
      ? t("matched")
      : status === "single_source"
        ? t("singleSource")
        : status === "pending_settlement"
          ? t("pending")
          : t("needsReview");
  return (
    <span className={cn("inline-flex h-[26px] items-center gap-1 rounded-full px-2.5 text-[12px] font-semibold", statusStyle[status])}>
      <Icon size={14} aria-hidden />
      {label}
    </span>
  );
}

const assetStyle: Record<AssetClass, string> = {
  equity: "bg-[#F2683C]/10 text-[#F2683C]",
  etf: "bg-[#00A3C4]/10 text-[#00A3C4]",
  mutual_fund: "bg-[#7C5CFA]/10 text-[#7C5CFA]",
  reit: "bg-[#F59E0B]/10 text-[#B7791F]",
  invit: "bg-[#12B76A]/10 text-[#0E9F6E]",
  bond: "bg-[#EF6C8A]/10 text-[#EF6C8A]",
  unknown: "bg-[#9CA3AF]/15 text-text-secondary",
};

export function AssetClassChip({ assetClass }: { assetClass: AssetClass }) {
  const { t } = useI18n();
  return (
    <span className={cn("inline-flex h-[26px] items-center rounded-full px-2.5 text-[12px] font-semibold", assetStyle[assetClass])}>
      {t(`asset.${assetClass}`)}
    </span>
  );
}

export function ShareChip({ share }: { share: number }) {
  const { t } = useI18n();
  return (
    <span className="inline-flex h-[26px] items-center rounded-full bg-surface-muted px-2.5 text-[12px] text-text-secondary">
      {share.toFixed(1)} % {t("ofTotal")}
    </span>
  );
}

export function IllustrativeBadge() {
  const { t } = useI18n();
  return (
    <span className="inline-flex h-[26px] items-center gap-1 rounded-full bg-illustrative-bg px-2.5 text-[12px] font-semibold text-illustrative">
      <Sparkles size={14} aria-hidden />
      {t("illustrative")}
    </span>
  );
}

export function TrustChip({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[26px] items-center gap-1.5 rounded-full bg-primary-tint px-2.5 text-[12px] font-medium text-primary"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-positive" />
      {label}
    </button>
  );
}

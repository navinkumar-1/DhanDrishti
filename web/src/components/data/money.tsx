"use client";

import { Eye, EyeOff } from "lucide-react";
import { formatInr } from "@/lib/format";
import { useUi, type SourceDrawerModel } from "@/store/ui-store";
import { cn } from "@/lib/utils";

export function MoneyText({
  amount,
  className,
  source,
  compact = false,
}: {
  amount?: number;
  className?: string;
  source?: SourceDrawerModel;
  compact?: boolean;
}) {
  const privacy = useUi((state) => state.privacy);
  const openSource = useUi((state) => state.openSource);
  const text = amount === undefined ? "—" : privacy ? "••••••" : compact ? formatInr(amount) : formatInr(amount);

  if (!source) {
    return <span className={className}>{text}</span>;
  }

  return (
    <button type="button" onClick={() => openSource(source)} className={cn("rounded-md text-left hover:text-primary", className)}>
      {text}
    </button>
  );
}

export function PrivacyToggle() {
  const privacy = useUi((state) => state.privacy);
  const toggle = useUi((state) => state.togglePrivacy);
  const Icon = privacy ? EyeOff : Eye;
  return (
    <button type="button" onClick={toggle} aria-label={privacy ? "Show amounts" : "Hide amounts"} className="text-text-secondary">
      <Icon size={22} />
    </button>
  );
}

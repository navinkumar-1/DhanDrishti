"use client";

import { useSearchParams } from "next/navigation";
import { LabHome, LabWorkspace } from "@/features/lab/lab-view";

export function LabRoute() {
  const params = useSearchParams();
  const mode = params.get("mode");
  if (mode === "portfolio" || mode === "virtual") {
    return <LabWorkspace mode={mode} initialAmount={Number(params.get("amount") ?? 10000)} />;
  }
  return <LabHome />;
}

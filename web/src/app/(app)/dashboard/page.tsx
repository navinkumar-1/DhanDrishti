import { Suspense } from "react";
import { DashboardGate } from "@/features/dashboard/dashboard-gate";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-[14px]" />}>
      <DashboardGate />
    </Suspense>
  );
}

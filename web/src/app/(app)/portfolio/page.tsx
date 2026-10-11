import { Suspense } from "react";
import { HoldingsView } from "@/features/portfolio/holdings-view";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-[14px]" />}>
      <HoldingsView />
    </Suspense>
  );
}

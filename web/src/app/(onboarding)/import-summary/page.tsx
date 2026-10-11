import { Suspense } from "react";
import { ImportSummaryView } from "@/features/onboarding/import-views";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-16 h-64 max-w-4xl rounded-[14px]" />}>
      <ImportSummaryView />
    </Suspense>
  );
}

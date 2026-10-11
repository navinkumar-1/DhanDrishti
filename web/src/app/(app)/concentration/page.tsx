import { Suspense } from "react";
import { ConcentrationView } from "@/features/concentration/concentration-view";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-[14px]" />}>
      <ConcentrationView />
    </Suspense>
  );
}

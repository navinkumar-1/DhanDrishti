import { Suspense } from "react";
import { LabRoute } from "@/features/lab/lab-route";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-[14px]" />}>
      <LabRoute />
    </Suspense>
  );
}

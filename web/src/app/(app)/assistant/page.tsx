import { Suspense } from "react";
import { AssistantView } from "@/features/assistant/assistant-view";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-[14px]" />}>
      <AssistantView />
    </Suspense>
  );
}

import { Suspense } from "react";
import { CallbackView } from "@/features/onboarding/import-views";

export default async function Page({ params }: { params: Promise<{ broker: string }> }) {
  const { broker } = await params;
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-16 h-64 max-w-[480px] rounded-[14px]" />}>
      <CallbackView broker={broker} />
    </Suspense>
  );
}

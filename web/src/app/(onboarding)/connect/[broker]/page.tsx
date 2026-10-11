import { Suspense } from "react";
import { BrokerConsent } from "@/features/brokers/broker-screens";

export default async function Page({ params }: { params: Promise<{ broker: string }> }) {
  const { broker } = await params;
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-16 h-64 max-w-[480px] rounded-[14px]" />}>
      <BrokerConsent broker={broker} />
    </Suspense>
  );
}

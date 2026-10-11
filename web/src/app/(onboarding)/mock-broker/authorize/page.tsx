"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { OnboardingFrame } from "@/features/onboarding/start-view";
import { Card, PrimaryButton, SecondaryButton } from "@/components/ui/primitives";

function MockAuthorize() {
  const params = useSearchParams();
  const state = params.get("state") ?? "";
  const redirectUri = params.get("redirect_uri") ?? "";
  const [error, setError] = useState("");

  function go(approved: boolean) {
    let target: URL;
    try {
      target = new URL(redirectUri);
    } catch {
      setError("This demo redirect is not valid.");
      return;
    }
    if (target.origin !== window.location.origin || target.pathname !== "/api/connect/mock_b/callback") {
      setError("This demo redirect is not valid.");
      return;
    }
    target.searchParams.set("state", state);
    if (approved) target.searchParams.set("code", "mock_code");
    else target.searchParams.set("error", "access_denied");
    window.location.assign(target.toString());
  }

  return (
    <OnboardingFrame>
      <Card>
        <p className="inline-flex rounded-full bg-illustrative-bg px-2.5 py-1 text-[12px] font-semibold text-illustrative">Demo</p>
        <h1 className="mt-3 text-[28px] font-bold">Demo Broker B</h1>
        <p className="mt-2 text-[14px] text-text-secondary">This is not a real broker. Approving shares a synthetic holdings file. No password is asked or stored.</p>
        {error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
        <div className="mt-5 flex flex-col gap-2">
          <PrimaryButton onClick={() => go(true)}>Approve (demo)</PrimaryButton>
          <SecondaryButton onClick={() => go(false)}>Deny</SecondaryButton>
        </div>
      </Card>
    </OnboardingFrame>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-16 h-64 max-w-[480px] rounded-[14px]" />}>
      <MockAuthorize />
    </Suspense>
  );
}

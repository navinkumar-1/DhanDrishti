import { Suspense } from "react";
import { AuthScreen } from "@/features/auth/auth-screen";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-16 h-96 max-w-[480px] rounded-[14px]" />}>
      <AuthScreen mode="signup" />
    </Suspense>
  );
}

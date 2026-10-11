import { Suspense } from "react";
import { AccountsView } from "@/features/accounts/accounts-view";

export default function Page() {
  return (
    <Suspense fallback={<div className="skeleton h-64 rounded-[14px]" />}>
      <AccountsView />
    </Suspense>
  );
}

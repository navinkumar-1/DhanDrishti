"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="max-w-md rounded-[14px] border border-border bg-surface p-6 text-center">
        <h1 className="text-[22px] font-bold">Something went wrong</h1>
        <p className="mt-2 text-[14px] text-text-secondary">The page could not be shown. Your imported session is unchanged.</p>
        <button type="button" onClick={reset} className="mt-4 h-11 rounded-[10px] bg-primary px-4 font-semibold text-white">
          Try again
        </button>
      </div>
    </div>
  );
}

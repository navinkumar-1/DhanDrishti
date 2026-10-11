import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-6">
      <div className="text-center">
        <h1 className="text-[28px] font-bold">Page not found</h1>
        <p className="mt-2 text-[14px] text-text-secondary">That route is not part of DhanDrishti.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/" className="font-semibold text-primary">
            Home
          </Link>
          <Link href="/dashboard" className="font-semibold text-primary">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

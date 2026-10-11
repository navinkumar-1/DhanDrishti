"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { PrimaryButton } from "@/components/ui/primitives";
import { authErrorMessage, completePasswordReset, lookupPasswordReset, sendPasswordReset } from "@/lib/firebase/auth";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function ResetPasswordScreen() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const code = params.get("oobCode");
  const mode = params.get("mode");
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const unsupported = mode === "recoverEmail" || mode === "verifyEmail";

  const [email, setEmail] = useState("");
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [linkState, setLinkState] = useState<"idle" | "checking" | "ready" | "invalid">(
    code && !unsupported ? "checking" : "idle",
  );

  useEffect(() => {
    if (!code || unsupported) return;
    let cancelled = false;
    lookupPasswordReset(code)
      .then((found) => {
        if (cancelled) return;
        setAccountEmail(found);
        setLinkState("ready");
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(authErrorMessage(caught));
        setLinkState("invalid");
      });
    return () => {
      cancelled = true;
    };
  }, [code, unsupported]);

  async function onRequest(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await sendPasswordReset(email);
      setSentTo(email.trim());
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setPending(false);
    }
  }

  async function onChoose(event: FormEvent) {
    event.preventDefault();
    if (!code) return;
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await completePasswordReset(code, password);
      setDone(true);
    } catch (caught) {
      setError(authErrorMessage(caught));
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-[480px]">
        <Link href="/" className="mb-6 flex items-center gap-2 font-bold">
          <LogoMark />
          DhanDrishti
        </Link>
        <div className="rounded-[14px] border border-border bg-surface p-6">
          {unsupported ? (
            <>
              <h1 className="text-[28px] leading-9 font-bold">Reset password</h1>
              <p className="mt-2 text-[14px] text-text-secondary">This link is not a password reset.</p>
              <PrimaryButton href="/reset-password" className="mt-5 w-full">
                Request a reset link
              </PrimaryButton>
            </>
          ) : linkState === "checking" ? (
            <>
              <h1 className="text-[28px] leading-9 font-bold">Reset password</h1>
              <p className="mt-2 text-[14px] text-text-secondary">Checking this reset link…</p>
            </>
          ) : done ? (
            <>
              <h1 className="text-[28px] leading-9 font-bold">Password updated</h1>
              <p className="mt-2 text-[14px] text-text-secondary">You can log in with the new password.</p>
              <PrimaryButton href={loginHref} className="mt-5 w-full">
                Log in
              </PrimaryButton>
            </>
          ) : linkState === "ready" && code ? (
            <form onSubmit={onChoose}>
              <h1 className="text-[28px] leading-9 font-bold">Choose a new password</h1>
              <p className="mt-2 text-[14px] text-text-secondary">
                {accountEmail ? <>For {accountEmail}. </> : null}
                Use at least 8 characters.
              </p>
              <div className="mt-5 space-y-3">
                <Field label="New password" value={password} onChange={setPassword} autoComplete="new-password" />
                <Field label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
              </div>
              {error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
              <PrimaryButton type="submit" className="mt-5 w-full" disabled={pending}>
                {pending ? "Please wait…" : "Update password"}
              </PrimaryButton>
            </form>
          ) : sentTo ? (
            <>
              <h1 className="text-[28px] leading-9 font-bold">Check your email</h1>
              <p className="mt-2 text-[14px] text-text-secondary">
                {`If an account exists for ${sentTo}, we sent a link to choose a new password. The link expires after a short time.`}
              </p>
              <PrimaryButton href={loginHref} className="mt-5 w-full">
                Back to log in
              </PrimaryButton>
              <p className="mt-4 text-center text-[14px]">
                <button type="button" className="font-semibold text-primary" onClick={() => setSentTo(null)}>
                  Use a different email
                </button>
              </p>
            </>
          ) : (
            <form onSubmit={onRequest}>
              <h1 className="text-[28px] leading-9 font-bold">Reset password</h1>
              <p className="mt-2 text-[14px] text-text-secondary">
                Enter the email on your account. We will send a link to choose a new password.
              </p>
              {linkState === "invalid" && error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
              <div className="mt-5">
                <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
              </div>
              {linkState !== "invalid" && error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
              <PrimaryButton type="submit" className="mt-5 w-full" disabled={pending}>
                {pending ? "Please wait…" : "Send reset link"}
              </PrimaryButton>
              <p className="mt-4 text-center text-[14px] text-text-secondary">
                <Link href={loginHref} className="font-semibold text-primary">
                  Back to log in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "password",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete: string;
}) {
  return (
    <label className="block text-[13px] text-text-secondary">
      {label}
      <input
        required
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-[12px] bg-surface-muted px-3 text-[15px] text-text-primary outline-none"
      />
    </label>
  );
}

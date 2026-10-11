"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { PrimaryButton, SecondaryButton } from "@/components/ui/primitives";
import { authErrorMessage, signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";
import { useAuth } from "@/providers/auth-provider";
import { useSession } from "@/store/session-store";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { user, ready } = useAuth();
  const hasData = useSession((state) => state.hasData);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const next = safeNext(params.get("next"));

  useEffect(() => {
    if (ready && user) {
      router.replace(next ?? (mode === "login" ? "/dashboard" : hasData ? "/dashboard" : "/start"));
    }
  }, [hasData, mode, next, ready, router, user]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (mode === "signup") {
      if (name.trim().length < 2) {
        setError("Enter the name you want shown in the app.");
        return;
      }
      if (password.length < 8) {
        setError("Use at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    setPending(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail({ name, email, password });
        router.replace(next ?? "/start");
      } else {
        await signInWithEmail(email, password);
        router.replace(next ?? "/dashboard");
      }
    } catch (caught) {
      setError(authErrorMessage(caught));
      setPending(false);
    }
  }

  const title = mode === "signup" ? "Create your account" : "Log in";

  function fillDemoCredentials() {
    setEmail("pushkarshinde141@gmail.com");
    setPassword("Pushk@r141");
    setError(null);
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-[480px]">
        <Link href="/" className="mb-6 flex items-center gap-2 font-bold">
          <LogoMark />
          DhanDrishti
        </Link>
        <form onSubmit={onSubmit} className="rounded-[14px] border border-border bg-surface p-6">
          <h1 className="text-[28px] leading-9 font-bold">{title}</h1>
          <p className="mt-2 text-[14px] text-text-secondary">Email and password. This does not connect a broker.</p>
          {mode === "login" ? (
            <SecondaryButton type="button" className="mt-4 w-full" onClick={fillDemoCredentials}>
              Demo Credentials
            </SecondaryButton>
          ) : null}
          <div className="mt-5 space-y-3">
            {mode === "signup" ? (
              <Field label="Name" value={name} onChange={setName} autoComplete="name" />
            ) : null}
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            {mode === "signup" ? (
              <Field label="Confirm password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
            ) : (
              <p className="text-right text-[13px]">
                <Link href={next ? `/reset-password?next=${encodeURIComponent(next)}` : "/reset-password"} className="font-semibold text-primary">
                  Forgot password?
                </Link>
              </p>
            )}
          </div>
          {error ? <p className="mt-3 text-[14px] text-danger">{error}</p> : null}
          <PrimaryButton type="submit" className="mt-5 w-full" disabled={pending}>
            {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Log in"}
          </PrimaryButton>
          <p className="mt-4 text-center text-[14px] text-text-secondary">
            {mode === "signup" ? (
              <>
                Already have an account?{" "}
                <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-primary">
                  Log in
                </Link>
              </>
            ) : (
              <>
                New here?{" "}
                <Link href={next ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} className="font-semibold text-primary">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
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

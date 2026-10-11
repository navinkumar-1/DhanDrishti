"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, PageHeader, PrimaryButton, SecondaryButton } from "@/components/ui/primitives";
import { deleteImportedPortfolio } from "@/lib/firebase/live-portfolio";
import { signOutUser } from "@/lib/firebase/auth";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useSession } from "@/store/session-store";
import { useUi } from "@/store/ui-store";

export function SettingsView() {
  const { t, language, setLanguage } = useI18n();
  const privacy = useUi((state) => state.privacy);
  const togglePrivacy = useUi((state) => state.togglePrivacy);
  const { user } = useAuth();
  const clear = useSession((state) => state.clear);
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function clearImportedData() {
    const uid = user?.uid ?? null;
    if (uid) await deleteImportedPortfolio(uid);
    clear();
    if (uid) useSession.getState().bindOwner(uid);
  }

  return (
    <div>
      <PageHeader title={t("nav.settings")} subtitle={user?.email ?? undefined} />
      <div className="space-y-3">
        <Link href="/accounts" className="block rounded-[14px] border border-border bg-surface px-4 py-4 font-semibold">Accounts and coverage</Link>
        <Card id="language">
          <h2 className="font-semibold">Language</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => setLanguage("en")} className={`rounded-[14px] border p-4 text-left ${language === "en" ? "border-primary bg-primary-tint" : "border-border"}`}>
              <span className="block font-semibold">English</span>
              <span className="text-[13px] text-text-secondary">Welcome to DhanDrishti</span>
            </button>
            <button type="button" onClick={() => setLanguage("hi")} className={`rounded-[14px] border p-4 text-left ${language === "hi" ? "border-primary bg-primary-tint" : "border-border"}`}>
              <span className="block font-semibold">हिंदी</span>
              <span className="text-[13px] text-text-secondary">धनदृष्टि में आपका स्वागत है</span>
            </button>
          </div>
          <p className="mt-2 text-[12px] text-text-tertiary">More languages will be added as reviewed content becomes available. Hindi on this build still needs a fluent-speaker review.</p>
        </Card>
        <Card id="privacy">
          <h2 className="font-semibold">Privacy and data</h2>
          <p className="mt-2 text-[14px]">Normalized holdings only. No passwords, no full PAN, no CAS passwords.</p>
          <label className="mt-3 flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={privacy} onChange={togglePrivacy} />
            Privacy mode hides amounts
          </label>
          <p className="mt-3 text-[13px] text-text-secondary">Consent for this demo is the choice to load sample, upload, or connect.</p>
          {!confirmDelete ? (
            <button type="button" className="mt-3 text-[14px] font-semibold text-danger" onClick={() => setConfirmDelete(true)}>
              Delete imported data
            </button>
          ) : (
            <div className="mt-3 rounded-[12px] bg-danger-bg p-3 text-[14px] text-danger">
              This deletes the imported holdings stored for your account.
              <div className="mt-2 flex gap-2">
                <PrimaryButton
                  disabled={deleting}
                  onClick={() => {
                    setDeleting(true);
                    void clearImportedData().then(() => router.push("/start"));
                  }}
                >
                  {deleting ? "Deleting…" : "Delete"}
                </PrimaryButton>
                <SecondaryButton onClick={() => setConfirmDelete(false)}>Cancel</SecondaryButton>
              </div>
            </div>
          )}
        </Card>
        <Card id="about">
          <h2 className="font-semibold">About and disclaimers</h2>
          <p className="mt-2 text-[14px] leading-6">{t("disclaimerLong")}</p>
          <p className="mt-2 text-[13px] text-text-secondary">Portfolio figures come from connected brokers. Version 0.1.0</p>
          <Link href="/trust" className="mt-2 inline-block font-semibold text-primary">How we handle data</Link>
        </Card>
        <Card>
          <h2 className="font-semibold">Imported data</h2>
          <p className="mt-1 text-[13px] text-text-secondary">Holdings are saved to your account after a broker sync.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <SecondaryButton
              onClick={() => {
                void clearImportedData().then(() => router.push("/start"));
              }}
            >
              Reset all data
            </SecondaryButton>
            <SecondaryButton
              onClick={() => {
                clear();
                void signOutUser().then(() => router.push("/login"));
              }}
            >
              Log out
            </SecondaryButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

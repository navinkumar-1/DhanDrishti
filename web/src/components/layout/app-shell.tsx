"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  CalendarDays,
  Download,
  FlaskConical,
  GraduationCap,
  Info,
  Landmark,
  LayoutDashboard,
  MessageCircle,
  Network,
  PieChart,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  Upload,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";
import { LogoMark } from "@/components/brand/logo";
import { DisclaimerFooter, EvidenceDrawer, SourceDrawer } from "@/components/trust/drawers";
import { signOutUser } from "@/lib/firebase/auth";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/providers/auth-provider";
import { useHoldings, useSummary } from "@/lib/query/hooks";
import { cn } from "@/lib/utils";
import { useSession } from "@/store/session-store";

const groups = [
  [
    { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/portfolio", key: "nav.holdings", icon: WalletCards },
    { href: "/accounts", key: "nav.accounts", icon: Landmark },
    { href: "/start", key: "nav.import", icon: Upload },
    { href: "/insights", key: "nav.insights", icon: Sparkles },
  ],
  [
    { href: "/concentration", key: "nav.concentration", icon: PieChart },
    { href: "/connections", key: "nav.connections", icon: Network },
    { href: "/follow-money", key: "nav.follow", icon: Network },
    { href: "/risk", key: "nav.risk", icon: ShieldAlert },
    { href: "/cashflow", key: "nav.cashflow", icon: CalendarDays },
  ],
  [
    { href: "/learn", key: "nav.learn", icon: GraduationCap },
    { href: "/lab", key: "nav.lab", icon: FlaskConical },
    { href: "/assistant", key: "nav.ask", icon: MessageCircle },
  ],
  [
    { href: "/settings", key: "nav.settings", icon: Settings },
    { href: "/trust", key: "nav.about", icon: Info },
  ],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, language, setLanguage } = useI18n();
  const source = useSession((state) => state.source);
  const summary = useSummary();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const openIssues = summary.data?.summary.openIssues ?? 0;
  const displayName = user?.displayName?.trim() || "Investor";
  const email = user?.email ?? "";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="app-shell min-h-screen bg-canvas text-text-primary">
      <aside className="app-sidebar sticky top-0 z-30 h-screen flex-col overflow-hidden border-r border-border bg-surface">
        <Link href="/dashboard" className="flex h-16 shrink-0 items-center gap-2.5 px-4">
          <LogoMark />
          <span className="app-brand-name text-[22px] font-bold">{t("brand")}</span>
        </Link>
        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {groups.map((group, index) => (
            <div key={index} className={cn(index > 0 && "mt-2 border-t border-border pt-2")}>
              {group.map((item) => {
                const active = pathname === item.href || (item.href !== "/trust" && pathname.startsWith(item.href) && item.href !== "/start");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative mb-1 flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] text-text-secondary",
                      active && "font-medium text-primary",
                    )}
                  >
                    {active ? <span className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-primary" /> : null}
                    <Icon size={20} />
                    <span className="app-nav-label">{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="app-promo shrink-0 p-3">
          {source === "sample" ? (
            <p className="mb-2 inline-flex rounded-full bg-illustrative-bg px-2.5 py-1 text-[12px] font-semibold text-illustrative">
              {t("sampleChip")}
            </p>
          ) : null}
          <div className="rounded-[14px] bg-primary p-4 text-white">
            <p className="text-[16px] font-bold">{t("promo.title")}</p>
            <p className="mt-1 text-[12px] leading-4 text-white/85">{t("promo.subtitle")}</p>
            <Link href="/connections" className="mt-3 flex h-10 items-center justify-center rounded-[10px] bg-white text-[14px] font-semibold text-primary">
              {t("promo.cta")}
            </Link>
          </div>
        </div>
      </aside>

      <div className="app-main min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          <SearchBox />
          <div className="ml-auto flex items-center gap-2">
            <Link href="/portfolio" aria-label={t("exportReport")} className="grid h-10 w-10 place-items-center rounded-full border border-border">
              <Download size={18} />
            </Link>
            <Link href="/reconciliation" aria-label="Issues" className="relative grid h-10 w-10 place-items-center rounded-full border border-border">
              <Bell size={18} />
              {openIssues > 0 ? <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-danger" /> : null}
            </Link>
            <div className="flex h-10 items-center rounded-full border border-border px-1 text-[13px] font-semibold">
              <button type="button" onClick={() => setLanguage("en")} className={cn("rounded-full px-2 py-1", language === "en" && "bg-primary-tint text-primary")}>
                EN
              </button>
              <button type="button" onClick={() => setLanguage("hi")} className={cn("rounded-full px-2 py-1", language === "hi" && "bg-primary-tint text-primary")}>
                हिं
              </button>
            </div>
            <div className="relative">
              <button type="button" onClick={() => setMenuOpen((open) => !open)} className="flex items-center gap-2 rounded-full py-1 pr-2 pl-1">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary-tint text-[13px] font-bold text-primary">{initials || "IN"}</span>
                <span className="hidden text-left sm:block">
                  <span className="block text-[15px] leading-5 font-semibold">{displayName}</span>
                  <span className="block text-[12px] text-text-secondary">{email}</span>
                </span>
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-40 mt-2 w-52 rounded-[14px] border border-border bg-surface p-2 text-[14px]">
                  <Link href="/settings" className="block rounded-lg px-3 py-2 hover:bg-surface-muted" onClick={() => setMenuOpen(false)}>
                    {t("nav.settings")}
                  </Link>
                  <Link href="/settings#privacy" className="block rounded-lg px-3 py-2 hover:bg-surface-muted" onClick={() => setMenuOpen(false)}>
                    Privacy and data
                  </Link>
                  <Link href="/trust" className="block rounded-lg px-3 py-2 hover:bg-surface-muted" onClick={() => setMenuOpen(false)}>
                    {t("nav.about")}
                  </Link>
                  <button
                    type="button"
                    className="block w-full rounded-lg px-3 py-2 text-left text-danger hover:bg-surface-muted"
                    onClick={() => {
                      setMenuOpen(false);
                      useSession.getState().clear();
                      void signOutUser().then(() => router.push("/login"));
                    }}
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="px-4 py-6 pb-24 md:px-6 md:pb-8">{children}</main>
        <DisclaimerFooter />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 grid-cols-5 border-t border-border bg-surface md:hidden">
        {[
          { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
          { href: "/portfolio", label: t("nav.holdings"), icon: WalletCards },
          { href: "/insights", label: t("nav.insights"), icon: Sparkles },
          { href: "/learn", label: t("nav.learn"), icon: GraduationCap },
          { href: "/assistant", label: t("nav.ask"), icon: MessageCircle },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center text-[11px] text-text-secondary", pathname.startsWith(item.href) && "text-primary")}>
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
      <SourceDrawer />
      <EvidenceDrawer />
      <Link
        href="/assistant"
        className="fixed right-5 bottom-20 z-20 grid h-12 w-12 place-items-center rounded-full bg-primary text-white shadow-none md:bottom-6"
        aria-label={t("nav.ask")}
      >
        <MessageCircle size={20} />
      </Link>
    </div>
  );
}

function SearchBox() {
  const { t } = useI18n();
  const router = useRouter();
  const holdings = useHoldings();
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return (holdings.data ?? []).filter((holding) => holding.name.toLowerCase().includes(q) || holding.isin.toLowerCase().includes(q)).slice(0, 6);
  }, [holdings.data, query]);

  return (
    <div className="relative w-full max-w-[280px]">
      <Search size={16} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-tertiary" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("search")}
        className="h-10 w-full rounded-full border border-transparent bg-surface-muted pr-3 pl-9 text-[14px] outline-none placeholder:text-text-tertiary"
      />
      {matches.length > 0 ? (
        <ul className="absolute top-12 z-30 w-[320px] overflow-hidden rounded-[14px] border border-border bg-surface">
          {matches.map((holding) => (
            <li key={holding.isin}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left hover:bg-surface-muted"
                onClick={() => {
                  setQuery("");
                  router.push(`/portfolio/${holding.isin}`);
                }}
              >
                <span className="block text-[14px] font-semibold">{holding.name}</span>
                <span className="text-[12px] text-text-secondary">{holding.isin}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

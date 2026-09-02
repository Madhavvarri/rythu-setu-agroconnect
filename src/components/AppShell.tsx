import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Bell, Home, Leaf, ShieldCheck, ShoppingBasket, User, Users } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", key: "home", Icon: Home },
  { to: "/jobs", key: "jobs", Icon: Users },
  { to: "/market", key: "market", Icon: ShoppingBasket },
  { to: "/organic", key: "organic", Icon: Leaf },
  { to: "/insurance", key: "insurance", Icon: ShieldCheck },
  { to: "/profile", key: "profile", Icon: User },
] as const;

export function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="flex items-center rounded-full border border-border bg-card p-0.5 text-sm font-semibold">
      {(["te", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-3 py-1 transition-colors",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {l === "te" ? "తె" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function AppHeader({ subtitle }: { subtitle?: string | undefined }) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-bold">{t("appName")}</span>
            <span className="block text-xs text-muted-foreground">{subtitle ?? t("tagline")}</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <Link
            to="/profile"
            className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { t } = useI18n();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card">
      <div className="mx-auto grid max-w-3xl grid-cols-6">
        {navItems.map(({ to, key, Icon }) => {
          const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-[0.7rem] font-semibold",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {t(key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppShell({ children, subtitle }: { children: ReactNode; subtitle?: string }) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader subtitle={subtitle} />
      <main className="mx-auto max-w-3xl px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between gap-2">
      <h2 className="font-display text-xl font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center text-muted-foreground">
      {message}
    </div>
  );
}

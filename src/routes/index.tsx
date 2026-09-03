import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Leaf, ShieldCheck, ShoppingBasket, Users } from "lucide-react";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RythuSetu — Labour, Market, Organic & Crop Insurance Support" },
      {
        name: "description",
        content:
          "RythuSetu connects Indian farmers with agricultural labour, a farm produce market, an organic store and crop insurance support. Telugu and English.",
      },
      { property: "og:title", content: "RythuSetu — Connecting Farmers to Everything They Need" },
      {
        property: "og:description",
        content: "Find labour, buy farm produce and organic inputs, and get crop insurance support in Telugu or English.",
      },
    ],
  }),
  component: Index,
});

const services = [
  { to: "/jobs", titleKey: "findLabour", descKey: "findLabourDesc", Icon: Users, tone: "bg-primary/10 text-primary" },
  { to: "/market", titleKey: "farmMarket", descKey: "farmMarketDesc", Icon: ShoppingBasket, tone: "bg-harvest/20 text-soil" },
  { to: "/organic", titleKey: "organicStore", descKey: "organicStoreDesc", Icon: Leaf, tone: "bg-success/15 text-success" },
  { to: "/insurance", titleKey: "cropInsurance", descKey: "cropInsuranceDesc", Icon: ShieldCheck, tone: "bg-sky/20 text-sky-foreground" },
] as const;

function Index() {
  const { t, lang } = useI18n();
  const { profile, userId } = useSession();

  const { data: jobs } = useQuery({
    queryKey: ["home-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labour_jobs")
        .select("id, title, crop, wage, wage_type, village, district, workers_required, work_date")
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: products } = useQuery({
    queryKey: ["home-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, name_te, price, unit, categories(type)")
        .eq("approval_status", "approved")
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
        <p className="font-display text-2xl font-bold">{t("greeting")}</p>
        <p className="mt-1 text-sm opacity-90">{t("tagline")}</p>
        <p className="mt-3 text-sm opacity-90">
          {profile?.village ? `${profile.village}, ${profile.district ?? ""}` : lang === "te" ? "మీ ప్రాంతం ఎంచుకోండి" : "Set your location in Profile"}
        </p>
        {!userId && (
          <Button asChild variant="secondary" size="lg" className="mt-4 w-full">
            <Link to="/auth">{t("signIn")}</Link>
          </Button>
        )}
      </div>

      <SectionTitle>{t("farmingServices")}</SectionTitle>
      <Card className="border-border bg-accent">
        <CardContent className="space-y-3 p-4">
          <p className="font-display text-base font-bold">{t("needServiceForFarm")}</p>
          <div className="grid grid-cols-3 gap-2">
            <Button asChild size="sm" className="h-11">
              <Link to="/services">{t("findService")}</Link>
            </Button>
            <Button asChild size="sm" variant="secondary" className="h-11">
              <Link to="/bookings">{t("myBookings")}</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="h-11">
              <Link to="/services/post-requirement">{t("postRequirement")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <SectionTitle>{lang === "te" ? "సేవలు" : "Services"}</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {services.map(({ to, titleKey, descKey, Icon, tone }) => (
          <Link key={to} to={to}>
            <Card className="h-full border-border shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]">
              <CardContent className="space-y-2 p-4">
                <span className={`flex size-12 items-center justify-center rounded-2xl ${tone}`}>
                  <Icon className="size-6" />
                </span>
                <p className="font-display text-base font-bold leading-tight">{t(titleKey)}</p>
                <p className="text-xs text-muted-foreground">{t(descKey)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <SectionTitle
        action={
          <Link to="/jobs" className="text-sm font-semibold text-primary">
            {lang === "te" ? "అన్నీ" : "See all"}
          </Link>
        }
      >
        {t("nearbyJobs")}
      </SectionTitle>
      {jobs?.length ? (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Card key={j.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-1">
                  <p className="font-semibold leading-tight">{j.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {j.crop} · {j.village}, {j.district} · {j.workers_required} workers
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{Number(j.wage)}</p>
                  <p className="text-[0.65rem] text-muted-foreground">{j.wage_type.replace("_", " ")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={t("noJobs")} />
      )}

      <SectionTitle
        action={
          <Link to="/market" className="text-sm font-semibold text-primary">
            {lang === "te" ? "అన్నీ" : "See all"}
          </Link>
        }
      >
        {t("popularProducts")}
      </SectionTitle>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {(products ?? []).map((p) => (
          <Card key={p.id} className="w-36 shrink-0 border-border">
            <CardContent className="p-3">
              <div className="mb-2 flex h-16 items-center justify-center rounded-xl bg-secondary text-2xl">🥬</div>
              <p className="truncate text-sm font-semibold">{lang === "te" && p.name_te ? p.name_te : p.name}</p>
              <p className="text-sm font-bold text-primary">
                ₹{Number(p.price)} <span className="text-xs font-normal text-muted-foreground">/{p.unit}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionTitle>{t("seasonal")}</SectionTitle>
      <Card className="border-border bg-accent">
        <CardContent className="space-y-2 p-4 text-sm">
          <Badge variant="secondary">{t("demoData")}</Badge>
          <p>
            {lang === "te"
              ? "ఖరీఫ్ సీజన్: విత్తనశుద్ధి చేసి విత్తండి. నీటి లభ్యతను బట్టి పంట ఎంపిక చేసుకోండి."
              : "Kharif season: treat seeds before sowing and choose crops based on expected water availability."}
          </p>
          <p className="text-xs text-muted-foreground">
            {lang === "te"
              ? "సాధారణ సమాచారం మాత్రమే. దిగుబడి హామీ కాదు."
              : "General information only. This is not a yield guarantee."}
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

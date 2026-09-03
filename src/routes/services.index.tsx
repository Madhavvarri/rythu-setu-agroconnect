import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Zap } from "lucide-react";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/services/")({
  head: () => ({
    meta: [
      { title: "Farming Services — Tractor, Drone, Harvesting & More | RythuSetu" },
      {
        name: "description",
        content:
          "Book verified farming service providers for tractor work, sowing, spraying, drone services, harvesting, irrigation, soil testing, equipment rental and farm transport.",
      },
      { property: "og:title", content: "Farming Services on RythuSetu" },
      {
        property: "og:description",
        content: "Find nearby farming service providers, compare prices and book services in Telugu or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesHome,
});

function ServicesHome() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");

  const { data: categories, isLoading } = useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name, name_te, slug, icon, description, description_te")
        .eq("status", "active")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: matches } = useQuery({
    queryKey: ["service-search", q],
    enabled: q.trim().length > 1,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, name_te, slug, pricing_type, service_categories(slug, name, name_te, icon)")
        .eq("status", "active")
        .ilike("name", `%${q.trim()}%`)
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = (categories ?? []).filter((c) =>
    q.trim().length < 2 ? true : `${c.name} ${c.name_te ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()),
  );

  return (
    <AppShell subtitle={t("farmingServices")}>
      <h1 className="font-display text-2xl font-bold">{t("findFarmingServices")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lang === "te"
          ? "ట్రాక్టర్ నుండి డ్రోన్ వరకు — మీ పొలానికి కావలసిన సేవను బుక్ చేసుకోండి."
          : "From tractors to drones — book the service your farm needs."}
      </p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("searchFarmingService")}
          className="h-12 pl-10 text-base"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button asChild size="lg" variant="secondary" className="h-12">
          <Link to="/bookings">{t("myBookings")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link to="/services/post-requirement">{t("postRequirement")}</Link>
        </Button>
      </div>

      <Card className="mt-3 border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Zap className="size-5" />
          </span>
          <div className="flex-1">
            <p className="font-semibold leading-tight">{t("urgentRequirement")}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "te" ? "ఈరోజే అందుబాటులో ఉన్న సేవాదారులు" : "Providers available today"}
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/services/post-requirement" search={{ urgent: true }}>
              {lang === "te" ? "వెతకండి" : "Find"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {q.trim().length > 1 && (matches?.length ?? 0) > 0 && (
        <>
          <SectionTitle>{lang === "te" ? "సేవలు" : "Matching services"}</SectionTitle>
          <div className="space-y-2">
            {matches!.map((s) => {
              const cat = s.service_categories as { slug: string; icon: string } | null;
              return (
                <Link key={s.id} to="/services/$slug" params={{ slug: cat?.slug ?? "" }} search={{ service: s.slug }}>
                  <Card className="border-border">
                    <CardContent className="flex items-center gap-3 p-3">
                      <span className="text-xl">{cat?.icon ?? "🌾"}</span>
                      <span className="font-semibold">{lang === "te" && s.name_te ? s.name_te : s.name}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      )}

      <SectionTitle>{lang === "te" ? "సేవా విభాగాలు" : "Service categories"}</SectionTitle>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : filtered.length ? (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((c) => (
            <Link key={c.id} to="/services/$slug" params={{ slug: c.slug }}>
              <Card className="h-full border-border shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]">
                <CardContent className="space-y-2 p-4">
                  <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-2xl">
                    {c.icon}
                  </span>
                  <p className="font-display text-base font-bold leading-tight">
                    {lang === "te" && c.name_te ? c.name_te : c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lang === "te" && c.description_te ? c.description_te : c.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "సేవలు కనిపించలేదు." : "No services matched your search."} />
      )}

      <SectionTitle>{lang === "te" ? "సేవాదారులు" : "For service providers"}</SectionTitle>
      <Card className="border-border">
        <CardContent className="space-y-3 p-4">
          <Badge variant="secondary">{lang === "te" ? "సేవాదారు" : "Provider"}</Badge>
          <p className="text-sm text-muted-foreground">
            {lang === "te"
              ? "మీ ట్రాక్టర్, డ్రోన్, హార్వెస్టర్ లేదా సేవలను రైతులకు అందించండి."
              : "Offer your tractor, drone, harvester or services to farmers near you."}
          </p>
          <Button asChild className="w-full">
            <Link to="/provider">{t("becomeProvider")}</Link>
          </Button>
        </CardContent>
      </Card>

      <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {t("servicesDisclaimer")}
      </p>
    </AppShell>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, MapPin, Star } from "lucide-react";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { DISTANCE_FILTERS, pick, PRICING_UNITS, recommendationScore, rupees } from "@/lib/farming-services";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

type Search = { service?: string | undefined; sort?: string | undefined };

export const Route = createFileRoute("/services/$slug")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    service: typeof s['service'] === "string" ? s['service'] : undefined,
    sort: typeof s['sort'] === "string" ? s['sort'] : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} services — RythuSetu Farming Services` },
      {
        name: "description",
        content: "Compare nearby farming service providers by price, rating, experience and availability on RythuSetu.",
      },
      { property: "og:title", content: "Farming service providers — RythuSetu" },
      { property: "og:description", content: "Compare and book verified farming service providers near your village." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CategoryPage,
});

const selectCls =
  "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground";

function CategoryPage() {
  const { slug } = Route.useParams();
  const search = Route.useSearch();
  const { t, lang } = useI18n();
  const { profile } = useSession();

  const [serviceSlug, setServiceSlug] = useState(search.service ?? "");
  const [sort, setSort] = useState(search.sort ?? "recommended");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [district, setDistrict] = useState(profile?.district ?? "");
  const [radius, setRadius] = useState("25");

  const { data: category } = useQuery({
    queryKey: ["service-category", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name, name_te, icon, description, description_te")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["category-services", category?.id],
    enabled: !!category?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, name_te, slug, pricing_type")
        .eq("category_id", category!.id)
        .eq("status", "active")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: rows, isLoading } = useQuery({
    queryKey: ["category-providers", category?.id],
    enabled: !!category?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_services")
        .select(
          "id, price, price_per_hour, pricing_unit, minimum_booking, equipment_details, service_id, services!inner(id, name, name_te, slug, category_id), service_providers!inner(id, business_name, experience_years, service_radius_km, state, district, mandal, village, verification_status, rating, rating_count, completed_jobs, response_rate, availability_status, accepts_urgent, status, is_demo)",
        )
        .eq("status", "active")
        .eq("services.category_id", category!.id)
        .eq("service_providers.status", "active");
      if (error) throw error;
      return data ?? [];
    },
  });

  const providers = useMemo(() => {
    const map = new Map<string, { p: any; offerings: any[] }>();
    for (const r of rows ?? []) {
      const p = r.service_providers as any;
      const svc = r.services as any;
      if (serviceSlug && svc?.slug !== serviceSlug) continue;
      if (!map.has(p.id)) map.set(p.id, { p, offerings: [] });
      map.get(p.id)!.offerings.push({ ...r, service: svc });
    }
    let list = [...map.values()].map((entry) => {
      const prices = entry.offerings.map((o) => Number(o.price ?? o.price_per_hour ?? 0)).filter((n) => n > 0);
      const minPrice = prices.length ? Math.min(...prices) : null;
      const score = recommendationScore({
        rating: Number(entry.p.rating),
        ratingCount: entry.p.rating_count,
        experienceYears: Number(entry.p.experience_years),
        completedJobs: entry.p.completed_jobs,
        responseRate: Number(entry.p.response_rate),
        availabilityStatus: entry.p.availability_status,
        sameDistrict: !!district && entry.p.district === district,
        sameMandal: !!profile?.mandal && entry.p.mandal === profile.mandal,
        offersService: true,
      });
      return { ...entry, minPrice, score };
    });

    if (district.trim()) {
      const d = district.trim().toLowerCase();
      list = list.filter(
        (e) =>
          !e.p.district ||
          e.p.district.toLowerCase().includes(d) ||
          Number(e.p.service_radius_km) >= Number(radius),
      );
    }
    if (maxPrice) list = list.filter((e) => e.minPrice === null || e.minPrice <= Number(maxPrice));
    if (Number(minRating) > 0) list = list.filter((e) => Number(e.p.rating) >= Number(minRating));
    if (verifiedOnly) list = list.filter((e) => e.p.verification_status !== "unverified");
    if (availableOnly) list = list.filter((e) => e.p.availability_status === "available");

    list.sort((a, b) => {
      if (sort === "price") return (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity);
      if (sort === "rating") return Number(b.p.rating) - Number(a.p.rating);
      if (sort === "experience") return Number(b.p.experience_years) - Number(a.p.experience_years);
      if (sort === "nearest") return Number(a.p.service_radius_km) - Number(b.p.service_radius_km);
      return b.score - a.score;
    });
    return list;
  }, [rows, serviceSlug, district, radius, maxPrice, minRating, verifiedOnly, availableOnly, sort, profile?.mandal]);

  return (
    <AppShell subtitle={t("farmingServices")}>
      <Link to="/services" className="text-sm font-semibold text-primary">
        ← {t("farmingServices")}
      </Link>
      <h1 className="mt-2 flex items-center gap-2 font-display text-2xl font-bold">
        <span>{category?.icon}</span>
        {category ? (lang === "te" && category.name_te ? category.name_te : category.name) : t("loading")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {category && (lang === "te" && category.description_te ? category.description_te : category.description)}
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        <Button
          size="sm"
          variant={serviceSlug ? "outline" : "default"}
          className="shrink-0 rounded-full"
          onClick={() => setServiceSlug("")}
        >
          {lang === "te" ? "అన్నీ" : "All"}
        </Button>
        {(services ?? []).map((s) => (
          <Button
            key={s.id}
            size="sm"
            variant={serviceSlug === s.slug ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => setServiceSlug(s.slug)}
          >
            {lang === "te" && s.name_te ? s.name_te : s.name}
          </Button>
        ))}
      </div>

      <Card className="mt-3 border-border">
        <CardContent className="grid grid-cols-2 gap-2 p-3">
          <Input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder={lang === "te" ? "జిల్లా / మండలం" : "District / Mandal"}
            className="h-11 text-sm"
          />
          <select className={selectCls} value={radius} onChange={(e) => setRadius(e.target.value)}>
            {DISTANCE_FILTERS.map((d) => (
              <option key={d} value={d}>
                {lang === "te" ? `${d} కి.మీ లోపు` : `Within ${d} km`}
              </option>
            ))}
          </select>
          <Input
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            inputMode="numeric"
            placeholder={lang === "te" ? "గరిష్ఠ ధర ₹" : "Max price ₹"}
            className="h-11 text-sm"
          />
          <select className={selectCls} value={minRating} onChange={(e) => setMinRating(e.target.value)}>
            <option value="0">{lang === "te" ? "ఏ రేటింగ్ అయినా" : "Any rating"}</option>
            <option value="3">3★+</option>
            <option value="4">4★+</option>
          </select>
          <select className={selectCls} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="recommended">{t("recommended")}</option>
            <option value="nearest">{t("nearest")}</option>
            <option value="price">{t("lowestPrice")}</option>
            <option value="rating">{t("highestRated")}</option>
            <option value="experience">{t("mostExperienced")}</option>
          </select>
          <div className="flex items-center gap-2 text-xs font-medium">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} />
              {t("verified")}
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
              {t("availability")}
            </label>
          </div>
        </CardContent>
      </Card>

      <SectionTitle>{t("availableProviders")}</SectionTitle>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : providers.length ? (
        <div className="space-y-3">
          {providers.map(({ p, offerings, minPrice, score }) => (
            <Card key={p.id} className="border-border">
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <p className="flex items-center gap-1 font-display text-lg font-bold leading-tight">
                      {p.business_name}
                      {p.verification_status !== "unverified" && <BadgeCheck className="size-4 text-primary" />}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {[p.village, p.mandal, p.district].filter(Boolean).join(", ") || "—"} ·{" "}
                      {lang === "te" ? `${p.service_radius_km} కి.మీ` : `${p.service_radius_km} km radius`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center justify-end gap-1 text-sm font-bold">
                      <Star className="size-4 fill-harvest text-harvest" />
                      {Number(p.rating).toFixed(1)}
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      {p.completed_jobs} {t("completedServices").toLowerCase()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {p.is_demo && <Badge variant="secondary">{t("demoData")}</Badge>}
                  {p.accepts_urgent && <Badge className="bg-harvest text-soil">{t("urgent")}</Badge>}
                  <Badge variant="outline">
                    {Number(p.experience_years)} {t("years")}
                  </Badge>
                  <Badge variant="outline">{score}% {t("matchScore")}</Badge>
                </div>

                <div className="space-y-1 text-sm">
                  {offerings.slice(0, 3).map((o: any) => (
                    <p key={o.id} className="flex justify-between gap-2">
                      <span className="truncate">{lang === "te" && o.service?.name_te ? o.service.name_te : o.service?.name}</span>
                      <span className="shrink-0 font-semibold text-primary">
                        {o.price ? `${rupees(o.price)} ${pick(PRICING_UNITS, o.pricing_unit, lang)}` : t("quotation")}
                      </span>
                    </p>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button asChild variant="outline" className="h-11">
                    <Link to="/providers/$id" params={{ id: p.id }}>
                      {t("viewProvider")}
                    </Link>
                  </Button>
                  <Button asChild className="h-11">
                    <Link to="/providers/$id" params={{ id: p.id }} hash="request">
                      {t("requestService")}
                    </Link>
                  </Button>
                </div>
                {minPrice !== null && (
                  <p className="text-[0.7rem] text-muted-foreground">
                    {lang === "te" ? "ప్రారంభ ధర" : "From"} {rupees(minPrice)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={t("noProviders")} />
      )}

      <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {t("servicesDisclaimer")}
      </p>
    </AppShell>
  );
}

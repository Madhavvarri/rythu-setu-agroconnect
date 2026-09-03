import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, CalendarDays, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { pick, PRICING_UNITS, rupees, VERIFICATION_LEVELS } from "@/lib/farming-services";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/providers/$id")({
  head: () => ({
    meta: [
      { title: "Service Provider Profile — RythuSetu Farming Services" },
      {
        name: "description",
        content: "View a farming service provider's services, pricing, equipment, service area, availability and farmer reviews.",
      },
      { property: "og:title", content: "Farming service provider — RythuSetu" },
      { property: "og:description", content: "Services, pricing, equipment and reviews for this farming service provider." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProviderProfile,
});

const selectCls = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium";

function ProviderProfile() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { userId, profile } = useSession();
  const navigate = useNavigate();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["provider", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_providers").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: offerings } = useQuery({
    queryKey: ["provider-services", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_services")
        .select("id, price, price_per_hour, pricing_unit, minimum_booking, equipment_details, materials_supplied_by, service_id, services(id, name, name_te, slug)")
        .eq("provider_id", id)
        .eq("status", "active");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: equipment } = useQuery({
    queryKey: ["provider-equipment", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("provider_equipment").select("*").eq("provider_id", id).eq("status", "active");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: locations } = useQuery({
    queryKey: ["provider-locations", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("provider_locations").select("*").eq("provider_id", id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: availability } = useQuery({
    queryKey: ["provider-availability", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_availability")
        .select("id, date, status, start_time, end_time")
        .eq("provider_id", id)
        .gte("date", new Date().toISOString().slice(0, 10))
        .order("date")
        .limit(14);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ["provider-reviews", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_reviews")
        .select("id, rating, comment, created_at")
        .eq("provider_id", id)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [form, setForm] = useState({
    service_id: "",
    crop: "",
    farm_size_acres: "",
    village: profile?.village ?? "",
    mandal: profile?.mandal ?? "",
    district: profile?.district ?? "",
    state: profile?.state ?? "",
    preferred_date: "",
    preferred_time: "",
    duration: "",
    equipment_required: "",
    description: "",
    is_urgent: false,
  });
  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const sendRequest = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("auth");
      const { error } = await supabase.from("service_requests").insert({
        farmer_id: userId,
        provider_id: id,
        service_id: form.service_id || null,
        crop: form.crop || null,
        farm_size_acres: form.farm_size_acres ? Number(form.farm_size_acres) : null,
        state: form.state || null,
        district: form.district || null,
        mandal: form.mandal || null,
        village: form.village || null,
        preferred_date: form.preferred_date || null,
        preferred_time: form.preferred_time || null,
        duration: form.duration || null,
        equipment_required: form.equipment_required || null,
        description: form.description.slice(0, 2000),
        is_urgent: form.is_urgent,
        status: "requested",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "అభ్యర్థన పంపబడింది." : "Service request sent.");
      navigate({ to: "/bookings" });
    },
    onError: (e: Error) => toast.error(e.message === "auth" ? t("signIn") : t("genericError")),
  });

  if (isLoading) {
    return (
      <AppShell subtitle={t("farmingServices")}>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </AppShell>
    );
  }
  if (!provider) {
    return (
      <AppShell subtitle={t("farmingServices")}>
        <EmptyState message={t("noProviders")} />
      </AppShell>
    );
  }

  return (
    <AppShell subtitle={t("farmingServices")}>
      <Link to="/services" className="text-sm font-semibold text-primary">
        ← {t("farmingServices")}
      </Link>

      <Card className="mt-2 border-border">
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl">🚜</span>
            <div className="flex-1">
              <h1 className="flex items-center gap-1 font-display text-xl font-bold leading-tight">
                {provider.business_name}
                {provider.verification_status !== "unverified" && <BadgeCheck className="size-5 text-primary" />}
              </h1>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3" />
                {[provider.village, provider.mandal, provider.district, provider.state].filter(Boolean).join(", ") || "—"}
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1 font-bold">
                  <Star className="size-4 fill-harvest text-harvest" />
                  {Number(provider.rating).toFixed(1)}
                </span>
                <span className="text-muted-foreground">
                  {provider.completed_jobs} {t("completedServices").toLowerCase()} · {Number(provider.experience_years)} {t("years")}
                </span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant={provider.verification_status === "unverified" ? "outline" : "default"}>
              {pick(VERIFICATION_LEVELS, provider.verification_status, lang)}
            </Badge>
            <Badge variant="outline">{provider.availability_status}</Badge>
            {provider.accepts_urgent && <Badge className="bg-harvest text-soil">{t("urgent")}</Badge>}
            {provider.is_demo && <Badge variant="secondary">{t("demoData")}</Badge>}
          </div>
          {provider.about && <p className="text-sm text-muted-foreground">{provider.about}</p>}
          <Button asChild className="h-12 w-full">
            <a href="#request">{t("requestService")}</a>
          </Button>
        </CardContent>
      </Card>

      <SectionTitle>{t("pricing")}</SectionTitle>
      {offerings?.length ? (
        <div className="space-y-2">
          {offerings.map((o) => {
            const s = o.services as { name: string; name_te: string | null } | null;
            return (
              <Card key={o.id} className="border-border">
                <CardContent className="p-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="font-semibold">{lang === "te" && s?.name_te ? s.name_te : s?.name}</span>
                    <span className="shrink-0 font-bold text-primary">
                      {o.price ? `${rupees(o.price)} ${pick(PRICING_UNITS, o.pricing_unit, lang)}` : t("quotation")}
                      {o.price_per_hour ? ` · ${rupees(o.price_per_hour)}/${lang === "te" ? "గం" : "hr"}` : ""}
                    </span>
                  </div>
                  {o.equipment_details && <p className="text-xs text-muted-foreground">{o.equipment_details}</p>}
                  {o.minimum_booking && (
                    <p className="text-xs text-muted-foreground">
                      {lang === "te" ? "కనీస బుకింగ్" : "Minimum booking"}: {o.minimum_booking}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {lang === "te" ? "సామగ్రి" : "Materials"}:{" "}
                    {o.materials_supplied_by === "provider"
                      ? lang === "te"
                        ? "సేవాదారు"
                        : "Provider"
                      : lang === "te"
                        ? "రైతు"
                        : "Farmer"}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "సేవలు జోడించలేదు." : "No services listed yet."} />
      )}

      <SectionTitle>{t("serviceArea")}</SectionTitle>
      <Card className="border-border">
        <CardContent className="p-3 text-sm">
          <p>
            {lang === "te"
              ? `${provider.service_radius_km} కి.మీ పరిధిలోని రైతులకు సేవలు`
              : `Serves farmers within ${provider.service_radius_km} km`}
          </p>
          <ul className="mt-1 list-inside list-disc text-xs text-muted-foreground">
            {(locations ?? []).map((l) => (
              <li key={l.id}>{[l.village, l.mandal, l.district, l.state].filter(Boolean).join(", ")}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {!!equipment?.length && (
        <>
          <SectionTitle>{t("equipment")}</SectionTitle>
          <div className="space-y-2">
            {equipment.map((e) => (
              <Card key={e.id} className="border-border">
                <CardContent className="p-3 text-sm">
                  <p className="font-semibold">
                    {e.name} {e.brand ? `· ${e.brand}` : ""} {e.model ?? ""} {e.horsepower ? `· ${e.horsepower} HP` : ""}
                  </p>
                  {e.description && <p className="text-xs text-muted-foreground">{e.description}</p>}
                  <p className="text-xs">
                    {e.rental_price_hour ? `${rupees(e.rental_price_hour)}/${lang === "te" ? "గం" : "hr"}` : ""}{" "}
                    {e.rental_price_day ? `· ${rupees(e.rental_price_day)}/${lang === "te" ? "రోజు" : "day"}` : ""}
                    {e.security_deposit ? ` · ${lang === "te" ? "డిపాజిట్" : "Deposit"} ${rupees(e.security_deposit)}` : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <SectionTitle>{t("availability")}</SectionTitle>
      <Card className="border-border">
        <CardContent className="p-3 text-sm">
          <p className="flex items-center gap-2">
            <CalendarDays className="size-4" />
            {(provider.working_days ?? []).join(", ")} · {String(provider.working_hours_start).slice(0, 5)} –{" "}
            {String(provider.working_hours_end).slice(0, 5)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {(availability ?? []).map((a) => (
              <Badge key={a.id} variant={a.status === "available" ? "default" : "outline"}>
                {a.date.slice(5)} · {a.status}
              </Badge>
            ))}
            {!availability?.length && (
              <span className="text-xs text-muted-foreground">
                {lang === "te" ? "క్యాలెండర్ ఇంకా నవీకరించలేదు." : "Calendar not updated yet."}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <SectionTitle>{t("reviews")}</SectionTitle>
      {reviews?.length ? (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Card key={r.id} className="border-border">
              <CardContent className="p-3 text-sm">
                <p className="font-semibold">{"★".repeat(r.rating)}</p>
                {r.comment && <p className="text-muted-foreground">{r.comment}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "ఇంకా సమీక్షలు లేవు." : "No reviews yet."} />
      )}

      <SectionTitle>{t("requestService")}</SectionTitle>
      <div id="request" />
      {!userId ? (
        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-center">
            <p>{lang === "te" ? "సేవను కోరడానికి సైన్ ఇన్ చేయండి." : "Sign in to request this service."}</p>
            <Button asChild className="w-full">
              <Link to="/auth">{t("signIn")}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="space-y-3 p-4">
            <select className={selectCls} value={form.service_id} onChange={(e) => set("service_id", e.target.value)}>
              <option value="">{lang === "te" ? "సేవను ఎంచుకోండి" : "Select service"}</option>
              {(offerings ?? []).map((o) => {
                const s = o.services as { name: string; name_te: string | null } | null;
                return (
                  <option key={o.id} value={o.service_id}>
                    {lang === "te" && s?.name_te ? s.name_te : s?.name}
                  </option>
                );
              })}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-12" value={form.crop} onChange={(e) => set("crop", e.target.value)} placeholder={lang === "te" ? "పంట" : "Crop"} />
              <Input
                className="h-12"
                inputMode="decimal"
                value={form.farm_size_acres}
                onChange={(e) => set("farm_size_acres", e.target.value)}
                placeholder={lang === "te" ? "ఎకరాలు" : "Acres"}
              />
              <Input className="h-12" value={form.village} onChange={(e) => set("village", e.target.value)} placeholder={lang === "te" ? "గ్రామం" : "Village"} />
              <Input className="h-12" value={form.mandal} onChange={(e) => set("mandal", e.target.value)} placeholder={lang === "te" ? "మండలం" : "Mandal"} />
              <Input className="h-12" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder={lang === "te" ? "జిల్లా" : "District"} />
              <Input className="h-12" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder={lang === "te" ? "రాష్ట్రం" : "State"} />
              <Input className="h-12" type="date" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} />
              <Input className="h-12" type="time" value={form.preferred_time} onChange={(e) => set("preferred_time", e.target.value)} />
              <Input
                className="h-12"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder={lang === "te" ? "వ్యవధి" : "Duration"}
              />
              <Input
                className="h-12"
                value={form.equipment_required}
                onChange={(e) => set("equipment_required", e.target.value)}
                placeholder={lang === "te" ? "కావలసిన పరికరం" : "Equipment required"}
              />
            </div>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={lang === "te" ? "అదనపు సూచనలు" : "Additional instructions"}
            />
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.is_urgent} onChange={(e) => set("is_urgent", e.target.checked)} />
              {t("urgentRequirement")}
            </label>
            <Button className="h-12 w-full" disabled={sendRequest.isPending} onClick={() => sendRequest.mutate()}>
              {sendRequest.isPending ? t("loading") : t("sendServiceRequest")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {lang === "te"
                ? "సేవాదారు ఫోన్ నంబర్ బుకింగ్ నిర్ధారణ తర్వాత మాత్రమే పంచుకోబడుతుంది. అప్పటివరకు యాప్ చాట్ ఉపయోగించండి."
                : "The provider's phone number is shared only after the booking is confirmed. Use in-app chat until then."}
            </p>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {t("servicesDisclaimer")}
      </p>
    </AppShell>
  );
}

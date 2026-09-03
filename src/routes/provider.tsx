import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { label, pick, rupees, STATUS_LABEL, VERIFICATION_LEVELS } from "@/lib/farming-services";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Service Provider Dashboard — RythuSetu" },
      {
        name: "description",
        content:
          "Register as a farming service provider, list your services and equipment, receive farmer requests, send quotations and manage bookings.",
      },
      { property: "og:title", content: "Service Provider Dashboard — RythuSetu" },
      { property: "og:description", content: "Manage farming service requests, quotations, bookings and earnings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProviderPage,
});

const selectCls = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium";

function ProviderPage() {
  const { t, lang } = useI18n();
  const { userId, profile } = useSession();
  const qc = useQueryClient();

  const { data: provider, isLoading } = useQuery({
    queryKey: ["my-provider", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase.from("service_providers").select("*").eq("user_id", userId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    business_name: "",
    about: "",
    experience_years: "",
    service_radius_km: "25",
    state: profile?.state ?? "",
    district: profile?.district ?? "",
    mandal: profile?.mandal ?? "",
    village: profile?.village ?? "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const register = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("service_providers").insert({
        user_id: userId!,
        business_name: form.business_name.slice(0, 120),
        about: form.about.slice(0, 1000) || null,
        experience_years: Number(form.experience_years || 0),
        service_radius_km: Number(form.service_radius_km || 25),
        state: form.state || null,
        district: form.district || null,
        mandal: form.mandal || null,
        village: form.village || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "సేవాదారు ప్రొఫైల్ సృష్టించబడింది." : "Provider profile created.");
      qc.invalidateQueries({ queryKey: ["my-provider"] });
    },
    onError: () => toast.error(t("genericError")),
  });

  const { data: services } = useQuery({
    queryKey: ["all-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, name_te, service_categories(name, name_te)")
        .eq("status", "active")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myServices } = useQuery({
    queryKey: ["my-provider-services", provider?.id],
    enabled: !!provider?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_services")
        .select("id, price, pricing_unit, services(name, name_te)")
        .eq("provider_id", provider!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const [newSvc, setNewSvc] = useState({ service_id: "", price: "", pricing_unit: "per_acre" });
  const addService = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("provider_services").insert({
        provider_id: provider!.id,
        service_id: newSvc.service_id,
        price: newSvc.price ? Number(newSvc.price) : null,
        pricing_unit: newSvc.pricing_unit,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewSvc({ service_id: "", price: "", pricing_unit: "per_acre" });
      qc.invalidateQueries({ queryKey: ["my-provider-services"] });
    },
    onError: () => toast.error(t("genericError")),
  });

  const { data: requests } = useQuery({
    queryKey: ["provider-requests", provider?.id],
    enabled: !!provider?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, services(name, name_te), service_quotes(id, total, status, provider_id)")
        .in("status", ["requested", "provider_reviewing", "quoted"])
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["provider-bookings", provider?.id],
    enabled: !!provider?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bookings")
        .select("*, services(name, name_te)")
        .eq("provider_id", provider!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const sendQuote = useMutation({
    mutationFn: async ({ requestId, base, transport, additional, notes }: any) => {
      const total = Number(base || 0) + Number(transport || 0) + Number(additional || 0);
      const { error } = await supabase.from("service_quotes").insert({
        request_id: requestId,
        provider_id: provider!.id,
        base_price: Number(base || 0),
        transport_fee: Number(transport || 0),
        additional_fee: Number(additional || 0),
        total,
        notes: (notes ?? "").slice(0, 1000) || null,
      });
      if (error) throw error;
      await supabase.from("service_requests").update({ status: "quoted" }).eq("id", requestId);
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "కొటేషన్ పంపబడింది." : "Quotation sent.");
      qc.invalidateQueries({ queryKey: ["provider-requests"] });
    },
    onError: () => toast.error(t("genericError")),
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("service_bookings").update({ booking_status: status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["provider-bookings"] }),
    onError: () => toast.error(t("genericError")),
  });

  if (!userId) {
    return (
      <AppShell subtitle={t("providerDashboard")}>
        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-center">
            <p>{lang === "te" ? "కొనసాగడానికి సైన్ ఇన్ చేయండి." : "Sign in to continue."}</p>
            <Button asChild className="w-full">
              <Link to="/auth">{t("signIn")}</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  if (isLoading) {
    return (
      <AppShell subtitle={t("providerDashboard")}>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      </AppShell>
    );
  }

  if (!provider) {
    return (
      <AppShell subtitle={t("providerDashboard")}>
        <h1 className="font-display text-2xl font-bold">{t("becomeProvider")}</h1>
        <Card className="mt-4 border-border">
          <CardContent className="space-y-3 p-4">
            <Input className="h-12" value={form.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder={lang === "te" ? "వ్యాపారం / సేవ పేరు" : "Business / service name"} />
            <div className="grid grid-cols-2 gap-2">
              <Input className="h-12" inputMode="decimal" value={form.experience_years} onChange={(e) => set("experience_years", e.target.value)} placeholder={lang === "te" ? "అనుభవం (సం.)" : "Experience (yrs)"} />
              <Input className="h-12" inputMode="decimal" value={form.service_radius_km} onChange={(e) => set("service_radius_km", e.target.value)} placeholder={lang === "te" ? "సేవా పరిధి కి.మీ" : "Service radius km"} />
              <Input className="h-12" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder={lang === "te" ? "రాష్ట్రం" : "State"} />
              <Input className="h-12" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder={lang === "te" ? "జిల్లా" : "District"} />
              <Input className="h-12" value={form.mandal} onChange={(e) => set("mandal", e.target.value)} placeholder={lang === "te" ? "మండలం" : "Mandal"} />
              <Input className="h-12" value={form.village} onChange={(e) => set("village", e.target.value)} placeholder={lang === "te" ? "గ్రామం" : "Village"} />
            </div>
            <Textarea rows={3} value={form.about} onChange={(e) => set("about", e.target.value)} placeholder={lang === "te" ? "మీ సేవల గురించి" : "About your services"} />
            <Button className="h-12 w-full" disabled={!form.business_name.trim() || register.isPending} onClick={() => register.mutate()}>
              {t("becomeProvider")}
            </Button>
            <p className="text-xs text-muted-foreground">
              {lang === "te"
                ? "పత్రాల ధృవీకరణ అడ్మిన్ చేస్తారు. ధృవీకరణ పూర్తయ్యే వరకు 'ధృవీకరించలేదు' అని చూపబడుతుంది."
                : "Documents are verified by admin. Until then your profile shows as unverified."}
            </p>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const earnings = (bookings ?? [])
    .filter((b: any) => b.payment_status === "paid")
    .reduce((s: number, b: any) => s + Number(b.provider_payout ?? b.agreed_price), 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <AppShell subtitle={t("providerDashboard")}>
      <h1 className="font-display text-2xl font-bold">{provider.business_name}</h1>
      <div className="mt-1 flex flex-wrap gap-1">
        <Badge>{pick(VERIFICATION_LEVELS, provider.verification_status, lang)}</Badge>
        <Badge variant="outline">{provider.availability_status}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          { l: lang === "te" ? "కొత్త అభ్యర్థనలు" : "New requests", v: (requests ?? []).length },
          { l: lang === "te" ? "ఈరోజు" : "Today", v: (bookings ?? []).filter((b: any) => b.booking_date === today).length },
          { l: t("rating"), v: Number(provider.rating).toFixed(1) },
          { l: lang === "te" ? "రాబడి" : "Earnings", v: rupees(earnings) },
          { l: t("completedServices"), v: provider.completed_jobs },
          { l: t("availability"), v: provider.availability_status },
        ].map((c) => (
          <Card key={c.l} className="border-border">
            <CardContent className="p-3">
              <p className="text-base font-bold">{c.v}</p>
              <p className="text-[0.65rem] text-muted-foreground">{c.l}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionTitle>{lang === "te" ? "నా సేవలు & ధరలు" : "My services & pricing"}</SectionTitle>
      <Card className="border-border">
        <CardContent className="space-y-2 p-3">
          {(myServices ?? []).map((s: any) => (
            <p key={s.id} className="flex justify-between text-sm">
              <span>{lang === "te" && s.services?.name_te ? s.services.name_te : s.services?.name}</span>
              <span className="font-semibold text-primary">{rupees(s.price)}</span>
            </p>
          ))}
          <select className={selectCls} value={newSvc.service_id} onChange={(e) => setNewSvc({ ...newSvc, service_id: e.target.value })}>
            <option value="">{lang === "te" ? "సేవను ఎంచుకోండి" : "Select a service"}</option>
            {(services ?? []).map((s: any) => (
              <option key={s.id} value={s.id}>
                {lang === "te" && s.name_te ? s.name_te : s.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <Input className="h-11" inputMode="numeric" value={newSvc.price} onChange={(e) => setNewSvc({ ...newSvc, price: e.target.value })} placeholder={lang === "te" ? "ధర ₹" : "Price ₹"} />
            <select className={selectCls} value={newSvc.pricing_unit} onChange={(e) => setNewSvc({ ...newSvc, pricing_unit: e.target.value })}>
              <option value="per_acre">{lang === "te" ? "ఎకరానికి" : "per acre"}</option>
              <option value="per_hour">{lang === "te" ? "గంటకు" : "per hour"}</option>
              <option value="per_day">{lang === "te" ? "రోజుకి" : "per day"}</option>
              <option value="per_task">{lang === "te" ? "పనికి" : "per task"}</option>
              <option value="quote">{lang === "te" ? "కొటేషన్" : "on quotation"}</option>
            </select>
          </div>
          <Button className="h-11 w-full" disabled={!newSvc.service_id || addService.isPending} onClick={() => addService.mutate()}>
            {lang === "te" ? "సేవను జోడించండి" : "Add service"}
          </Button>
        </CardContent>
      </Card>

      <SectionTitle>{lang === "te" ? "రైతుల అభ్యర్థనలు" : "Farmer requests"}</SectionTitle>
      {requests?.length ? (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <RequestCard key={r.id} r={r} lang={lang} t={t} providerId={provider.id} onQuote={(v) => sendQuote.mutate({ requestId: r.id, ...v })} />
          ))}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "ప్రస్తుతం అభ్యర్థనలు లేవు." : "No open requests right now."} />
      )}

      <SectionTitle>{lang === "te" ? "బుకింగ్‌లు" : "Bookings"}</SectionTitle>
      {bookings?.length ? (
        <div className="space-y-2">
          {bookings.map((b: any) => (
            <Card key={b.id} className="border-border">
              <CardContent className="space-y-2 p-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="font-semibold">
                    {b.booking_code} · {lang === "te" && b.services?.name_te ? b.services.name_te : b.services?.name}
                  </span>
                  <Badge>{label(STATUS_LABEL, b.booking_status, lang)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {b.booking_date ?? "—"} · {b.location || "—"} · {rupees(b.agreed_price)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {["on_the_way", "started", "completed"].map((s) => (
                    <Button key={s} size="sm" variant="outline" className="h-9" onClick={() => updateBooking.mutate({ id: b.id, status: s })}>
                      {label(STATUS_LABEL, s, lang)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "బుకింగ్‌లు లేవు." : "No bookings yet."} />
      )}

      <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {t("servicesDisclaimer")}
      </p>
    </AppShell>
  );
}

function RequestCard({ r, lang, t, providerId, onQuote }: any) {
  const [v, setV] = useState({ base: "", transport: "", additional: "", notes: "" });
  const already = (r.service_quotes ?? []).some((q: any) => q.provider_id === providerId);
  return (
    <Card className="border-border">
      <CardContent className="space-y-2 p-4 text-sm">
        <p className="font-display text-base font-bold">
          {r.title || (lang === "te" && r.services?.name_te ? r.services.name_te : r.services?.name)}
        </p>
        <p className="text-xs text-muted-foreground">
          {r.crop ?? "—"} · {r.farm_size_acres ?? "—"} {lang === "te" ? "ఎకరాలు" : "acres"} ·{" "}
          {[r.village, r.mandal, r.district].filter(Boolean).join(", ")} · {r.preferred_date ?? "—"}
        </p>
        {r.description && <p className="text-muted-foreground">{r.description}</p>}
        {already ? (
          <Badge variant="outline">{lang === "te" ? "కొటేషన్ పంపారు" : "Quote sent"}</Badge>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <Input className="h-11" inputMode="numeric" value={v.base} onChange={(e) => setV({ ...v, base: e.target.value })} placeholder={lang === "te" ? "సేవ ₹" : "Service ₹"} />
              <Input className="h-11" inputMode="numeric" value={v.transport} onChange={(e) => setV({ ...v, transport: e.target.value })} placeholder={lang === "te" ? "రవాణా ₹" : "Transport ₹"} />
              <Input className="h-11" inputMode="numeric" value={v.additional} onChange={(e) => setV({ ...v, additional: e.target.value })} placeholder={lang === "te" ? "అదనపు ₹" : "Extra ₹"} />
            </div>
            <Textarea rows={2} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder={lang === "te" ? "గమనికలు" : "Notes"} />
            <Button className="h-11 w-full" disabled={!v.base} onClick={() => onQuote(v)}>
              {t("sendQuote")}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

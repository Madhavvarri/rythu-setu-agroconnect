import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink, Info } from "lucide-react";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/insurance")({
  head: () => ({
    meta: [
      { title: "Crop Insurance Support — Compare Options | RythuSetu" },
      {
        name: "description",
        content:
          "Explore and compare crop insurance options from authorized providers, and raise support requests. RythuSetu does not sell or underwrite insurance.",
      },
      { property: "og:title", content: "Crop Insurance Support — RythuSetu" },
      {
        property: "og:description",
        content: "Independent crop insurance discovery, comparison and support for Indian farmers.",
      },
    ],
  }),
  component: InsurancePage,
});

const ticketCategories = [
  "Policy information",
  "Purchase assistance",
  "Policy document issue",
  "Premium issue",
  "Claim assistance",
  "Claim status",
  "Crop loss information",
  "General insurance support",
];

function Disclaimer() {
  const { t } = useI18n();
  return (
    <Card className="border-harvest/50 bg-accent">
      <CardContent className="flex gap-2 p-4 text-xs">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>{t("insuranceDisclaimer")}</p>
      </CardContent>
    </Card>
  );
}

function InsurancePage() {
  const { lang, t } = useI18n();
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ state: "Telangana", district: "", crop: "", season: "", area: "", farming_type: "" });
  const [searched, setSearched] = useState(false);
  const [ticket, setTicket] = useState({ provider: "", crop: "", policy_number: "", category: ticketCategories[0]!, description: "" });

  const { data: options } = useQuery({
    queryKey: ["insurance-options", filters.state, filters.crop, filters.season],
    enabled: searched,
    queryFn: async () => {
      let q = supabase.from("insurance_options").select("*").eq("status", "active");
      if (filters.state) q = q.eq("state", filters.state);
      if (filters.crop) q = q.ilike("crop", `%${filters.crop}%`);
      if (filters.season) q = q.ilike("season", `%${filters.season}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: tickets } = useQuery({
    queryKey: ["tickets", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_support_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("not-signed-in");
      if (!ticket.description.trim()) throw new Error("invalid");
      const { error } = await supabase.from("insurance_support_tickets").insert({
        user_id: userId,
        provider: ticket.provider,
        crop: ticket.crop || filters.crop,
        policy_number: ticket.policy_number,
        category: ticket.category,
        description: ticket.description.slice(0, 2000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setTicket((p) => ({ ...p, description: "", policy_number: "" }));
      toast.success(t("ticketSubmitted"));
    },
    onError: (e) => {
      if (e.message === "not-signed-in") toast.error(lang === "te" ? "ముందుగా సైన్ ఇన్ చేయండి." : "Please sign in first.");
      else if (e.message === "invalid") toast.error(lang === "te" ? "సమస్యను వివరించండి." : "Please describe your issue.");
      else toast.error(t("genericError"));
    },
  });

  return (
    <AppShell subtitle={t("cropInsurance")}>
      <h1 className="font-display text-2xl font-bold">{t("cropInsurance")}</h1>
      <p className="mb-3 text-sm text-muted-foreground">
        {lang === "te"
          ? "అందుబాటులో ఉన్న బీమా ఎంపికలు తెలుసుకోవడానికి మీ పంటను ఎంచుకోండి."
          : "Select your crop to explore available insurance options and support."}
      </p>
      <Disclaimer />

      <Card className="mt-4 border-border">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="field-label">{lang === "te" ? "రాష్ట్రం" : "State"}</Label>
              <Input value={filters.state} onChange={(e) => setFilters((f) => ({ ...f, state: e.target.value }))} />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "జిల్లా" : "District"}</Label>
              <Input value={filters.district} onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))} />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "పంట" : "Crop"}</Label>
              <Input value={filters.crop} onChange={(e) => setFilters((f) => ({ ...f, crop: e.target.value }))} placeholder="Chilli" />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "సీజన్" : "Season"}</Label>
              <Input value={filters.season} onChange={(e) => setFilters((f) => ({ ...f, season: e.target.value }))} placeholder="Kharif" />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "విస్తీర్ణం (ఎకరాలు)" : "Farm area (acres)"}</Label>
              <Input value={filters.area} onChange={(e) => setFilters((f) => ({ ...f, area: e.target.value }))} inputMode="decimal" />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "వ్యవసాయ రకం" : "Farming type"}</Label>
              <Input value={filters.farming_type} onChange={(e) => setFilters((f) => ({ ...f, farming_type: e.target.value }))} />
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={() => setSearched(true)}>
            {lang === "te" ? "ఎంపికలు చూడండి" : "Show insurance options"}
          </Button>
        </CardContent>
      </Card>

      {searched && (
        <>
          <SectionTitle>{lang === "te" ? "అందుబాటులో ఉన్న ఎంపికలు" : "Available options"}</SectionTitle>
          {options?.length ? (
            <div className="space-y-3">
              {options.map((o) => (
                <Card key={o.id} className="border-border shadow-[var(--shadow-card)]">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-lg font-bold leading-tight">{o.provider_name}</p>
                        <p className="text-xs text-muted-foreground">{o.scheme_name}</p>
                      </div>
                      {o.is_demo && <Badge variant="secondary">{t("demoData")}</Badge>}
                    </div>
                    <p className="text-sm">
                      {o.crop} · {o.state} · {o.season} · {o.policy_period}
                    </p>
                    <p className="text-sm text-muted-foreground">{o.coverage}</p>
                    <p className="text-sm text-muted-foreground">{o.premium_info}</p>
                    <p className="text-xs text-muted-foreground">{o.conditions}</p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <a href={o.provider_url ?? "#"} target="_blank" rel="noopener noreferrer">
                          {t("visitProvider")} <ExternalLink className="ml-1 size-4" />
                        </a>
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setTicket((p) => ({ ...p, provider: o.provider_name, crop: o.crop }));
                          toast.info(lang === "te" ? "క్రింద సహాయ అభ్యర్థన పూరించండి." : "Fill the support request below.");
                        }}
                      >
                        {t("requestSupport")}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              message={
                lang === "te"
                  ? "ఈ ఎంపికలకు సమాచారం అందుబాటులో లేదు. సహాయ అభ్యర్థన పెట్టండి."
                  : "No insurance information available for this selection. You can still raise a support request."
              }
            />
          )}
        </>
      )}

      <SectionTitle>{lang === "te" ? "సహాయ అభ్యర్థన" : "Insurance support request"}</SectionTitle>
      <Card className="border-border">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="field-label">{lang === "te" ? "ప్రొవైడర్" : "Provider"}</Label>
              <Input value={ticket.provider} onChange={(e) => setTicket((p) => ({ ...p, provider: e.target.value }))} />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "పంట" : "Crop"}</Label>
              <Input value={ticket.crop} onChange={(e) => setTicket((p) => ({ ...p, crop: e.target.value }))} />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "పాలసీ నంబర్" : "Policy number"}</Label>
              <Input value={ticket.policy_number} onChange={(e) => setTicket((p) => ({ ...p, policy_number: e.target.value }))} />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "విభాగం" : "Category"}</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                value={ticket.category}
                onChange={(e) => setTicket((p) => ({ ...p, category: e.target.value }))}
              >
                {ticketCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "వివరణ" : "Description"}</Label>
            <Textarea value={ticket.description} onChange={(e) => setTicket((p) => ({ ...p, description: e.target.value }))} maxLength={2000} />
          </div>
          <Button size="lg" className="w-full" disabled={createTicket.isPending} onClick={() => createTicket.mutate()}>
            {t("requestSupport")}
          </Button>
        </CardContent>
      </Card>

      {!!tickets?.length && (
        <>
          <SectionTitle>{lang === "te" ? "నా అభ్యర్థనలు" : "My support requests"}</SectionTitle>
          <div className="space-y-2">
            {tickets.map((tk) => (
              <Card key={tk.id} className="border-border">
                <CardContent className="space-y-1 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{tk.ticket_code}</span>
                    <Badge variant="secondary">{tk.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {tk.category} · {tk.provider} · {tk.crop}
                  </p>
                  <p className="text-sm">{tk.description}</p>
                  {tk.admin_response && <p className="rounded-lg bg-muted p-2 text-sm">{tk.admin_response}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

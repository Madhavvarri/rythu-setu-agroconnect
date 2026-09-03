import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

type Search = { urgent?: boolean | undefined };

export const Route = createFileRoute("/services/post-requirement")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    urgent: s['urgent'] === true || s['urgent'] === "true" ? true : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Post a Farming Requirement — RythuSetu" },
      {
        name: "description",
        content:
          "Describe what your farm needs and RythuSetu will suggest relevant farming service categories and providers near you.",
      },
      { property: "og:title", content: "Post a Farming Requirement — RythuSetu" },
      { property: "og:description", content: "Tell us what your farm needs and get matched with service providers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PostRequirement,
});

const KEYWORDS: { words: string[]; slug: string }[] = [
  { words: ["plough", "field prep", "prepare", "rotavator", "level", "tractor", "దుక్కి", "ట్రాక్టర్"], slug: "tractor-land" },
  { words: ["sow", "plant", "transplant", "నాట", "విత్తన"], slug: "sowing" },
  { words: ["spray", "pesticide", "fertilizer", "weed", "పిచికారీ", "ఎరువు"], slug: "crop-maintenance" },
  { words: ["drone", "డ్రోన్"], slug: "drone" },
  { words: ["harvest", "reaper", "thresher", "కోత"], slug: "harvesting" },
  { words: ["dry", "grade", "pack", "clean", "sort", "ప్యాకింగ్"], slug: "post-harvest" },
  { words: ["water", "pump", "drip", "sprinkler", "borewell", "నీటి"], slug: "irrigation" },
  { words: ["soil", "ph", "nutrient", "మట్టి"], slug: "soil-testing" },
  { words: ["rent", "hire", "అద్దె"], slug: "equipment-rental" },
  { words: ["transport", "truck", "pickup", "రవాణా"], slug: "transport" },
  { words: ["advice", "consult", "expert", "సలహా"], slug: "expert" },
];

function PostRequirement() {
  const { urgent } = Route.useSearch();
  const { t, lang } = useI18n();
  const { userId, profile } = useSession();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    crop: "",
    farm_size_acres: "",
    state: profile?.state ?? "",
    district: profile?.district ?? "",
    mandal: profile?.mandal ?? "",
    village: profile?.village ?? "",
    preferred_date: "",
    budget: "",
    description: "",
  });
  const [isUrgent, setIsUrgent] = useState(!!urgent);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const { data: categories } = useQuery({
    queryKey: ["service-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("id, name, name_te, slug, icon")
        .eq("status", "active")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const text = `${form.title} ${form.description}`.toLowerCase();
  const suggestedSlugs = KEYWORDS.filter((k) => k.words.some((w) => text.includes(w))).map((k) => k.slug);
  const suggestions = (categories ?? []).filter((c) => suggestedSlugs.includes(c.slug));

  const submit = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("auth");
      const { data, error } = await supabase
        .from("service_requests")
        .insert({
          farmer_id: userId,
          title: form.title.slice(0, 200),
          crop: form.crop || null,
          farm_size_acres: form.farm_size_acres ? Number(form.farm_size_acres) : null,
          state: form.state || null,
          district: form.district || null,
          mandal: form.mandal || null,
          village: form.village || null,
          preferred_date: form.preferred_date || null,
          budget: form.budget ? Number(form.budget) : null,
          description: form.description.slice(0, 2000),
          is_urgent: isUrgent,
          is_open_requirement: true,
          status: "requested",
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "మీ అవసరం పోస్ట్ అయ్యింది." : "Your requirement has been posted.");
      navigate({ to: "/bookings" });
    },
    onError: (e: Error) => {
      toast.error(e.message === "auth" ? t("signIn") : t("genericError"));
    },
  });

  if (!userId) {
    return (
      <AppShell subtitle={t("farmingServices")}>
        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-center">
            <p>{lang === "te" ? "అవసరాన్ని పోస్ట్ చేయడానికి సైన్ ఇన్ చేయండి." : "Sign in to post a requirement."}</p>
            <Button asChild className="w-full">
              <Link to="/auth">{t("signIn")}</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell subtitle={t("farmingServices")}>
      <Link to="/services" className="text-sm font-semibold text-primary">
        ← {t("farmingServices")}
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold">{t("postRequirement")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lang === "te"
          ? "ఏ సేవ కావాలో ఖచ్చితంగా తెలియకపోయినా ఫర్వాలేదు — మీ అవసరాన్ని రాయండి."
          : "Not sure which service you need? Just describe what your farm needs."}
      </p>

      <Card className="mt-4 border-border">
        <CardContent className="space-y-3 p-4">
          <Input
            className="h-12"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder={lang === "te" ? "మీకు ఏమి కావాలి?" : "What do you need?"}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input className="h-12" value={form.crop} onChange={(e) => set("crop", e.target.value)} placeholder={lang === "te" ? "పంట" : "Crop"} />
            <Input
              className="h-12"
              inputMode="decimal"
              value={form.farm_size_acres}
              onChange={(e) => set("farm_size_acres", e.target.value)}
              placeholder={lang === "te" ? "ఎకరాలు" : "Acres"}
            />
            <Input className="h-12" value={form.state} onChange={(e) => set("state", e.target.value)} placeholder={lang === "te" ? "రాష్ట్రం" : "State"} />
            <Input className="h-12" value={form.district} onChange={(e) => set("district", e.target.value)} placeholder={lang === "te" ? "జిల్లా" : "District"} />
            <Input className="h-12" value={form.mandal} onChange={(e) => set("mandal", e.target.value)} placeholder={lang === "te" ? "మండలం" : "Mandal"} />
            <Input className="h-12" value={form.village} onChange={(e) => set("village", e.target.value)} placeholder={lang === "te" ? "గ్రామం" : "Village"} />
            <Input className="h-12" type="date" value={form.preferred_date} onChange={(e) => set("preferred_date", e.target.value)} />
            <Input
              className="h-12"
              inputMode="numeric"
              value={form.budget}
              onChange={(e) => set("budget", e.target.value)}
              placeholder={lang === "te" ? "బడ్జెట్ ₹" : "Budget ₹"}
            />
          </div>
          <Textarea
            rows={4}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder={lang === "te" ? "వివరాలు రాయండి" : "Describe your requirement"}
          />
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} />
            {t("urgentRequirement")}
          </label>
          <Button
            className="h-12 w-full"
            disabled={!form.title.trim() || submit.isPending}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? t("loading") : t("postRequirement")}
          </Button>
        </CardContent>
      </Card>

      {suggestions.length > 0 && (
        <>
          <SectionTitle>{lang === "te" ? "సూచించిన సేవలు" : "Suggested services"}</SectionTitle>
          <Badge variant="secondary" className="mb-2">
            {t("matchScore")}
          </Badge>
          <div className="grid grid-cols-2 gap-3">
            {suggestions.map((c) => (
              <Link key={c.id} to="/services/$slug" params={{ slug: c.slug }}>
                <Card className="h-full border-border">
                  <CardContent className="space-y-1 p-4">
                    <span className="text-2xl">{c.icon}</span>
                    <p className="font-semibold leading-tight">{lang === "te" && c.name_te ? c.name_te : c.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {lang === "te"
              ? "ఇవి రైతుసేతు సూచనలు మాత్రమే — వృత్తిపరమైన హామీ కాదు."
              : "These are RythuSetu suggestions only, not professional guarantees."}
          </p>
        </>
      )}

      <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {t("servicesDisclaimer")}
      </p>
    </AppShell>
  );
}

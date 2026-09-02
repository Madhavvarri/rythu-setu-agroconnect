import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession, type Role } from "@/lib/session";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Create your profile — RythuSetu" },
      { name: "description", content: "Tell RythuSetu whether you are a farmer, labourer or seller and set up your profile." },
      { property: "og:title", content: "Create your profile — RythuSetu" },
      { property: "og:description", content: "Set up your farmer, labourer or seller profile on RythuSetu." },
    ],
  }),
  component: Onboarding,
});

const roleOptions: { role: Role; en: string; te: string; emoji: string }[] = [
  { role: "farmer", en: "Farmer", te: "రైతు", emoji: "🧑‍🌾" },
  { role: "labourer", en: "Labourer", te: "కూలీ", emoji: "💪" },
  { role: "seller", en: "Seller / Organisation", te: "విక్రేత / సంస్థ", emoji: "🏪" },
];

function Onboarding() {
  const { lang, t } = useI18n();
  const navigate = useNavigate();
  const { userId, profile, roles } = useSession();
  const [role, setRole] = useState<Role>("farmer");
  const [form, setForm] = useState({
    full_name: "",
    mobile: "",
    state: "Telangana",
    district: "",
    mandal: "",
    village: "",
    // farmer
    farm_size: "",
    crops: "",
    farming_type: "mixed",
    // labour
    skills: "",
    experience_years: "",
    preferred_wage: "",
    preferred_radius_km: "10",
    // seller
    business_name: "",
    business_type: "retail",
    description: "",
  });
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!userId) {
      toast.error(lang === "te" ? "ముందుగా సైన్ ఇన్ చేయండి." : "Please sign in first.");
      navigate({ to: "/auth" });
      return;
    }
    setBusy(true);
    try {
      const { error: pErr } = await supabase
        .from("profiles")
        .update({
          full_name: form.full_name || profile?.full_name || "",
          mobile: form.mobile || profile?.mobile,
          language: lang,
          state: form.state,
          district: form.district,
          mandal: form.mandal,
          village: form.village,
        })
        .eq("id", userId);
      if (pErr) throw pErr;

      if (!roles.includes(role)) {
        const { error: rErr } = await supabase.from("user_roles").insert({ user_id: userId, role });
        if (rErr && !rErr.message.includes("duplicate")) throw rErr;
      }

      if (role === "farmer") {
        const { error } = await supabase.from("farmer_profiles").upsert(
          {
            user_id: userId,
            farm_size: form.farm_size ? Number(form.farm_size) : null,
            crops: form.crops ? form.crops.split(",").map((c) => c.trim()).filter(Boolean) : [],
            farming_type: form.farming_type,
            farm_location: `${form.village}, ${form.district}`,
          },
          { onConflict: "user_id" },
        );
        if (error) throw error;
      } else if (role === "labourer") {
        const { error } = await supabase.from("labour_profiles").upsert(
          {
            user_id: userId,
            skills: form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
            experience_years: form.experience_years ? Number(form.experience_years) : 0,
            preferred_wage: form.preferred_wage ? Number(form.preferred_wage) : null,
            preferred_radius_km: Number(form.preferred_radius_km || 10),
          },
          { onConflict: "user_id" },
        );
        if (error) throw error;
      } else {
        const { error } = await supabase.from("seller_profiles").upsert(
          {
            user_id: userId,
            business_name: form.business_name || form.full_name,
            business_type: form.business_type,
            description: form.description,
          },
          { onConflict: "user_id" },
        );
        if (error) throw error;
      }

      toast.success(lang === "te" ? "ప్రొఫైల్ సేవ్ అయ్యింది." : "Profile saved.");
      navigate({ to: "/" });
    } catch {
      toast.error(t("genericError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md space-y-4 px-4 py-6">
        <h1 className="font-display text-2xl font-bold">{lang === "te" ? "మీ ప్రొఫైల్" : "Your profile"}</h1>

        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((o) => (
            <button
              key={o.role}
              type="button"
              onClick={() => setRole(o.role)}
              className={`rounded-2xl border p-3 text-center text-sm font-semibold ${
                role === o.role ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
              }`}
            >
              <span className="block text-2xl">{o.emoji}</span>
              {lang === "te" ? o.te : o.en}
            </button>
          ))}
        </div>

        <Card className="border-border">
          <CardContent className="space-y-3 p-4">
            <div>
              <Label className="field-label">{lang === "te" ? "పూర్తి పేరు" : "Full name"}</Label>
              <Input value={form.full_name} onChange={set("full_name")} placeholder={profile?.full_name ?? ""} maxLength={80} />
            </div>
            <div>
              <Label className="field-label">{lang === "te" ? "మొబైల్" : "Mobile"}</Label>
              <Input value={form.mobile} onChange={set("mobile")} inputMode="tel" maxLength={15} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="field-label">{lang === "te" ? "రాష్ట్రం" : "State"}</Label>
                <Input value={form.state} onChange={set("state")} />
              </div>
              <div>
                <Label className="field-label">{lang === "te" ? "జిల్లా" : "District"}</Label>
                <Input value={form.district} onChange={set("district")} />
              </div>
              <div>
                <Label className="field-label">{lang === "te" ? "మండలం" : "Mandal"}</Label>
                <Input value={form.mandal} onChange={set("mandal")} />
              </div>
              <div>
                <Label className="field-label">{lang === "te" ? "గ్రామం" : "Village"}</Label>
                <Input value={form.village} onChange={set("village")} />
              </div>
            </div>

            {role === "farmer" && (
              <>
                <div>
                  <Label className="field-label">{lang === "te" ? "భూమి (ఎకరాలు)" : "Farm size (acres)"}</Label>
                  <Input value={form.farm_size} onChange={set("farm_size")} inputMode="decimal" />
                </div>
                <div>
                  <Label className="field-label">{lang === "te" ? "పంటలు (కామాతో)" : "Crops grown (comma separated)"}</Label>
                  <Input value={form.crops} onChange={set("crops")} placeholder="Chilli, Cotton" />
                </div>
                <div>
                  <Label className="field-label">{lang === "te" ? "వ్యవసాయ రకం" : "Farming type"}</Label>
                  <Input value={form.farming_type} onChange={set("farming_type")} />
                </div>
              </>
            )}

            {role === "labourer" && (
              <>
                <div>
                  <Label className="field-label">{lang === "te" ? "నైపుణ్యాలు (కామాతో)" : "Skills (comma separated)"}</Label>
                  <Input value={form.skills} onChange={set("skills")} placeholder="Harvesting, Weeding" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="field-label">{lang === "te" ? "అనుభవం (సం.)" : "Experience (yrs)"}</Label>
                    <Input value={form.experience_years} onChange={set("experience_years")} inputMode="numeric" />
                  </div>
                  <div>
                    <Label className="field-label">{lang === "te" ? "కూలి (₹/రోజు)" : "Wage (₹/day)"}</Label>
                    <Input value={form.preferred_wage} onChange={set("preferred_wage")} inputMode="numeric" />
                  </div>
                </div>
                <div>
                  <Label className="field-label">{lang === "te" ? "పని దూరం (కి.మీ)" : "Working radius (km)"}</Label>
                  <Input value={form.preferred_radius_km} onChange={set("preferred_radius_km")} inputMode="numeric" />
                </div>
              </>
            )}

            {role === "seller" && (
              <>
                <div>
                  <Label className="field-label">{lang === "te" ? "వ్యాపార పేరు" : "Business name"}</Label>
                  <Input value={form.business_name} onChange={set("business_name")} maxLength={80} />
                </div>
                <div>
                  <Label className="field-label">{lang === "te" ? "వివరణ" : "Description"}</Label>
                  <Textarea value={form.description} onChange={set("description")} maxLength={500} />
                </div>
              </>
            )}

            <Button size="lg" className="w-full" disabled={busy} onClick={submit}>
              {lang === "te" ? "సేవ్ చేయండి" : "Save profile"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

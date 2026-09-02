import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, EmptyState, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/jobs")({
  head: () => ({
    meta: [
      { title: "Farm Labour Jobs & Workers — RythuSetu" },
      {
        name: "description",
        content: "Post agricultural labour requirements, browse nearby farm jobs and find suitable workers with RythuSetu.",
      },
      { property: "og:title", content: "Farm Labour Jobs & Workers — RythuSetu" },
      { property: "og:description", content: "Farmers post work, labourers apply. Simple labour matching for Indian farms." },
    ],
  }),
  component: JobsPage,
});

type LabourRow = {
  user_id: string;
  skills: string[];
  crops_experience: string[];
  experience_years: number;
  preferred_wage: number | null;
  availability: string;
  rating: number;
  completed_jobs: number;
  preferred_radius_km: number;
  profiles: { full_name: string; village: string | null; district: string | null; verification_status: string } | null;
};

function matchScore(w: LabourRow, district: string, crop: string, skill: string) {
  let score = 55;
  if (district && w.profiles?.district?.toLowerCase() === district.toLowerCase()) score += 18;
  if (crop && w.crops_experience.some((c) => c.toLowerCase().includes(crop.toLowerCase()))) score += 12;
  if (skill && w.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))) score += 8;
  if (w.availability === "available") score += 5;
  score += Math.min(8, Math.round(Number(w.rating) * 1.5));
  return Math.min(97, score);
}

function JobsPage() {
  const { lang, t } = useI18n();
  const { userId, hasRole, profile } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [workerFilter, setWorkerFilter] = useState({ district: "", crop: "", skill: "" });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs", search],
    queryFn: async () => {
      let q = supabase
        .from("labour_jobs")
        .select("*, profiles!labour_jobs_farmer_id_fkey(full_name, village, district)")
        .order("created_at", { ascending: false });
      if (search.trim()) q = q.ilike("title", `%${search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: myApplications } = useQuery({
    queryKey: ["my-applications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labour_applications")
        .select("id, job_id, status, labour_jobs(title, wage, status)")
        .eq("labourer_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: workers } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("labour_profiles")
        .select("*, profiles!labour_profiles_user_id_fkey(full_name, village, district, verification_status)");
      if (error) throw error;
      return (data ?? []) as unknown as LabourRow[];
    },
  });

  const apply = useMutation({
    mutationFn: async (jobId: string) => {
      if (!userId) throw new Error("not-signed-in");
      const { error } = await supabase.from("labour_applications").insert({ job_id: jobId, labourer_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-applications"] });
      toast.success(lang === "te" ? "దరఖాస్తు పంపబడింది." : "Application sent.");
    },
    onError: (e) =>
      toast.error(e.message === "not-signed-in" ? (lang === "te" ? "ముందుగా సైన్ ఇన్ చేయండి." : "Please sign in first.") : t("genericError")),
  });

  const appliedIds = new Set((myApplications ?? []).map((a) => a.job_id));
  const filteredWorkers = (workers ?? [])
    .map((w) => ({ ...w, score: matchScore(w, workerFilter.district, workerFilter.crop, workerFilter.skill) }))
    .sort((a, b) => b.score - a.score);

  return (
    <AppShell subtitle={lang === "te" ? "కూలీలు & పనులు" : "Labour Connect"}>
      <Tabs defaultValue="jobs">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="jobs">{lang === "te" ? "పనులు" : "Jobs"}</TabsTrigger>
          <TabsTrigger value="workers">{lang === "te" ? "కూలీలు" : "Workers"}</TabsTrigger>
          <TabsTrigger value="post">{lang === "te" ? "పోస్ట్" : "Post work"}</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="pt-4">
          <Input
            placeholder={lang === "te" ? "పని వెతకండి" : "Search jobs"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">{t("loading")}</p>
          ) : jobs?.length ? (
            <div className="mt-4 space-y-3">
              {jobs.map((j) => (
                <Card key={j.id} className="border-border shadow-[var(--shadow-card)]">
                  <CardContent className="space-y-2 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-lg font-bold leading-tight">{j.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {j.village}, {j.district} · {j.crop}
                        </p>
                      </div>
                      <Badge variant={j.status === "open" ? "default" : "secondary"}>{j.status}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">{lang === "te" ? "కూలి" : "Wage"}</p>
                        <p className="font-bold text-primary">₹{Number(j.wage)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{lang === "te" ? "కూలీలు" : "Workers"}</p>
                        <p className="font-semibold">{j.workers_required}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{lang === "te" ? "తేదీ" : "Date"}</p>
                        <p className="font-semibold">{j.work_date ?? "—"}</p>
                      </div>
                    </div>
                    {j.description && <p className="text-sm text-muted-foreground">{j.description}</p>}
                    <p className="text-xs text-muted-foreground">
                      {j.food ? (lang === "te" ? "భోజనం ఉంది" : "Food provided") : lang === "te" ? "భోజనం లేదు" : "No food"} ·{" "}
                      {j.accommodation ? (lang === "te" ? "వసతి ఉంది" : "Stay provided") : lang === "te" ? "వసతి లేదు" : "No stay"}
                    </p>
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={appliedIds.has(j.id) || j.status !== "open" || apply.isPending}
                      onClick={() => apply.mutate(j.id)}
                    >
                      {appliedIds.has(j.id) ? t("applied") : t("apply")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState message={t("noJobs")} />
            </div>
          )}

          {!!myApplications?.length && (
            <>
              <SectionTitle>{lang === "te" ? "నా దరఖాస్తులు" : "My applications"}</SectionTitle>
              <div className="space-y-2">
                {myApplications.map((a) => (
                  <Card key={a.id} className="border-border">
                    <CardContent className="flex items-center justify-between p-3 text-sm">
                      <span>{a.labour_jobs?.title}</span>
                      <Badge variant="secondary">{a.status}</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="workers" className="space-y-3 pt-4">
          <div className="grid grid-cols-3 gap-2">
            <Input
              placeholder={lang === "te" ? "జిల్లా" : "District"}
              value={workerFilter.district}
              onChange={(e) => setWorkerFilter((f) => ({ ...f, district: e.target.value }))}
            />
            <Input
              placeholder={lang === "te" ? "పంట" : "Crop"}
              value={workerFilter.crop}
              onChange={(e) => setWorkerFilter((f) => ({ ...f, crop: e.target.value }))}
            />
            <Input
              placeholder={lang === "te" ? "నైపుణ్యం" : "Skill"}
              value={workerFilter.skill}
              onChange={(e) => setWorkerFilter((f) => ({ ...f, skill: e.target.value }))}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {lang === "te"
              ? "మ్యాచ్ శాతం అనేది వేదిక సూచన మాత్రమే; హామీ కాదు."
              : "Match percentage is a platform recommendation only, not a guarantee of suitability."}
          </p>
          {filteredWorkers.length ? (
            filteredWorkers.map((w) => (
              <Card key={w.user_id} className="border-border">
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{w.profiles?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.profiles?.village}, {w.profiles?.district} · {w.experience_years} yrs
                      </p>
                    </div>
                    <Badge className="bg-success text-success-foreground">{w.score}% Match</Badge>
                  </div>
                  <p className="text-sm">{w.skills.join(", ")}</p>
                  <p className="text-sm text-muted-foreground">
                    ⭐ {Number(w.rating).toFixed(1)} · {w.completed_jobs} jobs · ₹{w.preferred_wage ?? "—"}/day ·{" "}
                    {w.availability}
                  </p>
                  <Button variant="outline" size="lg" className="w-full" onClick={() => toast.info(lang === "te" ? "కూలీ అంగీకరించిన తర్వాత సంప్రదింపు వివరాలు కనిపిస్తాయి." : "Contact details are shared after the worker accepts your request.")}>
                    {lang === "te" ? "కూలీని కోరండి" : "Request worker"}
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState message={t("noWorkers")} />
          )}
        </TabsContent>

        <TabsContent value="post" className="pt-4">
          <PostJobForm defaultDistrict={profile?.district ?? ""} defaultVillage={profile?.village ?? ""} canPost={!!userId && (hasRole("farmer") || !userId)} />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function PostJobForm({ defaultDistrict, defaultVillage, canPost }: { defaultDistrict: string; defaultVillage: string; canPost: boolean }) {
  const { lang, t } = useI18n();
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const [f, setF] = useState({
    title: "",
    category: "harvesting",
    crop: "",
    workers_required: "1",
    work_date: "",
    duration: "",
    wage: "",
    wage_type: "per_day",
    state: "Telangana",
    district: defaultDistrict,
    village: defaultVillage,
    description: "",
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));

  const post = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("not-signed-in");
      if (!f.title.trim() || !f.wage) throw new Error("invalid");
      const { error } = await supabase.from("labour_jobs").insert({
        farmer_id: userId,
        title: f.title.trim().slice(0, 120),
        category: f.category,
        crop: f.crop,
        workers_required: Number(f.workers_required || 1),
        work_date: f.work_date || null,
        duration: f.duration,
        wage: Number(f.wage),
        wage_type: f.wage_type,
        state: f.state,
        district: f.district,
        village: f.village,
        description: f.description.slice(0, 1000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success(lang === "te" ? "పని పోస్ట్ అయ్యింది." : "Labour requirement posted.");
      setF((p) => ({ ...p, title: "", crop: "", wage: "", description: "" }));
    },
    onError: (e) => {
      if (e.message === "not-signed-in") toast.error(lang === "te" ? "ముందుగా సైన్ ఇన్ చేయండి." : "Please sign in first.");
      else if (e.message === "invalid") toast.error(lang === "te" ? "శీర్షిక మరియు కూలి ఇవ్వండి." : "Please enter a title and wage.");
      else toast.error(t("genericError"));
    },
  });

  return (
    <Card className="border-border">
      <CardContent className="space-y-3 p-4">
        <div>
          <Label className="field-label">{lang === "te" ? "పని శీర్షిక" : "Work title"}</Label>
          <Input value={f.title} onChange={set("title")} placeholder="Need 8 workers for chilli harvesting" maxLength={120} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="field-label">{lang === "te" ? "విభాగం" : "Category"}</Label>
            <Input value={f.category} onChange={set("category")} />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "పంట" : "Crop"}</Label>
            <Input value={f.crop} onChange={set("crop")} />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "కూలీల సంఖ్య" : "Workers required"}</Label>
            <Input value={f.workers_required} onChange={set("workers_required")} inputMode="numeric" />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "తేదీ" : "Work date"}</Label>
            <Input type="date" value={f.work_date} onChange={set("work_date")} />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "కూలి (₹)" : "Wage (₹)"}</Label>
            <Input value={f.wage} onChange={set("wage")} inputMode="numeric" />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "వ్యవధి" : "Duration"}</Label>
            <Input value={f.duration} onChange={set("duration")} placeholder="3 days" />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "జిల్లా" : "District"}</Label>
            <Input value={f.district} onChange={set("district")} />
          </div>
          <div>
            <Label className="field-label">{lang === "te" ? "గ్రామం" : "Village"}</Label>
            <Input value={f.village} onChange={set("village")} />
          </div>
        </div>
        <div>
          <Label className="field-label">{lang === "te" ? "వివరణ" : "Description"}</Label>
          <Textarea value={f.description} onChange={set("description")} maxLength={1000} />
        </div>
        <Button size="lg" className="w-full" disabled={post.isPending || !canPost} onClick={() => post.mutate()}>
          {t("postJob")}
        </Button>
      </CardContent>
    </Card>
  );
}

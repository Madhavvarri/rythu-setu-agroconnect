import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ProductList } from "@/components/ProductList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/organic")({
  head: () => ({
    meta: [
      { title: "Organic Store — Seeds & Natural Fertilizers | RythuSetu" },
      {
        name: "description",
        content: "Buy organic seeds, cow dung manure, vermicompost and other natural farming inputs from verified sellers on RythuSetu.",
      },
      { property: "og:title", content: "Organic Store — Seeds & Natural Fertilizers | RythuSetu" },
      { property: "og:description", content: "Organic seeds and natural fertilizers for Indian farms, priced in rupees." },
    ],
  }),
  component: OrganicPage,
});

const cats = [
  { slug: "all", en: "All", te: "అన్నీ" },
  { slug: "organic-seeds", en: "Organic Seeds", te: "సేంద్రియ విత్తనాలు" },
  { slug: "natural-fertilizers", en: "Natural Fertilizers", te: "సహజ ఎరువులు" },
];

function OrganicPage() {
  const { lang, t } = useI18n();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  return (
    <AppShell subtitle={t("organicStore")}>
      <h1 className="mb-3 font-display text-2xl font-bold">{t("organicStore")}</h1>
      <Input placeholder={lang === "te" ? "వెతకండి" : "Search seeds & fertilizers"} value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="my-3 flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
          <Button key={c.slug} variant={cat === c.slug ? "default" : "outline"} size="sm" onClick={() => setCat(c.slug)}>
            {lang === "te" ? c.te : c.en}
          </Button>
        ))}
      </div>
      <ProductList type="organic" search={search} categorySlug={cat} />
      <p className="mt-6 text-xs text-muted-foreground">
        {lang === "te"
          ? "ఉత్పత్తి వివరాలు విక్రేత అందించినవి. దిగుబడి హామీ ఇవ్వబడదు. వాడకం ముందు సూచనలు చదవండి."
          : "Product information is provided by sellers. No yield or result is guaranteed. Read usage instructions before applying."}
      </p>
    </AppShell>
  );
}

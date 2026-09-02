import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { ProductList } from "@/components/ProductList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/market")({
  head: () => ({
    meta: [
      { title: "Farm Market — Vegetables, Eggs & Chicken | RythuSetu" },
      {
        name: "description",
        content: "Buy fresh vegetables, country eggs and chicken directly from verified local sellers on RythuSetu. Prices in ₹.",
      },
      { property: "og:title", content: "Farm Market — Vegetables, Eggs & Chicken | RythuSetu" },
      { property: "og:description", content: "Fresh farm produce from verified local sellers, priced in rupees." },
    ],
  }),
  component: MarketPage,
});

const cats = [
  { slug: "all", en: "All", te: "అన్నీ" },
  { slug: "vegetables", en: "Vegetables", te: "కూరగాయలు" },
  { slug: "eggs", en: "Eggs", te: "గుడ్లు" },
  { slug: "chicken", en: "Chicken", te: "చికెన్" },
];

function MarketPage() {
  const { lang, t } = useI18n();
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");

  return (
    <AppShell subtitle={t("farmMarket")}>
      <h1 className="mb-3 font-display text-2xl font-bold">{t("farmMarket")}</h1>
      <Input placeholder={lang === "te" ? "ఉత్పత్తి వెతకండి" : "Search products"} value={search} onChange={(e) => setSearch(e.target.value)} />
      <div className="my-3 flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
          <Button key={c.slug} variant={cat === c.slug ? "default" : "outline"} size="sm" onClick={() => setCat(c.slug)}>
            {lang === "te" ? c.te : c.en}
          </Button>
        ))}
      </div>
      <ProductList type="market" search={search} categorySlug={cat} />
      <p className="mt-6 text-xs text-muted-foreground">
        {lang === "te"
          ? "ఉత్పత్తులు విక్రేతలు అందించినవి. తాజాదనం, నాణ్యత సంబంధిత వివరాలు విక్రేత బాధ్యత."
          : "Products are listed by independent sellers. Quality, freshness and applicable food regulations are the seller's responsibility."}
      </p>
    </AppShell>
  );
}

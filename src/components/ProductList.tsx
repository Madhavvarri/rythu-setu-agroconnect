import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export type ProductRow = {
  id: string;
  name: string;
  name_te: string | null;
  description: string | null;
  benefits: string | null;
  usage_instructions: string | null;
  price: number;
  unit: string;
  stock: number;
  location: string | null;
  rating: number;
  is_demo: boolean;
  categories: { name: string; name_te: string | null; slug: string } | null;
  profiles: { full_name: string } | null;
};

export function useProducts(type: "market" | "organic", search: string, categorySlug: string) {
  return useQuery({
    queryKey: ["products", type, search, categorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories!inner(name, name_te, slug, type), profiles!products_seller_id_fkey(full_name)")
        .eq("approval_status", "approved")
        .eq("status", "active")
        .eq("categories.type", type)
        .order("created_at", { ascending: false });
      if (categorySlug !== "all") query = query.eq("categories.slug", categorySlug);
      if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as ProductRow[];
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { userId } = useSession();
  return useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      if (!userId) throw new Error("not-signed-in");
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", userId)
        .eq("product_id", productId)
        .maybeSingle();
      if (existing) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity: Number(existing.quantity) + quantity })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("cart_items")
          .insert({ user_id: userId, product_id: productId, quantity });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart");
    },
    onError: (error) => {
      toast.error(error.message === "not-signed-in" ? "Please sign in to shop." : "Something went wrong. Please try again.");
    },
  });
}

export function ProductList({ type, search, categorySlug }: { type: "market" | "organic"; search: string; categorySlug: string }) {
  const { lang, t } = useI18n();
  const { data, isLoading } = useProducts(type, search, categorySlug);
  const addToCart = useAddToCart();
  const { userId } = useSession();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (!data?.length) return <EmptyState message={lang === "te" ? "ఉత్పత్తులు కనిపించలేదు." : "No products found."} />;

  return (
    <div className="grid grid-cols-2 gap-3">
      {data.map((p) => (
        <Card key={p.id} className="overflow-hidden border-border shadow-[var(--shadow-card)]">
          <div className="flex h-24 items-center justify-center bg-secondary text-3xl">🌾</div>
          <CardContent className="space-y-1 p-3">
            <div className="flex items-start justify-between gap-1">
              <p className="font-semibold leading-tight">{lang === "te" && p.name_te ? p.name_te : p.name}</p>
              {p.is_demo && (
                <Badge variant="secondary" className="shrink-0 text-[0.6rem]">
                  {t("demoData")}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{p.profiles?.full_name}</p>
            <p className="text-xs text-muted-foreground">{p.location}</p>
            <p className="text-lg font-bold text-primary">
              ₹{Number(p.price).toLocaleString("en-IN")}
              <span className="text-xs font-normal text-muted-foreground"> / {p.unit}</span>
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3 fill-harvest text-harvest" /> {Number(p.rating).toFixed(1)} ·{" "}
              {Number(p.stock) > 0 ? `${Number(p.stock)} ${p.unit}` : t("outOfStock")}
            </p>
            {p.benefits && <p className="text-xs text-muted-foreground">{p.benefits}</p>}
            <Button
              className="mt-2 w-full"
              size="lg"
              disabled={Number(p.stock) <= 0 || addToCart.isPending}
              onClick={() => addToCart.mutate({ productId: p.id })}
            >
              {t("addToCart")}
            </Button>
            {!userId && (
              <Link to="/auth" className="block text-center text-xs text-muted-foreground underline">
                {t("signIn")}
              </Link>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

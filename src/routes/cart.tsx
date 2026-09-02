import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

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

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Cart & Orders — RythuSetu" },
      { name: "description", content: "Review your cart, place orders in ₹ and track order status on RythuSetu." },
      { property: "og:title", content: "Cart & Orders — RythuSetu" },
      { property: "og:description", content: "Checkout farm produce and organic inputs and track your orders." },
    ],
  }),
  component: CartPage,
});

const DELIVERY_FEE = 40;

function CartPage() {
  const { lang, t } = useI18n();
  const { userId } = useSession();
  const queryClient = useQueryClient();
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [accepted, setAccepted] = useState(false);

  const { data: items } = useQuery({
    queryKey: ["cart", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, products(id, name, price, unit, seller_id, stock)")
        .eq("user_id", userId!);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(product_name, quantity, price)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("cart_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const subtotal = (items ?? []).reduce((sum, i) => sum + Number(i.products?.price ?? 0) * Number(i.quantity), 0);
  const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  const placeOrder = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("not-signed-in");
      if (!items?.length) throw new Error("empty");
      if (!address.trim() || !phone.trim()) throw new Error("invalid");
      if (!accepted) throw new Error("terms");
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          subtotal,
          delivery_fee: DELIVERY_FEE,
          total,
          payment_method: paymentMethod,
          payment_status: paymentMethod === "cod" ? "pending" : "pending",
          order_status: "pending",
          address: address.trim().slice(0, 500),
          phone: phone.trim().slice(0, 15),
        })
        .select("id")
        .single();
      if (error) throw error;
      const rows = items.map((i) => ({
        order_id: order.id,
        product_id: i.product_id,
        seller_id: i.products?.seller_id ?? null,
        product_name: i.products?.name ?? "",
        quantity: Number(i.quantity),
        price: Number(i.products?.price ?? 0),
      }));
      const { error: itemErr } = await supabase.from("order_items").insert(rows);
      if (itemErr) throw itemErr;
      const { error: clearErr } = await supabase.from("cart_items").delete().eq("user_id", userId);
      if (clearErr) throw clearErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(lang === "te" ? "ఆర్డర్ నమోదైంది." : "Order placed.");
    },
    onError: (e) => {
      const map: Record<string, string> = {
        "not-signed-in": lang === "te" ? "ముందుగా సైన్ ఇన్ చేయండి." : "Please sign in first.",
        empty: lang === "te" ? "కార్ట్ ఖాళీగా ఉంది." : "Your cart is empty.",
        invalid: lang === "te" ? "చిరునామా, ఫోన్ నంబర్ ఇవ్వండి." : "Please enter a delivery address and phone number.",
        terms: lang === "te" ? "నిబంధనలను అంగీకరించండి." : "Please accept the terms to continue.",
      };
      toast.error(map[e.message] ?? t("genericError"));
    },
  });

  return (
    <AppShell subtitle={t("cart")}>
      <h1 className="mb-3 font-display text-2xl font-bold">{t("cart")}</h1>
      {items?.length ? (
        <div className="space-y-2">
          {items.map((i) => (
            <Card key={i.id} className="border-border">
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex-1">
                  <p className="font-semibold">{i.products?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Number(i.quantity)} × ₹{Number(i.products?.price)} / {i.products?.unit}
                  </p>
                </div>
                <p className="font-bold text-primary">₹{Number(i.products?.price ?? 0) * Number(i.quantity)}</p>
                <Button variant="ghost" size="icon" onClick={() => removeItem.mutate(i.id)} aria-label="Remove">
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
          <Card className="border-border">
            <CardContent className="space-y-1 p-4 text-sm">
              <div className="flex justify-between">
                <span>{lang === "te" ? "మొత్తం" : "Subtotal"}</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === "te" ? "డెలివరీ" : "Delivery fee"}</span>
                <span>₹{DELIVERY_FEE}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>{lang === "te" ? "చెల్లించాల్సినది" : "Total"}</span>
                <span>₹{total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="space-y-3 p-4">
              <div>
                <Label className="field-label">{lang === "te" ? "డెలివరీ చిరునామా" : "Delivery address"}</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} maxLength={500} />
              </div>
              <div>
                <Label className="field-label">{lang === "te" ? "ఫోన్ నంబర్" : "Phone number"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" maxLength={15} />
              </div>
              <div>
                <Label className="field-label">{lang === "te" ? "చెల్లింపు విధానం" : "Payment method"}</Label>
                <select
                  className="h-11 w-full rounded-md border border-input bg-background px-2"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="cod">Cash on Delivery</option>
                  <option value="upi">UPI (gateway not configured)</option>
                  <option value="card">Card (gateway not configured)</option>
                  <option value="netbanking">Net Banking (gateway not configured)</option>
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lang === "te"
                    ? "ఆన్‌లైన్ చెల్లింపులకు పేమెంట్ గేట్‌వే కాన్ఫిగర్ చేయాలి. కార్డు వివరాలు యాప్‌లో నిల్వ చేయబడవు."
                    : "Online payments need a payment gateway to be configured. Card details are never stored in this app."}
                </p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 size-4" />
                <span>
                  {lang === "te" ? "నేను నిబంధనలను అంగీకరిస్తున్నాను." : "I accept the terms and conditions."}
                </span>
              </label>
              <Button size="lg" className="w-full" disabled={placeOrder.isPending} onClick={() => placeOrder.mutate()}>
                {lang === "te" ? "ఆర్డర్ ఇవ్వండి" : "Place order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "కార్ట్ ఖాళీగా ఉంది." : "Your cart is empty."} />
      )}

      {!!orders?.length && (
        <>
          <SectionTitle>{lang === "te" ? "నా ఆర్డర్లు" : "My orders"}</SectionTitle>
          <div className="space-y-2">
            {orders.map((o) => (
              <Card key={o.id} className="border-border">
                <CardContent className="space-y-1 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">₹{Number(o.total)}</span>
                    <Badge variant="secondary">{o.order_status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {o.order_items?.map((it) => `${it.product_name} ×${Number(it.quantity)}`).join(", ")}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}

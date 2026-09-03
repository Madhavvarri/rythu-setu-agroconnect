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
import {
  CANCEL_REASONS,
  COMPLAINT_CATEGORIES,
  label,
  PAYMENT_METHODS,
  PAYMENT_STATUS_LABEL,
  pick,
  RESCHEDULE_REASONS,
  rupees,
  STATUS_LABEL,
} from "@/lib/farming-services";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/session";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Service Bookings — RythuSetu" },
      {
        name: "description",
        content: "Track your farming service requests, quotations, bookings, payments and reviews in one place.",
      },
      { property: "og:title", content: "My Service Bookings — RythuSetu" },
      { property: "og:description", content: "Track farming service requests, quotes, bookings and payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BookingsPage,
});

const selectCls = "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm font-medium";

function BookingsPage() {
  const { t, lang } = useI18n();
  const { userId } = useSession();
  const qc = useQueryClient();
  const [chatFor, setChatFor] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const { data: requests } = useQuery({
    queryKey: ["my-requests", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*, services(name, name_te), service_quotes(*, service_providers(id, business_name, rating))")
        .eq("farmer_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: bookings } = useQuery({
    queryKey: ["my-bookings", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_bookings")
        .select("*, services(name, name_te), service_providers(business_name)")
        .eq("farmer_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["booking-messages", chatFor],
    enabled: !!chatFor,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_messages")
        .select("id, message, sender_id, created_at")
        .eq("booking_id", chatFor!)
        .order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["my-requests"] });
    qc.invalidateQueries({ queryKey: ["my-bookings"] });
  };

  const acceptQuote = useMutation({
    mutationFn: async (quote: any) => {
      const { error: qe } = await supabase
        .from("service_quotes")
        .update({ status: "accepted", locked: true })
        .eq("id", quote.id);
      if (qe) throw qe;
      const req = (requests ?? []).find((r) => r.id === quote.request_id);
      const { data: setting } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "service_commission_percent")
        .maybeSingle();
      const percent = Number(setting?.value ?? 0);
      const total = Number(quote.total);
      const commission = Math.round((total * percent) / 100);
      const { error: be } = await supabase.from("service_bookings").insert({
        request_id: quote.request_id,
        quote_id: quote.id,
        provider_id: quote.provider_id,
        farmer_id: userId!,
        service_id: req?.service_id ?? null,
        booking_date: req?.preferred_date ?? null,
        start_time: req?.preferred_time ?? null,
        location: [req?.village, req?.mandal, req?.district].filter(Boolean).join(", "),
        farm_size_acres: req?.farm_size_acres ?? null,
        agreed_price: total,
        commission_percent: percent,
        commission_amount: commission,
        provider_payout: total - commission,
        booking_status: "confirmed",
      });
      if (be) throw be;
      await supabase.from("service_requests").update({ status: "farmer_accepted" }).eq("id", quote.request_id);
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "బుకింగ్ నిర్ధారించబడింది." : "Booking confirmed.");
      invalidate();
    },
    onError: () => toast.error(t("genericError")),
  });

  const rejectQuote = useMutation({
    mutationFn: async (quoteId: string) => {
      const { error } = await supabase.from("service_quotes").update({ status: "rejected" }).eq("id", quoteId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: () => toast.error(t("genericError")),
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, unknown> }) => {
      const { error } = await supabase.from("service_bookings").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "నవీకరించబడింది." : "Updated.");
      invalidate();
    },
    onError: () => toast.error(t("genericError")),
  });

  const sendMessage = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("booking_messages")
        .insert({ booking_id: chatFor!, sender_id: userId!, message: msg.slice(0, 1000) });
      if (error) throw error;
    },
    onSuccess: () => {
      setMsg("");
      qc.invalidateQueries({ queryKey: ["booking-messages", chatFor] });
    },
    onError: () => toast.error(t("genericError")),
  });

  const review = useMutation({
    mutationFn: async ({ booking, rating, comment }: { booking: any; rating: number; comment: string }) => {
      const { error } = await supabase.from("service_reviews").insert({
        booking_id: booking.id,
        reviewer_id: userId!,
        provider_id: booking.provider_id,
        direction: "farmer_to_provider",
        rating,
        comment: comment.slice(0, 1000),
      });
      if (error) throw error;
      await supabase.from("service_bookings").update({ booking_status: "reviewed" }).eq("id", booking.id);
    },
    onSuccess: () => {
      toast.success(lang === "te" ? "ధన్యవాదాలు!" : "Thank you for your review.");
      invalidate();
    },
    onError: () => toast.error(t("genericError")),
  });

  const complaint = useMutation({
    mutationFn: async ({ bookingId, category, description }: { bookingId: string; category: string; description: string }) => {
      const { error } = await supabase
        .from("service_complaints")
        .insert({ booking_id: bookingId, reporter_id: userId!, category, description: description.slice(0, 2000) });
      if (error) throw error;
    },
    onSuccess: () => toast.success(lang === "te" ? "ఫిర్యాదు నమోదైంది." : "Complaint submitted."),
    onError: () => toast.error(t("genericError")),
  });

  if (!userId) {
    return (
      <AppShell subtitle={t("myBookings")}>
        <Card className="border-border">
          <CardContent className="space-y-3 p-6 text-center">
            <p>{lang === "te" ? "బుకింగ్‌లు చూడటానికి సైన్ ఇన్ చేయండి." : "Sign in to view your bookings."}</p>
            <Button asChild className="w-full">
              <Link to="/auth">{t("signIn")}</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell subtitle={t("myBookings")}>
      <h1 className="font-display text-2xl font-bold">{t("myBookings")}</h1>
      <Button asChild variant="outline" className="mt-3 h-11 w-full">
        <Link to="/services">{t("findService")}</Link>
      </Button>

      <SectionTitle>{lang === "te" ? "నా అభ్యర్థనలు & కొటేషన్లు" : "My requests & quotations"}</SectionTitle>
      {requests?.length ? (
        <div className="space-y-3">
          {requests.map((r: any) => (
            <Card key={r.id} className="border-border">
              <CardContent className="space-y-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-bold">
                      {r.title || (lang === "te" && r.services?.name_te ? r.services.name_te : r.services?.name) || t("farmingServices")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {r.request_code} · {r.crop ?? "—"} · {r.farm_size_acres ?? "—"} {lang === "te" ? "ఎకరాలు" : "acres"} ·{" "}
                      {r.preferred_date ?? "—"}
                    </p>
                  </div>
                  <Badge variant="outline">{label(STATUS_LABEL, r.status, lang)}</Badge>
                </div>
                {r.is_urgent && <Badge className="bg-harvest text-soil">{t("urgent")}</Badge>}
                {r.description && <p className="text-muted-foreground">{r.description}</p>}

                {(r.service_quotes ?? []).map((q: any) => (
                  <div key={q.id} className="rounded-xl border border-border p-3">
                    <p className="font-semibold">{q.service_providers?.business_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {lang === "te" ? "సేవా ఛార్జి" : "Service"} {rupees(q.base_price)} ·{" "}
                      {lang === "te" ? "రవాణా" : "Transport"} {rupees(q.transport_fee)} ·{" "}
                      {lang === "te" ? "అదనపు" : "Additional"} {rupees(q.additional_fee)}
                    </p>
                    <p className="font-bold text-primary">
                      {lang === "te" ? "మొత్తం" : "Total"} {rupees(q.total)}
                    </p>
                    {q.notes && <p className="text-xs text-muted-foreground">{q.notes}</p>}
                    <Badge variant="outline" className="mt-1">
                      {q.status}
                    </Badge>
                    {q.status === "sent" && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button size="sm" className="h-10" onClick={() => acceptQuote.mutate(q)}>
                          {t("acceptQuote")}
                        </Button>
                        <Button size="sm" variant="outline" className="h-10" onClick={() => rejectQuote.mutate(q.id)}>
                          {t("rejectQuote")}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {r.status === "requested" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-10"
                    onClick={() =>
                      supabase
                        .from("service_requests")
                        .update({ status: "cancelled" })
                        .eq("id", r.id)
                        .then(() => invalidate())
                    }
                  >
                    {lang === "te" ? "అభ్యర్థన రద్దు" : "Cancel request"}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "ఇంకా అభ్యర్థనలు లేవు." : "No service requests yet."} />
      )}

      <SectionTitle>{lang === "te" ? "బుకింగ్‌లు" : "Bookings"}</SectionTitle>
      {bookings?.length ? (
        <div className="space-y-3">
          {bookings.map((b: any) => (
            <BookingCard
              key={b.id}
              b={b}
              lang={lang}
              t={t}
              onUpdate={(patch) => updateBooking.mutate({ id: b.id, patch })}
              onChat={() => setChatFor(chatFor === b.id ? null : b.id)}
              chatOpen={chatFor === b.id}
              messages={messages ?? []}
              msg={msg}
              setMsg={setMsg}
              onSend={() => msg.trim() && sendMessage.mutate()}
              onReview={(rating, comment) => review.mutate({ booking: b, rating, comment })}
              onComplaint={(category, description) => complaint.mutate({ bookingId: b.id, category, description })}
              userId={userId}
            />
          ))}
        </div>
      ) : (
        <EmptyState message={lang === "te" ? "ఇంకా బుకింగ్‌లు లేవు." : "No bookings yet."} />
      )}

      <p className="mt-6 rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        {t("servicesDisclaimer")}
      </p>
    </AppShell>
  );
}

function BookingCard(props: {
  b: any;
  lang: "en" | "te";
  t: (k: any) => string;
  userId: string;
  chatOpen: boolean;
  messages: any[];
  msg: string;
  setMsg: (v: string) => void;
  onSend: () => void;
  onChat: () => void;
  onUpdate: (patch: Record<string, unknown>) => void;
  onReview: (rating: number, comment: string) => void;
  onComplaint: (category: string, description: string) => void;
}) {
  const { b, lang, t } = props;
  const [cancelReason, setCancelReason] = useState("change_of_plan");
  const [rescheduleReason, setRescheduleReason] = useState("rain");
  const [payMethod, setPayMethod] = useState("upi");
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [cCat, setCCat] = useState("service_quality");
  const [cDesc, setCDesc] = useState("");

  const canCancel = !["completed", "farmer_confirmed", "paid", "reviewed", "cancelled"].includes(b.booking_status);

  return (
    <Card className="border-border">
      <CardContent className="space-y-2 p-4 text-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-base font-bold">
              {lang === "te" && b.services?.name_te ? b.services.name_te : b.services?.name ?? t("farmingServices")}
            </p>
            <p className="text-xs text-muted-foreground">
              {b.booking_code} · {b.service_providers?.business_name} · {b.booking_date ?? "—"} · {b.location || "—"}
            </p>
          </div>
          <Badge>{label(STATUS_LABEL, b.booking_status, lang)}</Badge>
        </div>
        <p className="font-bold text-primary">
          {lang === "te" ? "ఒప్పంద ధర" : "Agreed price"} {rupees(b.agreed_price)} ·{" "}
          <span className="font-normal text-muted-foreground">
            {label(PAYMENT_STATUS_LABEL, b.payment_status, lang)}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="h-10" onClick={props.onChat}>
            {t("chat")}
          </Button>
          {b.booking_status === "completed" && (
            <Button size="sm" className="h-10" onClick={() => props.onUpdate({ booking_status: "farmer_confirmed" })}>
              {t("confirmCompletion")}
            </Button>
          )}
        </div>

        {props.chatOpen && (
          <div className="rounded-xl border border-border p-2">
            <div className="max-h-40 space-y-1 overflow-y-auto text-xs">
              {props.messages.map((m) => (
                <p key={m.id} className={m.sender_id === props.userId ? "text-right" : ""}>
                  <span className="inline-block rounded-lg bg-muted px-2 py-1">{m.message}</span>
                </p>
              ))}
              {!props.messages.length && (
                <p className="text-muted-foreground">{lang === "te" ? "సందేశాలు లేవు." : "No messages yet."}</p>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <Input className="h-10" value={props.msg} onChange={(e) => props.setMsg(e.target.value)} />
              <Button size="sm" className="h-10" onClick={props.onSend}>
                {t("sendMessage")}
              </Button>
            </div>
          </div>
        )}

        {b.booking_status === "farmer_confirmed" && b.payment_status !== "paid" && (
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 font-semibold">{t("payNow")}</p>
            <select className={selectCls} value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {lang === "te" ? m.te : m.en}
                </option>
              ))}
            </select>
            <Button
              className="mt-2 h-11 w-full"
              onClick={() =>
                payMethod === "cash"
                  ? props.onUpdate({ payment_method: payMethod, payment_status: "paid", booking_status: "paid" })
                  : toast.info(
                      lang === "te"
                        ? "ఆన్‌లైన్ చెల్లింపు గేట్‌వే ఇంకా అనుసంధానించలేదు. కార్డు వివరాలు యాప్‌లో నిల్వ చేయబడవు."
                        : "The online payment gateway is not connected yet. Card details are never stored in RythuSetu.",
                    )
              }
            >
              {t("payNow")}
            </Button>
          </div>
        )}

        {["paid", "farmer_confirmed"].includes(b.booking_status) && (
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 font-semibold">{t("rateProvider")}</p>
            <select className={selectCls} value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {"★".repeat(r)}
                </option>
              ))}
            </select>
            <Textarea className="mt-2" rows={2} value={comment} onChange={(e) => setComment(e.target.value)} />
            <Button className="mt-2 h-11 w-full" onClick={() => props.onReview(Number(rating), comment)}>
              {t("rateProvider")}
            </Button>
          </div>
        )}

        {canCancel && (
          <div className="grid gap-2 rounded-xl border border-border p-3">
            <select className={selectCls} value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)}>
              {RESCHEDULE_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {lang === "te" ? r.te : r.en}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              className="h-10"
              onClick={() =>
                props.onUpdate({ reschedule_reason: rescheduleReason, reschedule_requested_by: "farmer" })
              }
            >
              {t("reschedule")}
            </Button>
            <select className={selectCls} value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}>
              {CANCEL_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {lang === "te" ? r.te : r.en}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              className="h-10"
              onClick={() =>
                props.onUpdate({
                  booking_status: "cancelled",
                  cancelled_by: "farmer",
                  cancellation_reason: pick(CANCEL_REASONS, cancelReason, lang),
                })
              }
            >
              {t("cancelBooking")}
            </Button>
          </div>
        )}

        <details className="rounded-xl border border-border p-3">
          <summary className="cursor-pointer font-semibold">{t("raiseComplaint")}</summary>
          <select className={`${selectCls} mt-2`} value={cCat} onChange={(e) => setCCat(e.target.value)}>
            {COMPLAINT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {lang === "te" ? c.te : c.en}
              </option>
            ))}
          </select>
          <Textarea className="mt-2" rows={2} value={cDesc} onChange={(e) => setCDesc(e.target.value)} />
          <Button
            className="mt-2 h-10 w-full"
            variant="outline"
            disabled={!cDesc.trim()}
            onClick={() => props.onComplaint(cCat, cDesc)}
          >
            {t("raiseComplaint")}
          </Button>
        </details>
      </CardContent>
    </Card>
  );
}

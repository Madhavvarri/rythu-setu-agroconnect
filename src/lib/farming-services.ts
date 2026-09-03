import type { Lang } from "@/lib/i18n";

/** Booking lifecycle used across the Farming Services module. */
export const BOOKING_FLOW = [
  "requested",
  "provider_reviewing",
  "quoted",
  "farmer_accepted",
  "confirmed",
  "on_the_way",
  "started",
  "completed",
  "farmer_confirmed",
  "paid",
  "reviewed",
] as const;

export type BookingStatus = (typeof BOOKING_FLOW)[number] | "cancelled" | "rejected";

export const STATUS_LABEL: Record<string, { en: string; te: string }> = {
  requested: { en: "Request sent", te: "అభ్యర్థన పంపబడింది" },
  provider_reviewing: { en: "Provider reviewing", te: "సేవాదారు పరిశీలిస్తున్నారు" },
  quoted: { en: "Quotation sent", te: "కొటేషన్ పంపబడింది" },
  farmer_accepted: { en: "Farmer accepted", te: "రైతు ఆమోదించారు" },
  confirmed: { en: "Booking confirmed", te: "బుకింగ్ నిర్ధారించబడింది" },
  on_the_way: { en: "Provider on the way", te: "సేవాదారు వస్తున్నారు" },
  started: { en: "Service started", te: "సేవ ప్రారంభమైంది" },
  completed: { en: "Service completed", te: "సేవ పూర్తయింది" },
  farmer_confirmed: { en: "Farmer confirmed", te: "రైతు నిర్ధారించారు" },
  paid: { en: "Payment completed", te: "చెల్లింపు పూర్తయింది" },
  reviewed: { en: "Reviewed", te: "సమీక్షించారు" },
  cancelled: { en: "Cancelled", te: "రద్దు చేయబడింది" },
  rejected: { en: "Rejected", te: "తిరస్కరించబడింది" },
};

export const PAYMENT_STATUS_LABEL: Record<string, { en: string; te: string }> = {
  pending: { en: "Pending", te: "పెండింగ్" },
  authorized: { en: "Authorized", te: "ఆథరైజ్డ్" },
  paid: { en: "Paid", te: "చెల్లించారు" },
  failed: { en: "Failed", te: "విఫలమైంది" },
  refunded: { en: "Refunded", te: "వాపసు" },
};

export const PAYMENT_METHODS = [
  { value: "upi", en: "UPI", te: "UPI" },
  { value: "card", en: "Credit / Debit card", te: "క్రెడిట్ / డెబిట్ కార్డ్" },
  { value: "netbanking", en: "Net banking", te: "నెట్ బ్యాంకింగ్" },
  { value: "cash", en: "Cash to provider", te: "సేవాదారుకి నగదు" },
] as const;

export const CANCEL_REASONS = [
  { value: "change_of_plan", en: "Change of plan", te: "ప్రణాళిక మార్పు" },
  { value: "weather", en: "Weather", te: "వాతావరణం" },
  { value: "equipment_unavailable", en: "Equipment unavailable", te: "పరికరాలు అందుబాటులో లేవు" },
  { value: "provider_unavailable", en: "Provider unavailable", te: "సేవాదారు అందుబాటులో లేరు" },
  { value: "incorrect_booking", en: "Incorrect booking", te: "తప్పు బుకింగ్" },
  { value: "emergency", en: "Emergency", te: "అత్యవసరం" },
  { value: "other", en: "Other", te: "ఇతర" },
] as const;

export const RESCHEDULE_REASONS = [
  { value: "rain", en: "Rain", te: "వర్షం" },
  { value: "bad_weather", en: "Bad weather", te: "చెడు వాతావరణం" },
  { value: "equipment_problem", en: "Equipment problem", te: "పరికరాల సమస్య" },
  { value: "labour_shortage", en: "Labour shortage", te: "కూలీల కొరత" },
  { value: "farm_not_ready", en: "Farm not ready", te: "పొలం సిద్ధంగా లేదు" },
  { value: "other", en: "Other", te: "ఇతర" },
] as const;

export const COMPLAINT_CATEGORIES = [
  { value: "service_quality", en: "Service quality", te: "సేవా నాణ్యత" },
  { value: "pricing", en: "Pricing issue", te: "ధర సమస్య" },
  { value: "no_show", en: "Provider did not arrive", te: "సేవాదారు రాలేదు" },
  { value: "damage", en: "Crop or property damage", te: "పంట/ఆస్తి నష్టం" },
  { value: "behaviour", en: "Behaviour", te: "ప్రవర్తన" },
  { value: "payment", en: "Payment issue", te: "చెల్లింపు సమస్య" },
  { value: "other", en: "Other", te: "ఇతర" },
] as const;

export const PRICING_UNITS = [
  { value: "per_acre", en: "per acre", te: "ఎకరానికి" },
  { value: "per_hour", en: "per hour", te: "గంటకు" },
  { value: "per_day", en: "per day", te: "రోజుకి" },
  { value: "per_task", en: "per task", te: "పనికి" },
  { value: "per_quintal", en: "per quintal", te: "క్వింటాల్‌కి" },
  { value: "quote", en: "on quotation", te: "కొటేషన్ ప్రకారం" },
] as const;

export const VERIFICATION_LEVELS = [
  { value: "unverified", en: "Unverified", te: "ధృవీకరించలేదు" },
  { value: "basic", en: "Basic Verified", te: "ప్రాథమిక ధృవీకరణ" },
  { value: "document", en: "Document Verified", te: "పత్రాలు ధృవీకరించబడ్డాయి" },
  { value: "trusted", en: "Highly Trusted", te: "అత్యంత విశ్వసనీయం" },
] as const;

export const DISTANCE_FILTERS = [5, 10, 25, 50] as const;

export function label(map: Record<string, { en: string; te: string }>, key: string | null | undefined, lang: Lang) {
  if (!key) return "";
  return map[key]?.[lang] ?? map[key]?.en ?? key;
}

export function pick<T extends { value: string; en: string; te: string }>(list: readonly T[], value: string, lang: Lang) {
  const found = list.find((i) => i.value === value);
  return found ? (lang === "te" ? found.te : found.en) : value;
}

export function rupees(n: number | null | undefined) {
  if (n === null || n === undefined) return "—";
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

type MatchInput = {
  rating: number;
  ratingCount: number;
  experienceYears: number;
  completedJobs: number;
  responseRate: number;
  availabilityStatus: string;
  sameDistrict: boolean;
  sameMandal: boolean;
  offersService: boolean;
};

/**
 * RythuSetu Recommendation Score — a transparent, platform-only heuristic.
 * It is NOT a professional assessment or a guarantee of service quality.
 */
export function recommendationScore(i: MatchInput): number {
  let score = 40;
  if (i.offersService) score += 12;
  if (i.sameMandal) score += 14;
  else if (i.sameDistrict) score += 8;
  if (i.availabilityStatus === "available") score += 10;
  score += Math.min(12, (i.rating / 5) * 12 * (i.ratingCount > 0 ? 1 : 0.4));
  score += Math.min(8, i.experienceYears);
  score += Math.min(8, i.completedJobs / 5);
  score += Math.min(6, (i.responseRate / 100) * 6);
  return Math.max(35, Math.min(99, Math.round(score)));
}

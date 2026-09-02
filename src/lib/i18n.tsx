import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "te";

type Dict = Record<string, { en: string; te: string }>;

export const dict: Dict = {
  appName: { en: "RythuSetu", te: "రైతుసేతు" },
  tagline: {
    en: "Connecting farmers to everything they need.",
    te: "రైతు అవసరానికి… రైతుసేతు అండగా.",
  },
  greeting: { en: "Namaskaram, Rythu Garu 👋", te: "నమస్కారం, రైతు గారు 👋" },
  home: { en: "Home", te: "హోమ్" },
  jobs: { en: "Jobs", te: "పనులు" },
  market: { en: "Market", te: "మార్కెట్" },
  organic: { en: "Organic", te: "సేంద్రియ" },
  insurance: { en: "Insurance", te: "బీమా" },
  profile: { en: "Profile", te: "ప్రొఫైల్" },
  cart: { en: "Cart", te: "కార్ట్" },
  findLabour: { en: "Find Labour", te: "కూలీలను వెతకండి" },
  findLabourDesc: {
    en: "Find trusted agricultural workers near you",
    te: "మీ దగ్గరలోని నమ్మకమైన వ్యవసాయ కూలీలు",
  },
  farmMarket: { en: "Farm Market", te: "ఫార్మ్ మార్కెట్" },
  farmMarketDesc: { en: "Vegetables • Eggs • Chicken", te: "కూరగాయలు • గుడ్లు • చికెన్" },
  organicStore: { en: "Organic Store", te: "సేంద్రియ దుకాణం" },
  organicStoreDesc: { en: "Seeds • Natural Fertilizers", te: "విత్తనాలు • సహజ ఎరువులు" },
  cropInsurance: { en: "Crop Insurance Support", te: "పంట బీమా సహాయం" },
  cropInsuranceDesc: {
    en: "Find and understand suitable crop insurance options",
    te: "తగిన పంట బీమా ఎంపికలను తెలుసుకోండి",
  },
  nearbyJobs: { en: "Nearby labour jobs", te: "దగ్గరలోని పనులు" },
  popularProducts: { en: "Popular products", te: "ప్రముఖ ఉత్పత్తులు" },
  organicPicks: { en: "Organic farming products", te: "సేంద్రియ వ్యవసాయ ఉత్పత్తులు" },
  seasonal: { en: "Seasonal farming information", te: "సీజన్ వ్యవసాయ సమాచారం" },
  signIn: { en: "Sign in", te: "సైన్ ఇన్" },
  signOut: { en: "Sign out", te: "సైన్ అవుట్" },
  signUp: { en: "Create account", te: "ఖాతా సృష్టించండి" },
  postJob: { en: "Post labour requirement", te: "పని అవసరాన్ని పోస్ట్ చేయండి" },
  apply: { en: "Apply", te: "దరఖాస్తు" },
  applied: { en: "Applied", te: "దరఖాస్తు చేశారు" },
  addToCart: { en: "Add to cart", te: "కార్ట్‌లో చేర్చండి" },
  buyNow: { en: "Buy now", te: "ఇప్పుడే కొనండి" },
  viewDetails: { en: "View details", te: "వివరాలు" },
  requestSupport: { en: "Request support", te: "సహాయం కోరండి" },
  visitProvider: { en: "Visit provider", te: "ప్రొవైడర్ వెబ్‌సైట్" },
  loading: { en: "Loading…", te: "లోడ్ అవుతోంది…" },
  noJobs: { en: "No jobs available right now.", te: "ప్రస్తుతం పనులు అందుబాటులో లేవు." },
  noWorkers: {
    en: "No workers found near your selected location.",
    te: "మీరు ఎంచుకున్న ప్రాంతంలో కూలీలు కనిపించలేదు.",
  },
  outOfStock: { en: "This product is currently out of stock.", te: "ఈ ఉత్పత్తి ప్రస్తుతం అందుబాటులో లేదు." },
  genericError: { en: "Something went wrong. Please try again.", te: "ఏదో పొరపాటు జరిగింది. మళ్ళీ ప్రయత్నించండి." },
  ticketSubmitted: {
    en: "Your support request has been submitted successfully.",
    te: "మీ సహాయ అభ్యర్థన విజయవంతంగా నమోదైంది.",
  },
  insuranceDisclaimer: {
    en: "RythuSetu is an independent support platform and does not itself provide or underwrite insurance policies. Policy terms, eligibility, premiums and claims are determined by the respective authorized insurance provider.",
    te: "రైతుసేతు ఒక స్వతంత్ర సహాయ వేదిక మాత్రమే; బీమా పాలసీలను స్వయంగా అందించదు. పాలసీ నిబంధనలు, అర్హత, ప్రీమియం మరియు క్లెయిమ్‌లు సంబంధిత అధీకృత బీమా సంస్థ నిర్ణయిస్తుంది.",
  },
  demoData: { en: "Demo data", te: "డెమో డేటా" },
};

type I18nValue = { lang: Lang; setLang: (l: Lang) => void; t: (key: keyof typeof dict) => string };

const I18nContext = createContext<I18nValue>({ lang: "en", setLang: () => {}, t: (k) => dict[k]?.en ?? String(k) });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("rythusetu-lang");
    if (saved === "te" || saved === "en") setLangState(saved);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("rythusetu-lang", l);
  }, []);

  const t = useCallback((key: keyof typeof dict) => dict[key]?.[lang] ?? dict[key]?.en ?? String(key), [lang]);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

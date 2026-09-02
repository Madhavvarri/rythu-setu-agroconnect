import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AppHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — RythuSetu" },
      { name: "description", content: "Sign in or create your RythuSetu account as a farmer, labourer or seller." },
      { property: "og:title", content: "Sign in — RythuSetu" },
      { property: "og:description", content: "Create your RythuSetu account to find labour, shop and get insurance support." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSignIn() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(lang === "te" ? "లాగిన్ విఫలమైంది. వివరాలు సరిచూడండి." : "Sign in failed. Please check your details.");
      return;
    }
    navigate({ to: "/onboarding" });
  }

  async function handleSignUp() {
    if (!fullName.trim() || !mobile.trim()) {
      toast.error(lang === "te" ? "పేరు మరియు మొబైల్ నంబర్ ఇవ్వండి." : "Please enter your name and mobile number.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, mobile },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(lang === "te" ? "ఖాతా సృష్టించబడింది. ఇమెయిల్ నిర్ధారించండి." : "Account created. Please confirm your email if prompted.");
    navigate({ to: "/onboarding" });
  }

  async function handleGoogle() {
    toast.info(lang === "te" ? "Google సైన్ ఇన్ త్వరలో అందుబాటులోకి వస్తుంది." : "Google sign-in will be enabled shortly.");
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-md px-4 py-6">
        <h1 className="font-display text-2xl font-bold">{t("appName")} · రైతుసేతు</h1>
        <p className="mb-4 text-sm text-muted-foreground">{t("tagline")}</p>
        <Card className="border-border">
          <CardContent className="p-4">
            <Tabs defaultValue="signin">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t("signIn")}</TabsTrigger>
                <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-3 pt-4">
                <div>
                  <Label className="field-label">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <Label className="field-label">Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                </div>
                <Button size="lg" className="w-full" disabled={busy} onClick={handleSignIn}>
                  {t("signIn")}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-3 pt-4">
                <div>
                  <Label className="field-label">{lang === "te" ? "పూర్తి పేరు" : "Full name"}</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} />
                </div>
                <div>
                  <Label className="field-label">{lang === "te" ? "మొబైల్ నంబర్" : "Mobile number"}</Label>
                  <Input value={mobile} onChange={(e) => setMobile(e.target.value)} inputMode="tel" maxLength={15} />
                </div>
                <div>
                  <Label className="field-label">Email</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                </div>
                <div>
                  <Label className="field-label">Password</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                </div>
                <Button size="lg" className="w-full" disabled={busy} onClick={handleSignUp}>
                  {t("signUp")}
                </Button>
              </TabsContent>
            </Tabs>

            <div className="my-4 text-center text-xs text-muted-foreground">or</div>
            <Button variant="outline" size="lg" className="w-full" onClick={handleGoogle}>
              Continue with Google
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              {lang === "te"
                ? "మొబైల్ OTP లాగిన్ త్వరలో. ప్రస్తుతం ఇమెయిల్/Google ద్వారా లాగిన్ చేయండి."
                : "Mobile OTP login is planned; SMS delivery needs an SMS provider to be configured. Use email or Google for now."}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

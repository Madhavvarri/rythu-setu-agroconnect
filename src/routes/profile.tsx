import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { AppShell, SectionTitle } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";
import { useSession, signOut } from "@/lib/session";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — RythuSetu" },
      { name: "description", content: "Manage your RythuSetu profile, role, location and account settings." },
      { property: "og:title", content: "My Profile — RythuSetu" },
      { property: "og:description", content: "Your RythuSetu farmer, labourer or seller account." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { lang, t } = useI18n();
  const { profile, roles, userId } = useSession();
  const navigate = useNavigate();

  if (!userId) {
    return (
      <AppShell subtitle={t("profile")}>
        <Card className="border-border">
          <CardContent className="space-y-3 p-5 text-center">
            <p>{lang === "te" ? "మీ ఖాతాను చూడటానికి సైన్ ఇన్ చేయండి." : "Sign in to view your account."}</p>
            <Button asChild size="lg" className="w-full">
              <Link to="/auth">{t("signIn")}</Link>
            </Button>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell subtitle={t("profile")}>
      <h1 className="mb-3 font-display text-2xl font-bold">{t("profile")}</h1>
      <Card className="border-border">
        <CardContent className="space-y-2 p-4">
          <p className="font-display text-xl font-bold">{profile?.full_name}</p>
          <p className="text-sm text-muted-foreground">{profile?.mobile}</p>
          <p className="text-sm text-muted-foreground">
            {[profile?.village, profile?.mandal, profile?.district, profile?.state].filter(Boolean).join(", ")}
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {roles.map((r) => (
              <Badge key={r} variant="secondary">
                {r}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <SectionTitle>{lang === "te" ? "ఖాతా" : "Account"}</SectionTitle>
      <div className="space-y-2">
        <Button asChild variant="outline" size="lg" className="w-full justify-start">
          <Link to="/onboarding">{lang === "te" ? "ప్రొఫైల్ సవరించండి" : "Edit profile & role"}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full justify-start">
          <Link to="/cart">{lang === "te" ? "నా ఆర్డర్లు" : "My orders"}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="w-full justify-start">
          <Link to="/insurance">{lang === "te" ? "బీమా సహాయ అభ్యర్థనలు" : "Insurance support requests"}</Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start"
          onClick={async () => {
            await signOut();
            navigate({ to: "/" });
          }}
        >
          {lang === "te" ? "సైన్ అవుట్" : "Sign out"}
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        {lang === "te"
          ? "మేము సేవకు అవసరమైన సమాచారాన్ని మాత్రమే సేకరిస్తాము. మీ ఫోన్ నంబర్ అనవసరంగా బహిర్గతం చేయబడదు."
          : "We collect only the information needed to provide the service. Your phone number is not exposed publicly without need."}
      </p>
    </AppShell>
  );
}

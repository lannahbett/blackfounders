import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { useLocale } from "@/i18n";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Black Founders Hub" },
      { name: "description", content: "Sign in or create your Black Founders Hub account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [role, setRole] = useState<"founder" | "mentor">("founder");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName, intended_role: role },
          },
        });
        if (error) throw error;
        if (data.user) {
          // assign role
          await supabase
            .from("user_roles")
            .upsert({ user_id: data.user.id, role }, { onConflict: "user_id,role" });
          await supabase
            .from("profiles")
            .upsert({ id: data.user.id, full_name: fullName });
        }
        if (data.session) navigate({ to: "/dashboard" });
        else toast.success(t.auth.accountCreated);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? t.common.somethingWentWrong);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) toast.error(t.auth.googleFailed);
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-primary font-serif text-lg">B</span>
          <span className="font-serif text-xl font-semibold">{t.brand.name}</span>
        </Link>
        <div>
          <Sparkles className="h-6 w-6 text-[color:var(--gold)]" />
          <h2 className="mt-4 font-serif text-4xl leading-tight">
            {t.auth.heroTitle}
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            {t.auth.heroLede}
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} {t.brand.name}</p>
      </aside>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-4 flex justify-end"><LanguageSwitcher /></div>
          <h1 className="font-serif text-3xl font-semibold">
            {mode === "signup" ? t.auth.createTitle : t.auth.welcomeTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup" ? t.auth.createLede : t.auth.signInLede}
          </p>

          <Button onClick={handleGoogle} variant="outline" className="mt-6 w-full">
            {t.auth.continueGoogle}
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> {t.auth.or} <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="full_name">{t.auth.fullName}</Label>
                  <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>{t.auth.joiningAs}</Label>
                  <Tabs value={role} onValueChange={(v) => setRole(v as "founder" | "mentor")} className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="founder">{t.auth.founder}</TabsTrigger>
                      <TabsTrigger value="mentor">{t.auth.mentor}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="founder" className="mt-2 text-xs text-muted-foreground">
                      {t.auth.founderHint}
                    </TabsContent>
                    <TabsContent value="mentor" className="mt-2 text-xs text-muted-foreground">
                      {t.auth.mentorHint}
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">{t.auth.password}</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? t.common.pleaseWait : mode === "signup" ? t.auth.createAccount : t.auth.signIn}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? t.auth.alreadyHave : t.auth.newHere}{" "}
            <button
              type="button"
              className="font-medium text-accent hover:underline"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? t.auth.signIn : t.auth.createAccount}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
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

export const Route = createFileRoute("/auth")({
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
        else toast.success("Account created. Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) toast.error("Google sign-in failed");
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground md:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-primary font-serif text-lg">B</span>
          <span className="font-serif text-xl font-semibold">Black Founders Hub</span>
        </Link>
        <div>
          <Sparkles className="h-6 w-6 text-[color:var(--gold)]" />
          <h2 className="mt-4 font-serif text-4xl leading-tight">
            Build with mentors who get it, and capital that finds you.
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join a hub built for Black Women Founders — from your first idea to your first round.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Black Founders Hub</p>
      </aside>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-3xl font-semibold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup" ? "Free forever for founders & mentors." : "Sign in to continue."}
          </p>

          <Button onClick={handleGoogle} variant="outline" className="mt-6 w-full">
            Continue with Google
          </Button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div>
                  <Label>I'm joining as</Label>
                  <Tabs value={role} onValueChange={(v) => setRole(v as "founder" | "mentor")} className="mt-1">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="founder">Founder</TabsTrigger>
                      <TabsTrigger value="mentor">Mentor</TabsTrigger>
                    </TabsList>
                    <TabsContent value="founder" className="mt-2 text-xs text-muted-foreground">
                      Find mentors, grants, and a community that's been there.
                    </TabsContent>
                    <TabsContent value="mentor" className="mt-2 text-xs text-muted-foreground">
                      Share your experience with founders building what's next.
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button
              type="button"
              className="font-medium text-accent hover:underline"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            >
              {mode === "signup" ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
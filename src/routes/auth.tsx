import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
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

  const year = new Date().getFullYear();

  return (
    <div
      className="flex min-h-screen flex-col bg-ivory text-ink"
      style={{ fontFamily: "var(--font-editorial)" }}
    >
      <header className="flex items-center justify-between border-b border-stone px-6 py-4 md:px-8">
        <Link
          to="/"
          className="text-[15px] font-medium tracking-tight"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {t.brand.name}
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="flex flex-1 items-start justify-center px-6 py-14 md:py-20">
        <div className="w-full max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-terracotta">
            {mode === "signup" ? t.auth.createAccount : t.auth.signIn}
          </p>
          <h1
            className="mt-4 text-3xl font-light leading-tight tracking-tight md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {mode === "signup" ? t.auth.createTitle : t.auth.welcomeTitle}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-ink/60">
            {mode === "signup" ? t.auth.createLede : t.auth.signInLede}
          </p>

          <button
            onClick={handleGoogle}
            type="button"
            className="mt-8 w-full rounded-md border border-stone bg-transparent px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink/40 hover:bg-stone/40"
          >
            {t.auth.continueGoogle}
          </button>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-stone" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-ink/40">
              {t.auth.or}
            </span>
            <div className="h-px flex-1 bg-stone" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <>
                <FormField
                  id="full_name"
                  label={t.auth.fullName}
                  value={fullName}
                  onChange={setFullName}
                  required
                />
                <div>
                  <label className="block text-xs font-medium text-ink/60">
                    {t.auth.joiningAs}
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(["founder", "mentor"] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`rounded-md border py-2.5 text-sm font-medium transition-colors ${
                          role === r
                            ? "border-ink bg-ink text-ivory"
                            : "border-stone text-ink/60 hover:border-ink/30"
                        }`}
                      >
                        {r === "founder" ? t.auth.founder : t.auth.mentor}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-ink/55">
                    {role === "founder" ? t.auth.founderHint : t.auth.mentorHint}
                  </p>
                </div>
              </>
            )}

            <FormField
              id="email"
              type="email"
              label={t.auth.email}
              placeholder="name@domain.com"
              value={email}
              onChange={setEmail}
              required
            />
            <FormField
              id="password"
              type="password"
              label={t.auth.password}
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              minLength={8}
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ink px-4 py-3 text-sm font-medium text-ivory transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? t.common.pleaseWait
                : mode === "signup"
                  ? t.auth.createAccount
                  : t.auth.signIn}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-between border-t border-stone pt-6 text-sm">
            <span className="text-ink/55">
              {mode === "signup" ? t.auth.alreadyHave : t.auth.newHere}
            </span>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="font-medium text-terracotta hover:underline"
            >
              {mode === "signup" ? t.auth.signIn : t.auth.createAccount}
            </button>
          </div>

          <p className="mt-10 text-center text-[11px] text-ink/35">
            © {year} {t.brand.name}
          </p>
        </div>
      </main>
    </div>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  minLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-ink/60"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        minLength={minLength}
        placeholder={placeholder}
        className="mt-1.5 w-full rounded-md border border-stone bg-transparent px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/30 focus:border-ink/50"
      />
    </div>
  );
}
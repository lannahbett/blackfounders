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
      className="min-h-screen bg-paper p-4 text-espresso md:p-8"
      style={{ fontFamily: "var(--font-editorial)" }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl grid-cols-1 border border-copper/30 bg-paper shadow-2xl shadow-espresso/10 lg:grid-cols-12">
        {/* Left: editorial image */}
        <aside className="relative min-h-[280px] bg-espresso lg:col-span-5 lg:min-h-full">
          <img
            src={founderHero}
            alt="Black woman founder in a sun-drenched studio"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-espresso/10 to-transparent" />
          <Link
            to="/"
            className="absolute left-8 top-8 text-[10px] font-bold uppercase tracking-[0.3em] text-paper/90 hover:text-gold-warm"
          >
            ← {t.brand.name}
          </Link>
          <div className="absolute bottom-8 left-8 right-8 md:bottom-10 md:left-10 md:right-10">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-warm"
            >
              The Mastermind
            </p>
            <h2
              className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-paper md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.auth.heroTitle}
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-paper/80">
              {t.auth.heroLede}
            </p>
          </div>
        </aside>

        {/* Right: form */}
        <section className="relative flex flex-col p-8 md:p-12 lg:col-span-7 lg:p-16">
          <div className="mb-10 flex items-start justify-between md:mb-16">
            <div>
              <h1
                className="text-lg font-extrabold uppercase tracking-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t.brand.name}
                <span className="text-copper">.</span>
              </h1>
              <div className="mt-1 h-1 w-8 bg-copper" />
            </div>
            <div className="flex items-start gap-4">
              <LanguageSwitcher />
              <div className="hidden text-right text-[10px] font-bold uppercase tracking-[0.25em] text-espresso/50 md:block">
                <p>Global · Est. {year}</p>
                <p>Private Collective</p>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md">
            <span className="inline-block border border-sienna/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-sienna">
              {mode === "signup" ? "Apply for Entry" : "Private Access"}
            </span>
            <h2
              className="mt-6 text-4xl font-extrabold leading-[0.9] tracking-tighter md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {mode === "signup" ? (
                <>
                  {t.auth.createTitle.split(" ")[0]}
                  <br />
                  <span className="font-normal italic text-sienna">
                    {t.auth.createTitle.split(" ").slice(1).join(" ")}
                  </span>
                </>
              ) : (
                <>
                  {t.auth.welcomeTitle.split(" ")[0]}
                  <br />
                  <span className="font-normal italic text-sienna">
                    {t.auth.welcomeTitle.split(" ").slice(1).join(" ")}
                  </span>
                </>
              )}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-espresso/70">
              {mode === "signup" ? t.auth.createLede : t.auth.signInLede}
            </p>

            <button
              onClick={handleGoogle}
              type="button"
              className="mt-8 w-full border border-espresso/30 bg-transparent px-4 py-3.5 text-[11px] font-bold uppercase tracking-[0.25em] text-espresso transition-all hover:-translate-y-0.5 hover:border-espresso hover:bg-espresso hover:text-paper"
            >
              {t.auth.continueGoogle}
            </button>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-espresso/15" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-espresso/40">
                {t.auth.or}
              </span>
              <div className="h-px flex-1 bg-espresso/15" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                    <label className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-sienna">
                      {t.auth.joiningAs}
                    </label>
                    <div className="mt-2 grid grid-cols-2 border border-espresso/20">
                      {(["founder", "mentor"] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors ${
                            role === r
                              ? "bg-espresso text-paper"
                              : "text-espresso/60 hover:bg-espresso/5"
                          }`}
                        >
                          {r === "founder" ? t.auth.founder : t.auth.mentor}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 px-1 text-[11px] leading-relaxed text-espresso/60">
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
                className="mt-2 w-full bg-espresso px-4 py-4 text-[11px] font-bold uppercase tracking-[0.3em] text-gold-warm shadow-lg shadow-espresso/10 transition-all hover:-translate-y-0.5 hover:bg-sienna disabled:cursor-not-allowed disabled:opacity-60"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {loading
                  ? t.common.pleaseWait
                  : mode === "signup"
                    ? t.auth.createAccount
                    : t.auth.signIn}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-between border-t border-copper/30 pt-6 text-[10px] font-bold uppercase tracking-[0.25em]">
              <span className="text-espresso/50">
                {mode === "signup" ? t.auth.alreadyHave : t.auth.newHere}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
                className="text-sienna hover:text-copper"
              >
                {mode === "signup" ? t.auth.signIn : t.auth.createAccount}
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-6 right-6 hidden flex-col items-center gap-2 md:flex">
            <div className="h-12 w-px bg-copper/30" />
            <span className="origin-center rotate-90 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.3em] text-espresso/20">
              BFH · Collective · {year}
            </span>
          </div>
        </section>
      </div>
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
        className="block px-1 text-[10px] font-bold uppercase tracking-[0.25em] text-sienna"
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
        className="w-full border-b border-copper/40 bg-transparent px-1 py-3 text-sm text-espresso outline-none transition-colors placeholder:text-espresso/25 focus:border-espresso"
      />
    </div>
  );
}
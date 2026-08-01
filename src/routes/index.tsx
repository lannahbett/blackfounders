import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Users, Coins, MessagesSquare } from "lucide-react";
import { useLocale } from "@/i18n";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import founderHero from "@/assets/founder-hero.jpg";
import communityImg from "@/assets/community.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Black Founders Hub — Mentors, Grants & Community" },
      { name: "description", content: "Connect with verified mentors, discover grants made for you, and join a community of Black Women Founders building the future." },
      { property: "og:title", content: "Black Founders Hub — Mentors & Community" },
      { property: "og:description", content: "Mentors, grants and community for Black Women Founders." },
      { property: "og:url", content: "https://blackfounders.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://blackfounders.lovable.app/" }],
  }),
  component: Index,
});

function Index() {
  const { t } = useLocale();
  const year = new Date().getFullYear();

  const features = [
    { Icon: Users, title: t.landing.feature1Title, body: t.landing.feature1Body },
    { Icon: Coins, title: t.landing.feature2Title, body: t.landing.feature2Body },
    { Icon: MessagesSquare, title: t.landing.feature3Title, body: t.landing.feature3Body },
  ];

  const stats = [
    { value: "420+", label: "Founders" },
    { value: "30+", label: "Grants" },
    { value: "24", label: "Mentors" },
  ];

  return (
    <div
      className="min-h-screen bg-ivory text-ink"
      style={{ fontFamily: "var(--font-editorial)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone bg-ivory/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-8">
          <Link
            to="/"
            className="text-[15px] font-medium tracking-tight md:text-base"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.brand.name}
          </Link>
          <nav className="flex items-center gap-3 md:gap-5">
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="text-sm text-ink/70 transition-colors hover:text-terracotta"
            >
              {t.nav.signIn}
            </Link>
            <Link
              to="/auth"
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-terracotta"
            >
              {t.nav.joinTheHub}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="reveal lg:col-span-7">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-terracotta">
                {t.landing.badge}
              </p>
              <h1
                className="mt-6 text-4xl font-light leading-[1.05] tracking-tight md:text-6xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {t.landing.h1a}{" "}
                <span className="font-medium text-terracotta">{t.landing.h1b}</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-ink/65 md:text-lg">
                {t.landing.lede}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3 text-sm font-medium text-ivory transition-colors hover:bg-terracotta"
                >
                  {t.landing.ctaPrimary} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-ink/70 underline decoration-stone decoration-2 underline-offset-4 transition-colors hover:text-terracotta hover:decoration-terracotta"
                >
                  {t.landing.ctaMentor}
                </Link>
              </div>
            </div>

            <div className="reveal lg:col-span-5">
              <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-stone/40">
                <img
                  src={founderHero}
                  alt="Black woman founder in a sun-drenched studio"
                  className="h-full w-full object-cover"
                  width={1024}
                  height={1536}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trust line */}
        <section className="border-y border-stone">
          <div className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-stone px-6 md:px-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="px-2 py-8 text-center md:py-10">
                <div
                  className="text-2xl font-medium tracking-tight md:text-3xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {value}
                </div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.2em] text-ink/45">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <div className="grid gap-12 md:grid-cols-3 md:gap-10">
            {features.map(({ Icon, title, body }) => (
              <article key={title}>
                <Icon className="h-5 w-5 text-terracotta" strokeWidth={1.5} />
                <h2
                  className="mt-5 text-xl font-medium leading-snug tracking-tight"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Community band */}
        <section className="relative overflow-hidden border-y border-stone">
          <img
            src={communityImg}
            alt="Black women founders collaborating around a table"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ivory/85" />
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center md:px-8 md:py-32">
            <blockquote
              className="text-2xl font-light leading-snug tracking-tight md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              “You shouldn’t have to build alone.”
            </blockquote>
            <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-ink/45">
              {t.brand.name}
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8 md:py-32">
          <h2
            className="text-3xl font-light leading-tight tracking-tight md:text-5xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {t.landing.closingTitle}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-ink/65">
            {t.landing.closingLede}
          </p>
          <Link
            to="/auth"
            className="mt-10 inline-flex items-center gap-2 rounded-md bg-ink px-7 py-3 text-sm font-medium text-ivory transition-colors hover:bg-terracotta"
          >
            {t.landing.closingCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="border-t border-stone">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-ink/55 md:px-8">
          <span>© {year} {t.brand.name}</span>
          <span>
            {t.landing.footerMadeBy}{" "}
            <a
              href="https://lannaraportfolio.lovable.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#7c3aed] hover:underline"
            >
              Lannara Silva
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
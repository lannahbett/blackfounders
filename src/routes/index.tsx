import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/i18n";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";
import founderHero from "@/assets/founder-hero.jpg";
import mentorsImg from "@/assets/mentors.jpg";
import grantsImg from "@/assets/grants.jpg";
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
    { n: "01", img: mentorsImg, title: t.landing.feature1Title, body: t.landing.feature1Body },
    { n: "02", img: grantsImg, title: t.landing.feature2Title, body: t.landing.feature2Body },
    { n: "03", img: communityImg, title: t.landing.feature3Title, body: t.landing.feature3Body },
  ];

  return (
    <div
      className="min-h-screen bg-paper text-espresso"
      style={{ fontFamily: "var(--font-editorial)" }}
    >
      {/* Masthead */}
      <header className="border-b border-espresso/15">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
          <Link to="/" className="flex items-baseline gap-2">
            <span
              className="text-lg font-extrabold uppercase tracking-tight md:text-xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.brand.name}
              <span className="text-copper">.</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] text-espresso/50 md:inline">
              Vol. 03 · Est. {year}
            </span>
          </Link>
          <nav className="flex items-center gap-4 md:gap-6">
            <LanguageSwitcher />
            <Link
              to="/auth"
              className="text-[11px] font-bold uppercase tracking-[0.2em] hover:text-copper"
            >
              {t.nav.signIn}
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-espresso px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-paper transition-all hover:-translate-y-0.5 hover:bg-sienna"
            >
              {t.nav.joinTheHub}
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero editorial spread */}
        <section className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="flex flex-col justify-between lg:col-span-7">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-block border border-sienna/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-sienna">
                    The Founders Issue
                  </span>
                  <span className="h-px flex-1 bg-espresso/15" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-espresso/50">
                    {t.landing.badge}
                  </span>
                </div>

                <h1
                  className="mt-8 text-5xl font-extrabold leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {t.landing.h1a}
                  <br />
                  <span className="font-normal italic text-sienna">{t.landing.h1b}</span>
                </h1>

                <p className="mt-8 max-w-xl text-lg leading-relaxed text-espresso/75 md:text-xl">
                  {t.landing.lede}
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 bg-espresso px-6 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-paper shadow-lg shadow-espresso/10 transition-all hover:-translate-y-0.5 hover:bg-sienna"
                  >
                    {t.landing.ctaPrimary} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 border border-espresso px-6 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-espresso transition-all hover:-translate-y-0.5 hover:bg-espresso hover:text-paper"
                  >
                    {t.landing.ctaMentor}
                  </Link>
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-8 border-t border-espresso/15 pt-8 lg:mt-16">
                <div>
                  <div
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    420+
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-espresso/50">
                    Founders
                  </div>
                </div>
                <div>
                  <div
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    30+
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-espresso/50">
                    Curated Grants
                  </div>
                </div>
                <div>
                  <div
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    24
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.25em] text-espresso/50">
                    Verified Mentors
                  </div>
                </div>
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-espresso">
                <img
                  src={founderHero}
                  alt="Black woman founder in a sun-drenched studio"
                  className="h-full w-full object-cover"
                  width={1024}
                  height={1536}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-warm">
                    Featured Founder
                  </p>
                  <p
                    className="mt-2 text-2xl font-extrabold leading-tight text-paper md:text-3xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Legacy is a<br />
                    <span className="italic">daily practice.</span>
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-5 hidden bg-copper px-4 py-3 text-paper md:block">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em]">
                  Issue No. 03
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature triptych */}
        <section className="border-y border-espresso/15 bg-paper">
          <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
            <div className="mb-12 flex items-baseline justify-between border-b border-espresso/15 pb-6">
              <h2
                className="text-2xl font-extrabold tracking-tight md:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What's inside
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-espresso/50">
                Three columns
              </span>
            </div>

            <div className="grid gap-10 md:grid-cols-3 md:gap-8">
              {features.map(({ n, img, title, body }) => (
                <article key={n} className="group flex flex-col">
                  <div className="relative aspect-[4/5] overflow-hidden bg-espresso/5">
                    <img
                      src={img}
                      alt={title}
                      loading="lazy"
                      width={1200}
                      height={1500}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-5 flex items-baseline gap-3">
                    <span
                      className="text-xs font-bold text-copper"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {n}
                    </span>
                    <span className="h-px flex-1 bg-espresso/20" />
                  </div>
                  <h2
                    className="mt-3 text-2xl font-extrabold leading-tight tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-espresso/75">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Pull quote */}
        <section className="bg-espresso text-paper">
          <div className="mx-auto max-w-5xl px-6 py-20 md:px-10 md:py-28">
            <div className="mb-8 h-px w-16 bg-gold-warm" />
            <blockquote
              className="text-3xl font-normal italic leading-[1.15] tracking-tight md:text-5xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              "You shouldn't have to build alone. We built the room we
              wished we had walked into on day one."
            </blockquote>
            <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.3em] text-gold-warm">
              The Editors — Black Founders Hub
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-paper">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center md:px-10">
            <span className="inline-block border border-sienna/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-sienna">
              Private Access
            </span>
            <h2
              className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {t.landing.closingTitle}
            </h2>
            <p className="mt-6 text-lg text-espresso/75">{t.landing.closingLede}</p>
            <Link
              to="/auth"
              className="mt-10 inline-flex items-center gap-2 bg-espresso px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-paper transition-all hover:-translate-y-0.5 hover:bg-sienna"
            >
              {t.landing.closingCta} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-espresso/15 bg-paper">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-xs uppercase tracking-[0.2em] text-espresso/60 md:px-10">
          <span>© {year} {t.brand.name}</span>
          <span className="normal-case tracking-normal">
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
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, BookOpenCheck, MessagesSquare, ArrowRight } from "lucide-react";
import { useLocale } from "@/i18n";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

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
  const features = [
    { icon: Users, title: t.landing.feature1Title, body: t.landing.feature1Body },
    { icon: BookOpenCheck, title: t.landing.feature2Title, body: t.landing.feature2Body },
    { icon: MessagesSquare, title: t.landing.feature3Title, body: t.landing.feature3Body },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-serif text-lg">B</span>
          <span className="font-serif text-xl font-semibold">{t.brand.name}</span>
        </Link>
        <nav className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link to="/auth" className="text-sm font-medium hover:text-accent">{t.nav.signIn}</Link>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/auth">{t.nav.joinTheHub}</Link>
          </Button>
        </nav>
      </header>

      <main>
      <section className="mx-auto max-w-6xl px-6 pt-10 pb-24 md:pt-20 md:pb-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)]" /> {t.landing.badge}
        </div>
        <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] md:text-7xl">
          {t.landing.h1a}<br />
          <span className="text-accent">{t.landing.h1b}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t.landing.lede}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/auth">
              {t.landing.ctaPrimary} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary/20">
            <Link to="/auth" search={{ mode: "mentor" } as never}>{t.landing.ctaMentor}</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-background p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--gold)]/20 text-[color:var(--gold)]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-serif text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">{t.landing.closingTitle}</h2>
        <p className="mt-4 text-muted-foreground">{t.landing.closingLede}</p>
        <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/auth">{t.landing.closingCta}</Link>
        </Button>
      </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} {t.brand.name}</span>
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

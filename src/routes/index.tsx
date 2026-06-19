import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Users, BookOpenCheck, MessagesSquare, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Black Founders Hub — Mentors, Grants & Community for Black Women Founders" },
      { name: "description", content: "Connect with verified mentors, discover grants made for you, and join a community of Black Women Founders building the future." },
      { property: "og:title", content: "Black Founders Hub" },
      { property: "og:description", content: "Mentors, grants and community for Black Women Founders." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground font-serif text-lg">B</span>
          <span className="font-serif text-xl font-semibold">Black Founders Hub</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link to="/auth" className="text-sm font-medium hover:text-accent">Sign in</Link>
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/auth">Join the hub</Link>
          </Button>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pt-10 pb-24 md:pt-20 md:pb-32">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--gold)]" /> Built for Black women & nonbinary founders
        </div>
        <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] md:text-7xl">
          Mentors who get it.<br />
          <span className="text-accent">Capital you can actually access.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Black Founders Hub closes the funding and opportunity gap with verified mentors, a curated grant directory, and a community of founders building alongside you.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/auth">
              Get started — it's free <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary/20">
            <Link to="/auth" search={{ mode: "mentor" } as never}>Become a mentor</Link>
          </Button>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-16 md:grid-cols-3">
          {[
            { icon: Users, title: "Mentor matching", body: "Browse verified mentors by industry and stage. Request 1:1 mentorship in a click." },
            { icon: BookOpenCheck, title: "Grants made for you", body: "A curated directory of grants and accelerators that actually fund Black women founders." },
            { icon: MessagesSquare, title: "Founder community", body: "Asks, wins, and resources from founders who've been where you're going." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-background p-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--gold)]/20 text-[color:var(--gold)]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-serif text-xl font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">You shouldn't have to build alone.</h2>
        <p className="mt-4 text-muted-foreground">Join hundreds of founders and mentors closing the gap, together.</p>
        <Button asChild size="lg" className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90">
          <Link to="/auth">Create your free account</Link>
        </Button>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Black Founders Hub</span>
          <span>Made with care 🌻</span>
        </div>
      </footer>
    </div>
  );
}

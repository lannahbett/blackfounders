import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, BookOpen, Calendar, MessageCircle, Inbox, MessagesSquare, UserCircle, LogOut, Menu, Newspaper, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmaraDock } from "@/components/amara-dock";
import { FeedbackButton } from "@/components/feedback-button";
import { getMe } from "@/lib/hub.functions";
import { useLocale } from "@/i18n";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const NAV = [
    { to: "/dashboard", label: t.nav.home, icon: Home },
    { to: "/mentors", label: t.nav.mentors, icon: Users },
    { to: "/requests", label: t.nav.requests, icon: Inbox },
    { to: "/sessions", label: t.nav.sessions, icon: Calendar },
    { to: "/messages", label: t.nav.messages, icon: MessageCircle },
    { to: "/grants", label: t.nav.grants, icon: BookOpen },
    { to: "/community", label: t.nav.community, icon: MessagesSquare },
    { to: "/blog", label: t.nav.blog, icon: Newspaper },
    { to: "/profile", label: t.nav.profile, icon: UserCircle },
  ];
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const meFn = useServerFn(getMe);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const isAdmin = me?.roles?.includes("admin");

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    if (!me) return;
    pendo.identify({
      visitor: {
        id: me.userId,
        full_name: me.profile?.full_name ?? undefined,
        headline: me.profile?.headline ?? undefined,
        location: me.profile?.location ?? undefined,
        industry: me.profile?.industry ?? undefined,
        stage: me.profile?.stage ?? undefined,
        createdAt: me.profile?.created_at ?? undefined,
        updatedAt: me.profile?.updated_at ?? undefined,
        roles: me.roles ?? undefined,
        verified: me.mentor?.verified ?? undefined,
        acceptingMentees: me.mentor?.accepting_mentees ?? undefined,
        yearsExperience: me.mentor?.years_experience ?? undefined,
        hourlyRate: me.mentor?.hourly_rate ?? undefined,
        expertise: me.mentor?.expertise ?? undefined,
        mentorIndustries: me.mentor?.industries ?? undefined,
      },
    });
  }, [me]);

  async function signOut() {
    pendo.clearSession();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-serif">B</span>
          <span className="font-serif font-semibold">{t.brand.shortName}</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex">
        <aside
          className={`${open ? "block" : "hidden"} fixed inset-x-0 top-[57px] z-40 border-b border-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0`}
        >
          <div className="hidden items-center justify-between gap-2 px-6 py-6 md:flex">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-primary font-serif text-lg">B</span>
              <span className="font-serif text-lg font-semibold">{t.brand.shortName}</span>
            </div>
            <LanguageSwitcher />
          </div>
          <nav className="flex flex-col gap-1 px-3 pb-4 md:px-3">
            {NAV.map(({ to, label, icon: Icon }) => {
              const active = path === to || path.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
            {isAdmin && (
              <>
                <div className="mt-3 px-3 pb-1 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">
                  {t.nav.admin}
                </div>
                <Link
                  to="/admin/feedback"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    path.startsWith("/admin/feedback")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" /> {t.nav.feedback}
                </Link>
                <Link
                  to="/admin/blog"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    path.startsWith("/admin/blog")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/60"
                  }`}
                >
                  <Newspaper className="h-4 w-4" /> {t.nav.blog}
                </Link>
              </>
            )}
            <button
              onClick={signOut}
              className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
            >
              <LogOut className="h-4 w-4" /> {t.nav.signOut}
            </button>
          </nav>
        </aside>

        <main className="min-h-screen flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-12">
            <Outlet />
          </div>
        </main>
      </div>
      <AmaraDock />
      <FeedbackButton />
    </div>
  );
}
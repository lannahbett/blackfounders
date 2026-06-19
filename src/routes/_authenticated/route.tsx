import { createFileRoute, Outlet, redirect, Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Home, Users, BookOpen, Calendar, MessageCircle, Inbox, MessagesSquare, UserCircle, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AuthedLayout,
});

const NAV = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/mentors", label: "Mentors", icon: Users },
  { to: "/requests", label: "Requests", icon: Inbox },
  { to: "/sessions", label: "Sessions", icon: Calendar },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/grants", label: "Grants", icon: BookOpen },
  { to: "/community", label: "Community", icon: MessagesSquare },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

function AuthedLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [path]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground font-serif">B</span>
          <span className="font-serif font-semibold">Founders Hub</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex">
        <aside
          className={`${open ? "block" : "hidden"} fixed inset-x-0 top-[57px] z-40 border-b border-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:block md:h-screen md:w-64 md:shrink-0 md:border-r md:border-b-0`}
        >
          <div className="hidden items-center gap-2 px-6 py-6 md:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-primary font-serif text-lg">B</span>
            <span className="font-serif text-lg font-semibold">Founders Hub</span>
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
            <button
              onClick={signOut}
              className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </nav>
        </aside>

        <main className="min-h-screen flex-1">
          <div className="mx-auto max-w-5xl px-4 py-8 md:px-10 md:py-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
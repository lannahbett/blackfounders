import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMe, listGrants, listRequests, listSessions } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Inbox, Sparkles } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Black Founders Hub" }] }),
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="p-6 text-sm">
        <p className="text-destructive">{error.message}</p>
        <Button className="mt-2" onClick={() => { router.invalidate(); reset(); }}>Retry</Button>
      </div>
    );
  },
  notFoundComponent: () => <p>Not found</p>,
  component: Dashboard,
});

function Dashboard() {
  const meFn = useServerFn(getMe);
  const requestsFn = useServerFn(listRequests);
  const sessionsFn = useServerFn(listSessions);
  const grantsFn = useServerFn(listGrants);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const { data: requests = [] } = useQuery({ queryKey: ["requests"], queryFn: () => requestsFn() });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => sessionsFn() });
  const { data: grants = [] } = useQuery({ queryKey: ["grants"], queryFn: () => grantsFn({ data: {} }) });

  const isMentor = me?.roles?.includes("mentor");
  const pendingForMe = requests.filter(
    (r: any) => r.status === "pending" && (isMentor ? r.mentor_id === me?.userId : r.founder_id === me?.userId),
  );
  const upcoming = sessions.filter((s: any) => s.status === "scheduled").slice(0, 3);
  const featuredGrants = grants.slice(0, 3);

  return (
    <div>
      <PageHeader
        title={`Hi${me?.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""} 👋`}
        description={isMentor ? "Your founders are waiting." : "Let's keep building."}
      />

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Inbox className="h-4 w-4" /> Pending requests</div>
          <p className="mt-2 font-serif text-3xl">{pendingForMe.length}</p>
          <Link to="/requests" className="mt-3 inline-flex items-center text-sm text-accent">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /> Upcoming sessions</div>
          <p className="mt-2 font-serif text-3xl">{upcoming.length}</p>
          <Link to="/sessions" className="mt-3 inline-flex items-center text-sm text-accent">Schedule <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Card>
        <Card className="p-5 bg-primary text-primary-foreground">
          <div className="flex items-center gap-2 text-sm opacity-80"><Sparkles className="h-4 w-4 text-[color:var(--gold)]" /> New grants this week</div>
          <p className="mt-2 font-serif text-3xl">{grants.length}</p>
          <Link to="/grants" className="mt-3 inline-flex items-center text-sm text-[color:var(--gold)]">Explore <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Card>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">Featured grants</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {featuredGrants.map((g: any) => (
            <Card key={g.id} className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.organization}</p>
              <h3 className="mt-1 font-serif text-lg font-semibold">{g.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{g.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-medium text-accent">{g.amount ?? "Varies"}</span>
                {g.deadline ? (
                  <span className="text-xs text-muted-foreground">{format(new Date(g.deadline), "MMM d, yyyy")}</span>
                ) : null}
              </div>
              <Link to="/grants/$id" params={{ id: g.id }} className="mt-3 inline-flex text-sm text-accent">Open →</Link>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
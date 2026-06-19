import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMe, listGrants, listRequests, listSessions } from "@/lib/hub.functions";
import { listSavedGrants } from "@/lib/saved-grants.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, CheckCircle2, Circle, Inbox, Sparkles } from "lucide-react";
import { DataErrorState } from "@/components/data-error-state";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Black Founders Hub" }] }),
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => <p>Not found</p>,
  component: Dashboard,
});

function Dashboard() {
  const meFn = useServerFn(getMe);
  const requestsFn = useServerFn(listRequests);
  const sessionsFn = useServerFn(listSessions);
  const grantsFn = useServerFn(listGrants);
  const savedFn = useServerFn(listSavedGrants);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const { data: requests = [] } = useQuery({ queryKey: ["requests"], queryFn: () => requestsFn() });
  const { data: sessions = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => sessionsFn() });
  const { data: grants = [] } = useQuery({ queryKey: ["grants"], queryFn: () => grantsFn({ data: {} }) });
  const { data: saved = [] } = useQuery({ queryKey: ["saved-grants"], queryFn: () => savedFn() });

  const isMentor = me?.roles?.includes("mentor");
  const pendingForMe = requests.filter(
    (r: any) => r.status === "pending" && (isMentor ? r.mentor_id === me?.userId : r.founder_id === me?.userId),
  );
  const upcoming = sessions.filter((s: any) => s.status === "scheduled").slice(0, 3);
  const featuredGrants = grants.slice(0, 3);

  const checklist = [
    {
      label: "Complete your profile",
      done: !!(me?.profile?.full_name && me?.profile?.bio),
      href: "/profile",
    },
    { label: "Save your first grant", done: saved.length > 0, href: "/grants" },
    { label: "Send your first mentor request", done: requests.length > 0, href: "/mentors" },
    { label: "Book your first session", done: sessions.length > 0, href: "/sessions" },
  ];
  const doneCount = checklist.filter((i) => i.done).length;
  const allDone = doneCount === checklist.length;

  return (
    <div>
      <PageHeader
        title={`Hi${me?.profile?.full_name ? `, ${me.profile.full_name.split(" ")[0]}` : ""} 👋`}
        description={isMentor ? "Your founders are waiting." : "Let's keep building."}
      />

      {!allDone && (
        <Card className="mb-8 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-lg font-semibold">Get the most from the hub</h3>
              <p className="text-xs text-muted-foreground">
                {doneCount} of {checklist.length} done
              </p>
            </div>
            <div className="h-2 w-32 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${(doneCount / checklist.length) * 100}%` }}
              />
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {checklist.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.href}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={item.done ? "text-muted-foreground line-through" : ""}>
                    {item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

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
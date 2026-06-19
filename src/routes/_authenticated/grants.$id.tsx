import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getGrant } from "@/lib/hub.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import { SaveGrantButton } from "@/components/save-grant-button";
import { DataErrorState } from "@/components/data-error-state";

export const Route = createFileRoute("/_authenticated/grants/$id")({
  head: () => ({ meta: [{ title: "Grant — Black Founders Hub" }] }),
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => <p>Grant not found</p>,
  component: GrantDetail,
});

function GrantDetail() {
  const { id } = Route.useParams();
  const fn = useServerFn(getGrant);
  const { data: g } = useQuery({ queryKey: ["grant", id], queryFn: () => fn({ data: { id } }) });
  if (!g) return <p>Loading…</p>;
  return (
    <div>
      <Link to="/grants" className="text-sm text-muted-foreground hover:text-foreground">← All grants</Link>
      <Card className="mt-4 p-6">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.organization}</p>
        <h1 className="font-serif text-3xl font-semibold">{g.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[color:var(--gold)]/30 px-3 py-1 text-sm font-medium">{g.amount ?? "Varies"}</span>
          {g.region ? <Badge variant="outline">{g.region}</Badge> : null}
          {g.deadline ? <Badge variant="secondary">Deadline {format(new Date(g.deadline), "MMM d, yyyy")}</Badge> : <Badge variant="secondary">Rolling</Badge>}
        </div>
        <p className="mt-6 whitespace-pre-line">{g.description}</p>
        {g.eligibility ? (
          <div className="mt-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Eligibility</h3>
            <p className="mt-2">{g.eligibility}</p>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-1.5">
          {(g.tags ?? []).map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <a href={g.url} target="_blank" rel="noreferrer">Visit grant page <ExternalLink className="ml-2 h-4 w-4" /></a>
          </Button>
          <SaveGrantButton grantId={g.id} />
        </div>
      </Card>
    </div>
  );
}
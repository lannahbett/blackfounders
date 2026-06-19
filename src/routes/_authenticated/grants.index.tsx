import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listGrants } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/grants/")({
  head: () => ({ meta: [{ title: "Grants — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: GrantsPage,
});

function GrantsPage() {
  const [q, setQ] = useState("");
  const fn = useServerFn(listGrants);
  const { data = [] } = useQuery({ queryKey: ["grants", q], queryFn: () => fn({ data: { q } }) });
  return (
    <div>
      <PageHeader title="Grants & funding" description="Curated programs that actually fund Black women founders." />
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search grants" className="pl-9" />
      </div>
      <div className="space-y-4">
        {data.map((g: any) => (
          <Link key={g.id} to="/grants/$id" params={{ id: g.id }}>
            <Card className="p-5 transition-colors hover:border-accent">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{g.organization}</p>
                  <h3 className="font-serif text-xl font-semibold">{g.title}</h3>
                </div>
                <span className="rounded-full bg-[color:var(--gold)]/30 px-3 py-1 text-sm font-medium text-foreground">{g.amount ?? "Varies"}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{g.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {(g.tags ?? []).slice(0, 4).map((t: string) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                {g.deadline ? <span className="ml-auto text-xs text-muted-foreground">Deadline {format(new Date(g.deadline), "MMM d, yyyy")}</span> : <span className="ml-auto text-xs text-muted-foreground">Rolling</span>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
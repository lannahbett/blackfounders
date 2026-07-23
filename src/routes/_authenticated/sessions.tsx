import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, listSessions, cancelSession } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarPill } from "@/components/avatar-pill";
import { toast } from "sonner";
import { format } from "date-fns";
import { useLocale } from "@/i18n";

export const Route = createFileRoute("/_authenticated/sessions")({
  head: () => ({ meta: [{ title: "Sessions — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: SessionsPage,
});

function SessionsPage() {
  const { t } = useLocale();
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const fn = useServerFn(listSessions);
  const cancelFn = useServerFn(cancelSession);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const { data = [] } = useQuery({ queryKey: ["sessions"], queryFn: () => fn() });
  const m = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => { toast.success(t.sessions.cancelled); qc.invalidateQueries({ queryKey: ["sessions"] }); },
  });

  const now = Date.now();
  const upcoming = data.filter((s: any) => s.status === "scheduled" && new Date(s.scheduled_at).getTime() >= now);
  const past = data.filter((s: any) => !upcoming.includes(s));

  return (
    <div>
      <PageHeader title={t.sessions.title} description={t.sessions.description} />
      <Section title={t.sessions.upcoming} items={upcoming} meId={me?.userId} onCancel={(id) => m.mutate(id)} labels={t.sessions} />
      <Section title={t.sessions.pastCancelled} items={past} meId={me?.userId} muted labels={t.sessions} />
    </div>
  );
}

function Section({
  title, items, meId, onCancel, muted, labels,
}: { title: string; items: any[]; meId?: string; onCancel?: (id: string) => void; muted?: boolean; labels: any }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-semibold">{title}</h2>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? <p className="text-sm text-muted-foreground">{labels.nothing}</p> : null}
        {items.map((s) => {
          const other = s.mentor_id === meId ? s.founder : s.mentor;
          const otherLabel = s.mentor_id === meId ? labels.withFounder : labels.withMentor;
          return (
            <Card key={s.id} className={`flex flex-wrap items-center gap-4 p-5 ${muted ? "opacity-80" : ""}`}>
              <AvatarPill name={other?.full_name} src={other?.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{format(new Date(s.scheduled_at), "EEE, MMM d • h:mm a")}</p>
                <p className="text-sm text-muted-foreground">{otherLabel} {other?.full_name} · {s.duration_min} {labels.minutes}</p>
                {s.meeting_link ? <a href={s.meeting_link} target="_blank" rel="noreferrer" className="text-sm text-accent">{labels.joinLink}</a> : null}
              </div>
              <Badge variant={s.status === "scheduled" ? "default" : "outline"}>{s.status}</Badge>
              {onCancel && s.status === "scheduled" ? (
                <Button size="sm" variant="outline" onClick={() => onCancel(s.id)}>{labels.cancel}</Button>
              ) : null}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, listRequests, respondRequest } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AvatarPill } from "@/components/avatar-pill";
import { toast } from "sonner";
import { format } from "date-fns";
import { pendoTrack } from "@/lib/pendo";

export const Route = createFileRoute("/_authenticated/requests")({
  head: () => ({ meta: [{ title: "Mentorship requests" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: RequestsPage,
});

function RequestsPage() {
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const fn = useServerFn(listRequests);
  const respondFn = useServerFn(respondRequest);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const { data = [] } = useQuery({ queryKey: ["requests"], queryFn: () => fn() });

  const m = useMutation({
    mutationFn: (v: { id: string; status: "accepted" | "declined" | "cancelled" }) => respondFn({ data: v }),
    onSuccess: (_data, v) => {
      pendoTrack("mentorship_request_responded", {
        request_id: v.id,
        response_status: v.status,
        responder_role: v.status === "cancelled" ? "founder" : "mentor",
      });
      toast.success("Updated");
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
  });

  const incoming = data.filter((r: any) => r.mentor_id === me?.userId);
  const outgoing = data.filter((r: any) => r.founder_id === me?.userId);

  return (
    <div>
      <PageHeader title="Mentorship requests" />
      <section>
        <h2 className="font-serif text-xl font-semibold">Incoming</h2>
        <div className="mt-3 space-y-3">
          {incoming.length === 0 ? <p className="text-sm text-muted-foreground">Nothing yet.</p> : null}
          {incoming.map((r: any) => (
            <Card key={r.id} className="flex flex-wrap items-start gap-4 p-5">
              <AvatarPill name={r.founder?.full_name} src={r.founder?.avatar_url} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{r.founder?.full_name}</p>
                  <Badge variant={r.status === "pending" ? "secondary" : r.status === "accepted" ? "default" : "outline"}>{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
                <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => m.mutate({ id: r.id, status: "accepted" })}>Accept</Button>
                  <Button size="sm" variant="outline" onClick={() => m.mutate({ id: r.id, status: "declined" })}>Decline</Button>
                </div>
              ) : r.status === "accepted" ? (
                <Link to="/messages/$id" params={{ id: r.founder_id }}><Button size="sm" variant="outline">Message</Button></Link>
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl font-semibold">Sent</h2>
        <div className="mt-3 space-y-3">
          {outgoing.length === 0 ? <p className="text-sm text-muted-foreground">No requests sent yet.</p> : null}
          {outgoing.map((r: any) => (
            <Card key={r.id} className="flex flex-wrap items-start gap-4 p-5">
              <AvatarPill name={r.mentor?.full_name} src={r.mentor?.avatar_url} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">To {r.mentor?.full_name}</p>
                  <Badge variant={r.status === "pending" ? "secondary" : r.status === "accepted" ? "default" : "outline"}>{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy")}</p>
                <p className="mt-2 whitespace-pre-line text-sm">{r.message}</p>
              </div>
              {r.status === "pending" ? (
                <Button size="sm" variant="outline" onClick={() => m.mutate({ id: r.id, status: "cancelled" })}>Cancel</Button>
              ) : r.status === "accepted" ? (
                <Link to="/messages/$id" params={{ id: r.mentor_id }}><Button size="sm" variant="outline">Message</Button></Link>
              ) : null}
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
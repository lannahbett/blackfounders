import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listConversations } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { AvatarPill } from "@/components/avatar-pill";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/messages/")({
  head: () => ({ meta: [{ title: "Messages — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: MessagesIndex,
});

function MessagesIndex() {
  const fn = useServerFn(listConversations);
  const { data = [] } = useQuery({ queryKey: ["conversations"], queryFn: () => fn() });
  return (
    <div>
      <PageHeader title="Messages" />
      {data.length === 0 ? <p className="text-muted-foreground">No conversations yet. Start one from a mentor's profile.</p> : (
        <div className="space-y-3">
          {data.map((c: any) => (
            <Link key={c.other_id} to="/messages/$id" params={{ id: c.other_id }}>
              <Card className="flex items-center gap-4 p-4 transition-colors hover:border-accent">
                <AvatarPill name={c.other_profile?.full_name} src={c.other_profile?.avatar_url} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{c.other_profile?.full_name ?? "Unknown"}</p>
                    <p className="shrink-0 text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.last_at), { addSuffix: true })}</p>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{c.last_message}</p>
                </div>
                {c.unread > 0 ? <Badge className="bg-accent text-accent-foreground">{c.unread}</Badge> : null}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
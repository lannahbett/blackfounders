import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listThread, sendMessage, getMe } from "@/lib/hub.functions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AvatarPill } from "@/components/avatar-pill";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { pendoTrack } from "@/lib/pendo";

export const Route = createFileRoute("/_authenticated/messages/$id")({
  head: () => ({ meta: [{ title: "Conversation — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: Thread,
});

function Thread() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const fn = useServerFn(listThread);
  const sendFn = useServerFn(sendMessage);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });
  const { data } = useQuery({ queryKey: ["thread", id], queryFn: () => fn({ data: { other_id: id } }) });
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  useEffect(() => {
    const channel = supabase
      .channel(`thread-${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m: any = payload.new;
        if (m.sender_id === id || m.recipient_id === id) {
          qc.invalidateQueries({ queryKey: ["thread", id] });
          qc.invalidateQueries({ queryKey: ["conversations"] });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, qc]);

  const send = useMutation({
    mutationFn: () => sendFn({ data: { recipient_id: id, body } }),
    onSuccess: () => {
      pendoTrack("message_sent", {
        recipient_id: id,
        message_length: body.length,
      });
      setBody("");
      qc.invalidateQueries({ queryKey: ["thread", id] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <Link to="/messages" className="text-sm text-muted-foreground hover:text-foreground">← All conversations</Link>
      <Card className="mt-3 flex items-center gap-3 p-4">
        <AvatarPill name={data?.other?.full_name} src={data?.other?.avatar_url} />
        <div>
          <p className="font-medium">{data?.other?.full_name ?? "Loading…"}</p>
          <p className="text-xs text-muted-foreground">{data?.other?.headline}</p>
        </div>
      </Card>
      <div className="mt-4 flex-1 space-y-2 overflow-y-auto rounded-xl border border-border bg-card p-4">
        {(data?.messages ?? []).map((m: any) => {
          const mine = m.sender_id === me?.userId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${mine ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => { e.preventDefault(); if (body.trim()) send.mutate(); }}
      >
        <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message…" />
        <Button type="submit" disabled={!body.trim() || send.isPending}>Send</Button>
      </form>
    </div>
  );
}
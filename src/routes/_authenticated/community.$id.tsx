import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPost, togglePostLike, addComment } from "@/lib/hub.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AvatarPill } from "@/components/avatar-pill";
import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { pendoTrack } from "@/lib/pendo";

export const Route = createFileRoute("/_authenticated/community/$id")({
  head: () => ({ meta: [{ title: "Post — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Post not found</p>,
  component: PostDetail,
});

function PostDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fn = useServerFn(getPost);
  const likeFn = useServerFn(togglePostLike);
  const commentFn = useServerFn(addComment);
  const { data } = useQuery({ queryKey: ["post", id], queryFn: () => fn({ data: { id } }) });
  const [body, setBody] = useState("");

  const like = useMutation({
    mutationFn: () => likeFn({ data: { post_id: id } }),
    onSuccess: () => {
      pendoTrack("community_post_liked", {
        post_id: id,
        action: data?.liked ? "unliked" : "liked",
      });
      qc.invalidateQueries({ queryKey: ["post", id] });
    },
  });
  const comment = useMutation({
    mutationFn: () => commentFn({ data: { post_id: id, body } }),
    onSuccess: () => {
      pendoTrack("community_comment_added", {
        post_id: id,
        comment_length: body.length,
      });
      setBody("");
      qc.invalidateQueries({ queryKey: ["post", id] });
    },
  });

  if (!data?.post) return <p>Loading…</p>;
  const p = data.post as any;

  return (
    <div>
      <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">← Community</Link>
      <Card className="mt-4 p-6">
        <div className="flex items-center gap-3">
          <AvatarPill name={p.author?.full_name} src={p.author?.avatar_url} />
          <div>
            <p className="font-medium">{p.author?.full_name}</p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</p>
          </div>
          <Badge variant="outline" className="ml-auto capitalize">{p.tag}</Badge>
        </div>
        <h1 className="mt-4 font-serif text-3xl font-semibold">{p.title}</h1>
        <p className="mt-3 whitespace-pre-line text-foreground/90">{p.body}</p>
        <Button
          variant={data.liked ? "default" : "outline"}
          size="sm"
          className="mt-4"
          onClick={() => like.mutate()}
        >
          <Heart className={`mr-1 h-4 w-4 ${data.liked ? "fill-current" : ""}`} />
          {data.likeCount}
        </Button>
      </Card>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">Comments</h2>
        <div className="mt-3 space-y-3">
          {data.comments.map((c: any) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-center gap-2">
                <AvatarPill name={c.author?.full_name} src={c.author?.avatar_url} size="sm" />
                <p className="text-sm font-medium">{c.author?.full_name}</p>
                <p className="text-xs text-muted-foreground">· {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{c.body}</p>
            </Card>
          ))}
        </div>
        <form
          className="mt-4 space-y-2"
          onSubmit={(e) => { e.preventDefault(); if (body.trim()) comment.mutate(); }}
        >
          <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Add a comment…" />
          <Button type="submit" disabled={!body.trim() || comment.isPending}>Comment</Button>
        </form>
      </section>
    </div>
  );
}
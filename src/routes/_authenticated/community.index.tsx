import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listPosts, createPost } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AvatarPill } from "@/components/avatar-pill";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/community/")({
  head: () => ({
    meta: [
      { title: "Community — Black Founders Hub" },
      { name: "description", content: "Share wins, asks, and resources with fellow Black Women Founders in the community feed." },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: Community,
});

function Community() {
  const qc = useQueryClient();
  const fn = useServerFn(listPosts);
  const createFn = useServerFn(createPost);
  const { data = [] } = useQuery({ queryKey: ["posts"], queryFn: () => fn() });

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<"ask" | "win" | "resource" | "intro">("ask");

  const create = useMutation({
    mutationFn: () => createFn({ data: { title, body, tag } }),
    onSuccess: () => {
      toast.success("Posted");
      setOpen(false); setTitle(""); setBody(""); setTag("ask");
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div>
      <PageHeader
        title="Community"
        description="Asks, wins, resources, and intros from founders building alongside you."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90"><Plus className="mr-1 h-4 w-4" />New post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Share with the community</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="t">Title</Label>
                  <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={tag} onValueChange={(v) => setTag(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ask">Ask</SelectItem>
                      <SelectItem value="win">Win</SelectItem>
                      <SelectItem value="resource">Resource</SelectItem>
                      <SelectItem value="intro">Intro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="b">Body</Label>
                  <Textarea id="b" rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button disabled={title.length < 3 || body.length < 5 || create.isPending} onClick={() => create.mutate()}>Post</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="space-y-4">
        {data.length === 0 ? <p className="text-muted-foreground">No posts yet. Be the first to share!</p> : null}
        {data.map((p: any) => (
          <Link key={p.id} to="/community/$id" params={{ id: p.id }}>
            <Card className="p-5 transition-colors hover:border-accent">
              <div className="flex items-center gap-3">
                <AvatarPill name={p.author?.full_name} src={p.author?.avatar_url} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{p.author?.full_name ?? "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}</p>
                </div>
                <Badge variant="outline" className="ml-auto capitalize">{p.tag}</Badge>
              </div>
              <h3 className="mt-3 font-serif text-xl font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.body}</p>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" />{p.likes?.[0]?.count ?? 0}</span>
                <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" />{p.comments?.[0]?.count ?? 0}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
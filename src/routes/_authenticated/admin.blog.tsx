import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminListPosts, deleteBlogPost } from "@/lib/blog.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataErrorState } from "@/components/data-error-state";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Blog admin" }] }),
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => <p>Not found</p>,
  component: BlogAdmin,
});

function BlogAdmin() {
  const fn = useServerFn(adminListPosts);
  const delFn = useServerFn(deleteBlogPost);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-posts"], queryFn: () => fn() });
  const del = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Write and publish stories for the community."
        action={
          <Link to="/admin/blog/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New post
            </Button>
          </Link>
        }
      />
      {data.length === 0 ? (
        <p className="text-muted-foreground">No posts yet — write your first.</p>
      ) : (
        <div className="space-y-3">
          {data.map((p: any) => (
            <Card key={p.id} className="flex items-start justify-between gap-4 p-5">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={p.published_at ? "default" : "outline"}>
                    {p.published_at ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{p.slug}</span>
                </div>
                <h3 className="mt-1 font-serif text-lg font-semibold">{p.title}</h3>
                {p.excerpt && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  Updated {format(new Date(p.updated_at), "MMM d, yyyy")}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link to="/admin/blog/$id" params={{ id: p.id }}>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm("Delete this post?")) del.mutate(p.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminListPosts } from "@/lib/blog.functions";
import { BlogEditor } from "@/components/blog-editor";
import { DataErrorState } from "@/components/data-error-state";

export const Route = createFileRoute("/_authenticated/admin/blog/$id")({
  head: () => ({ meta: [{ title: "Edit post — Admin" }] }),
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => <p>Not found</p>,
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const fn = useServerFn(adminListPosts);
  const { data = [] } = useQuery({ queryKey: ["admin-posts"], queryFn: () => fn() });
  const post = data.find((p: any) => p.id === id);
  if (!post) return <p className="text-muted-foreground">Loading…</p>;
  return <BlogEditor initial={post} onSaved={() => navigate({ to: "/admin/blog" })} />;
}
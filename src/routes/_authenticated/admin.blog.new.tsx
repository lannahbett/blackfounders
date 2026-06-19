import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BlogEditor } from "@/components/blog-editor";

export const Route = createFileRoute("/_authenticated/admin/blog/new")({
  head: () => ({ meta: [{ title: "New post — Admin" }] }),
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  return (
    <BlogEditor
      initial={null}
      onSaved={() => navigate({ to: "/admin/blog" })}
    />
  );
}
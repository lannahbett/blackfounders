import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertBlogPost } from "@/lib/blog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

type BlogPostInitial = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  body_md: string;
  tags: string[];
  published_at: string | null;
} | null;

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export function BlogEditor({
  initial,
  onSaved,
}: {
  initial: BlogPostInitial;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? "");
  const [body, setBody] = useState(initial?.body_md ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [preview, setPreview] = useState(false);

  const qc = useQueryClient();
  const fn = useServerFn(upsertBlogPost);
  const save = useMutation({
    mutationFn: (publish: boolean) =>
      fn({
        data: {
          id: initial?.id,
          slug: slug || slugify(title),
          title,
          excerpt: excerpt || null,
          cover_url: coverUrl || null,
          body_md: body,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          publish,
        },
      }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      onSaved();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  return (
    <div>
      <PageHeader
        title={initial ? "Edit post" : "New post"}
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreview((v) => !v)}>
              {preview ? "Edit" : "Preview"}
            </Button>
            <Button variant="outline" onClick={() => save.mutate(false)} disabled={save.isPending}>
              Save draft
            </Button>
            <Button onClick={() => save.mutate(true)} disabled={save.isPending}>
              Publish
            </Button>
          </div>
        }
      />
      {preview ? (
        <Card className="p-6">
          <h2 className="font-serif text-3xl">{title || "Untitled"}</h2>
          {coverUrl && <img src={coverUrl} alt="" className="mt-4 w-full rounded-xl" />}
          <div className="prose mt-6 max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body || "_Empty_"}</ReactMarkdown>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          <div>
            <Label className="mb-1.5 block text-xs">Title</Label>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!initial && !slug) setSlug(slugify(e.target.value));
              }}
              placeholder="Post title"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="mb-1.5 block text-xs">Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Tags (comma separated)</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="funding, mindset" />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Cover image URL (optional)</Label>
            <Input value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://…" />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Excerpt</Label>
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} />
          </div>
          <div>
            <Label className="mb-1.5 block text-xs">Body (Markdown)</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className="font-mono text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
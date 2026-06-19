import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getPublishedPost } from "@/lib/blog.functions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { DataErrorState } from "@/components/data-error-state";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params, context }) => {
    const post = await context.queryClient.ensureQueryData({
      queryKey: ["blog-post", params.slug],
      queryFn: () => getPublishedPost({ data: { slug: params.slug } }),
    });
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Article — Black Founders Hub" }] };
    return {
      meta: [
        { title: `${p.title} — Black Founders Hub` },
        { name: "description", content: p.excerpt ?? p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt ?? "" },
        ...(p.cover_url ? [{ property: "og:image", content: p.cover_url }] : []),
        { property: "og:type", content: "article" },
      ],
    };
  },
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="font-serif text-3xl">Article not found</h1>
      <Link to="/blog" className="mt-4 inline-block text-accent">
        Back to the blog
      </Link>
    </div>
  ),
  component: BlogPost,
});

function BlogPost() {
  const { slug } = Route.useParams();
  const fn = useServerFn(getPublishedPost);
  const { data: post } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fn({ data: { slug } }),
  });
  if (!post) return null;

  return (
    <article className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link to="/blog" className="text-xs uppercase tracking-widest text-accent">
          ← Back to the blog
        </Link>
        <h1 className="mt-4 font-serif text-4xl font-semibold md:text-5xl">{post.title}</h1>
        {post.published_at && (
          <p className="mt-3 text-sm text-muted-foreground">
            {format(new Date(post.published_at), "MMMM d, yyyy")}
          </p>
        )}
        {post.cover_url && (
          <img
            src={post.cover_url}
            alt={post.title}
            className="mt-6 w-full rounded-2xl object-cover"
          />
        )}
        <div className="prose prose-lg mt-8 max-w-none prose-headings:font-serif prose-a:text-accent">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body_md}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
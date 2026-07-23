import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listPublishedPosts } from "@/lib/blog.functions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { DataErrorState } from "@/components/data-error-state";
import { useLocale } from "@/i18n";
import { LanguageSwitcher } from "@/i18n/LanguageSwitcher";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "Blog — Black Founders Hub" },
      {
        name: "description",
        content:
          "Stories, playbooks, and conversations for Black women founders building boldly.",
      },
      { property: "og:title", content: "Black Founders Hub — Blog" },
      {
        property: "og:description",
        content: "Stories and playbooks for Black women founders.",
      },
      { property: "og:url", content: "https://blackfounders.lovable.app/blog" },
    ],
    links: [{ rel: "canonical", href: "https://blackfounders.lovable.app/blog" }],
  }),
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => <p className="p-8">Not found.</p>,
  component: BlogIndex,
});

function BlogIndex() {
  const { t } = useLocale();
  const fn = useServerFn(listPublishedPosts);
  const { data = [] } = useQuery({ queryKey: ["blog-posts"], queryFn: () => fn() });
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex items-center justify-between gap-3">
            <Link to="/" className="text-xs uppercase tracking-widest text-accent">
              {t.blog.backBrand}
            </Link>
            <LanguageSwitcher />
          </div>
          <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">{t.blog.heading}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {t.blog.lede}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-10">
        {data.length === 0 ? (
          <p className="text-muted-foreground">{t.blog.empty}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {data.map((p: any) => (
              <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }}>
                <Card className="overflow-hidden p-0 transition-colors hover:border-accent">
                  {p.cover_url && (
                    <img
                      src={p.cover_url}
                      alt={p.title}
                      className="h-44 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="space-y-2 p-5">
                    <div className="flex flex-wrap gap-1">
                      {(p.tags ?? []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="font-serif text-xl font-semibold leading-tight">{p.title}</h2>
                    {p.excerpt && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
                    )}
                    {p.published_at && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(p.published_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
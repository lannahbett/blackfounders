import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listMentors } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarPill } from "@/components/avatar-pill";
import { Search, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useLocale } from "@/i18n";

export const Route = createFileRoute("/_authenticated/mentors/")({
  head: () => ({ meta: [{ title: "Mentors — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: MentorsPage,
});

function MentorsPage() {
  const { t } = useLocale();
  const [q, setQ] = useState("");
  const fn = useServerFn(listMentors);
  const { data = [] } = useQuery({ queryKey: ["mentors", q], queryFn: () => fn({ data: { q } }) });

  return (
    <div>
      <PageHeader title={t.mentors.title} description={t.mentors.description} />
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t.mentors.searchPlaceholder}
          className="pl-9"
        />
      </div>
      {data.length === 0 ? (
        <p className="text-muted-foreground">{t.mentors.empty}{" "}
          <Link to="/profile" className="text-accent underline">{t.mentors.emptyLinkText}</Link>.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {data.map((m: any) => (
            <Link key={m.user_id} to="/mentors/$id" params={{ id: m.user_id }}>
              <Card className="flex h-full gap-4 p-5 transition-colors hover:border-accent">
                <AvatarPill name={m.profile?.full_name} src={m.profile?.avatar_url} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-serif text-lg font-semibold">{m.profile?.full_name ?? t.mentors.unnamed}</h3>
                    {m.verified ? <BadgeCheck className="h-4 w-4 text-accent" /> : null}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{m.profile?.headline ?? m.profile?.industry}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(m.expertise ?? []).slice(0, 3).map((e: string) => (
                      <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
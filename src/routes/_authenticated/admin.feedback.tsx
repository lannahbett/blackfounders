import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllFeedback, updateFeedbackStatus } from "@/lib/feedback.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataErrorState } from "@/components/data-error-state";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/admin/feedback")({
  head: () => ({ meta: [{ title: "Feedback — Admin" }] }),
  errorComponent: ({ error, reset }) => <DataErrorState error={error} reset={reset} />,
  notFoundComponent: () => <p>Not found</p>,
  component: AdminFeedback,
});

function AdminFeedback() {
  const fn = useServerFn(listAllFeedback);
  const updateFn = useServerFn(updateFeedbackStatus);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["admin-feedback"], queryFn: () => fn() });
  const update = useMutation({
    mutationFn: (vars: { id: string; status: "new" | "triaged" | "resolved" }) =>
      updateFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  return (
    <div>
      <PageHeader
        title="Feedback"
        description="What users are telling us. Triage and resolve."
      />
      {data.length === 0 ? (
        <p className="text-muted-foreground">No feedback yet.</p>
      ) : (
        <div className="space-y-3">
          {data.map((f: any) => (
            <Card key={f.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{f.category}</Badge>
                    {f.rating && (
                      <span className="text-xs text-muted-foreground">
                        {"★".repeat(f.rating)}
                        {"☆".repeat(5 - f.rating)}
                      </span>
                    )}
                    <Badge variant={f.status === "resolved" ? "default" : "outline"}>
                      {f.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm">{f.message}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {f.page_url} • {format(new Date(f.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(["new", "triaged", "resolved"] as const).map((s) => (
                    <Button
                      key={s}
                      size="sm"
                      variant={f.status === s ? "default" : "outline"}
                      onClick={() => update.mutate({ id: f.id, status: s })}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
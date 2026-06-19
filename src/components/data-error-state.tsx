import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";

function friendlyMessage(raw: string | undefined) {
  if (!raw) return "Something went wrong loading this page.";
  if (/relationship between/i.test(raw) || /schema cache/i.test(raw))
    return "We're updating part of the database. Please refresh in a moment.";
  if (/Unauthorized/i.test(raw)) return "Your session expired. Please sign in again.";
  if (/permission/i.test(raw) || /RLS/i.test(raw))
    return "You don't have access to this data yet.";
  if (/fetch|network/i.test(raw)) return "Network hiccup. Check your connection and try again.";
  return raw;
}

export function DataErrorState({ error, reset }: { error: Error | string; reset?: () => void }) {
  const router = useRouter();
  const message = friendlyMessage(typeof error === "string" ? error : error.message);
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gold)]/30 text-foreground">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold">We couldn't load this</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button
        className="mt-5"
        variant="secondary"
        onClick={() => {
          router.invalidate();
          reset?.();
        }}
      >
        <RefreshCcw className="mr-2 h-4 w-4" /> Try again
      </Button>
    </div>
  );
}
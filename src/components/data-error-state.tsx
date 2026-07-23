import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "@tanstack/react-router";
import { useLocale } from "@/i18n";

export function DataErrorState({ error, reset }: { error: Error | string; reset?: () => void }) {
  const router = useRouter();
  const { t } = useLocale();
  const raw = typeof error === "string" ? error : error.message;
  const message = !raw
    ? t.errors.generic
    : /relationship between/i.test(raw) || /schema cache/i.test(raw)
      ? t.errors.schemaCache
      : /Unauthorized/i.test(raw)
        ? t.errors.unauthorized
        : /permission/i.test(raw) || /RLS/i.test(raw)
          ? t.errors.permission
          : /fetch|network/i.test(raw)
            ? t.errors.network
            : raw;
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--gold)]/30 text-foreground">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-serif text-lg font-semibold">{t.errors.dataErrorTitle}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button
        className="mt-5"
        variant="secondary"
        onClick={() => {
          router.invalidate();
          reset?.();
        }}
      >
        <RefreshCcw className="mr-2 h-4 w-4" /> {t.common.tryAgain}
      </Button>
    </div>
  );
}
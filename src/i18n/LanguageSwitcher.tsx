import { Globe } from "lucide-react";
import { LANGS, useLocale, type Lang } from "@/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher({
  align = "end",
  className,
}: {
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const { lang, setLang, t } = useLocale();
  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.language.label}
        className={`inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary ${className ?? ""}`}
      >
        <Globe className="h-3.5 w-3.5" />
        {active.label}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {LANGS.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => setLang(l.code as Lang)}
            className={lang === l.code ? "font-semibold text-accent" : ""}
          >
            {l.code === "en" ? t.language.en : l.code === "pt-BR" ? t.language.ptBR : t.language.es}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
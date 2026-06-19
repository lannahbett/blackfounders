import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AvatarPill({
  name,
  src,
  size = "md",
}: {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const initials = (name ?? "·")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const cls = size === "lg" ? "h-14 w-14 text-lg" : size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10";
  return (
    <Avatar className={cls}>
      {src ? <AvatarImage src={src} alt={name ?? ""} /> : null}
      <AvatarFallback className="bg-[color:var(--gold)]/30 font-serif text-foreground">
        {initials || "·"}
      </AvatarFallback>
    </Avatar>
  );
}
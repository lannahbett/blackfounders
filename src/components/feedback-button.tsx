import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { submitFeedback } from "@/lib/feedback.functions";
import { toast } from "sonner";
import { useLocale } from "@/i18n";

export function FeedbackButton() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<"bug" | "idea" | "love" | "other">("idea");
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");

  const fn = useServerFn(submitFeedback);
  const mutation = useMutation({
    mutationFn: () =>
      fn({
        data: {
          category,
          rating: rating || undefined,
          message,
          page_url: typeof window !== "undefined" ? window.location.pathname : null,
        },
      }),
    onSuccess: () => {
      toast.success(t.feedback.thanks);
      setOpen(false);
      setMessage("");
      setRating(0);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : t.feedback.error),
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-md transition-colors hover:bg-secondary md:inline-flex"
        aria-label={t.feedback.open}
      >
        <MessageSquarePlus className="h-4 w-4 text-accent" /> {t.feedback.label}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t.feedback.dialogTitle}</DialogTitle>
            <DialogDescription>{t.feedback.dialogDesc}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs">{t.feedback.category}</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">{t.feedback.catIdea}</SelectItem>
                  <SelectItem value="bug">{t.feedback.catBug}</SelectItem>
                  <SelectItem value="love">{t.feedback.catLove}</SelectItem>
                  <SelectItem value="other">{t.feedback.catOther}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">{t.feedback.rating}</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n === rating ? 0 : n)}
                    className={`h-9 w-9 rounded-md border text-lg transition-colors ${
                      n <= rating
                        ? "border-accent bg-[color:var(--gold)]/40"
                        : "border-border hover:bg-secondary"
                    }`}
                    aria-label={`Rate ${n}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">{t.feedback.yourFeedback}</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                rows={4}
                placeholder={t.feedback.placeholder}
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {message.length}/2000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {t.feedback.cancel}
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || message.trim().length < 3}
            >
              {mutation.isPending ? t.feedback.sending : t.feedback.submit}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
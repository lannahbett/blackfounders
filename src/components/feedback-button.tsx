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

export function FeedbackButton() {
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
      toast.success("Thanks for the feedback 💛");
      setOpen(false);
      setMessage("");
      setRating(0);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't send feedback"),
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm shadow-md transition-colors hover:bg-secondary md:inline-flex"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="h-4 w-4 text-accent" /> Feedback
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Help us make it better</DialogTitle>
            <DialogDescription>
              Bug, idea, love note — we read everything.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-1.5 block text-xs">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">💡 Idea</SelectItem>
                  <SelectItem value="bug">🐞 Bug</SelectItem>
                  <SelectItem value="love">💛 Love</SelectItem>
                  <SelectItem value="other">✨ Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">How are we doing? (optional)</Label>
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
              <Label className="mb-1.5 block text-xs">Your feedback</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                rows={4}
                placeholder="Tell us what you think…"
              />
              <p className="mt-1 text-right text-xs text-muted-foreground">
                {message.length}/2000
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || message.trim().length < 3}
            >
              {mutation.isPending ? "Sending…" : "Send feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
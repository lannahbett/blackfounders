import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLocale } from "@/i18n";

export function AmaraDock() {
  const { t, lang } = useLocale();
  const SUGGESTIONS = [t.amara.suggestion1, t.amara.suggestion2, t.amara.suggestion3];
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setToken(session?.access_token ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: { lang },
      }),
    [token, lang],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err: Error) => toast.error(err.message || t.amara.couldntRespond),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  async function send(text: string) {
    if (!text.trim() || isLoading) return;
    setInput("");
    await sendMessage({ text: text.trim() });
  }

  return (
    <>
      {!open && (
        <button
          aria-label={t.amara.aria}
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
        >
          <Sparkles className="h-5 w-5 text-[color:var(--gold)]" />
        </button>
      )}
      {open && (
        <div className="fixed inset-x-3 bottom-3 z-50 flex max-h-[80vh] flex-col rounded-2xl border border-border bg-card shadow-2xl md:right-5 md:bottom-5 md:left-auto md:w-[380px] md:max-h-[600px]">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--gold)] text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="font-serif text-base font-semibold leading-tight">Amara</p>
                <p className="text-xs text-muted-foreground">{t.amara.subtitle}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label={t.amara.close}>
              <X className="h-4 w-4" />
            </Button>
          </header>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-sm">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  {t.amara.greeting}
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground transition-colors hover:bg-secondary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m: UIMessage) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex gap-1 px-1 text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
                  style={{ animationDelay: "120ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-current"
                  style={{ animationDelay: "240ms" }}
                />
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.amara.inputPlaceholder}
              disabled={isLoading}
              className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent disabled:opacity-60"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const text = message.parts
    .map((p) => (p.type === "text" ? (p as { type: "text"; text: string }).text : ""))
    .join("");
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-a:text-accent prose-a:underline">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || "…"}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
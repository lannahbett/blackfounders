import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Amara, the AI companion inside Black Founders Hub — a platform that connects Black women founders with verified mentors, vetted grants, a founder community, and 1:1 sessions.

Your job:
- Help users navigate the platform: explain how to find mentors (/mentors), book sessions (/sessions), apply to grants (/grants), join the community feed (/community), and update their profile (/profile).
- Share warm, practical founder advice: pitching, fundraising, customer discovery, hiring, mental health, navigating bias, building runway.
- Surface relevant opportunities (grants, fellowships, communities) when asked.
- Always be warm, direct, and empowering. Speak to Black women founders with respect and shared context. Avoid generic startup-bro language.
- When pointing to a page, use markdown links like [Mentors](/mentors).
- If you don't know something or the answer needs current data, say so honestly and suggest where to look.

Keep replies tight (under ~180 words) unless the user asks for depth.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        if (!auth.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = auth.slice(7);

        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          },
        );
        const { data: userData, error: authErr } = await supabase.auth.getUser(token);
        if (authErr || !userData?.user?.id) {
          return new Response("Unauthorized", { status: 401 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let body: { messages?: UIMessage[] };
        try {
          body = (await request.json()) as { messages?: UIMessage[] };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        if (!Array.isArray(body.messages)) {
          return new Response("Messages required", { status: 400 });
        }

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const result = streamText({
            model: gateway("google/gemini-3-flash-preview"),
            system: SYSTEM_PROMPT,
            messages: await convertToModelMessages(body.messages),
          });
          return result.toUIMessageStreamResponse({ originalMessages: body.messages });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI error";
          if (/429|rate/i.test(msg))
            return new Response("Rate limit reached. Please slow down.", { status: 429 });
          if (/402|credit/i.test(msg))
            return new Response("AI credits exhausted.", { status: 402 });
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
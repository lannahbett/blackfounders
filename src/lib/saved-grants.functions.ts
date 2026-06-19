import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSavedGrants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_grants")
      .select("grant_id, created_at, grant:grants(*)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const toggleSavedGrant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ grant_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("saved_grants")
      .select("grant_id")
      .eq("user_id", userId)
      .eq("grant_id", data.grant_id)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("saved_grants")
        .delete()
        .eq("user_id", userId)
        .eq("grant_id", data.grant_id);
      return { saved: false };
    }
    await supabase.from("saved_grants").insert({ user_id: userId, grant_id: data.grant_id });
    return { saved: true };
  });
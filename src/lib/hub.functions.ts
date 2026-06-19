import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ===== Profile / role =====
export const getMe = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: roles }, { data: mentor }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("mentor_profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    return {
      userId,
      profile,
      roles: (roles ?? []).map((r) => r.role as string),
      mentor,
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        full_name: z.string().min(1).max(120),
        headline: z.string().max(160).optional().nullable(),
        bio: z.string().max(2000).optional().nullable(),
        location: z.string().max(120).optional().nullable(),
        industry: z.string().max(80).optional().nullable(),
        stage: z.string().max(80).optional().nullable(),
        linkedin_url: z.string().url().optional().nullable().or(z.literal("")),
        website: z.string().url().optional().nullable().or(z.literal("")),
        avatar_url: z.string().url().optional().nullable().or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const clean = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v === "" ? null : v]),
    );
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: userId, ...clean })
      .eq("id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ role: z.enum(["founder"]) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const upsertMentorProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        expertise: z.array(z.string()).default([]),
        industries: z.array(z.string()).default([]),
        years_experience: z.number().int().min(0).max(80).optional().nullable(),
        hourly_rate: z.number().min(0).optional().nullable(),
        availability_note: z.string().max(500).optional().nullable(),
        accepting_mentees: z.boolean().default(true),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    // Calls SECURITY DEFINER RPC that grants the mentor role + creates an unverified profile.
    // Admin must flip `verified` before the mentor is treated as vetted.
    const { error } = await supabase.rpc("apply_for_mentor", {
      _expertise: data.expertise,
      _industries: data.industries,
      _years_experience: data.years_experience ?? null,
      _hourly_rate: data.hourly_rate ?? null,
      _availability_note: data.availability_note ?? null,
      _accepting_mentees: data.accepting_mentees,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Mentors =====
export const listMentors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        q: z.string().optional(),
        industry: z.string().optional(),
      })
      .partial()
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("mentor_profiles")
      .select(
        "user_id, expertise, industries, years_experience, hourly_rate, availability_note, verified, accepting_mentees, profile:profiles!mentor_profiles_user_id_profile_fkey(full_name, headline, bio, avatar_url, location, industry)",
      )
      .eq("accepting_mentees", true)
      .order("verified", { ascending: false });
    if (data.industry) query = query.contains("industries", [data.industry]);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const q = data.q?.toLowerCase();
    const filtered = q
      ? (rows ?? []).filter((r) => {
          const p = (r as any).profile;
          return [
            p?.full_name,
            p?.headline,
            p?.bio,
            ...(r.expertise ?? []),
            ...(r.industries ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q);
        })
      : rows ?? [];
    return filtered;
  });

export const getMentor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: mentor, error } = await supabase
      .from("mentor_profiles")
      .select(
        "*, profile:profiles!mentor_profiles_user_id_profile_fkey(full_name, headline, bio, avatar_url, location, industry, linkedin_url, website)",
      )
      .eq("user_id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return mentor;
  });

// ===== Mentorship requests =====
export const sendRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ mentor_id: z.string().uuid(), message: z.string().min(10).max(2000) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (data.mentor_id === userId) throw new Error("Cannot request yourself");
    const { error } = await supabase.from("mentorship_requests").insert({
      founder_id: userId,
      mentor_id: data.mentor_id,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("mentorship_requests")
      .select(
        "*, founder:profiles!mentorship_requests_founder_id_profile_fkey(full_name, avatar_url, headline), mentor:profiles!mentorship_requests_mentor_id_profile_fkey(full_name, avatar_url, headline)",
      )
      .or(`founder_id.eq.${userId},mentor_id.eq.${userId}`)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const respondRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["accepted", "declined", "cancelled"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("mentorship_requests")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Sessions =====
export const bookSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        mentor_id: z.string().uuid(),
        scheduled_at: z.string(),
        duration_min: z.number().int().min(15).max(180).default(30),
        meeting_link: z.string().url().optional().nullable().or(z.literal("")),
        notes: z.string().max(1000).optional().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("sessions").insert({
      mentor_id: data.mentor_id,
      founder_id: userId,
      scheduled_at: data.scheduled_at,
      duration_min: data.duration_min,
      meeting_link: data.meeting_link || null,
      notes: data.notes || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("sessions")
      .select(
        "*, founder:profiles!sessions_founder_id_profile_fkey(full_name, avatar_url), mentor:profiles!sessions_mentor_id_profile_fkey(full_name, avatar_url)",
      )
      .or(`founder_id.eq.${userId},mentor_id.eq.${userId}`)
      .order("scheduled_at", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const cancelSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("sessions")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Messages =====
export const listConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, sender_id, recipient_id, body, read_at, created_at, sender:profiles!messages_sender_id_profile_fkey(full_name, avatar_url), recipient:profiles!messages_recipient_id_profile_fkey(full_name, avatar_url)",
      )
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    const map = new Map<string, any>();
    for (const m of data ?? []) {
      const other = m.sender_id === userId ? m.recipient_id : m.sender_id;
      const otherProfile = m.sender_id === userId ? (m as any).recipient : (m as any).sender;
      if (!map.has(other)) {
        map.set(other, {
          other_id: other,
          other_profile: otherProfile,
          last_message: m.body,
          last_at: m.created_at,
          unread: m.recipient_id === userId && !m.read_at ? 1 : 0,
        });
      } else if (m.recipient_id === userId && !m.read_at) {
        map.get(other).unread += 1;
      }
    }
    return Array.from(map.values());
  });

export const listThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ other_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: msgs, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${data.other_id}),and(sender_id.eq.${data.other_id},recipient_id.eq.${userId})`,
      )
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", userId)
      .eq("sender_id", data.other_id)
      .is("read_at", null);
    const { data: other } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, headline")
      .eq("id", data.other_id)
      .maybeSingle();
    return { messages: msgs ?? [], other };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ recipient_id: z.string().uuid(), body: z.string().min(1).max(4000) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("messages").insert({
      sender_id: userId,
      recipient_id: data.recipient_id,
      body: data.body,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ===== Grants =====
export const listGrants = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ q: z.string().optional(), region: z.string().optional() })
      .partial()
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    let query = supabase
      .from("grants")
      .select("*")
      .order("deadline", { ascending: true, nullsFirst: false });
    if (data.region) query = query.eq("region", data.region);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    const q = data.q?.toLowerCase();
    return q
      ? (rows ?? []).filter((r) =>
          [r.title, r.organization, r.description, ...(r.tags ?? [])]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q),
        )
      : (rows ?? []);
  });

export const getGrant = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: g, error } = await supabase
      .from("grants")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return g;
  });

// ===== Community =====
export const listPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("posts")
      .select(
        "*, author:profiles!posts_author_id_profile_fkey(full_name, avatar_url, headline), likes:post_likes(count), comments:post_comments(count)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        title: z.string().min(3).max(160),
        body: z.string().min(5).max(8000),
        tag: z.enum(["ask", "win", "resource", "intro"]).default("ask"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("posts")
      .insert({ ...data, author_id: userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [{ data: post, error: e1 }, { data: comments, error: e2 }, { data: liked }] = await Promise.all([
      supabase
        .from("posts")
        .select(
          "*, author:profiles!posts_author_id_profile_fkey(full_name, avatar_url, headline)",
        )
        .eq("id", data.id)
        .maybeSingle(),
      supabase
        .from("post_comments")
        .select("*, author:profiles!post_comments_author_id_profile_fkey(full_name, avatar_url)")
        .eq("post_id", data.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("post_likes")
        .select("user_id")
        .eq("post_id", data.id)
        .eq("user_id", userId)
        .maybeSingle(),
    ]);
    if (e1) throw new Error(e1.message);
    if (e2) throw new Error(e2.message);
    const { count } = await context.supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", data.id);
    return { post, comments: comments ?? [], liked: !!liked, likeCount: count ?? 0 };
  });

export const togglePostLike = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ post_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: existing } = await supabase
      .from("post_likes")
      .select("user_id")
      .eq("post_id", data.post_id)
      .eq("user_id", userId)
      .maybeSingle();
    if (existing) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", data.post_id)
        .eq("user_id", userId);
      return { liked: false };
    }
    await supabase.from("post_likes").insert({ post_id: data.post_id, user_id: userId });
    return { liked: true };
  });

export const addComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({ post_id: z.string().uuid(), body: z.string().min(1).max(2000) })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("post_comments")
      .insert({ post_id: data.post_id, author_id: userId, body: data.body });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
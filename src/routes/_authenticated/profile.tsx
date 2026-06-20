import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile, upsertMentorProfile, setRole } from "@/lib/hub.functions";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { pendoTrack } from "@/lib/pendo";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Not found</p>,
  component: ProfilePage,
});

function ProfilePage() {
  const qc = useQueryClient();
  const meFn = useServerFn(getMe);
  const updateFn = useServerFn(updateProfile);
  const mentorFn = useServerFn(upsertMentorProfile);
  const roleFn = useServerFn(setRole);
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: () => meFn() });

  const [p, setP] = useState({
    full_name: "", headline: "", bio: "", location: "", industry: "", stage: "", linkedin_url: "", website: "", avatar_url: "",
  });
  const [m, setM] = useState({
    expertise: "", industries: "", years_experience: 0, hourly_rate: 0, availability_note: "", accepting_mentees: true,
  });
  const isMentor = me?.roles?.includes("mentor");

  useEffect(() => {
    if (me?.profile) setP({
      full_name: me.profile.full_name ?? "",
      headline: me.profile.headline ?? "",
      bio: me.profile.bio ?? "",
      location: me.profile.location ?? "",
      industry: me.profile.industry ?? "",
      stage: me.profile.stage ?? "",
      linkedin_url: me.profile.linkedin_url ?? "",
      website: me.profile.website ?? "",
      avatar_url: me.profile.avatar_url ?? "",
    });
    if (me?.mentor) setM({
      expertise: (me.mentor.expertise ?? []).join(", "),
      industries: (me.mentor.industries ?? []).join(", "),
      years_experience: me.mentor.years_experience ?? 0,
      hourly_rate: Number(me.mentor.hourly_rate ?? 0),
      availability_note: me.mentor.availability_note ?? "",
      accepting_mentees: me.mentor.accepting_mentees ?? true,
    });
  }, [me]);

  const saveProfile = useMutation({
    mutationFn: () => updateFn({ data: p }),
    onSuccess: () => {
      pendoTrack("profile_updated", {
        has_bio: !!p.bio,
        has_headline: !!p.headline,
        has_avatar_url: !!p.avatar_url,
        has_linkedin_url: !!p.linkedin_url,
        has_website: !!p.website,
        industry: p.industry || null,
        stage: p.stage || null,
        location: p.location || null,
      });
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const saveMentor = useMutation({
    mutationFn: () => mentorFn({ data: {
      expertise: m.expertise.split(",").map((s) => s.trim()).filter(Boolean),
      industries: m.industries.split(",").map((s) => s.trim()).filter(Boolean),
      years_experience: Number(m.years_experience) || null,
      hourly_rate: Number(m.hourly_rate) || null,
      availability_note: m.availability_note,
      accepting_mentees: m.accepting_mentees,
    } }),
    onSuccess: () => {
      pendoTrack("mentor_profile_updated", {
        expertise_count: m.expertise.split(",").map((s) => s.trim()).filter(Boolean).length,
        industries_count: m.industries.split(",").map((s) => s.trim()).filter(Boolean).length,
        years_experience: Number(m.years_experience) || null,
        hourly_rate: Number(m.hourly_rate) || null,
        accepting_mentees: m.accepting_mentees,
        has_availability_note: !!m.availability_note,
      });
      toast.success("Mentor profile saved");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e: any) => toast.error(e.message),
  });
  const becomeMentor = useMutation({
    mutationFn: () => roleFn({ data: { role: "mentor" } }),
    onSuccess: () => {
      pendoTrack("mentor_role_activated");
      toast.success("You're now a mentor — fill in your details below.");
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <div>
      <PageHeader title="Your profile" description="Tell the community who you are." />
      <Card className="p-6">
        <h2 className="font-serif text-xl font-semibold">Basics</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Full name"><Input value={p.full_name} onChange={(e) => setP({ ...p, full_name: e.target.value })} /></Field>
          <Field label="Headline"><Input value={p.headline} onChange={(e) => setP({ ...p, headline: e.target.value })} placeholder="Founder of … / Former PM at …" /></Field>
          <Field label="Location"><Input value={p.location} onChange={(e) => setP({ ...p, location: e.target.value })} /></Field>
          <Field label="Industry"><Input value={p.industry} onChange={(e) => setP({ ...p, industry: e.target.value })} /></Field>
          <Field label="Stage"><Input value={p.stage} onChange={(e) => setP({ ...p, stage: e.target.value })} placeholder="idea / mvp / revenue / scaling" /></Field>
          <Field label="Avatar URL"><Input value={p.avatar_url} onChange={(e) => setP({ ...p, avatar_url: e.target.value })} placeholder="https://…" /></Field>
          <Field label="LinkedIn URL"><Input value={p.linkedin_url} onChange={(e) => setP({ ...p, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/…" /></Field>
          <Field label="Website"><Input value={p.website} onChange={(e) => setP({ ...p, website: e.target.value })} placeholder="https://…" /></Field>
          <div className="md:col-span-2">
            <Field label="Bio"><Textarea rows={5} value={p.bio} onChange={(e) => setP({ ...p, bio: e.target.value })} /></Field>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">Save profile</Button>
        </div>
      </Card>

      <Card className="mt-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-semibold">Mentor profile</h2>
            <p className="text-sm text-muted-foreground">{isMentor ? "Visible to founders looking for mentorship." : "Become a mentor to share your expertise."}</p>
          </div>
          {!isMentor ? <Button onClick={() => becomeMentor.mutate()}>Become a mentor</Button> : null}
        </div>
        {isMentor ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Expertise (comma-separated)"><Input value={m.expertise} onChange={(e) => setM({ ...m, expertise: e.target.value })} placeholder="fundraising, product, ops" /></Field>
            <Field label="Industries (comma-separated)"><Input value={m.industries} onChange={(e) => setM({ ...m, industries: e.target.value })} placeholder="fintech, health, consumer" /></Field>
            <Field label="Years of experience"><Input type="number" value={m.years_experience} onChange={(e) => setM({ ...m, years_experience: Number(e.target.value) })} /></Field>
            <Field label="Hourly rate (optional, USD)"><Input type="number" value={m.hourly_rate} onChange={(e) => setM({ ...m, hourly_rate: Number(e.target.value) })} placeholder="0 for free" /></Field>
            <div className="md:col-span-2">
              <Field label="Availability note"><Textarea rows={3} value={m.availability_note} onChange={(e) => setM({ ...m, availability_note: e.target.value })} placeholder="e.g. 2 sessions a month, weekday evenings ET" /></Field>
            </div>
            <label className="flex items-center gap-3 md:col-span-2">
              <Switch checked={m.accepting_mentees} onCheckedChange={(v) => setM({ ...m, accepting_mentees: v })} />
              <span className="text-sm">Accepting new mentees</span>
            </label>
            <div className="md:col-span-2">
              <Button onClick={() => saveMentor.mutate()} disabled={saveMentor.isPending} className="bg-accent text-accent-foreground hover:bg-accent/90">Save mentor profile</Button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
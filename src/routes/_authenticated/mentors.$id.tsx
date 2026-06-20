import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMentor, sendRequest, bookSession } from "@/lib/hub.functions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AvatarPill } from "@/components/avatar-pill";
import { BadgeCheck, Globe, Linkedin, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { pendoTrack } from "@/lib/pendo";

export const Route = createFileRoute("/_authenticated/mentors/$id")({
  head: () => ({ meta: [{ title: "Mentor — Black Founders Hub" }] }),
  errorComponent: ({ error }) => <p className="text-destructive">{error.message}</p>,
  notFoundComponent: () => <p>Mentor not found</p>,
  component: MentorDetail,
});

function MentorDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fn = useServerFn(getMentor);
  const reqFn = useServerFn(sendRequest);
  const bookFn = useServerFn(bookSession);
  const { data: mentor, isLoading } = useQuery({
    queryKey: ["mentor", id],
    queryFn: () => fn({ data: { id } }),
  });

  const [msg, setMsg] = useState("");
  const [when, setWhen] = useState("");
  const [link, setLink] = useState("");

  const request = useMutation({
    mutationFn: () => reqFn({ data: { mentor_id: id, message: msg } }),
    onSuccess: () => {
      pendoTrack("mentorship_request_sent", {
        mentor_id: id,
        message_length: msg.length,
      });
      toast.success("Request sent");
      setMsg("");
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const book = useMutation({
    mutationFn: () =>
      bookFn({ data: { mentor_id: id, scheduled_at: new Date(when).toISOString(), duration_min: 30, meeting_link: link } }),
    onSuccess: () => {
      pendoTrack("session_booked", {
        mentor_id: id,
        duration_min: 30,
        has_meeting_link: !!link,
      });
      toast.success("Session requested");
      qc.invalidateQueries({ queryKey: ["sessions"] });
      navigate({ to: "/sessions" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (isLoading) return <p>Loading…</p>;
  if (!mentor) return <p>Mentor not found</p>;
  const p = (mentor as any).profile;

  return (
    <div>
      <Link to="/mentors" className="text-sm text-muted-foreground hover:text-foreground">← All mentors</Link>
      <Card className="mt-4 p-6">
        <div className="flex flex-wrap items-start gap-5">
          <AvatarPill name={p?.full_name} src={p?.avatar_url} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-3xl font-semibold">{p?.full_name}</h1>
              {mentor.verified ? <BadgeCheck className="h-5 w-5 text-accent" /> : null}
            </div>
            {p?.headline ? <p className="mt-1 text-muted-foreground">{p.headline}</p> : null}
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {p?.location ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{p.location}</span> : null}
              {p?.linkedin_url ? <a className="inline-flex items-center gap-1 hover:text-accent" href={p.linkedin_url} target="_blank" rel="noreferrer"><Linkedin className="h-3 w-3" />LinkedIn</a> : null}
              {p?.website ? <a className="inline-flex items-center gap-1 hover:text-accent" href={p.website} target="_blank" rel="noreferrer"><Globe className="h-3 w-3" />Website</a> : null}
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Request mentorship</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request mentorship</DialogTitle></DialogHeader>
                <Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Briefly: what are you building & what do you need help with?" />
                <DialogFooter>
                  <Button disabled={msg.length < 10 || request.isPending} onClick={() => request.mutate()}>Send request</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Book a session</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Book a 30-min session</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="when">When</Label>
                    <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="link">Meeting link (optional)</Label>
                    <Input id="link" placeholder="https://meet.google.com/…" value={link} onChange={(e) => setLink(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button disabled={!when || book.isPending} onClick={() => book.mutate()}>Request session</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {p?.bio ? <p className="mt-6 whitespace-pre-line text-foreground/90">{p.bio}</p> : null}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Expertise</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(mentor.expertise ?? []).map((e: string) => <Badge key={e} variant="secondary">{e}</Badge>)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Industries</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {(mentor.industries ?? []).map((e: string) => <Badge key={e} variant="outline">{e}</Badge>)}
            </div>
          </div>
          {mentor.years_experience ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Experience</h3>
              <p className="mt-2">{mentor.years_experience} years</p>
            </div>
          ) : null}
          {mentor.availability_note ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Availability</h3>
              <p className="mt-2 text-sm">{mentor.availability_note}</p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
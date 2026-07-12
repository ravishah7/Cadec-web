// frontend/src/components/admin/events/EventForm.tsx

import { useState, useEffect } from "react";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ImageUpload from "@/components/admin/shared/ImageUpload";
import QuestionBuilder from "./QuestionBuilder";
import type { Event, EventFormData, EventStatus } from "@/types/admin.types";

/* ── Constants ── */
const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: "Upcoming",  label: "Upcoming"  },
  { value: "Ongoing",   label: "Ongoing"   },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const EVENT_CATEGORIES = [
  "Workshop", "Seminar", "Competition",
  "Networking", "Cultural", "Other",
];

/* ── Default builder ── */
const buildDefault = (event?: Event | null): EventFormData => ({
  title:                event?.title                                     ?? "",
  description:          event?.description                               ?? "",
  date:                 event?.date  ? event.date.slice(0, 10)          : "",
  time:                 event?.time                                      ?? "",
  location:             event?.location                                  ?? "",
  image:                event?.image                                     ?? "",
  category:             event?.category                                  ?? "Other",
  price:               event?.price                                        ?? "Free",
  status:               event?.status                                    ?? "Upcoming",
  registrationDeadline: event?.registrationDeadline
    ? event.registrationDeadline.slice(0, 10)
    : "",
  isRegistrationOpen:   event?.isRegistrationOpen                       ?? true,
  maxAttendees:         event?.maxAttendees ? String(event.maxAttendees) : "",
  registrationFormType: event?.registrationFormType                     ?? "internal",
  externalFormLink:     event?.externalFormLink                         ?? "",
  questions:            event?.questions                                 ?? [],
  isActive:             event?.isActive                                  ?? true,
});

interface EventFormProps {
  event?: Event | null;
  onSubmit: (data: EventFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EventForm = ({ event, onSubmit, onCancel, isSubmitting }: EventFormProps) => {
  const [form, setForm] = useState<EventFormData>(() => buildDefault(event));

  useEffect(() => { setForm(buildDefault(event)); }, [event]);

  const set = <K extends keyof EventFormData>(k: K, v: EventFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate external form link if external mode selected
    if (form.registrationFormType === "external" && !form.externalFormLink.trim()) {
      return;
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* ── Title ── */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ef-title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Annual Startup Summit"
          required
        />
      </div>

      {/* ── Description ── */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-desc">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="ef-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Describe the event..."
          rows={3}
          required
        />
      </div>

      {/* ── Date + Time ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ef-date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ef-date"
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ef-time">
            Time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ef-time"
            type="time"
            value={form.time}
            onChange={(e) => set("time", e.target.value)}
            required
          />
        </div>
      </div>

      {/* ── Location ── */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-loc">
          Location <span className="text-destructive">*</span>
        </Label>
        <Input
          id="ef-loc"
          value={form.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="PGDAV College, Nehru Nagar"
          required
        />
      </div>

      {/* ── Category + Status ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ef-cat">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger id="ef-cat"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ef-status">Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) => set("status", v as EventStatus)}
          >
            <SelectTrigger id="ef-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price + Max Attendees */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="ef-price">
            Price <span className="text-destructive">*</span>
          </Label>
          <Input
            id="ef-price"
            type="text"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="Free / ₹500 / Prize Pool ₹30,000"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ef-max">Max Attendees</Label>
          <Input
            id="ef-max"
            type="text"
            value={form.maxAttendees}
            onChange={(e) =>  set("maxAttendees", e.target.value)}
            placeholder="Unlimited / 100 Seats / Limited"
          />
        </div>
      </div>

      {/* ── Event Image (Cloudinary) ── */}
      <ImageUpload
        value={form.image}
        onChange={(url) => set("image", url)}
        folder="cadec/events"
        label="Event Image"
        aspectHint="Recommended: 16:9 ratio · JPG, PNG, WEBP · Max 5MB"
      />

      {/* ── Registration Deadline ── */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-deadline">Registration Deadline</Label>
        <Input
          id="ef-deadline"
          type="date"
          value={form.registrationDeadline}
          onChange={(e) => set("registrationDeadline", e.target.value)}
        />
      </div>

      {/* ── Toggles ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="ef-regopen" className="text-sm font-medium">
              Registration Open
            </Label>
            <p className="text-xs text-muted-foreground">Allow registrations</p>
          </div>
          <Switch
            id="ef-regopen"
            checked={form.isRegistrationOpen}
            onCheckedChange={(v) => set("isRegistrationOpen", v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <Label htmlFor="ef-active" className="text-sm font-medium">Active</Label>
            <p className="text-xs text-muted-foreground">Visible publicly</p>
          </div>
          <Switch
            id="ef-active"
            checked={form.isActive}
            onCheckedChange={(v) => set("isActive", v)}
          />
        </div>
      </div>

      {/* ══ REGISTRATION FORM TYPE ══ */}
      <div className="space-y-3 rounded-lg border p-4">
        <div>
          <Label className="text-sm font-medium">Registration Form</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Choose how attendees register for this event
          </p>
        </div>

        <Tabs
          value={form.registrationFormType}
          onValueChange={(v) =>
            set("registrationFormType", v as "internal" | "external")
          }
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="internal" className="text-xs">
              Internal Form
            </TabsTrigger>
            <TabsTrigger value="external" className="text-xs">
              External Link
            </TabsTrigger>
          </TabsList>

          {/* ── Internal: question builder ── */}
          <TabsContent value="internal" className="mt-4">
            <QuestionBuilder
              questions={form.questions}
              onChange={(q) => set("questions", q)}
            />
          </TabsContent>

          {/* ── External: Google Form / Typeform link ── */}
          <TabsContent value="external" className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ef-extlink">
                External Form Link{" "}
                {form.registrationFormType === "external" && (
                  <span className="text-destructive">*</span>
                )}
              </Label>
              <Input
                id="ef-extlink"
                value={form.externalFormLink}
                onChange={(e) => set("externalFormLink", e.target.value)}
                placeholder="https://forms.google.com/... or https://typeform.com/..."
                required={form.registrationFormType === "external"}
              />
              {form.externalFormLink && (
                <a
                  href={form.externalFormLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Preview form link
                </a>
              )}
            </div>

            <div className="rounded-lg bg-muted/50 border border-dashed p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <span className="font-medium text-foreground">Note:</span>{" "}
                When external form is selected, the custom question builder is
                ignored and attendees will be redirected to your external form
                link when they click Register.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Actions ── */}
      <div className="flex justify-end gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          {event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;

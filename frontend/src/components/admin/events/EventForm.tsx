// frontend/src/components/admin/events/EventForm.tsx

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QuestionBuilder from "./QuestionBuilder";
import type { Event, EventFormData, EventStatus } from "@/types/admin.types";

// lowercase — matches model enum exactly
const EVENT_STATUSES: { value: EventStatus; label: string }[] = [
  { value: "Upcoming", label: "Upcoming" },
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
];

const EVENT_CATEGORIES = [
  "Workshop",
  "Seminar",
  "Competition",
  "Networking",
  "Cultural",
  "Other",
];

const buildDefault = (event?: Event | null): EventFormData => ({
  title:               event?.title                                        ?? "",
  description:         event?.description                                  ?? "",
  date:                event?.date   ? event.date.slice(0, 10)            : "",
  time:                event?.time                                         ?? "",
  location:            event?.location                                     ?? "",
  image:               event?.image                                        ?? "",
  category:            event?.category                                     ?? "Other",
  price:               event?.price                                        ?? "Free",
  status:              event?.status                                       ?? "Upcoming",
  registrationDeadline: event?.registrationDeadline
    ? event.registrationDeadline.slice(0, 10)
    : "",
  registrationOpen:  event?.registrationOpen                          ?? true,
  maxAttendees:      event?.maxAttendees ? String(event.maxAttendees)   : "",
  questions:           event?.questions                                    ?? [],
  isActive:            event?.isActive                                     ?? true,
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
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title */}
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

      {/* Description */}
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

      {/* Date + Time */}
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

      {/* Location */}
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

      {/* Category + Status */}
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
      {/* Image URL */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-img">Event Image URL</Label>
        <div className="flex gap-3 items-center">
          <Input
            id="ef-img"
            value={form.image}
            onChange={(e) => set("image", e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          {form.image && (
            <img
              src={form.image}
              alt="Preview"
              className="h-9 w-16 rounded object-cover border bg-muted shrink-0"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
          )}
        </div>
      </div>

      {/* Registration Deadline */}
      <div className="space-y-1.5">
        <Label htmlFor="ef-deadline">Registration Deadline</Label>
        <Input
          id="ef-deadline"
          type="date"
          value={form.registrationDeadline}
          onChange={(e) => set("registrationDeadline", e.target.value)}
        />
      </div>

      {/* Toggles */}
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
            checked={form.registrationOpen}
            onCheckedChange={(v) => set("registrationOpen", v)}
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

      {/* Question Builder */}
      <QuestionBuilder
        questions={form.questions}
        onChange={(q) => set("questions", q)}
      />

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
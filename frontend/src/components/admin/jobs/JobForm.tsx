// frontend/src/components/admin/jobs/JobForm.tsx

import { useState, useEffect } from "react";
import { Loader2, Plus, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Job, JobFormData, JobType } from "@/types/admin.types";

const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Internship"];
const EXPERIENCE_LEVELS = ["Fresher", "0-2 Years", "2-5 Years", "5+ Years"];

const buildDefault = (job?: Job | null): JobFormData => ({
  title:           job?.title              ?? "",
  company:         job?.company            ?? "",
  description:     job?.description        ?? "",
  location:        job?.location           ?? "",
  type:            (job?.type as JobType)  ?? "Full-time",
  experienceLevel: job?.experienceLevel    ?? "",
  applyLink:       job?.applyLink          ?? "",
  companyLogo:     job?.companyLogo        ?? "",
  salary:          job?.salary             ?? "",
  requirements:    job?.requirements       ?? [],
  isActive:        job?.isActive           ?? true,
});

interface JobFormProps {
  job?: Job | null;
  onSubmit: (data: JobFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const JobForm = ({ job, onSubmit, onCancel, isSubmitting }: JobFormProps) => {
  const [form, setForm] = useState<JobFormData>(() => buildDefault(job));
  const [reqInput, setReqInput] = useState("");

  useEffect(() => {
    setForm(buildDefault(job));
    setReqInput("");
  }, [job]);

  const set = <K extends keyof JobFormData>(k: K, v: JobFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addRequirement = () => {
    const t = reqInput.trim();
    if (t && !form.requirements.includes(t)) {
      set("requirements", [...form.requirements, t]);
    }
    setReqInput("");
  };

  const removeRequirement = (r: string) =>
    set("requirements", form.requirements.filter((x) => x !== r));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Title + Company */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="jf-title">
            Job Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="jf-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Frontend Developer"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jf-company">
            Company <span className="text-destructive">*</span>
          </Label>
          <Input
            id="jf-company"
            value={form.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="e.g. Acme Corp"
            required
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="jf-desc">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="jf-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Role overview and responsibilities..."
          rows={4}
          required
        />
      </div>

      {/* Location + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="jf-location">
            Location <span className="text-destructive">*</span>
          </Label>
          <Input
            id="jf-location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="New Delhi / Remote"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jf-type">
            Job Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.type}
            onValueChange={(v) => set("type", v as JobType)}
          >
            <SelectTrigger id="jf-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JOB_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Experience + Salary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="jf-exp">
            Experience Level <span className="text-destructive">*</span>
          </Label>
          <Select
            value={form.experienceLevel}
            onValueChange={(v) => set("experienceLevel", v)}
          >
            <SelectTrigger id="jf-exp">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="jf-salary">Salary</Label>
          <Input
            id="jf-salary"
            value={form.salary}
            onChange={(e) => set("salary", e.target.value)}
            placeholder="₹6–8 LPA"
          />
        </div>
      </div>
{/* Apply Link */}
<div className="space-y-1.5">
  <Label htmlFor="jf-apply">
    Apply Link <span className="text-destructive">*</span>
  </Label>

  <div className="flex gap-2">
    <Input
      id="jf-apply"
      value={form.applyLink}
      onChange={(e) => set("applyLink", e.target.value)}
      placeholder="https://..."
      type="text"
      required
      className="flex-1"
    />

    {form.applyLink && isValidUrl(form.applyLink) && (
      <a
        href={
          form.applyLink.startsWith("http")
            ? form.applyLink
            : `https://${form.applyLink}`
        }
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Preview apply link"
        className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors shrink-0"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    )}
  </div>
</div>
      {/* Company Logo */}
      <div className="space-y-1.5">
        <Label htmlFor="jf-logo">Company Logo URL</Label>
        <div className="flex gap-3 items-center">
          <Input
            id="jf-logo"
            value={form.companyLogo}
            onChange={(e) => set("companyLogo", e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
          {form.companyLogo && isValidUrl(form.companyLogo) && (
            <img
              src={form.companyLogo}
              alt="Logo preview"
              className="h-9 w-9 rounded object-contain border bg-muted shrink-0"
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
          )}
        </div>
      </div>

      {/* Requirements chips */}
      <div className="space-y-1.5">
        <Label htmlFor="jf-req">Requirements</Label>
        <div className="flex gap-2">
          <Input
            id="jf-req"
            value={reqInput}
            onChange={(e) => setReqInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRequirement();
              }
            }}
            placeholder="Type a skill and press Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addRequirement}
            disabled={!reqInput.trim()}
            aria-label="Add requirement"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {form.requirements.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {form.requirements.map((req) => (
              <Badge
                key={req}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {req}
                <button
                  type="button"
                  onClick={() => removeRequirement(req)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${req}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label htmlFor="jf-active" className="text-sm font-medium">
            Active
          </Label>
          <p className="text-xs text-muted-foreground">
            Visible on the public jobs page
          </p>
        </div>
        <Switch
          id="jf-active"
          checked={form.isActive}
          onCheckedChange={(v) => set("isActive", v)}
        />
      </div>

      {/* Actions */}
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
          {job ? "Update Job" : "Create Job"}
        </Button>
      </div>
    </form>
  );
};

export default JobForm;
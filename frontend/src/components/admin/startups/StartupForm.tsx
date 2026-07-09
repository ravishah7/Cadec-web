// frontend/src/components/admin/startups/StartupForm.tsx

import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Startup, StartupFormData } from "@/types/admin.types";

// matches model enum exactly
const STATUSES = ["Incubated", "Accelerated"];

const CATEGORIES = [
  "EdTech", "FinTech", "HealthTech", "AgriTech",
  "E-Commerce", "SaaS", "AI/ML", "Social Impact", "Other",
];

const buildDefault = (s?: Startup | null): StartupFormData => ({
  name:        s?.name        ?? "",
  description: s?.description ?? "",
  logo:        s?.logo        ?? "",
  founders:    s?.founders    ?? [],   // string[]
  status:      s?.status      ?? "Incubated",
  website:     s?.website     ?? "",
  category:    s?.category    ?? "Other",
  yearFounded: s?.yearFounded ?? "",
  funding:     s?.funding     ?? "",
  isActive:    s?.isActive    ?? true,
});

interface StartupFormProps {
  startup?: Startup | null;
  onSubmit: (data: StartupFormData) => Promise<boolean>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const StartupForm = ({ startup, onSubmit, onCancel, isSubmitting }: StartupFormProps) => {
  const [form, setForm] = useState<StartupFormData>(() => buildDefault(startup));
  const [founderInput, setFounderInput] = useState("");

  useEffect(() => {
    setForm(buildDefault(startup));
    setFounderInput("");
  }, [startup]);

  const set = <K extends keyof StartupFormData>(k: K, v: StartupFormData[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const addFounder = () => {
    const t = founderInput.trim();
    if (t && !form.founders.includes(t)) {
      set("founders", [...form.founders, t]);
    }
    setFounderInput("");
  };

  const removeFounder = (name: string) =>
    set("founders", form.founders.filter((f) => f !== name));

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.yearFounded) {
    return; // yearFounded is required
  }

  // Flush any founder name still sitting in the input but not yet added
  const pending = founderInput.trim();
  const finalFounders =
    pending && !form.founders.includes(pending)
      ? [...form.founders, pending]
      : form.founders;

  const success = await onSubmit({ ...form, founders: finalFounders });

  if (success) {
    setFounderInput("");
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="sf-name">
          Startup Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="sf-name"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="GreenLeaf Technologies"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="sf-desc">
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="sf-desc"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="What does this startup do?"
          rows={3}
          required
        />
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sf-cat">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger id="sf-cat"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sf-status">
            Status <span className="text-destructive">*</span>
          </Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger id="sf-status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Website + Year Founded */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sf-web">Website</Label>
          <Input
            id="sf-web"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
            placeholder="https://..."
            type="text"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sf-year">
            Year Founded <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sf-year"
            type="number"
            min={1900}
            max={new Date().getFullYear()}
            value={form.yearFounded}
            onChange={(e) =>
              set("yearFounded", e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder={String(new Date().getFullYear())}
            required
          />
        </div>
      </div>

      {/* Funding + Logo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sf-funding">Funding</Label>
          <Input
            id="sf-funding"
            value={form.funding}
            onChange={(e) => set("funding", e.target.value)}
            placeholder="₹10L Seed / Bootstrapped"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sf-logo">Logo URL</Label>
          <div className="flex gap-2 items-center">
            <Input
              id="sf-logo"
              value={form.logo}
              onChange={(e) => set("logo", e.target.value)}
              placeholder="https://..."
              className="flex-1"
            />
            {form.logo && (
              <img
                src={form.logo}
                alt="Logo"
                className="h-9 w-9 rounded object-contain border bg-muted shrink-0"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Founders — simple string chips */}
      <div className="space-y-1.5">
        <Label htmlFor="sf-founder">Founders</Label>
        <div className="flex gap-2">
          <Input
            id="sf-founder"
            value={founderInput}
            onChange={(e) => setFounderInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFounder();
              }
            }}
            placeholder="Type a founder name and press Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addFounder}
            disabled={!founderInput.trim()}
            aria-label="Add founder"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {form.founders.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {form.founders.map((name) => (
              <Badge
                key={name}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                {name}
                <button
                  type="button"
                  onClick={() => removeFounder(name)}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Active */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label htmlFor="sf-active" className="text-sm font-medium">Active</Label>
          <p className="text-xs text-muted-foreground">
            Visible on the public startups page
          </p>
        </div>
        <Switch
          id="sf-active"
          checked={form.isActive}
          onCheckedChange={(v) => set("isActive", v)}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {startup ? "Update Startup" : "Create Startup"}
        </Button>
      </div>
    </form>
  );
};

export default StartupForm;
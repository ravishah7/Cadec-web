
import {
  useEffect,
  useState,
  useCallback,
  type ElementType,
  type FormEvent,
} from "react";
import {
  BookOpen, FileText, Image, Plus, Edit2,
  Trash2, Loader2, ExternalLink, ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import EmptyState from "@/components/admin/shared/EmptyState";
import { adminGalleryAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { GalleryContent, GalleryItem, GallerySection } from "@/types/admin.types";

/* ── Section metadata ── */
const SECTIONS: {
  key: GallerySection;
  label: string;
  icon: React.ElementType;
  placeholder: string;
}[] = [
  {
    key: "magazines",
    label: "Magazines",
    icon: BookOpen,
    placeholder: "CADEC Monthly — Issue 1",
  },
  {
    key: "brochures",
    label: "Brochures",
    icon: FileText,
    placeholder: "CADEC Info Brochure 2024",
  },
  {
    key: "posters",
    label: "Posters",
    icon: Image,
    placeholder: "BizBlitz Event Poster",
  },
];

/* ── Form state ── */
interface ItemFormState {
  title: string;
  description: string;
  canvaLink: string;
  thumbnail: string;
  isActive: boolean;
}

const EMPTY_FORM: ItemFormState = {
  title:       "",
  description: "",
  canvaLink:   "",
  thumbnail:   "",
  isActive:    true,
};

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const ManageGallery = () => {
  const { toast } = useToast();

  const [content, setContent]     = useState<GalleryContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── form dialog ── */
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [activeSection, setActiveSection]   = useState<GallerySection>("magazines");
  const [editingItem, setEditingItem]       = useState<GalleryItem | null>(null);
  const [form, setForm]                     = useState<ItemFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting]     = useState(false);

  /* ── delete dialog ── */
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    section: GallerySection;
    id: string;
    label: string;
  }>({ open: false, section: "magazines", id: "", label: "" });
  const [isDeleting, setIsDeleting] = useState(false);

  /* ─────────────────────────────────────
     FETCH
  ───────────────────────────────────── */
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminGalleryAPI.getContent();
      setContent(res.data.data);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load gallery content.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  /* ─────────────────────────────────────
     OPEN DIALOGS
  ───────────────────────────────────── */
  const openAdd = (section: GallerySection) => {
    setActiveSection(section);
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (section: GallerySection, item: GalleryItem) => {
    setActiveSection(section);
    setEditingItem(item);
    setForm({
      title:       item.title,
      description: item.description,
      canvaLink:   item.canvaLink,
      thumbnail:   item.thumbnail,
      isActive:    item.isActive,
    });
    setDialogOpen(true);
  };

  /* ─────────────────────────────────────
     SUBMIT
  ───────────────────────────────────── */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  try {
    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      canvaLink:   form.canvaLink.trim(),
      thumbnail:   form.thumbnail.trim(),   // explicit — not spread
      isActive:    form.isActive,
    };

    const res = editingItem
      ? await adminGalleryAPI.updateItem(activeSection, editingItem._id!, payload)
      : await adminGalleryAPI.addItem(activeSection, payload);

    setContent(res.data.data);
    toast({
      title: "Success",
      description: `Item ${editingItem ? "updated" : "added"} successfully.`,
    });
    setDialogOpen(false);
  } catch {
    toast({
      title: "Error",
      description: "Failed to save item.",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  /* ─────────────────────────────────────
     TOGGLE
  ───────────────────────────────────── */
  const handleToggle = async (
    section: GallerySection,
    item: GalleryItem
  ) => {
    try {
      const res = await adminGalleryAPI.toggleItem(
        section,
        item._id!,
        !item.isActive
      );
      setContent(res.data.data);
      toast({
        title: item.isActive ? "Deactivated" : "Activated",
        description: `"${item.title}" is now ${item.isActive ? "hidden" : "visible"}.`,
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  /* ─────────────────────────────────────
     DELETE
  ───────────────────────────────────── */
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await adminGalleryAPI.deleteItem(
        deleteDialog.section,
        deleteDialog.id
      );
      setContent(res.data.data);
      toast({ title: "Deleted", description: `"${deleteDialog.label}" removed.` });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete item.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialog((p) => ({ ...p, open: false }));
    }
  };

  /* ─────────────────────────────────────
     ITEM CARD
  ───────────────────────────────────── */
  const ItemCard = ({
    item,
    section,
  }: {
    item: GalleryItem;
    section: GallerySection;
  }) => (
    <Card className={`overflow-hidden transition-opacity ${!item.isActive ? "opacity-55" : ""}`}>
      {/* Thumbnail */}
      {item.thumbnail ? (
        <div className="h-36 overflow-hidden bg-muted">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) =>
              ((e.target as HTMLImageElement).parentElement!.style.display = "none")
            }
          />
        </div>
      ) : (
        <div className="h-36 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          {section === "magazines" && <BookOpen className="h-10 w-10 text-primary/40" />}
          {section === "brochures" && <FileText className="h-10 w-10 text-primary/40" />}
          {section === "posters"   && <Image    className="h-10 w-10 text-primary/40" />}
        </div>
      )}

      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {item.description}
              </p>
            )}
          </div>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs ${
              item.isActive
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {item.isActive ? "Live" : "Hidden"}
          </Badge>
        </div>

        {/* Canva link preview */}
      
    {item.canvaLink && (
    <a
        href={
        item.canvaLink.startsWith("http")
            ? item.canvaLink
            : `https://${item.canvaLink}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-primary hover:underline truncate"
        onClick={(e) => e.stopPropagation()}
    >
        <ExternalLink className="h-3 w-3 shrink-0" />
        <span className="truncate">
        {item.canvaLink.replace(/^https?:\/\//, "")}
        </span>
    </a>
    )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => handleToggle(section, item)}
            aria-label={item.isActive ? "Hide" : "Show"}
          >
            {item.isActive ? (
              <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
            ) : (
              <ToggleLeft className="h-4 w-4 mr-1 text-muted-foreground" />
            )}
            {item.isActive ? "Live" : "Hidden"}
          </Button>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => openEdit(section, item)}
              aria-label="Edit"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
              onClick={() =>
                setDeleteDialog({
                  open: true,
                  section,
                  id: item._id!,
                  label: item.title,
                })
              }
              aria-label="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  /* ─────────────────────────────────────
     SECTION TAB CONTENT
  ───────────────────────────────────── */
  const SectionTab = ({ section }: { section: typeof SECTIONS[number] }) => {
    const items = content?.[section.key] ?? [];
    const Icon  = section.icon;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? "s" : ""}
            {" · "}
            {items.filter((i) => i.isActive).length} live
          </p>
          <Button size="sm" onClick={() => openAdd(section.key)}>
            <Plus className="h-4 w-4 mr-2" />
            Add {section.label.slice(0, -1)}
          </Button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Icon as any}
            title={`No ${section.label.toLowerCase()} yet`}
            description={`Add ${section.label.toLowerCase()} with Canva view links to display in the gallery.`}
            actionLabel={`Add ${section.label.slice(0, -1)}`}
            onAction={() => openAdd(section.key)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} section={section.key} />
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────
     LOADING
  ───────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /* ─────────────────────────────────────
     RENDER
  ───────────────────────────────────── */
  const sectionLabel = SECTIONS.find((s) => s.key === activeSection)?.label ?? "";

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">Gallery</h2>
        <p className="text-sm text-muted-foreground">
          Manage magazines, brochures, and posters with Canva view links.
        </p>
      </div>

      <Tabs defaultValue="magazines">
        <TabsList className="flex flex-wrap h-auto gap-1">
          {SECTIONS.map((s) => {
            const Icon  = s.icon;
            const count = content?.[s.key].length ?? 0;
            return (
              <TabsTrigger
                key={s.key}
                value={s.key}
                className="flex items-center gap-1.5"
              >
                <Icon className="h-3.5 w-3.5" />
                {s.label}
                <Badge variant="secondary" className="ml-1 text-xs">
                  {count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {SECTIONS.map((s) => (
          <TabsContent key={s.key} value={s.key} className="mt-4">
            <SectionTab section={s} />
          </TabsContent>
        ))}
      </Tabs>

      {/* ══ ADD / EDIT DIALOG ══ */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit" : "Add"}{" "}
              {sectionLabel.slice(0, -1)}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="gi-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="gi-title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder={
                  SECTIONS.find((s) => s.key === activeSection)?.placeholder ?? "Title"
                }
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="gi-desc">Description</Label>
              <Textarea
                id="gi-desc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Brief description (optional)"
                rows={2}
              />
            </div>

            {/* Canva Link */}
<div className="space-y-1.5">
  <Label htmlFor="gi-canva">
    Canva View Link <span className="text-destructive">*</span>
  </Label>

  <Input
    id="gi-canva"
    value={form.canvaLink}
    onChange={(e) =>
      setForm((p) => ({
        ...p,
        canvaLink: e.target.value,
      }))
    }
    placeholder="https://www.canva.com/design/..."
    required
  />

  {form.canvaLink && (
    <a
      href={
        form.canvaLink.startsWith("http")
          ? form.canvaLink
          : `https://${form.canvaLink}`
      }
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
    >
      <ExternalLink className="h-3 w-3" />
      Preview link
    </a>
  )}
</div>

{/* Thumbnail */}
<div className="space-y-1.5">
  <Label htmlFor="gallery-thumbnail">
    Thumbnail URL
  </Label>

  <Input
    id="gallery-thumbnail"
    type="url"
    placeholder="https://example.com/thumbnail.jpg"
    value={form.thumbnail}
    onChange={(e) =>
      setForm((prev) => ({
        ...prev,
        thumbnail: e.target.value,
      }))
    }
  />

  {form.thumbnail && (
    <div className="mt-3 rounded-lg border overflow-hidden">
      <img
        src={form.thumbnail}
        alt="Thumbnail Preview"
        className="w-full h-40 object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  )}
</div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label htmlFor="gi-active" className="text-sm font-medium">
                  Live
                </Label>
                <p className="text-xs text-muted-foreground">
                  Visible to the public in the gallery
                </p>
              </div>
              <Switch
                id="gi-active"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
            </div>

           {/* Actions */}
<div className="flex justify-end gap-2 pt-1">
  <Button
    type="button"
    variant="outline"
    onClick={() => setDialogOpen(false)}
    disabled={isSubmitting}
  >
    Cancel
  </Button>

  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting && (
      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
    )}
    {editingItem ? "Update" : "Add"}
  </Button>
</div>
</form>
</DialogContent>
</Dialog>

      {/* ══ DELETE CONFIRM ══ */}
      <ConfirmDeleteDialog
        open={deleteDialog.open}
        onOpenChange={(o) => setDeleteDialog((p) => ({ ...p, open: o }))}
        onConfirm={handleDelete}
        title={`Delete "${deleteDialog.label}"`}
        description="This will permanently remove the item from the gallery."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageGallery;
// frontend/src/pages/admin/ManageStartups.tsx

import { useEffect, useState } from "react";
import {
  Rocket, Plus, Edit2, Trash2,
  ToggleLeft, ToggleRight, Globe, Calendar, Tag, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import StartupForm from "@/components/admin/startups/StartupForm";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import PaginationControls from "@/components/admin/shared/PaginationControls";
import SearchInput from "@/components/admin/shared/SearchInput";
import EmptyState from "@/components/admin/shared/EmptyState";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { useAdminStartups } from "@/hooks/useAdminStartups";
import type { Startup, StartupFormData } from "@/types/admin.types";
import { cn } from "@/lib/utils";

const STATUSES = ["Incubated", "Accelerated", "Alumni", "Other"];

const ManageStartups = () => {
  const {
    startups, total, page, pageSize, filters,
    isLoading, isSubmitting,
    fetchStartups, createStartup, updateStartup,
    toggleStartupActive, deleteStartup,
    handleFilterChange, handlePageChange,
  } = useAdminStartups();

  const [formOpen, setFormOpen]               = useState(false);
  const [editingStartup, setEditingStartup]   = useState<Startup | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);
  const [isDeleting, setIsDeleting]           = useState(false);

  useEffect(() => { fetchStartups(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditingStartup(null); setFormOpen(true); };
  const openEdit   = (s: Startup) => { setEditingStartup(s); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditingStartup(null); };

  const handleSubmit = async (data: StartupFormData): Promise<boolean> => {
    const ok = editingStartup
      ? await updateStartup(editingStartup._id, data)
      : await createStartup(data);
    if (ok) closeForm();
    return ok;
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    await deleteStartup(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-muted" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/3" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-3 bg-muted rounded" />
        <div className="h-3 bg-muted rounded w-4/5" />
        <div className="h-8 bg-muted rounded mt-4" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Startups</h2>
          <p className="text-sm text-muted-foreground">
            {total} startup{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Startup
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchInput
          value={filters.search}
          onChange={(v) => handleFilterChange({ search: v })}
          placeholder="Search startups..."
          className="flex-1"
        />
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => handleFilterChange({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.isActive || "all"}
          onValueChange={(v) => handleFilterChange({ isActive: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : startups.length === 0 ? (
        <EmptyState
          icon={Rocket}
          title="No startups found"
          description={
            filters.search || filters.status || filters.isActive
              ? "Try adjusting your filters."
              : "Add your first startup to showcase."
          }
          actionLabel={
            !filters.search && !filters.status && !filters.isActive
              ? "Add Startup" : undefined
          }
          onAction={
            !filters.search && !filters.status && !filters.isActive
              ? openCreate : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {startups.map((startup) => (
            <Card
              key={startup._id}
              className={cn("overflow-hidden transition-opacity", !startup.isActive && "opacity-60")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {startup.logo ? (
                      <img
                        src={startup.logo}
                        alt={startup.name}
                        className="w-12 h-12 rounded-lg object-contain border bg-muted shrink-0"
                        onError={(e) =>
                          ((e.target as HTMLImageElement).style.display = "none")
                        }
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Rocket className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{startup.name}</CardTitle>
                      <StatusBadge status={startup.status} variant="startup" />
                    </div>
                  </div>
                  <StatusBadge status={startup.isActive ? "Active" : "Inactive"} variant="active" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {startup.description}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 shrink-0" />
                    {startup.category}
                  </div>
                  {startup.yearFounded && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      Founded {startup.yearFounded}
                    </div>
                  )}
                  {startup.website && (
  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <Globe className="h-3.5 w-3.5 shrink-0" />

                <a
                href={
                    startup.website.startsWith("http")
                    ? startup.website
                    : `https://${startup.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="truncate hover:text-primary transition-colors"
                onClick={(e) => e.stopPropagation()}
                >
                {startup.website.replace(/^https?:\/\//, "")}
                </a>
            </div>
            )}
                  {startup.founders?.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {startup.founders.slice(0, 2).map((f) => f.name).join(", ")}
                      {startup.founders.length > 2 && ` +${startup.founders.length - 2}`}
                    </div>
                  )}
                </div>

                {startup.funding && (
                  <Badge variant="outline" className="text-xs">{startup.funding}</Badge>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost" size="sm" className="h-8 px-2 text-xs"
                    onClick={() => toggleStartupActive(startup._id, !startup.isActive)}
                    aria-label={startup.isActive ? "Deactivate" : "Activate"}
                  >
                    {startup.isActive
                      ? <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
                      : <ToggleLeft  className="h-4 w-4 mr-1 text-muted-foreground" />}
                    {startup.isActive ? "Active" : "Inactive"}
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => openEdit(startup)} aria-label="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingId(startup._id)} aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaginationControls page={page} total={total} pageSize={pageSize} onPageChange={handlePageChange} />

      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingStartup ? "Edit Startup" : "Add New Startup"}</DialogTitle>
          </DialogHeader>
          <StartupForm
            startup={editingStartup}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deletingId}
        onOpenChange={(o) => !o && setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Startup"
        description="This will permanently remove the startup."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageStartups;
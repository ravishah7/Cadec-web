// frontend/src/pages/admin/ManageJobs.tsx

import { useEffect, useState } from "react";
import {
  Briefcase, Plus, Edit2, Trash2,
  ToggleLeft, ToggleRight, MapPin, Clock, DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import JobForm from "@/components/admin/jobs/JobForm";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import PaginationControls from "@/components/admin/shared/PaginationControls";
import SearchInput from "@/components/admin/shared/SearchInput";
import EmptyState from "@/components/admin/shared/EmptyState";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { useAdminJobs } from "@/hooks/useAdminJobs";
import type { Job, JobFormData } from "@/types/admin.types";
import { cn } from "@/lib/utils";

const ManageJobs = () => {
  const {
    jobs, total, page, pageSize, filters,
    isLoading, isSubmitting,
    fetchJobs, createJob, updateJob,
    toggleJobActive, deleteJob,
    handleFilterChange, handlePageChange,
  } = useAdminJobs();

  const [formOpen, setFormOpen]       = useState(false);
  const [editingJob, setEditingJob]   = useState<Job | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);

  useEffect(() => { fetchJobs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditingJob(null); setFormOpen(true); };
  const openEdit   = (job: Job) => { setEditingJob(job); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditingJob(null); };

  const handleSubmit = async (data: JobFormData): Promise<boolean> => {
    const ok = editingJob
      ? await updateJob(editingJob._id, data)
      : await createJob(data);
    if (ok) closeForm();
    return ok;
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    await deleteJob(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-3 bg-muted rounded w-1/2" />
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
          <h2 className="text-xl font-bold">Jobs</h2>
          <p className="text-sm text-muted-foreground">
            {total} job{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchInput
          value={filters.search}
          onChange={(v) => handleFilterChange({ search: v })}
          placeholder="Search jobs..."
          className="flex-1"
        />
        <Select
          value={filters.type || "all"}
          onValueChange={(v) => handleFilterChange({ type: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Full-time">Full-time</SelectItem>
            <SelectItem value="Part-time">Part-time</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.isActive || "all"}
          onValueChange={(v) => handleFilterChange({ isActive: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
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
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description={
            filters.search || filters.type || filters.isActive
              ? "Try adjusting your filters."
              : "Create your first job posting."
          }
          actionLabel={!filters.search && !filters.type && !filters.isActive ? "Add Job" : undefined}
          onAction={!filters.search && !filters.type && !filters.isActive ? openCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card
              key={job._id}
              className={cn("overflow-hidden transition-opacity", !job.isActive && "opacity-60")}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-10 h-10 rounded-lg object-contain border bg-muted shrink-0"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Briefcase className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{job.title}</CardTitle>
                      <p className="text-sm text-primary font-medium truncate">{job.company}</p>
                    </div>
                  </div>
                  <StatusBadge status={job.isActive ? "Active" : "Inactive"} variant="active" />
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {job.experienceLevel}
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" />
                      {job.salary}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs">{job.type}</Badge>
                  {job.requirements.slice(0, 2).map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                  {job.requirements.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{job.requirements.length - 2}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs"
                    onClick={() => toggleJobActive(job._id, !job.isActive)}
                    aria-label={job.isActive ? "Deactivate" : "Activate"}
                  >
                    {job.isActive
                      ? <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
                      : <ToggleLeft  className="h-4 w-4 mr-1 text-muted-foreground" />}
                    {job.isActive ? "Active" : "Inactive"}
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => openEdit(job)} aria-label="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingId(job._id)} aria-label="Delete"
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

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={(o) => !o && closeForm()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Edit Job" : "Create New Job"}</DialogTitle>
          </DialogHeader>
          <JobForm
            job={editingJob}
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
        title="Delete Job"
        description="This will permanently remove the job posting. This cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageJobs;
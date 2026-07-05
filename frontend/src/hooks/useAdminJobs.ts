// frontend/src/hooks/useAdminJobs.ts

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminJobsAPI } from "@/services/api";
import type { Job, JobFormData, JobFilters } from "@/types/admin.types";

const DEFAULT_FILTERS: JobFilters = {
  search: "",
  type: "",
  experienceLevel: "",
  isActive: "",
};

const PAGE_SIZE = 9;

export function useAdminJobs() {
  const { toast } = useToast();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<JobFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJobs = useCallback(
    async (overridePage?: number, overrideFilters?: JobFilters) => {
      setIsLoading(true);
      try {
        const currentPage = overridePage ?? page;
        const currentFilters = overrideFilters ?? filters;

        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
          ...(currentFilters.search && { search: currentFilters.search }),
          ...(currentFilters.type && { type: currentFilters.type }),
          ...(currentFilters.experienceLevel && {
            experienceLevel: currentFilters.experienceLevel,
          }),
          ...(currentFilters.isActive !== "" && {
            isActive: currentFilters.isActive,
          }),
        };

        const response = await adminJobsAPI.getJobs(params);
        setJobs(response.data.data);
        setTotal(response.data.total);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load jobs.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [page, filters, toast]
  );

  const createJob = useCallback(
    async (data: JobFormData): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await adminJobsAPI.createJob(data);
        toast({ title: "Success", description: "Job created successfully." });
        await fetchJobs(1, filters);
        setPage(1);
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create job.";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchJobs, filters, toast]
  );

  const updateJob = useCallback(
    async (id: string, data: Partial<JobFormData>): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await adminJobsAPI.updateJob(id, data);
        toast({ title: "Success", description: "Job updated successfully." });
        await fetchJobs();
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update job.";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchJobs, toast]
  );

  const toggleJobActive = useCallback(
    async (id: string, isActive: boolean): Promise<void> => {
      try {
        await adminJobsAPI.toggleActive(id, isActive);
        setJobs((prev) =>
          prev.map((j) => (j._id === id ? { ...j, isActive } : j))
        );
        toast({
          title: isActive ? "Job Activated" : "Job Deactivated",
          description: `Job has been ${
            isActive ? "activated" : "deactivated"
          }.`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update job status.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const deleteJob = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await adminJobsAPI.deleteJob(id);
        toast({ title: "Success", description: "Job deleted successfully." });
        await fetchJobs();
        return true;
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete job.",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchJobs, toast]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<JobFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setPage(1);
      fetchJobs(1, updated);
    },
    [filters, fetchJobs]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchJobs(newPage, filters);
    },
    [fetchJobs, filters]
  );

  return {
    jobs,
    total,
    page,
    pageSize: PAGE_SIZE,
    filters,
    isLoading,
    isSubmitting,
    fetchJobs,
    createJob,
    updateJob,
    toggleJobActive,
    deleteJob,
    handleFilterChange,
    handlePageChange,
  };
}
// frontend/src/hooks/useAdminStartups.ts

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminStartupsAPI } from "@/services/api";
import type {
  Startup,
  StartupFormData,
  StartupFilters,
} from "@/types/admin.types";

const DEFAULT_FILTERS: StartupFilters = {
  search: "",
  status: "",
  category: "",
  isActive: "",
};

const PAGE_SIZE = 9;

export function useAdminStartups() {
  const { toast } = useToast();

  const [startups, setStartups] = useState<Startup[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<StartupFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStartups = useCallback(
    async (overridePage?: number, overrideFilters?: StartupFilters) => {
      setIsLoading(true);
      try {
        const currentPage = overridePage ?? page;
        const currentFilters = overrideFilters ?? filters;

        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
          ...(currentFilters.search && { search: currentFilters.search }),
          ...(currentFilters.status && { status: currentFilters.status }),
          ...(currentFilters.category && {
            category: currentFilters.category,
          }),
          ...(currentFilters.isActive !== "" && {
            isActive: currentFilters.isActive,
          }),
        };

        const response = await adminStartupsAPI.getStartups(params);
        setStartups(response.data.data);
        setTotal(response.data.total);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load startups.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [page, filters, toast]
  );

  const createStartup = useCallback(
    async (data: StartupFormData): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await adminStartupsAPI.createStartup(data);
        toast({
          title: "Success",
          description: "Startup created successfully.",
        });
        await fetchStartups(1, filters);
        setPage(1);
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create startup.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchStartups, filters, toast]
  );

  const updateStartup = useCallback(
    async (id: string, data: Partial<StartupFormData>): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await adminStartupsAPI.updateStartup(id, data);
        toast({
          title: "Success",
          description: "Startup updated successfully.",
        });
        await fetchStartups();
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update startup.";
        toast({
          title: "Error",
          description: message,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchStartups, toast]
  );

  const toggleStartupActive = useCallback(
    async (id: string, isActive: boolean): Promise<void> => {
      try {
        await adminStartupsAPI.toggleActive(id, isActive);
        setStartups((prev) =>
          prev.map((s) => (s._id === id ? { ...s, isActive } : s))
        );
        toast({
          title: isActive ? "Startup Activated" : "Startup Deactivated",
          description: `Startup has been ${
            isActive ? "activated" : "deactivated"
          }.`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update startup status.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const deleteStartup = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await adminStartupsAPI.deleteStartup(id);
        toast({
          title: "Success",
          description: "Startup deleted successfully.",
        });
        await fetchStartups();
        return true;
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete startup.",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchStartups, toast]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<StartupFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setPage(1);
      fetchStartups(1, updated);
    },
    [filters, fetchStartups]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchStartups(newPage, filters);
    },
    [fetchStartups, filters]
  );

  return {
    startups,
    total,
    page,
    pageSize: PAGE_SIZE,
    filters,
    isLoading,
    isSubmitting,
    fetchStartups,
    createStartup,
    updateStartup,
    toggleStartupActive,
    deleteStartup,
    handleFilterChange,
    handlePageChange,
  };
}
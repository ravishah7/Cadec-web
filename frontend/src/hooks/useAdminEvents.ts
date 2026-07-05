// frontend/src/hooks/useAdminEvents.ts

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { adminEventsAPI } from "@/services/api";
import type { Event, EventFormData, EventFilters } from "@/types/admin.types";

const DEFAULT_FILTERS: EventFilters = {
  search: "",
  status: "",
  category: "",
  registrationOpen: "",
};

const PAGE_SIZE = 9;

export function useAdminEvents() {
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = useCallback(
    async (overridePage?: number, overrideFilters?: EventFilters) => {
      setIsLoading(true);
      try {
        const currentPage = overridePage ?? page;
        const currentFilters = overrideFilters ?? filters;

        const params = {
          page: currentPage,
          limit: PAGE_SIZE,
          ...(currentFilters.search && { search: currentFilters.search }),
          ...(currentFilters.status && { status: currentFilters.status }),
          ...(currentFilters.category && { category: currentFilters.category }),
          ...(currentFilters.registrationOpen !== "" && {
            registrationOpen: currentFilters.registrationOpen,
          }),
        };

        const response = await adminEventsAPI.getEvents(params);
        setEvents(response.data.data);
        setTotal(response.data.total);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load events.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [page, filters, toast]
  );

  const createEvent = useCallback(
    async (data: EventFormData): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await adminEventsAPI.createEvent(data);
        toast({ title: "Success", description: "Event created successfully." });
        await fetchEvents(1, filters);
        setPage(1);
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to create event.";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchEvents, filters, toast]
  );

  const updateEvent = useCallback(
    async (id: string, data: Partial<EventFormData>): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        await adminEventsAPI.updateEvent(id, data);
        toast({ title: "Success", description: "Event updated successfully." });
        await fetchEvents();
        return true;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update event.";
        toast({ title: "Error", description: message, variant: "destructive" });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchEvents, toast]
  );

  const toggleEventActive = useCallback(
    async (id: string, isActive: boolean): Promise<void> => {
      try {
        await adminEventsAPI.toggleActive(id, isActive);
        setEvents((prev) =>
          prev.map((e) => (e._id === id ? { ...e, isActive } : e))
        );
        toast({
          title: isActive ? "Event Activated" : "Event Deactivated",
          description: `Event has been ${
            isActive ? "activated" : "deactivated"
          }.`,
        });
      } catch {
        toast({
          title: "Error",
          description: "Failed to update event status.",
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await adminEventsAPI.deleteEvent(id);
        toast({ title: "Success", description: "Event deleted successfully." });
        await fetchEvents();
        return true;
      } catch {
        toast({
          title: "Error",
          description: "Failed to delete event.",
          variant: "destructive",
        });
        return false;
      }
    },
    [fetchEvents, toast]
  );

  const handleFilterChange = useCallback(
    (newFilters: Partial<EventFilters>) => {
      const updated = { ...filters, ...newFilters };
      setFilters(updated);
      setPage(1);
      fetchEvents(1, updated);
    },
    [filters, fetchEvents]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchEvents(newPage, filters);
    },
    [fetchEvents, filters]
  );

  return {
    events,
    total,
    page,
    pageSize: PAGE_SIZE,
    filters,
    isLoading,
    isSubmitting,
    fetchEvents,
    createEvent,
    updateEvent,
    toggleEventActive,
    deleteEvent,
    handleFilterChange,
    handlePageChange,
  };
}
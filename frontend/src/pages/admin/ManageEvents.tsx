// frontend/src/pages/admin/ManageEvents.tsx

import { useEffect, useState } from "react";
import {
  CalendarDays, Plus, Edit2, Trash2,
  ToggleLeft, ToggleRight, MapPin, Tag, Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import EventForm from "@/components/admin/events/EventForm";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import PaginationControls from "@/components/admin/shared/PaginationControls";
import SearchInput from "@/components/admin/shared/SearchInput";
import EmptyState from "@/components/admin/shared/EmptyState";
import StatusBadge from "@/components/admin/shared/StatusBadge";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import type { Event, EventFormData } from "@/types/admin.types";
import { cn } from "@/lib/utils";

const ManageEvents = () => {
  const {
    events, total, page, pageSize, filters,
    isLoading, isSubmitting,
    fetchEvents, createEvent, updateEvent,
    toggleEventActive, deleteEvent,
    handleFilterChange, handlePageChange,
  } = useAdminEvents();

  const [formOpen, setFormOpen]           = useState(false);
  const [editingEvent, setEditingEvent]   = useState<Event | null>(null);
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);

  useEffect(() => { fetchEvents(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditingEvent(null); setFormOpen(true); };
  const openEdit   = (e: Event) => { setEditingEvent(e); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditingEvent(null); };

  const handleSubmit = async (data: EventFormData): Promise<boolean> => {
    const ok = editingEvent
      ? await updateEvent(editingEvent._id, data)
      : await createEvent(data);
    if (ok) closeForm();
    return ok;
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    await deleteEvent(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
  };

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      });
    } catch { return d; }
  };

  const SkeletonCard = () => (
    <Card className="animate-pulse">
      <CardHeader className="pb-3">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-3 bg-muted rounded w-1/2 mt-1.5" />
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
          <h2 className="text-xl font-bold">Events</h2>
          <p className="text-sm text-muted-foreground">
            {total} event{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <SearchInput
          value={filters.search}
          onChange={(v) => handleFilterChange({ search: v })}
          placeholder="Search events..."
          className="flex-1"
        />
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => handleFilterChange({ status: v === "all" ? "" : v })}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Upcoming">Upcoming</SelectItem>
            <SelectItem value="Ongoing">Ongoing</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.registrationOpen || "all"}
          onValueChange={(v) =>
            handleFilterChange({ registrationOpen: v === "all" ? "" : v })
          }
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Registration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Registration</SelectItem>
            <SelectItem value="true">Open</SelectItem>
            <SelectItem value="false">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events found"
          description={
            filters.search || filters.status || filters.registrationOpen
              ? "Try adjusting your filters."
              : "Create your first event."
          }
          actionLabel={
            !filters.search && !filters.status && !filters.registrationOpen
              ? "Add Event" : undefined
          }
          onAction={
            !filters.search && !filters.status && !filters.registrationOpen
              ? openCreate : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card
              key={event._id}
              className={cn("overflow-hidden transition-opacity", !event.isActive && "opacity-60")}
            >
              {event.image && (
                <div className="h-32 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).parentElement!.style.display = "none")
                    }
                  />
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{event.title}</CardTitle>
                  <StatusBadge status={event.status} variant="event" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {fmtDate(event.date)}{event.time && ` · ${event.time}`}
                </p>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Tag className="h-3.5 w-3.5 shrink-0" />
                    {event.category}
                    {event.price}
                  </div>
                  {event.maxAttendees && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      Max {event.maxAttendees} attendees
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <StatusBadge
                    status={event.isRegistrationOpen ? "Open" : "Closed"}
                    variant="active"
                  />
                  {event.questions.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {event.questions.length} question{event.questions.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <Button
                    variant="ghost" size="sm" className="h-8 px-2 text-xs"
                    onClick={() => toggleEventActive(event._id, !event.isActive)}
                    aria-label={event.isActive ? "Deactivate" : "Activate"}
                  >
                    {event.isActive
                      ? <ToggleRight className="h-4 w-4 mr-1 text-green-600" />
                      : <ToggleLeft  className="h-4 w-4 mr-1 text-muted-foreground" />}
                    {event.isActive ? "Active" : "Inactive"}
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => openEdit(event)} aria-label="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon"
                      className="h-8 w-8 hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeletingId(event._id)} aria-label="Delete"
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
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <EventForm
            event={editingEvent}
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
        title="Delete Event"
        description="This will permanently remove the event and all its data."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageEvents;
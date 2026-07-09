// frontend/src/pages/admin/ManageAbout.tsx

import { useEffect, useState, useCallback } from "react";
import {
  Users, GraduationCap, Calendar, Trophy,
  Plus, Edit2, Trash2, Loader2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import ConfirmDeleteDialog from "@/components/admin/ConfirmDeleteDialog";
import EmptyState from "@/components/admin/shared/EmptyState";
import { adminAboutAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type {
  AboutContent, FacultyMember, StudentCoordinator,
  MajorEvent, Competition, CompetitionWinner,
} from "@/types/admin.types";

/* ─── Icon options for major events ─── */
const ICON_OPTIONS = [
  "Calendar", "GraduationCap", "Building2", "Trophy",
  "Users", "Star", "Briefcase", "Award", "Lightbulb", "Target",
];

/* ─── Generic member form (faculty + coordinator share same shape) ─── */
interface MemberFormState {
  name: string;
  role: string;
  department: string;
}

const EMPTY_MEMBER: MemberFormState = { name: "", role: "", department: "" };

/* ─── Major event form ─── */
interface EventFormState {
  title: string;
  description: string;
  icon: string;
}

const EMPTY_EVENT: EventFormState = { title: "", description: "", icon: "Calendar" };

/* ─── Competition form ─── */
interface CompetitionFormState {
  title: string;
  subtitle: string;
}

const EMPTY_COMPETITION: CompetitionFormState = { title: "", subtitle: "" };

/* ─── Winner form ─── */
interface WinnerFormState {
  name: string;
  startup: string;
  position: string;
  amount: string;
}

const EMPTY_WINNER: WinnerFormState = {
  name: "", startup: "", position: "", amount: "",
};

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const ManageAbout = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ── delete dialog state ── */
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    label: string;
    onConfirm: () => Promise<void>;
  }>({ open: false, label: "", onConfirm: async () => {} });
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── faculty dialog ── */
  const [facultyDialog, setFacultyDialog] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [facultyForm, setFacultyForm] = useState<MemberFormState>(EMPTY_MEMBER);
  const [facultySubmitting, setFacultySubmitting] = useState(false);

  /* ── coordinator dialog ── */
  const [coordDialog, setCoordDialog] = useState(false);
  const [editingCoord, setEditingCoord] = useState<StudentCoordinator | null>(null);
  const [coordForm, setCoordForm] = useState<MemberFormState>(EMPTY_MEMBER);
  const [coordSubmitting, setCoordSubmitting] = useState(false);

  /* ── major events dialog ── */
  const [eventDialog, setEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<MajorEvent | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(EMPTY_EVENT);
  const [eventSubmitting, setEventSubmitting] = useState(false);

  /* ── competition dialog ── */
  const [compDialog, setCompDialog] = useState(false);
  const [editingComp, setEditingComp] = useState<Competition | null>(null);
  const [compForm, setCompForm] = useState<CompetitionFormState>(EMPTY_COMPETITION);
  const [compSubmitting, setCompSubmitting] = useState(false);

  /* ── winner dialog ── */
  const [winnerDialog, setWinnerDialog] = useState(false);
  const [winnerCompId, setWinnerCompId] = useState<string>("");
  const [editingWinner, setEditingWinner] = useState<CompetitionWinner | null>(null);
  const [winnerForm, setWinnerForm] = useState<WinnerFormState>(EMPTY_WINNER);
  const [winnerSubmitting, setWinnerSubmitting] = useState(false);

  /* ── expanded competitions ── */
  const [expandedComps, setExpandedComps] = useState<Record<string, boolean>>({});

  /* ─────────────────────────────────────
     FETCH
  ───────────────────────────────────── */
  const fetchContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminAboutAPI.getContent();
      setContent(res.data.data);
    } catch {
      toast({ title: "Error", description: "Failed to load about content.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchContent(); }, [fetchContent]);

  /* ─────────────────────────────────────
     DELETE HELPER
  ───────────────────────────────────── */
  const confirmDelete = (label: string, onConfirm: () => Promise<void>) => {
    setDeleteDialog({ open: true, label, onConfirm });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDialog.onConfirm();
      toast({ title: "Deleted", description: `${deleteDialog.label} removed.` });
    } catch {
      toast({ title: "Error", description: "Delete failed.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setDeleteDialog((p) => ({ ...p, open: false }));
    }
  };

  /* ─────────────────────────────────────
     FACULTY
  ───────────────────────────────────── */
  const openAddFaculty = () => {
    setEditingFaculty(null);
    setFacultyForm(EMPTY_MEMBER);
    setFacultyDialog(true);
  };

  const openEditFaculty = (m: FacultyMember) => {
    setEditingFaculty(m);
    setFacultyForm({ name: m.name, role: m.role, department: m.department });
    setFacultyDialog(true);
  };

  const submitFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacultySubmitting(true);
    try {
      const res = editingFaculty
        ? await adminAboutAPI.updateFaculty(editingFaculty._id!, facultyForm)
        : await adminAboutAPI.addFaculty(facultyForm);
      setContent(res.data.data);
      toast({ title: "Success", description: `Faculty member ${editingFaculty ? "updated" : "added"}.` });
      setFacultyDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to save faculty member.", variant: "destructive" });
    } finally {
      setFacultySubmitting(false);
    }
  };

  /* ─────────────────────────────────────
     COORDINATORS
  ───────────────────────────────────── */
  const openAddCoord = () => {
    setEditingCoord(null);
    setCoordForm(EMPTY_MEMBER);
    setCoordDialog(true);
  };

  const openEditCoord = (m: StudentCoordinator) => {
    setEditingCoord(m);
    setCoordForm({ name: m.name, role: m.role, department: m.department });
    setCoordDialog(true);
  };

  const submitCoord = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoordSubmitting(true);
    try {
      const res = editingCoord
        ? await adminAboutAPI.updateCoordinator(editingCoord._id!, coordForm)
        : await adminAboutAPI.addCoordinator(coordForm);
      setContent(res.data.data);
      toast({ title: "Success", description: `Coordinator ${editingCoord ? "updated" : "added"}.` });
      setCoordDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to save coordinator.", variant: "destructive" });
    } finally {
      setCoordSubmitting(false);
    }
  };

  /* ─────────────────────────────────────
     MAJOR EVENTS
  ───────────────────────────────────── */
  const openAddEvent = () => {
    setEditingEvent(null);
    setEventForm(EMPTY_EVENT);
    setEventDialog(true);
  };

  const openEditEvent = (ev: MajorEvent) => {
    setEditingEvent(ev);
    setEventForm({ title: ev.title, description: ev.description, icon: ev.icon });
    setEventDialog(true);
  };

  const submitEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventSubmitting(true);
    try {
      const res = editingEvent
        ? await adminAboutAPI.updateEvent(editingEvent._id!, eventForm)
        : await adminAboutAPI.addEvent(eventForm);
      setContent(res.data.data);
      toast({ title: "Success", description: `Event ${editingEvent ? "updated" : "added"}.` });
      setEventDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to save event.", variant: "destructive" });
    } finally {
      setEventSubmitting(false);
    }
  };

  /* ─────────────────────────────────────
     COMPETITIONS
  ───────────────────────────────────── */
  const openAddComp = () => {
    setEditingComp(null);
    setCompForm(EMPTY_COMPETITION);
    setCompDialog(true);
  };

  const openEditComp = (c: Competition) => {
    setEditingComp(c);
    setCompForm({ title: c.title, subtitle: c.subtitle });
    setCompDialog(true);
  };

  const submitComp = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompSubmitting(true);
    try {
      const res = editingComp
        ? await adminAboutAPI.updateCompetition(editingComp._id!, { ...compForm, winners: editingComp.winners })
        : await adminAboutAPI.addCompetition({ ...compForm, winners: [] });
      setContent(res.data.data);
      toast({ title: "Success", description: `Competition ${editingComp ? "updated" : "added"}.` });
      setCompDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to save competition.", variant: "destructive" });
    } finally {
      setCompSubmitting(false);
    }
  };

  /* ─────────────────────────────────────
     WINNERS
  ───────────────────────────────────── */
  const openAddWinner = (compId: string) => {
    setWinnerCompId(compId);
    setEditingWinner(null);
    setWinnerForm(EMPTY_WINNER);
    setWinnerDialog(true);
  };

  const openEditWinner = (compId: string, w: CompetitionWinner) => {
    setWinnerCompId(compId);
    setEditingWinner(w);
    setWinnerForm({ name: w.name, startup: w.startup, position: w.position, amount: w.amount });
    setWinnerDialog(true);
  };

  const submitWinner = async (e: React.FormEvent) => {
    e.preventDefault();
    setWinnerSubmitting(true);
    try {
      const res = editingWinner
        ? await adminAboutAPI.updateWinner(winnerCompId, editingWinner._id!, winnerForm)
        : await adminAboutAPI.addWinner(winnerCompId, winnerForm);
      setContent(res.data.data);
      toast({ title: "Success", description: `Winner ${editingWinner ? "updated" : "added"}.` });
      setWinnerDialog(false);
    } catch {
      toast({ title: "Error", description: "Failed to save winner.", variant: "destructive" });
    } finally {
      setWinnerSubmitting(false);
    }
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
  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold">About Page</h2>
        <p className="text-sm text-muted-foreground">
          Manage faculty, student coordinators, major events, and competition winners.
        </p>
      </div>

      <Tabs defaultValue="faculty">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="faculty" className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Faculty
            <Badge variant="secondary" className="ml-1 text-xs">
              {content?.facultyMembers.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="coordinators" className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Coordinators
            <Badge variant="secondary" className="ml-1 text-xs">
              {content?.studentCoordinators.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Events
            <Badge variant="secondary" className="ml-1 text-xs">
              {content?.majorEvents.length ?? 0}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="competitions" className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            Competitions
            <Badge variant="secondary" className="ml-1 text-xs">
              {content?.competitions.length ?? 0}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* ══ FACULTY ══ */}
        <TabsContent value="faculty" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddFaculty}>
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty Member
            </Button>
          </div>

          {!content?.facultyMembers.length ? (
            <EmptyState
              icon={GraduationCap}
              title="No faculty members"
              description="Add faculty advisors to display on the About page."
              actionLabel="Add Faculty Member"
              onAction={openAddFaculty}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {content.facultyMembers.map((m) => (
                <Card key={m._id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">{m.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{m.department}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => openEditFaculty(m)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          confirmDelete(`Faculty member "${m.name}"`, async () => {
                            const res = await adminAboutAPI.deleteFaculty(m._id!);
                            setContent(res.data.data);
                          })
                        }>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══ COORDINATORS ══ */}
        <TabsContent value="coordinators" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddCoord}>
              <Plus className="h-4 w-4 mr-2" />
              Add Coordinator
            </Button>
          </div>

          {!content?.studentCoordinators.length ? (
            <EmptyState
              icon={Users}
              title="No student coordinators"
              description="Add student leaders to display on the About page."
              actionLabel="Add Coordinator"
              onAction={openAddCoord}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {content.studentCoordinators.map((m) => (
                <Card key={m._id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{m.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">{m.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{m.department}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => openEditCoord(m)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          confirmDelete(`Coordinator "${m.name}"`, async () => {
                            const res = await adminAboutAPI.deleteCoordinator(m._id!);
                            setContent(res.data.data);
                          })
                        }>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══ MAJOR EVENTS ══ */}
        <TabsContent value="events" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddEvent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>

          {!content?.majorEvents.length ? (
            <EmptyState
              icon={Calendar}
              title="No major events"
              description="Add events to display on the About page."
              actionLabel="Add Event"
              onAction={openAddEvent}
            />
          ) : (
            <div className="space-y-3">
              {content.majorEvents.map((ev) => (
                <Card key={ev._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="bg-primary/10 p-2 rounded-lg shrink-0">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{ev.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {ev.description}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1.5">{ev.icon}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => openEditEvent(ev)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon"
                        className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          confirmDelete(`Event "${ev.title}"`, async () => {
                            const res = await adminAboutAPI.deleteEvent(ev._id!);
                            setContent(res.data.data);
                          })
                        }>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ══ COMPETITIONS ══ */}
        <TabsContent value="competitions" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={openAddComp}>
              <Plus className="h-4 w-4 mr-2" />
              Add Competition
            </Button>
          </div>

          {!content?.competitions.length ? (
            <EmptyState
              icon={Trophy}
              title="No competitions"
              description="Add competitions and their winners to display on the About page."
              actionLabel="Add Competition"
              onAction={openAddComp}
            />
          ) : (
            <div className="space-y-4">
              {content.competitions.map((comp) => (
                <Card key={comp._id} className="overflow-hidden">
                  {/* Competition header */}
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base">{comp.title}</CardTitle>
                        {comp.subtitle && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {comp.subtitle}
                          </p>
                        )}
                        <Badge variant="secondary" className="text-xs mt-1.5">
                          {comp.winners.length} winner{comp.winners.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => openEditComp(comp)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon"
                          className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            confirmDelete(`Competition "${comp.title}"`, async () => {
                              const res = await adminAboutAPI.deleteCompetition(comp._id!);
                              setContent(res.data.data);
                            })
                          }>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() =>
                            setExpandedComps((p) => ({ ...p, [comp._id!]: !p[comp._id!] }))
                          }
                          aria-label="Toggle winners"
                        >
                          {expandedComps[comp._id!]
                            ? <ChevronUp className="h-3.5 w-3.5" />
                            : <ChevronDown className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Winners (collapsible) */}
                  {expandedComps[comp._id!] && (
                    <CardContent className="pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Winners
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs"
                          onClick={() => openAddWinner(comp._id!)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Winner
                        </Button>
                      </div>

                      {comp.winners.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded-lg">
                          No winners yet. Click "Add Winner" above.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {comp.winners.map((w) => (
                            <div
                              key={w._id}
                              className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/30"
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs shrink-0">
                                    {w.position}
                                  </Badge>
                                  <span className="text-sm font-medium truncate">
                                    {w.startup}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {w.name} · {w.amount}
                                </p>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <Button
                                  variant="ghost" size="icon" className="h-7 w-7"
                                  onClick={() => openEditWinner(comp._id!, w)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost" size="icon"
                                  className="h-7 w-7 hover:text-destructive hover:bg-destructive/10"
                                  onClick={() =>
                                    confirmDelete(`Winner "${w.startup}"`, async () => {
                                      const res = await adminAboutAPI.deleteWinner(comp._id!, w._id!);
                                      setContent(res.data.data);
                                    })
                                  }
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ══ FACULTY DIALOG ══ */}
      <Dialog open={facultyDialog} onOpenChange={(o) => !o && setFacultyDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingFaculty ? "Edit Faculty Member" : "Add Faculty Member"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitFaculty} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="f-name">Name <span className="text-destructive">*</span></Label>
              <Input id="f-name" value={facultyForm.name} required
                onChange={(e) => setFacultyForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Dr. Richa Agarwal Malik" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-role">Role <span className="text-destructive">*</span></Label>
              <Input id="f-role" value={facultyForm.role} required
                onChange={(e) => setFacultyForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="Convenor" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-dept">Department <span className="text-destructive">*</span></Label>
              <Input id="f-dept" value={facultyForm.department} required
                onChange={(e) => setFacultyForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="Faculty Advisor" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setFacultyDialog(false)}
                disabled={facultySubmitting}>Cancel</Button>
              <Button type="submit" disabled={facultySubmitting}>
                {facultySubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingFaculty ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ COORDINATOR DIALOG ══ */}
      <Dialog open={coordDialog} onOpenChange={(o) => !o && setCoordDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoord ? "Edit Coordinator" : "Add Coordinator"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitCoord} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name <span className="text-destructive">*</span></Label>
              <Input id="c-name" value={coordForm.name} required
                onChange={(e) => setCoordForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Ankit Anand" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-role">Role <span className="text-destructive">*</span></Label>
              <Input id="c-role" value={coordForm.role} required
                onChange={(e) => setCoordForm((p) => ({ ...p, role: e.target.value }))}
                placeholder="President" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-dept">Department <span className="text-destructive">*</span></Label>
              <Input id="c-dept" value={coordForm.department} required
                onChange={(e) => setCoordForm((p) => ({ ...p, department: e.target.value }))}
                placeholder="Student Coordinator" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setCoordDialog(false)}
                disabled={coordSubmitting}>Cancel</Button>
              <Button type="submit" disabled={coordSubmitting}>
                {coordSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCoord ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ MAJOR EVENT DIALOG ══ */}
      <Dialog open={eventDialog} onOpenChange={(o) => !o && setEventDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Major Event" : "Add Major Event"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitEvent} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="ev-title">Title <span className="text-destructive">*</span></Label>
              <Input id="ev-title" value={eventForm.title} required
                onChange={(e) => setEventForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="BizBlitz Event 1.0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-desc">Description <span className="text-destructive">*</span></Label>
              <Textarea id="ev-desc" value={eventForm.description} required rows={3}
                onChange={(e) => setEventForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe the event..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-icon">Icon</Label>
              <Select value={eventForm.icon}
                onValueChange={(v) => setEventForm((p) => ({ ...p, icon: v }))}>
                <SelectTrigger id="ev-icon"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((ic) => (
                    <SelectItem key={ic} value={ic}>{ic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setEventDialog(false)}
                disabled={eventSubmitting}>Cancel</Button>
              <Button type="submit" disabled={eventSubmitting}>
                {eventSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingEvent ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ COMPETITION DIALOG ══ */}
      <Dialog open={compDialog} onOpenChange={(o) => !o && setCompDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingComp ? "Edit Competition" : "Add Competition"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitComp} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-title">Title <span className="text-destructive">*</span></Label>
              <Input id="cp-title" value={compForm.title} required
                onChange={(e) => setCompForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="BizBlitz 1.0 Winners" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cp-sub">Subtitle</Label>
              <Input id="cp-sub" value={compForm.subtitle}
                onChange={(e) => setCompForm((p) => ({ ...p, subtitle: e.target.value }))}
                placeholder="Celebrating innovative minds..." />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setCompDialog(false)}
                disabled={compSubmitting}>Cancel</Button>
              <Button type="submit" disabled={compSubmitting}>
                {compSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingComp ? "Update" : "Add"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ══ WINNER DIALOG ══ */}
      <Dialog open={winnerDialog} onOpenChange={(o) => !o && setWinnerDialog(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingWinner ? "Edit Winner" : "Add Winner"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submitWinner} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="w-startup">Startup Name <span className="text-destructive">*</span></Label>
              <Input id="w-startup" value={winnerForm.startup} required
                onChange={(e) => setWinnerForm((p) => ({ ...p, startup: e.target.value }))}
                placeholder="LittleMove" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="w-name">Founder(s) <span className="text-destructive">*</span></Label>
              <Input id="w-name" value={winnerForm.name} required
                onChange={(e) => setWinnerForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Varsha Yadav, Harsh Singh" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="w-pos">Position <span className="text-destructive">*</span></Label>
                <Input id="w-pos" value={winnerForm.position} required
                  onChange={(e) => setWinnerForm((p) => ({ ...p, position: e.target.value }))}
                  placeholder="1st Prize" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="w-amt">Amount <span className="text-destructive">*</span></Label>
                <Input id="w-amt" value={winnerForm.amount} required
                  onChange={(e) => setWinnerForm((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="₹5,000" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => setWinnerDialog(false)}
                disabled={winnerSubmitting}>Cancel</Button>
              <Button type="submit" disabled={winnerSubmitting}>
                {winnerSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingWinner ? "Update" : "Add"}
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
        title={`Delete ${deleteDialog.label}`}
        description="This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ManageAbout;
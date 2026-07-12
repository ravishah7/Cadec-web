// frontend/src/types/admin.types.ts

/* ----------------------------------------
   Shared
-----------------------------------------*/
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface SingleResponse<T> {
  success: boolean;
  data: T;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

/* ----------------------------------------
   Job
-----------------------------------------*/
export type JobType = "Full-time" | "Part-time" | "Internship";

export interface Job {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  type: JobType;
  experienceLevel: string;
  applyLink: string;
  companyLogo?: string;
  salary?: string;
  requirements: string[];
  postedBy?: { _id: string; name: string; email: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  title: string;
  company: string;
  description: string;
  location: string;
  type: JobType;
  experienceLevel: string;
  applyLink: string;
  companyLogo: string;
  salary: string;
  requirements: string[];
  isActive: boolean;
}

export interface JobFilters {
  search: string;
  type: string;
  experienceLevel: string;
  isActive: string;
}

export type EventStatus =
  | "Upcoming"
  | "Ongoing"
  | "Completed"
  | "Cancelled";

export interface EventQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category: string;
  maxAttendees?: string;
  currentAttendees: number;
  price: string;
  status: EventStatus;
  isRegistrationOpen: boolean;
  registrationDeadline?: string;
  registrationFormType: 'internal' | 'external';   // ← NEW
  externalFormLink?: string;                         // ← NEW
  questions: EventQuestion[];
  createdBy?: { _id: string; name: string; email: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Replace the Event and EventFormData interfaces in admin.types.ts

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image?: string;
  category: string;
  maxAttendees?: string;
  currentAttendees: number;
  price: string;
  status: EventStatus;
  isRegistrationOpen: boolean;
  registrationDeadline?: string;
  registrationFormType: 'internal' | 'external';   // ← NEW
  externalFormLink?: string;                         // ← NEW
  questions: EventQuestion[];
  createdBy?: { _id: string; name: string; email: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price: string;
  status: EventStatus;
  registrationDeadline: string;
  isRegistrationOpen: boolean;
  maxAttendees: string;
  registrationFormType: 'internal' | 'external';   // ← NEW
  externalFormLink: string;                          // ← NEW
  questions: EventQuestion[];
  isActive: boolean;
}
export interface EventFilters {
  search: string;
  status: string;
  category: string;
  registrationOpen: string;
}

export interface Startup {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  founders: string[];      // plain string array — just names
  status: string;
  website?: string;
  category: string;
  yearFounded: number;     // required in model
  funding?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StartupFormData {
  name: string;
  description: string;
  logo: string;
  founders: string[];      // plain string array
  status: string;
  website: string;
  category: string;
  yearFounded: number | "";
  funding: string;
  isActive: boolean;
}

export interface StartupFilters {
  search: string;
  status: string;
  category: string;
  isActive: string;
}

/* ----------------------------------------
   Dashboard Stats
-----------------------------------------*/
export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalEvents: number;
  activeEvents: number;
  totalStartups: number;
  activeStartups: number;
}

/* ----------------------------------------
   About Page Content
-----------------------------------------*/
export interface FacultyMember {
  _id?: string;
  name: string;
  role: string;
  department: string;
}

export interface StudentCoordinator {
  _id?: string;
  name: string;
  role: string;
  department: string;
}

export interface MajorEvent {
  _id?: string;
  title: string;
  description: string;
  icon: string;
}

export interface CompetitionWinner {
  _id?: string;
  name: string;
  startup: string;
  position: string;
  amount: string;
}

export interface Competition {
  _id?: string;
  title: string;
  subtitle: string;
  winners: CompetitionWinner[];
}

export interface AboutContent {
  _id: string;
  facultyMembers: FacultyMember[];
  studentCoordinators: StudentCoordinator[];
  majorEvents: MajorEvent[];
  competitions: Competition[];
  updatedAt: string;
}

// ── APPEND TO BOTTOM OF frontend/src/types/admin.types.ts ──────────────────

/* ----------------------------------------
   Gallery Content
-----------------------------------------*/
export interface GalleryItem {
  _id?: string;
  title: string;
  description: string;
  canvaLink: string;
  thumbnail: string;    
  isActive: boolean;
  createdAt?: string;
}

export interface GalleryContent {
  _id: string;
  magazines: GalleryItem[];
  brochures: GalleryItem[];
  posters:   GalleryItem[];
  updatedAt: string;
}

export type GallerySection = "magazines" | "brochures" | "posters";
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

/* ----------------------------------------
   Event
   — matches backend model exactly:
     status: lowercase enum
     price: string
     isRegistrationOpen (not registrationOpen)
     questions.question (not label)
-----------------------------------------*/
export type EventStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export type QuestionType =
  | "text"
  | "textarea"
  | "radio"
  | "checkbox"
  | "select";

export interface EventQuestion {
  id: string;
  question: string;        // matches model field name
  type: QuestionType;
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
  maxAttendees?: number;
  currentAttendees: number;
  price: string;           // string in model
  status: EventStatus;
  isRegistrationOpen: boolean;   // exact model field name
  registrationDeadline?: string;
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
  price: string;           // string to match model
  status: EventStatus;
  registrationDeadline: string;
  isRegistrationOpen: boolean;   // exact model field name
  maxAttendees: number | "";
  questions: EventQuestion[];
  isActive: boolean;
}

export interface EventFilters {
  search: string;
  status: string;
  category: string;
  isRegistrationOpen: string;
}

/* ----------------------------------------
   Startup
   — matches backend model exactly:
     founders: string[] (just names)
     status: 'Incubated' | 'Accelerated' only
     yearFounded: required
-----------------------------------------*/
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
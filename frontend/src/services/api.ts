

import axios from "axios";
import type {
  Job,
  JobFormData,
  Event as AdminEvent,
  EventFormData,
  Startup,
  StartupFormData,
  PaginatedResponse,
  SingleResponse,
  MessageResponse,
  DashboardStats,
} from "@/types/admin.types";

import type {
  AboutContent,
  FacultyMember,
  StudentCoordinator,
  MajorEvent,
  Competition,
  CompetitionWinner,
} from "@/types/admin.types";


import type { GalleryContent, GalleryItem, GallerySection } from "@/types/admin.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ------------------------------------------------
   Axios Instance
------------------------------------------------ */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

/* ------------------------------------------------
   Auth API
------------------------------------------------ */
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/api/auth/register", { name, email, password }),

  getMe: () => api.get("/api/auth/me"),
};

/* ------------------------------------------------
   Public Jobs API
------------------------------------------------ */
export const jobsAPI = {
  getJobs: (params?: {
    type?: string;
    location?: string;
    search?: string;
  }) => api.get("/api/jobs", { params }),

  getJob: (id: string) => api.get(`/api/jobs/${id}`),

  createJob: (data: unknown) => api.post("/api/jobs", data),

  updateJob: (id: string, data: unknown) =>
    api.put(`/api/jobs/${id}`, data),

  deleteJob: (id: string) => api.delete(`/api/jobs/${id}`),
};

/* ------------------------------------------------
   Public Startups API
------------------------------------------------ */
export const startupsAPI = {
  getStartups: (params?: {
    status?: string;
    category?: string;
    search?: string;
  }) => api.get("/api/startups", { params }),

  getStartup: (id: string) => api.get(`/api/startups/${id}`),

  createStartup: (data: unknown) => api.post("/api/startups", data),

  updateStartup: (id: string, data: unknown) =>
    api.put(`/api/startups/${id}`, data),

  deleteStartup: (id: string) => api.delete(`/api/startups/${id}`),
};

/* ------------------------------------------------
   Contact API
------------------------------------------------ */
export const contactAPI = {
  submitContact: (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) => api.post("/api/contact", data),

  getContacts: (params?: {
    isResolved?: boolean;
    search?: string;
  }) => api.get("/api/contact", { params }),

  getContact: (id: string) => api.get(`/api/contact/${id}`),

  markResolved: (id: string) => api.put(`/api/contact/${id}/resolve`),

  deleteContact: (id: string) => api.delete(`/api/contact/${id}`),
};

/* ================================================
   ADMIN — DASHBOARD
================================================ */
export const adminDashboardAPI = {
  getStats: () =>
    api.get<DashboardStats>("/api/admin/stats"),
};

/* ================================================
   ADMIN — JOBS
================================================ */
export const adminJobsAPI = {
  getJobs: (params?: {
    search?: string;
    type?: string;
    experienceLevel?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) => api.get<PaginatedResponse<Job>>("/api/admin/jobs", { params }),

  getJob: (id: string) =>
    api.get<SingleResponse<Job>>(`/api/admin/jobs/${id}`),

  createJob: (data: JobFormData) =>
    api.post<SingleResponse<Job>>("/api/admin/jobs", data),

  updateJob: (id: string, data: Partial<JobFormData>) =>
    api.put<SingleResponse<Job>>(`/api/admin/jobs/${id}`, data),

  toggleActive: (id: string, isActive: boolean) =>
    api.patch<SingleResponse<Job>>(`/api/admin/jobs/${id}/toggle`, {
      isActive,
    }),

  deleteJob: (id: string) =>
    api.delete<MessageResponse>(`/api/admin/jobs/${id}`),
};

/* ================================================
   ADMIN — EVENTS
================================================ */
export const adminEventsAPI = {
  getEvents: (params?: {
    search?: string;
    status?: string;
    category?: string;
    registrationOpen?: string;
    page?: number;
    limit?: number;
  }) => api.get<PaginatedResponse<AdminEvent>>("/api/admin/events", { params }),

  getEvent: (id: string) =>
    api.get<SingleResponse<AdminEvent>>(`/api/admin/events/${id}`),

  createEvent: (data: EventFormData) =>
    api.post<SingleResponse<AdminEvent>>("/api/admin/events", data),

  updateEvent: (id: string, data: Partial<EventFormData>) =>
    api.put<SingleResponse<AdminEvent>>(`/api/admin/events/${id}`, data),

  toggleActive: (id: string, isActive: boolean) =>
    api.patch<SingleResponse<AdminEvent>>(
      `/api/admin/events/${id}/toggle`,
      { isActive }
    ),

  deleteEvent: (id: string) =>
    api.delete<MessageResponse>(`/api/admin/events/${id}`),
};

/* ================================================
   ADMIN — STARTUPS
================================================ */
export const adminStartupsAPI = {
  getStartups: (params?: {
    search?: string;
    status?: string;
    category?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) =>
    api.get<PaginatedResponse<Startup>>("/api/admin/startups", { params }),

  getStartup: (id: string) =>
    api.get<SingleResponse<Startup>>(`/api/admin/startups/${id}`),

  createStartup: (data: StartupFormData) =>
    api.post<SingleResponse<Startup>>("/api/admin/startups", data),

  updateStartup: (id: string, data: Partial<StartupFormData>) =>
    api.put<SingleResponse<Startup>>(`/api/admin/startups/${id}`, data),

  toggleActive: (id: string, isActive: boolean) =>
    api.patch<SingleResponse<Startup>>(
      `/api/admin/startups/${id}/toggle`,
      { isActive }
    ),

  deleteStartup: (id: string) =>
    api.delete<MessageResponse>(`/api/admin/startups/${id}`),
};


/* ================================================
   PUBLIC — About
================================================ */
export const aboutAPI = {
  getContent: () =>
    api.get<{ success: boolean; data: AboutContent }>("/api/about"),
};

/* ================================================
   ADMIN — About
================================================ */
export const adminAboutAPI = {
  // Get full content
  getContent: () =>
    api.get<{ success: boolean; data: AboutContent }>("/api/admin/about"),

  // Faculty
  addFaculty: (data: Omit<FacultyMember, "_id">) =>
    api.post<{ success: boolean; data: AboutContent }>("/api/admin/about/faculty", data),
  updateFaculty: (id: string, data: Omit<FacultyMember, "_id">) =>
    api.put<{ success: boolean; data: AboutContent }>(`/api/admin/about/faculty/${id}`, data),
  deleteFaculty: (id: string) =>
    api.delete<{ success: boolean; data: AboutContent }>(`/api/admin/about/faculty/${id}`),

  // Student Coordinators
  addCoordinator: (data: Omit<StudentCoordinator, "_id">) =>
    api.post<{ success: boolean; data: AboutContent }>("/api/admin/about/coordinators", data),
  updateCoordinator: (id: string, data: Omit<StudentCoordinator, "_id">) =>
    api.put<{ success: boolean; data: AboutContent }>(`/api/admin/about/coordinators/${id}`, data),
  deleteCoordinator: (id: string) =>
    api.delete<{ success: boolean; data: AboutContent }>(`/api/admin/about/coordinators/${id}`),

  // Major Events
  addEvent: (data: Omit<MajorEvent, "_id">) =>
    api.post<{ success: boolean; data: AboutContent }>("/api/admin/about/events", data),
  updateEvent: (id: string, data: Omit<MajorEvent, "_id">) =>
    api.put<{ success: boolean; data: AboutContent }>(`/api/admin/about/events/${id}`, data),
  deleteEvent: (id: string) =>
    api.delete<{ success: boolean; data: AboutContent }>(`/api/admin/about/events/${id}`),

  // Competitions
  addCompetition: (data: Omit<Competition, "_id">) =>
    api.post<{ success: boolean; data: AboutContent }>("/api/admin/about/competitions", data),
  updateCompetition: (id: string, data: Omit<Competition, "_id">) =>
    api.put<{ success: boolean; data: AboutContent }>(`/api/admin/about/competitions/${id}`, data),
  deleteCompetition: (id: string) =>
    api.delete<{ success: boolean; data: AboutContent }>(`/api/admin/about/competitions/${id}`),

  // Winners inside a competition
  addWinner: (competitionId: string, data: Omit<CompetitionWinner, "_id">) =>
    api.post<{ success: boolean; data: AboutContent }>(
      `/api/admin/about/competitions/${competitionId}/winners`, data
    ),
  updateWinner: (competitionId: string, winnerId: string, data: Omit<CompetitionWinner, "_id">) =>
    api.put<{ success: boolean; data: AboutContent }>(
      `/api/admin/about/competitions/${competitionId}/winners/${winnerId}`, data
    ),
  deleteWinner: (competitionId: string, winnerId: string) =>
    api.delete<{ success: boolean; data: AboutContent }>(
      `/api/admin/about/competitions/${competitionId}/winners/${winnerId}`
    ),
};


/* ================================================
   PUBLIC — Gallery
================================================ */
export const galleryAPI = {
  getContent: () =>
    api.get<{ success: boolean; data: GalleryContent }>("/api/gallery"),
};

/* ================================================
   ADMIN — Gallery
================================================ */
export const adminGalleryAPI = {
  getContent: () =>
    api.get<{ success: boolean; data: GalleryContent }>("/api/admin/gallery"),

  addItem: (
    section: GallerySection,
    data: Omit<GalleryItem, "_id" | "createdAt">
  ) =>
    api.post<{ success: boolean; data: GalleryContent }>(
      `/api/admin/gallery/${section}`,
      data
    ),

  updateItem: (
    section: GallerySection,
    id: string,
    data: Partial<Omit<GalleryItem, "_id" | "createdAt">>
  ) =>
    api.put<{ success: boolean; data: GalleryContent }>(
      `/api/admin/gallery/${section}/${id}`,
      data
    ),

  toggleItem: (section: GallerySection, id: string, isActive: boolean) =>
    api.patch<{ success: boolean; data: GalleryContent }>(
      `/api/admin/gallery/${section}/${id}/toggle`,
      { isActive }
    ),

  deleteItem: (section: GallerySection, id: string) =>
    api.delete<{ success: boolean; data: GalleryContent }>(
      `/api/admin/gallery/${section}/${id}`
    ),
};

export default api;
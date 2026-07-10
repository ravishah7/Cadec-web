import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";

import ScrollToTop from "./components/ScrollToTop";

import Index from "./pages/Index";
import About from "./pages/About";
import Events from "./pages/Events";
import Gallery from "./pages/Gallery";
import Startups from "./pages/Startups";
import Jobs from "./pages/Jobs";
import Contact from "./pages/Contact";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import ManageJobs from "./pages/admin/ManageJobs";
import ManageEvents from "./pages/admin/ManageEvents";
import ManageStartups from "./pages/admin/ManageStartups";
import ManageAbout from "./pages/admin/ManageAbout";
import ManageGallery from "./pages/admin/ManageGallery";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter>
            <ScrollToTop />

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/startups" element={<Startups />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              

              {/* Redirect admin pages to home */}
             {/* ── Admin Module ────────────────────────────── */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin"          element={<Dashboard />} />
                    <Route path="/admin/jobs"     element={<ManageJobs />} />
                    <Route path="/admin/events"   element={<ManageEvents />} />
                    <Route path="/admin/startups" element={<ManageStartups />} />
                    <Route path="/admin/about" element={<ManageAbout />} />
                    <Route path="/admin/gallery" element={<ManageGallery />} />
                    </Route>
                </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
import { useState, useEffect, useMemo } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, ExternalLink, Briefcase, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import api, { jobsAPI } from "@/services/api";
import type { Job } from "@/types/admin.types";

const Jobs = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchJobs = async () => {
    try {
      const res = await jobsAPI.getJobs();
      setJobs(res.data.data ?? []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load jobs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchJobs();
}, []);

  const handleApply = (job: Job) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login before applying.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    window.open(job.applyLink, "_blank", "noopener,noreferrer");
  };

  const formatPostedDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const fullTimeJobs = useMemo(
    () => jobs.filter((j) => j.type === "Full-time"),
    [jobs]
  );
  const partTimeJobs = useMemo(
    () => jobs.filter((j) => j.type === "Part-time"),
    [jobs]
  );
  const internshipJobs = useMemo(
    () => jobs.filter((j) => j.type === "Internship"),
    [jobs]
  );

  const uniqueCompanies = useMemo(
    () => new Set(jobs.map((j) => j.company)).size,
    [jobs]
  );
  const uniqueCategories = useMemo(
    () => new Set(jobs.map((j) => j.type)).size,
    [jobs]
  );

  const JobCard = ({ job }: { job: Job }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
              <img
                src={job.companyLogo || "/placeholder.svg"}
                alt={job.company}
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">{job.title}</CardTitle>
              <p className="text-primary font-medium">{job.company}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline">{job.type}</Badge>
                <Badge variant="secondary">{job.experienceLevel}</Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Posted {formatPostedDate(job.createdAt)}
            </p>
            {job.salary && (
              <p className="font-semibold text-primary">{job.salary}</p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {job.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {job.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {job.type}
          </div>
        </div>

        {job.requirements.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Skills Required:</p>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" size="sm" onClick={() => handleApply(job)}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Job <span className="text-primary">Opportunities</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover exciting career opportunities from our partner companies.
              Find your next role in technology, marketing, design, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Jobs Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="all">All Jobs</TabsTrigger>
                <TabsTrigger value="fulltime">Full-time</TabsTrigger>
                <TabsTrigger value="parttime">Part-time</TabsTrigger>
                <TabsTrigger value="internship">Internships</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Available Positions</h2>
                  <p className="text-muted-foreground">
                    Browse through our curated list of job opportunities.
                  </p>
                </div>

                {jobs.length === 0 ? (
                  <p className="text-center text-muted-foreground">No jobs posted yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fulltime" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Full-time Positions</h2>
                  <p className="text-muted-foreground">
                    Permanent positions with competitive benefits and growth opportunities.
                  </p>
                </div>

                {fullTimeJobs.length === 0 ? (
                  <p className="text-center text-muted-foreground">No full-time jobs right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {fullTimeJobs.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="parttime" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Part-time Positions</h2>
                  <p className="text-muted-foreground">
                    Flexible work arrangements for students and working professionals.
                  </p>
                </div>

                {partTimeJobs.length === 0 ? (
                  <p className="text-center text-muted-foreground">No part-time jobs right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {partTimeJobs.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="internship" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Internship Opportunities</h2>
                  <p className="text-muted-foreground">
                    Gain valuable experience and build your professional network.
                  </p>
                </div>

                {internshipJobs.length === 0 ? (
                  <p className="text-center text-muted-foreground">No internships right now.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {internshipJobs.map((job) => (
                      <JobCard key={job._id} job={job} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">{jobs.length}</h3>
              <p className="text-muted-foreground">Active Jobs</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">{uniqueCompanies}</h3>
              <p className="text-muted-foreground">Partner Companies</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">{uniqueCategories}</h3>
              <p className="text-muted-foreground">Job Categories</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">50+</h3>
              <p className="text-muted-foreground">Applications Received</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Looking for Talent?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Partner with us to reach our talented community of students and alumni.
            Post your job openings and connect with qualified candidates.
          </p>
          <Button size="lg" onClick={() => navigate('/contact')}>
            Post a Job
            <Briefcase className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Jobs;
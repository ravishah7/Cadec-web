import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Users, Calendar, Globe, Building2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface StartupItem {
  _id: string;
  name: string;
  description: string;
  logo?: string;
  founders: string[];
  status: "Incubated" | "Accelerated";
  website?: string;
  category: string;
  yearFounded: number;
  funding?: string;
}

const Startups = () => {
  const navigate = useNavigate();

  const [startups, setStartups] = useState<StartupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/startups`);

        if (!response.ok) {
          throw new Error("Failed to load startups");
        }

        const data = await response.json();
        setStartups(data.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Could not load startups right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStartups();
  }, []);

  const StartupCard = ({ startup }: { startup: StartupItem }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
              {startup.logo ? (
                <img
                  src={startup.logo}
                  alt={startup.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building2 className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{startup.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge
                  variant={startup.status === "Accelerated" ? "default" : "secondary"}
                >
                  {startup.status}
                </Badge>
                <Badge variant="outline">{startup.category}</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {startup.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span className="font-medium">Founders:</span>
            <span className="ml-1">{startup.founders.join(", ")}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Founded: {startup.yearFounded}</span>
          </div>
          {startup.funding && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Building2 className="h-4 w-4 mr-2" />
              <span>Funding: {startup.funding}</span>
            </div>
          )}
        </div>

        {startup.website && (
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" size="sm" asChild>
              <a href={startup.website} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4 mr-2" />
                Visit Website
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const incubatedStartups = startups.filter((s) => s.status === "Incubated");
  const acceleratedStartups = startups.filter((s) => s.status === "Accelerated");

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="text-primary">Startups</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover the innovative startups incubated and accelerated by CADEC.
              These ventures represent the entrepreneurial spirit and innovation
              that drives our community forward.
            </p>
          </div>
        </div>
      </section>

      {/* Startups Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-muted-foreground">{error}</div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="all">All Startups</TabsTrigger>
                <TabsTrigger value="incubated">Incubated</TabsTrigger>
                <TabsTrigger value="accelerated">Accelerated</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Our Portfolio</h2>
                  <p className="text-muted-foreground">
                    A diverse range of innovative startups nurtured through our programs.
                  </p>
                </div>

                {startups.length === 0 ? (
                  <p className="text-center text-muted-foreground">No startups to show yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {startups.map((startup) => (
                      <StartupCard key={startup._id} startup={startup} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="incubated" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Incubated Startups</h2>
                  <p className="text-muted-foreground">
                    Early-stage startups receiving mentorship and support through our incubation program.
                  </p>
                </div>

                {incubatedStartups.length === 0 ? (
                  <p className="text-center text-muted-foreground">No incubated startups yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {incubatedStartups.map((startup) => (
                      <StartupCard key={startup._id} startup={startup} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="accelerated" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Accelerated Startups</h2>
                  <p className="text-muted-foreground">
                    Growth-stage startups receiving intensive support to scale their operations.
                  </p>
                </div>

                {acceleratedStartups.length === 0 ? (
                  <p className="text-center text-muted-foreground">No accelerated startups yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {acceleratedStartups.map((startup) => (
                      <StartupCard key={startup._id} startup={startup} />
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
              <h3 className="text-3xl font-bold text-primary mb-2">{startups.length}</h3>
              <p className="text-muted-foreground">Active Startups</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">₹5.2Cr</h3>
              <p className="text-muted-foreground">Total Funding Raised</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {new Set(startups.flatMap((s) => s.founders)).size}+
              </h3>
              <p className="text-muted-foreground">Founders Supported</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {new Set(startups.map((s) => s.category)).size}
              </h3>
              <p className="text-muted-foreground">Industries Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Have a Startup Idea?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our incubation and acceleration programs to turn your innovative ideas
            into successful businesses. Get mentorship, funding support, and access to
            our entrepreneurial network.
          </p>
          <Button size="lg" onClick={() => navigate('/contact')}>
            Apply for Incubation
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Startups;
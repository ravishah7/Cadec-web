import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, Users, ExternalLink, UserCheck, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface EventQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface EventItem {
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
  price: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isRegistrationOpen: boolean;
  questions: EventQuestion[];
}

const Events = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [userRegistrations, setUserRegistrations] = useState<Set<string>>(new Set());

  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [pastEvents, setPastEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/events`);

        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        const data = await response.json();

        setUpcomingEvents(data.upcoming ?? []);
        setPastEvents(data.past ?? []);
      } catch (err) {
        console.error(err);
        setError("Could not load events right now. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle event registration
  const handleRegister = (event: EventItem) => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to register for this event.",
        variant: "destructive",
      });
      return;
    }

    if (!event.isRegistrationOpen) {
      toast({
        title: "Registration Closed",
        description: "Registration for this event is no longer open.",
        variant: "destructive",
      });
      return;
    }

    if (userRegistrations.has(event._id)) {
      toast({
        title: "Already Registered",
        description: "You have already registered for this event.",
        variant: "destructive",
      });
      return;
    }

    setSelectedEvent(event);
    setShowRegistrationForm(true);
  };

  const handleRegistrationSuccess = () => {
    if (selectedEvent) {
      setUserRegistrations((prev) => new Set([...prev, selectedEvent._id]));
    }
    setShowRegistrationForm(false);
    setSelectedEvent(null);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const EventCard = ({ event, isPast = false }: { event: EventItem; isPast?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={event.image || "/src/assets/event1.jpg"}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <Badge
          className="absolute top-4 left-4"
          variant={
            event.category === "Workshop" ? "default" :
            event.category === "Conference" ? "secondary" :
            event.category === "Technical" ? "outline" : "default"
          }
        >
          {event.category}
        </Badge>
        {!isPast && (
          <Badge
            className="absolute top-4 right-4"
            variant={event.isRegistrationOpen ? "default" : "secondary"}
          >
            {event.isRegistrationOpen ? "Open" : "Closed"}
          </Badge>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{event.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{event.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(event.date)}
          </div>
          {event.time && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              {event.time}
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {event.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            {event.currentAttendees} {isPast ? "attended" : "attending"}
            {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
          </div>
        </div>

        {event.price && (
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">{event.price}</span>
          </div>
        )}

        {!isPast && (
          <div className="space-y-2">
            {userRegistrations.has(event._id) ? (
              <Button className="w-full mt-4" disabled>
                <UserCheck className="mr-2 h-4 w-4" />
                Registered
              </Button>
            ) : (
              <Button
                className="w-full mt-4"
                disabled={!event.isRegistrationOpen}
                onClick={() => handleRegister(event)}
              >
                Register Now
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
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
              CADEC <span className="text-primary">Events</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover entrepreneurial opportunities, workshops, and competitions
              designed to nurture innovation and business excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Events Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-16 text-muted-foreground">{error}</div>
          ) : (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                <TabsTrigger value="past">Past Events</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Don't Miss Out!</h2>
                  <p className="text-muted-foreground">
                    Register for these exciting upcoming events and secure your spot.
                  </p>
                </div>

                {upcomingEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No upcoming events right now — check back soon!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upcomingEvents.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">Our Journey</h2>
                  <p className="text-muted-foreground">
                    Relive the memories from our successful past events and celebrations.
                  </p>
                </div>

                {pastEvents.length === 0 ? (
                  <p className="text-center text-muted-foreground">
                    No past events to show yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pastEvents.map((event) => (
                      <EventCard key={event._id} event={event} isPast={true} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Organize an Event?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Have an idea for an event or workshop? We'd love to hear from you!
            Join us in creating amazing experiences for our community.
          </p>
          <Button size="lg" onClick={() => navigate('/contact')}>
            Propose an Event
            <ExternalLink className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>


      {/* Registration Form Modal */}
      {showRegistrationForm && selectedEvent && (
        <EventRegistrationForm
          eventId={selectedEvent._id}
          questions={selectedEvent.questions || []}
          onClose={() => {
            setShowRegistrationForm(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleRegistrationSuccess}
        />
      )}
    </div>
  );
};

export default Events;
// frontend/src/pages/About.tsx

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Target, Lightbulb, Building2, GraduationCap, Trophy, Calendar } from "lucide-react";
import { aboutAPI } from "@/services/api";
import type { AboutContent } from "@/types/admin.types";

// Map icon string names to lucide components
const ICON_MAP: Record<string, React.ElementType> = {
  Calendar, GraduationCap, Building2, Trophy,
  Target, Lightbulb,
};

const getIcon = (name: string): React.ElementType =>
  ICON_MAP[name] ?? Calendar;

const About = () => {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    aboutAPI
      .getContent()
      .then((res) => setContent(res.data.data))
      .catch(() => {/* falls back to empty state gracefully */})
      .finally(() => setIsLoading(false));
  }, []);

  // Keep the hardcoded static data as fallback
  const facultyMembers = content?.facultyMembers.length
    ? content.facultyMembers
    : [
        { _id: "1", name: "Dr. Richa Agarwal Malik", role: "Convenor",    department: "Faculty Advisor" },
        { _id: "2", name: "Dr. Gaurav Kumar",         role: "Co-Convenor", department: "Faculty Advisor" },
        { _id: "3", name: "Mrs. Anshita Jain",        role: "Mentor",      department: "Faculty Advisor" },
      ];

  const studentCoordinators = content?.studentCoordinators.length
    ? content.studentCoordinators
    : [
        { _id: "1", name: "Ankit Anand",   role: "President",       department: "Student Coordinator" },
        { _id: "2", name: "Nikhil Bhargav",role: "Vice President",  department: "Student Coordinator" },
        { _id: "3", name: "Naman Baisla",  role: "Secretary",       department: "Student Coordinator" },
        { _id: "4", name: "Somil Verma",   role: "Treasurer",       department: "Student Coordinator" },
        { _id: "5", name: "Tina",          role: "Joint Secretary", department: "Student Coordinator" },
        { _id: "6", name: "Smriti Singh",  role: "Head of HR",      department: "Student Coordinator" },
      ];

  const majorEvents = content?.majorEvents.length
    ? content.majorEvents
    : [
        { _id: "1", icon: "GraduationCap", title: "University of Delhi Centenary Year Valedictory Ceremony", description: "CADEC members showcased their innovative projects at valedictory ceremony for Centenary year of University of Delhi and was covered by the well renowned news channel NDTV." },
        { _id: "2", icon: "Building2",     title: "World Food India Participation",                          description: "CADEC members participated in World Food India on invitation by the University of Delhi and the Ministry of Food Processing Industries, Govt. of India." },
        { _id: "3", icon: "Calendar",      title: "Diwali Stall and Sale",                                   description: "ShriJi Gavya and the Marketing Department organized a Diwali stall on the college campus and in Janpath, showcasing and selling their products." },
        { _id: "4", icon: "Trophy",        title: "BizBlitz Event 1.0 B-Plan Competition",                  description: "B-Plan Competition for our college students as a culmination of our efforts to empower aspiring entrepreneurs, providing a platform to demonstrate their innovative ideas." },
      ];

  const competitions = content?.competitions.length
    ? content.competitions
    : [
        {
          _id: "1", title: "BizBlitz 1.0 Winners",
          subtitle: "Celebrating the innovative minds who won our B-Plan Competition.",
          winners: [
            { _id: "1", startup: "LittleMove", name: "Varsha Yadav, Harsh Singh", position: "1st Prize", amount: "₹5,000" },
            { _id: "2", startup: "Gama",        name: "Shubham Jain",             position: "2nd Prize", amount: "₹3,000" },
            { _id: "3", startup: "Ecstasy",     name: "Yash Kumar Singh",         position: "3rd Prize", amount: "₹2,000" },
          ],
        },
      ];

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navigation />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About <span className="text-primary">CADEC</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-4">The Career Development Centre</p>
            <p className="text-lg text-muted-foreground">
              CADEC: the Career Development Centre of PGDAV College was founded in 2023 as an
              incubator and resource hub for our college students who are interested in startups,
              entrepreneurial ventures and building their own business.
            </p>
          </div>
        </div>
      </section>

      {/* About CADEC — static, no admin control needed */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 mb-8">
              <CardHeader>
                <CardTitle className="text-2xl mb-4">About CADEC</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>The Centre came into being after PGDAV College (M) and the University of Delhi signed a Memorandum of Understanding (MoU) with Samarth Bharat for the establishment of the Career Development Centre (CDC) at the college.</p>
                <p>It is a platform that provides various services to support the growth and success of startups, including mentorship, funding assistance, networking opportunities and workshops on various aspects of entrepreneurship.</p>
                <p>Our dedicated team of student leaders, under the guidance of faculty advisors, oversees various initiatives aimed at nurturing entrepreneurial talent.</p>
                <p>At CADEC, we believe that entrepreneurship is not just about starting a business; it's about developing essential skills, fostering a mindset of innovation, and making a positive impact on society.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-8">
              <CardHeader>
                <Target className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">The mission of CADEC is to empower students and alumni to turn their innovative ideas into successful businesses by providing them with the knowledge skills and resources they need to thrive in the competitive business landscape.</p>
              </CardContent>
            </Card>
            <Card className="p-8">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="text-2xl">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">At CADEC, our vision is to create a vibrant ecosystem that nurtures innovation, fosters growth and cultivates a spirit of entrepreneurship that transcends boundaries and transforms lives.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Faculty Members */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Faculty Members</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our dedicated faculty advisors guiding the entrepreneurial journey.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {facultyMembers.map((member) => (
              <Card key={member._id} className="text-center p-6">
                <CardHeader>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="secondary">{member.role}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.department}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Student Coordinators */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Student Coordinators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our dynamic student leadership team driving innovation and entrepreneurship.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {studentCoordinators.map((member) => (
              <Card key={member._id} className="text-center p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{member.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">{member.role}</Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{member.department}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Major Events */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Major Events Organised</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Celebrating our achievements and impact in the entrepreneurial ecosystem.
            </p>
          </div>
          <div className="space-y-6">
            {majorEvents.map((event) => {
              const IconComponent = getIcon(event.icon);
              return (
                <Card key={event._id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full shrink-0">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Competitions + Winners */}
      {competitions.map((comp) => (
        <section key={comp._id} className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{comp.title}</h2>
              {comp.subtitle && (
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {comp.subtitle}
                </p>
              )}
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {comp.winners.map((winner) => (
                  <Card key={winner._id} className="text-center p-6">
                    <CardHeader>
                      <div className="bg-accent/10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Trophy className="h-8 w-8 text-accent" />
                      </div>
                      <CardTitle className="text-lg">{winner.startup}</CardTitle>
                      <Badge variant="secondary" className="text-sm">{winner.position}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold text-primary mb-2">{winner.amount}</p>
                      <p className="text-sm text-muted-foreground">{winner.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent>
              <h2 className="text-3xl font-bold mb-4">Join CADEC Today!</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join us at CADEC and embark on a journey of exploration, discovery, and transformation.
              </p>
              <p className="text-xl font-semibold text-primary">
                Empower your entrepreneurial spirit with CADEC - where innovation meets opportunity!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default About;
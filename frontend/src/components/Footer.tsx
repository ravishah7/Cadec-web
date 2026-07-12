import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin,
  Send
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { contactAPI } from "@/services/api";

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const quickLinks = [
    { name: "About Us", href: "/about" },
    { name: "Events", href: "/events" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/cadec.pgdav", color: "text-blue-600" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/cadec_pgdav", color: "text-blue-400" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/cadec.pgdav", color: "text-pink-600" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/cadec-pgdav/", color: "text-blue-700" },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await contactAPI.submitContact({
        firstName: "Potential Sponsor",
        lastName: "Sponor",
        email: email,
        subject: "Sponsor",
        message: `Sponsor`
      });

      toast({
        title: "Success!",
        description: "we are looking forward. Thank you!",
      });
      setEmail('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-secondary/30 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <Button key={social.name} variant="ghost" size="sm" asChild>
                  <a href={social.href} aria-label={social.name}>
                    <social.icon className="h-5 w-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>PGDAV College, University of Delhi, Ring Road, New Delhi</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>Not Available Yet</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>cadec@pgdav.du.ac.in</span>
              </div>
            </div>
          </div>

          {/* Sponsor */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Want to sponsor us?</h3>
            <p className="text-muted-foreground mb-4">
              Share your email and our team will reach out to discuss sponsorship opportunities.
            </p>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="flex-1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
              <Button size="sm" type="submit" disabled={isSubmitting}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2023 CADEC PGDAV.
          </p>
          <p className="text-muted-foreground text-sm">
            Made with ❤️ by RAVI & ANKIT KUMAR SINGH 
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
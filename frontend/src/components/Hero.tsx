// frontend/src/components/Hero.tsx

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { aboutAPI } from "@/services/api";
import type { AboutContent } from "@/types/admin.types";

const Hero = () => {
  const [content, setContent] = useState<AboutContent | null>(null);

  useEffect(() => {
    aboutAPI
      .getContent()
      .then((res) => setContent(res.data.data))
      .catch(() => {
        /* silently fall back to hardcoded defaults below */
      });
  }, []);

  /* ── Derived stats from About content ── */

  // Total winners across all competitions
  const totalWinners = content
    ? content.competitions.reduce(
        (sum, comp) => sum + comp.winners.length,
        0
      )
    : 3;

  // Total prize money — parse amounts like "₹5,000" → 5000 and sum
  const totalPrizeMoney = content
    ? content.competitions.reduce((sum, comp) => {
        return (
          sum +
          comp.winners.reduce((wSum, w) => {
            const numeric = Number(
              w.amount.replace(/[^0-9]/g, "")
            );
            return wSum + (isNaN(numeric) ? 0 : numeric);
          }, 0)
        );
      }, 0)
    : 10000;

  // Format prize money — e.g. 10000 → "10K+"
  const formatPrize = (amount: number): string => {
    if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L+`;
    if (amount >= 1000)   return `${Math.floor(amount / 1000)}K+`;
    return `₹${amount}`;
  };

  // Number of competitions
  const totalCompetitions = content
    ? content.competitions.length
    : 1;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/hero-bg.jpg"
          alt="PGDAV College Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Welcome to <span className="text-accent">CADEC</span>
          <br />
          Career Development Centre
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Empowering students through entrepreneurship, innovation, and
          business excellence. Join us in creating a vibrant entrepreneurial
          ecosystem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/events">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Explore Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/about">
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              Learn More
            </Button>
          </Link>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-3xl font-bold mb-2">2023</h3>
            <p className="text-lg">Founded</p>
          </div>

          <div className="text-center">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-3xl font-bold mb-2">
              {formatPrize(totalPrizeMoney)}
            </h3>
            <p className="text-lg">
              Prize Money
              {totalCompetitions > 1
                ? ` across ${totalCompetitions} competitions`
                : ""}
            </p>
          </div>

          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="text-3xl font-bold mb-2">{totalWinners}</h3>
            <p className="text-lg">
              Startup Winner{totalWinners !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
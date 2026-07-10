// frontend/src/pages/Gallery.tsx

import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, BookOpen, FileText, Image, Loader2 } from "lucide-react";
import { galleryAPI } from "@/services/api";
import type { GalleryContent, GalleryItem } from "@/types/admin.types";

/* ── Single item card ── */
const MediaCard = ({
  item,
  icon: Icon,
  accentClass,
}: {
  item: GalleryItem;
  icon: React.ElementType;
  accentClass: string;
}) => (
  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
    {/* Thumbnail or placeholder */}
    {item.thumbnail ? (
      <div className="h-48 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) =>
            ((e.target as HTMLImageElement).parentElement!.classList.add("hidden"))
          }
        />
      </div>
    ) : (
      <div
        className={`h-48 flex items-center justify-center ${accentClass}`}
      >
        <Icon className="h-14 w-14 opacity-20" />
      </div>
    )}

    <div className="p-4 space-y-3">
  <div>
    <h3 className="font-semibold text-sm leading-snug">
      {item.title}
    </h3>

    {item.description && (
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {item.description}
      </p>
    )}
  </div>

  <a
    href={
      item.canvaLink.startsWith("http")
        ? item.canvaLink
        : `https://${item.canvaLink}`
    }
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full"
  >
    <Button size="sm" className="w-full gap-2">
      <ExternalLink className="h-4 w-4" />
      View on Canva
    </Button>
  </a>
</div>
  </Card>
);

/* ── Empty section placeholder ── */
const EmptySection = ({ label }: { label: string }) => (
  <div className="text-center py-16 text-muted-foreground">
    <p className="text-sm">No {label} available yet. Check back soon.</p>
  </div>
);

/* ════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════ */
const Gallery = () => {
  const [content, setContent]     = useState<GalleryContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    galleryAPI
      .getContent()
      .then((res) => setContent(res.data.data))
      .catch(() => {/* graceful degradation — empty sections shown */})
      .finally(() => setIsLoading(false));
  }, []);

  // Only show active items to public
  const magazines = (content?.magazines ?? []).filter((i) => i.isActive);
  const brochures = (content?.brochures ?? []).filter((i) => i.isActive);
  const posters   = (content?.posters   ?? []).filter((i) => i.isActive);
  const totalItems = magazines.length + brochures.length + posters.length;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navigation />

      {/* Hero */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Media <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Explore our magazines, brochures, and event posters — all designed
              on Canva. Click any item to view the full design.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {isLoading ? (
            <div className="flex justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="magazines" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="magazines" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Magazines
                  {magazines.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {magazines.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="brochures" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Brochures
                  {brochures.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {brochures.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="posters" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Posters
                  {posters.length > 0 && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {posters.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Magazines */}
              <TabsContent value="magazines">
                {magazines.length === 0 ? (
                  <EmptySection label="magazines" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {magazines.map((item) => (
                      <MediaCard
                        key={item._id}
                        item={item}
                        icon={BookOpen}
                        accentClass="bg-primary/5"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Brochures */}
              <TabsContent value="brochures">
                {brochures.length === 0 ? (
                  <EmptySection label="brochures" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {brochures.map((item) => (
                      <MediaCard
                        key={item._id}
                        item={item}
                        icon={FileText}
                        accentClass="bg-accent/5"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Posters */}
              <TabsContent value="posters">
                {posters.length === 0 ? (
                  <EmptySection label="posters" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {posters.map((item) => (
                      <MediaCard
                        key={item._id}
                        item={item}
                        icon={Image}
                        accentClass="bg-muted"
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {magazines.length}
              </h3>
              <p className="text-muted-foreground">Magazines</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {brochures.length}
              </h3>
              <p className="text-muted-foreground">Brochures</p>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {posters.length}
              </h3>
              <p className="text-muted-foreground">Posters</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Gallery;
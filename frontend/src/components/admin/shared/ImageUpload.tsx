// frontend/src/components/admin/shared/ImageUpload.tsx
//
// Reusable image upload component with drag-and-drop,
// progress bar, preview, and URL fallback input.

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, Image, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCloudinaryUpload } from "@/hooks/useCloudinaryUpload";
import { cn } from "@/lib/utils";



interface ImageUploadProps {
  value: string;                          
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectHint?: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB    = 5;

const ImageUpload = ({
  value,
  onChange,
  folder     = "cadec/gallery",
  label      = "Thumbnail",
  aspectHint = "JPG, PNG, WEBP or GIF · Max 5MB",
}: ImageUploadProps) => {
  const { upload, isUploading, progress } = useCloudinaryUpload();
  const [dragOver, setDragOver]           = useState(false);
  const [error,    setError]              = useState<string | null>(null);
  const [urlInput, setUrlInput]           = useState(value);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  /* ── Validate file ── */
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Please upload a JPG, PNG, WEBP, or GIF file.";
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File size must be under ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  /* ── Handle file selection ── */
  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        const result = await upload(file, folder);
        onChange(result.url);
      } catch (err) {
        setError("Upload failed. Please try again.");
      }
    },
    [upload, folder, onChange]
  );

  /* ── Drag handlers ── */
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true);  };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  /* ── Input change ── */
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  /* ── URL tab apply ── */
  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) onChange(trimmed);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>

      <Tabs defaultValue="upload">
        <TabsList className="h-8 text-xs">
          <TabsTrigger value="upload" className="text-xs flex items-center gap-1">
            <Upload className="h-3 w-3" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="url" className="text-xs flex items-center gap-1">
            <Link className="h-3 w-3" />
            URL
          </TabsTrigger>
        </TabsList>

        {/* ── Upload tab ── */}
        <TabsContent value="upload" className="mt-2">
          {/* Preview */}
          {value && !isUploading && (
            <div className="relative mb-3 rounded-lg overflow-hidden border bg-muted h-40">
              <img
                src={value}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
              <button
                type="button"
                onClick={() => { onChange(""); setError(null); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Drop zone */}
          {!value && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                isUploading && "pointer-events-none opacity-60"
              )}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" && fileInputRef.current?.click()
              }
              aria-label="Upload image"
            >
              {isUploading ? (
                <div className="space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Uploading... {progress}%
                  </p>
                  <Progress value={progress} className="h-1.5 max-w-[200px] mx-auto" />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      Drop image here or{" "}
                      <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {aspectHint}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload progress when replacing */}
          {value && isUploading && (
            <div className="space-y-2 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading... {progress}%
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}

          {/* Replace button when image exists */}
          {value && !isUploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5 mr-2" />
              Replace Image
            </Button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={onInputChange}
            aria-hidden="true"
          />
        </TabsContent>

        {/* ── URL tab ── */}
        <TabsContent value="url" className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyUrl())}
              placeholder="https://..."
              className="flex-1 text-sm"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyUrl}
              disabled={!urlInput.trim()}
            >
              Apply
            </Button>
          </div>
          {value && (
            <div className="relative rounded-lg overflow-hidden border bg-muted h-32">
              <img
                src={value}
                alt="URL preview"
                className="w-full h-full object-cover"
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
              <button
                type="button"
                onClick={() => { onChange(""); setUrlInput(""); }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
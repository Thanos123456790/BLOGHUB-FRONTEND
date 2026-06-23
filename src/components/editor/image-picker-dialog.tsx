  "use client";

  import * as React from "react";
  import { toast } from "sonner";
  import { ImagePlusIcon, Loader2Icon, UploadCloudIcon } from "lucide-react";

  import { stockCoverImages } from "@/lib/filters";
  import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/file-to-data-url";
  import { useUploadAssetMutation } from "@/lib/store/api/blogifyApi";
  import type { AssetType } from "@/lib/api/types";
  import { cn } from "@/lib/utils";
  import { Button } from "@/components/ui/button";
  import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
  } from "@/components/ui/dialog";
  import { Input } from "@/components/ui/input";
  import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

  export function ImagePickerDialog({
    onSelect,
    trigger,
    assetType,
  }: {
    onSelect: (url: string) => void;
    trigger: React.ReactNode;
    /** Which S3 key prefix / validation bucket this upload belongs to. */
    assetType: AssetType;
  }) {
    const [open, setOpen] = React.useState(false);
    const [customUrl, setCustomUrl] = React.useState("");
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploadAsset, { isLoading: uploading }] = useUploadAssetMutation();

    function choose(url: string) {
      onSelect(url);
      setOpen(false);
      setCustomUrl("");
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (file.size > MAX_IMAGE_BYTES) {
        toast.error("That image is too large.", {
          description: "Please choose a file under 5MB.",
        });
        return;
      }

      try {
        const result = await uploadAsset({ file, filename: file.name, type: assetType }).unwrap();
        const cleanPath = result.url.startsWith("/") ? result.url.slice(1) : result.url;
        const fullUrl = result.url.startsWith("https://")
          ? result.url
          : "https://amzn-s3-spark-buket.s3.ap-south-1.amazonaws.com/" + cleanPath;
        console.log("fullUrl", fullUrl);
        choose(fullUrl);
      } catch {
        toast.error("Upload failed", {
          description: "Couldn't upload that image. Please try again.",
        });
      }
    }

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <div onClick={() => setOpen(true)}>{trigger}</div>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a photo</DialogTitle>
            <DialogDescription>
              Upload your own photo, pick from the gallery, or paste an image link.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload">
            <TabsList className="w-full">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="url">Link</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="pt-1">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-10 text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                )}
              >
                {uploading ? (
                  <Loader2Icon className="size-6 animate-spin" />
                ) : (
                  <UploadCloudIcon className="size-6" />
                )}
                <span className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Click to upload a photo"}
                </span>
                <span className="text-xs">PNG, JPG, WEBP or GIF, up to 5MB</span>
              </button>
            </TabsContent>

            <TabsContent value="gallery" className="pt-1">
              <div className="grid grid-cols-3 gap-2">
                {stockCoverImages.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => choose(url)}
                    className="aspect-square overflow-hidden rounded-xl border border-border hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img src={url} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="url" className="pt-1">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Paste an image URL"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!customUrl.trim()}
                  onClick={() => choose(customUrl.trim())}
                >
                  <ImagePlusIcon className="size-4" />
                  Use
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

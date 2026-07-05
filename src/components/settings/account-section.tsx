"use client";

import * as React from "react";
import { toast } from "sonner";
import { CameraIcon, ImageIcon, Loader2Icon } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import type { UserProfile } from "@/lib/api/types";
import { useGetMeQuery, useUpdateMeMutation, useUploadAssetMutation } from "@/lib/store/api/blogifyApi";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  dataUrlToBlob,
  readFileAsDataUrl,
} from "@/lib/file-to-data-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ImageEditorDialog } from "@/components/editor/image-editor-dialog";
import { cn } from "@/lib/utils";

type PhotoField = "avatarUrl" | "bannerUrl";

export function AccountSection() {
  const { data: me } = useGetMeQuery();

  if (!me) {
    return (
      <Card className="py-5">
        <CardContent className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2Icon className="size-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  // Keyed by id so the form's local draft state (name/bio/location) always
  // starts fresh from the loaded profile, with no effect needed to sync it.
  return <AccountForm key={me.id} me={me} />;
}

function AccountForm({ me }: { me: UserProfile }) {
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [uploadAsset, { isLoading: uploading }] = useUploadAssetMutation();
  const { user: clerkUser } = useUser();

  // Determine display name: prefer backend name, fall back to Clerk firstName + lastName
  const isClerkGeneratedName =
    /^user_[a-zA-Z0-9]+$/.test(me.name) || me.name === me.handle;
  const clerkFullName =
    clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.fullName ?? clerkUser?.username ?? me.name;
  const resolvedName = isClerkGeneratedName ? clerkFullName : me.name;

  const [name, setName] = React.useState(resolvedName);
  const [bio, setBio] = React.useState(me.bio ?? "");
  const [location, setLocation] = React.useState(me.location ?? "");
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const bannerInputRef = React.useRef<HTMLInputElement>(null);

  const [editorField, setEditorField] = React.useState<PhotoField | null>(null);
  const [editorSrc, setEditorSrc] = React.useState<string | null>(null);

  // Loading skeleton states for images
  const [bannerLoading, setBannerLoading] = React.useState(!!me.bannerUrl);
  const [avatarLoading, setAvatarLoading] = React.useState(!!me.avatarUrl);

  const isDirty = name !== resolvedName || bio !== (me.bio ?? "") || location !== (me.location ?? "");

  async function handleFileSelected(
    e: React.ChangeEvent<HTMLInputElement>,
    field: PhotoField
  ) {
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
      const dataUrl = await readFileAsDataUrl(file);
      setEditorSrc(dataUrl);
      setEditorField(field);
    } catch {
      toast.error("Couldn't read that file. Please try another image.");
    }
  }

  async function handleEditorSave(editedDataUrl: string) {
    if (!editorField) return;
    try {
      const blob = dataUrlToBlob(editedDataUrl);
      const assetType = editorField === "avatarUrl" ? "AVATAR" : "BANNER";
      const filename = `${assetType.toLowerCase()}.jpg`;

      // Show skeleton while uploading
      if (editorField === "bannerUrl") setBannerLoading(true);
      if (editorField === "avatarUrl") setAvatarLoading(true);

      const uploaded = await uploadAsset({ file: blob, filename, type: assetType }).unwrap();
      // Resolve full URL if needed
      const resolvedUrl = uploaded.url.startsWith("https://")
        ? uploaded.url
        : `https://amzn-s3-spark-buket.s3.ap-south-1.amazonaws.com/${uploaded.url.replace(/^\//, "")}`;
      await updateMe({ [editorField]: resolvedUrl }).unwrap();
      toast.success(
        editorField === "avatarUrl" ? "Profile photo updated" : "Cover photo updated"
      );
    } catch {
      toast.error("Couldn't save that photo. Please try again.");
    } finally {
      setBannerLoading(false);
      setAvatarLoading(false);
    }
  }

  function handleSave() {
    updateMe({ name: name.trim() || resolvedName, bio: bio.trim(), location: location.trim() })
      .unwrap()
      .then(() => toast.success("Account updated"))
      .catch(() => toast.error("Couldn't save your changes. Please try again."));
  }

  return (
    <Card className="py-5">
      <CardHeader className="px-5 pt-0">
        <CardTitle>Account</CardTitle>
        <CardDescription>
          This information is shown on your public profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* Banner with loading skeleton */}
          <div className="relative h-24 bg-muted">
            {bannerLoading && (
              <div className="absolute inset-0 animate-pulse bg-muted z-10" />
            )}
            {me.bannerUrl && (
              <img
                src={me.bannerUrl}
                alt=""
                className={cn("size-full object-cover transition-opacity duration-300", bannerLoading ? "opacity-0" : "opacity-100")}
                onLoad={() => setBannerLoading(false)}
                onError={() => setBannerLoading(false)}
              />
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES}
              className="hidden"
              onChange={(e) => handleFileSelected(e, "bannerUrl")}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2 gap-1.5 shadow-sm z-20"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading && editorField === "bannerUrl" ? (
                <Loader2Icon className="size-3.5 animate-spin" />
              ) : (
                <ImageIcon className="size-3.5" />
              )}
              Change cover
            </Button>
          </div>

          <div className="flex items-center gap-4 p-4 -mt-8">
            <div className="relative shrink-0">
              {/* Avatar with loading skeleton */}
              {avatarLoading && (
                <div className="size-16 rounded-full ring-4 ring-card bg-muted animate-pulse absolute inset-0 z-10" />
              )}
              <Avatar className="size-16 ring-4 ring-card">
                <AvatarImage
                  src={me.avatarUrl ?? undefined}
                  alt={me.name}
                  onLoad={() => setAvatarLoading(false)}
                  onError={() => setAvatarLoading(false)}
                />
                <AvatarFallback>{resolvedName[0]}</AvatarFallback>
              </Avatar>
              <input
                ref={avatarInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES}
                className="hidden"
                onChange={(e) => handleFileSelected(e, "avatarUrl")}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60 z-20"
              >
                {uploading && editorField === "avatarUrl" ? (
                  <Loader2Icon className="size-3.5 animate-spin" />
                ) : (
                  <CameraIcon className="size-3.5" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tap the camera icon to update your profile photo, or use the button
              above to change your cover photo. Both open a quick editor to crop,
              rotate, and adjust light before saving.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-name">Name</Label>
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-handle">Username</Label>
          <Input id="settings-handle" value={`@${me.handle}`} disabled />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-bio">Bio</Label>
          <Textarea
            id="settings-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="settings-location">Location</Label>
          <Input
            id="settings-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button onClick={handleSave} disabled={!isDirty || saving}>
          {saving && <Loader2Icon className="size-4 animate-spin" />}
          Save changes
        </Button>
      </CardFooter>

      <ImageEditorDialog
        key={editorSrc ?? "empty"}
        open={editorField !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditorField(null);
            setEditorSrc(null);
          }
        }}
        imageSrc={editorSrc}
        shape={editorField === "avatarUrl" ? "circle" : "rect"}
        aspect={3}
        title={editorField === "avatarUrl" ? "Edit profile photo" : "Edit cover photo"}
        onSave={handleEditorSave}
      />
    </Card>
  );
}

"use client";

import * as React from "react";
import { toast } from "sonner";
import { CameraIcon, Loader2Icon } from "lucide-react";

import { useUser } from "@clerk/nextjs";

import type { UserProfile } from "@/lib/api/types";
import { useUpdateMeMutation, useUploadAssetMutation } from "@/lib/store/api/blogifyApi";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  dataUrlToBlob,
  readFileAsDataUrl,
} from "@/lib/file-to-data-url";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageEditorDialog } from "@/components/editor/image-editor-dialog";

export function EditProfileDialog({ user }: { user: UserProfile }) {
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [uploadAsset, { isLoading: uploading }] = useUploadAssetMutation();
  const { user: clerkUser } = useUser();

  // If the backend name looks like a Clerk-generated ID, suggest the Clerk full name instead
  const isClerkGeneratedName =
    /^user_[a-zA-Z0-9]+$/.test(user.name) || user.name === user.handle;
  const defaultName = isClerkGeneratedName
    ? (clerkUser?.fullName ?? clerkUser?.username ?? user.name)
    : user.name;

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(defaultName);
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [location, setLocation] = React.useState(user.location ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatarUrl ?? "");
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorSrc, setEditorSrc] = React.useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(defaultName);
      setBio(user.bio ?? "");
      setLocation(user.location ?? "");
      setAvatarUrl(user.avatarUrl ?? "");
    }
    setOpen(next);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      setEditorOpen(true);
    } catch {
      toast.error("Couldn't read that file. Please try another image.");
    }
  }

  async function handleEditorSave(editedDataUrl: string) {
    try {
      const blob = dataUrlToBlob(editedDataUrl);
      const uploaded = await uploadAsset({ file: blob, filename: "avatar.jpg", type: "AVATAR" }).unwrap();
      setAvatarUrl(uploaded.url);
    } catch {
      toast.error("Upload failed", { description: "Couldn't upload that photo." });
    }
  }

  async function handleSave() {
    try {
      await updateMe({
        name: name.trim() || user.name,
        bio: bio.trim(),
        location: location.trim(),
        avatarUrl: avatarUrl || undefined,
      }).unwrap();
      toast.success("Profile updated", {
        description: "Your changes have been saved.",
      });
      setOpen(false);
    } catch {
      toast.error("Couldn't save your changes. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            This information appears on your public profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <Avatar className="size-16">
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback>{name[0]}</AvatarFallback>
          </Avatar>
          <input
            ref={avatarInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              <CameraIcon className="size-4" />
            )}
            Change photo
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2Icon className="size-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>

      <ImageEditorDialog
        key={editorSrc ?? "empty"}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        imageSrc={editorSrc}
        shape="circle"
        title="Edit profile photo"
        onSave={handleEditorSave}
      />
    </Dialog>
  );
}

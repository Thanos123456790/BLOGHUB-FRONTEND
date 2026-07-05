"use client";

import * as React from "react";
import { toast } from "sonner";
import { CameraIcon, Loader2Icon, PlusIcon, XIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import type { UserProfile, SocialLink, EducationEntry, ExperienceEntry } from "@/types/user";
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
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── helpers ────────────────────────────────────────────────────────────────────

function splitTags(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ── sub-components ─────────────────────────────────────────────────────────────

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = React.useState(value.join(", "));

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <Input
        value={raw}
        placeholder={placeholder ?? "Comma-separated"}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(splitTags(e.target.value));
        }}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => {
                  const next = value.filter((t) => t !== tag);
                  onChange(next);
                  setRaw(next.join(", "));
                }}
              >
                <XIcon className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SocialLinksEditor({
  value,
  onChange,
}: {
  value: SocialLink[];
  onChange: (v: SocialLink[]) => void;
}) {
  const PLATFORMS = ["Website", "Twitter", "GitHub", "LinkedIn", "Instagram", "YouTube", "Other"];

  function update(i: number, field: keyof SocialLink, val: string) {
    const next = value.map((l, idx) => (idx === i ? { ...l, [field]: val } : l));
    onChange(next);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...value, { platform: "Website", url: "" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <Label>Social Links</Label>
      {value.map((link, i) => (
        <div key={i} className="flex gap-2 items-center">
          <select
            value={link.platform}
            onChange={(e) => update(i, "platform", e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <Input
            className="flex-1"
            placeholder="https://..."
            value={link.url}
            onChange={(e) => update(i, "url", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => remove(i)}
          >
            <XIcon className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-1.5"
        onClick={add}
      >
        <PlusIcon className="size-4" />
        Add link
      </Button>
    </div>
  );
}

function EducationEditor({
  value,
  onChange,
}: {
  value: EducationEntry[];
  onChange: (v: EducationEntry[]) => void;
}) {
  function update(i: number, field: keyof EducationEntry, val: string | number) {
    onChange(value.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>Education</Label>
      {value.map((entry, i) => (
        <div key={i} className="rounded-lg border border-border p-3 flex flex-col gap-2 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 size-7"
            onClick={() => remove(i)}
          >
            <XIcon className="size-3.5" />
          </Button>
          <Input
            placeholder="Institution"
            value={entry.institution}
            onChange={(e) => update(i, "institution", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Degree (e.g. B.Sc)"
              value={entry.degree ?? ""}
              onChange={(e) => update(i, "degree", e.target.value)}
            />
            <Input
              placeholder="Field of study"
              value={entry.field ?? ""}
              onChange={(e) => update(i, "field", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Start year"
              value={entry.startYear ?? ""}
              onChange={(e) => update(i, "startYear", Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="End year"
              value={entry.endYear ?? ""}
              onChange={(e) => update(i, "endYear", Number(e.target.value))}
            />
          </div>
          <Textarea
            placeholder="Description (optional)"
            value={entry.description ?? ""}
            rows={2}
            onChange={(e) => update(i, "description", e.target.value)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-1.5"
        onClick={() =>
          onChange([...value, { institution: "", degree: "", field: "" }])
        }
      >
        <PlusIcon className="size-4" />
        Add education
      </Button>
    </div>
  );
}

function ExperienceEditor({
  value,
  onChange,
}: {
  value: ExperienceEntry[];
  onChange: (v: ExperienceEntry[]) => void;
}) {
  function update(i: number, field: keyof ExperienceEntry, val: string | boolean) {
    onChange(value.map((e, idx) => (idx === i ? { ...e, [field]: val } : e)));
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>Experience</Label>
      {value.map((entry, i) => (
        <div key={i} className="rounded-lg border border-border p-3 flex flex-col gap-2 relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 size-7"
            onClick={() => remove(i)}
          >
            <XIcon className="size-3.5" />
          </Button>
          <Input
            placeholder="Job title"
            value={entry.title}
            onChange={(e) => update(i, "title", e.target.value)}
          />
          <Input
            placeholder="Company"
            value={entry.company}
            onChange={(e) => update(i, "company", e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="month"
              placeholder="Start date"
              value={entry.startDate ?? ""}
              onChange={(e) => update(i, "startDate", e.target.value)}
            />
            <Input
              type="month"
              placeholder="End date"
              value={entry.endDate ?? ""}
              disabled={entry.current}
              onChange={(e) => update(i, "endDate", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={entry.current ?? false}
              onChange={(e) => update(i, "current", e.target.checked)}
              className="rounded"
            />
            I currently work here
          </label>
          <Textarea
            placeholder="Description (optional)"
            value={entry.description ?? ""}
            rows={2}
            onChange={(e) => update(i, "description", e.target.value)}
          />
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-1.5"
        onClick={() => onChange([...value, { title: "", company: "" }])}
      >
        <PlusIcon className="size-4" />
        Add experience
      </Button>
    </div>
  );
}

// ── Main dialog ────────────────────────────────────────────────────────────────

export function EditProfileDialog({ user }: { user: UserProfile }) {
  const [updateMe, { isLoading: saving }] = useUpdateMeMutation();
  const [uploadAsset, { isLoading: uploading }] = useUploadAssetMutation();
  const { user: clerkUser } = useUser();

  const isClerkGeneratedName =
    /^user_[a-zA-Z0-9]+$/.test(user.name) || user.name === user.handle;
  const clerkFullName =
    clerkUser?.firstName && clerkUser?.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`
      : clerkUser?.fullName ?? clerkUser?.username ?? user.name;
  const defaultName = isClerkGeneratedName ? clerkFullName : user.name;

  const [open, setOpen] = React.useState(false);

  // Basic fields
  const [name, setName] = React.useState(defaultName);
  const [bio, setBio] = React.useState(user.bio ?? "");
  const [location, setLocation] = React.useState(user.location ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatarUrl ?? "");
  const [avatarLoading, setAvatarLoading] = React.useState(false);

  // Extended fields
  const [website, setWebsite] = React.useState(user.website ?? "");
  const [profession, setProfession] = React.useState(user.profession ?? "");
  const [skills, setSkills] = React.useState<string[]>(user.skills ?? []);
  const [interests, setInterests] = React.useState<string[]>(user.interests ?? []);
  const [languages, setLanguages] = React.useState<string[]>(user.languages ?? []);
  const [socialLinks, setSocialLinks] = React.useState<SocialLink[]>(user.socialLinks ?? []);
  const [education, setEducation] = React.useState<EducationEntry[]>(user.education ?? []);
  const [experience, setExperience] = React.useState<ExperienceEntry[]>(user.experience ?? []);

  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const [editorSrc, setEditorSrc] = React.useState<string | null>(null);

  function resetForm() {
    setName(defaultName);
    setBio(user.bio ?? "");
    setLocation(user.location ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setWebsite(user.website ?? "");
    setProfession(user.profession ?? "");
    setSkills(user.skills ?? []);
    setInterests(user.interests ?? []);
    setLanguages(user.languages ?? []);
    setSocialLinks(user.socialLinks ?? []);
    setEducation(user.education ?? []);
    setExperience(user.experience ?? []);
  }

  function handleOpenChange(next: boolean) {
    if (next) resetForm();
    setOpen(next);
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("That image is too large.", {
        description: "Please choose a file under 5 MB.",
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
      setAvatarLoading(true);
      const blob = dataUrlToBlob(editedDataUrl);
      const uploaded = await uploadAsset({
        file: blob,
        filename: "avatar.jpg",
        type: "AVATAR",
      }).unwrap();
      const resolvedUrl = uploaded.url.startsWith("https://")
        ? uploaded.url
        : `https://amzn-s3-spark-buket.s3.ap-south-1.amazonaws.com/${uploaded.url.replace(/^\//, "")}`;
      setAvatarUrl(resolvedUrl);
    } catch {
      toast.error("Upload failed", { description: "Couldn't upload that photo." });
    } finally {
      setAvatarLoading(false);
    }
  }

  async function handleSave() {
    try {
      await updateMe({
        name: name.trim() || user.name,
        bio: bio.trim(),
        location: location.trim(),
        avatarUrl: avatarUrl || undefined,
        website: website.trim() || undefined,
        profession: profession.trim() || undefined,
        skills: skills.length ? skills : undefined,
        interests: interests.length ? interests : undefined,
        languages: languages.length ? languages : undefined,
        socialLinks: socialLinks.filter((l) => l.url.trim()).length
          ? socialLinks.filter((l) => l.url.trim())
          : undefined,
        education: education.filter((e) => e.institution.trim()).length
          ? education.filter((e) => e.institution.trim())
          : undefined,
        experience: experience.filter((e) => e.title.trim() && e.company.trim()).length
          ? experience.filter((e) => e.title.trim() && e.company.trim())
          : undefined,
      }).unwrap();
      toast.success("Profile updated", { description: "Your changes have been saved." });
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

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            This information appears on your public profile.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">Basic</TabsTrigger>
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="career" className="flex-1">Career</TabsTrigger>
          </TabsList>

          {/* ── Basic ──────────────────────────────────────────── */}
          <TabsContent value="basic" className="flex flex-col gap-4 mt-4">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative size-16 shrink-0">
                {avatarLoading && (
                  <div className="absolute inset-0 rounded-full bg-muted animate-pulse z-10" />
                )}
                <Avatar className="size-16">
                  <AvatarImage src={avatarUrl || undefined} alt={name} />
                  <AvatarFallback>{name[0]}</AvatarFallback>
                </Avatar>
              </div>
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
                disabled={uploading || avatarLoading}
              >
                {uploading || avatarLoading ? (
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yoursite.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </TabsContent>

          {/* ── Details ────────────────────────────────────────── */}
          <TabsContent value="details" className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profession">Profession</Label>
              <Input
                id="profession"
                placeholder="e.g. Software Engineer"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
              />
            </div>

            <TagInput
              label="Skills"
              value={skills}
              onChange={setSkills}
              placeholder="React, TypeScript, Node.js"
            />

            <TagInput
              label="Interests"
              value={interests}
              onChange={setInterests}
              placeholder="Open Source, AI, Design"
            />

            <TagInput
              label="Languages"
              value={languages}
              onChange={setLanguages}
              placeholder="English, Hindi, Spanish"
            />

            <SocialLinksEditor value={socialLinks} onChange={setSocialLinks} />
          </TabsContent>

          {/* ── Career ─────────────────────────────────────────── */}
          <TabsContent value="career" className="flex flex-col gap-6 mt-4">
            <EducationEditor value={education} onChange={setEducation} />
            <ExperienceEditor value={experience} onChange={setExperience} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2Icon className="size-4 animate-spin mr-1" />}
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
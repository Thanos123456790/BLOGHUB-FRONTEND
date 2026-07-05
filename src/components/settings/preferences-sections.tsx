"use client";

import { BellRingIcon, EyeIcon, EyeOffIcon, MailIcon, NewspaperIcon } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectSettings, setPref } from "@/lib/store/slices/settingsSlice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingRow } from "./setting-row";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function NotificationsSection() {
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  return (
    <Card className="py-5">
      <CardHeader className="px-5 pt-0">
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to hear about.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow
          icon={MailIcon}
          label="Email notifications"
          description="Replies, mentions, and new followers in your inbox."
          checked={settings.emailNotifications}
          onCheckedChange={(value) =>
            dispatch(setPref({ key: "emailNotifications", value }))
          }
        />
        <SettingRow
          icon={BellRingIcon}
          label="Push notifications"
          description="Get notified on this device in real time."
          checked={settings.pushNotifications}
          onCheckedChange={(value) =>
            dispatch(setPref({ key: "pushNotifications", value }))
          }
        />
        <SettingRow
          icon={NewspaperIcon}
          label="Weekly digest"
          description="A Monday-morning summary of posts you might like."
          checked={settings.weeklyDigest}
          onCheckedChange={(value) =>
            dispatch(setPref({ key: "weeklyDigest", value }))
          }
        />
      </CardContent>
    </Card>
  );
}

export function PrivacySection() {
  const settings = useAppSelector(selectSettings);
  const dispatch = useAppDispatch();

  return (
    <Card className="py-5">
      <CardHeader className="px-5 pt-0">
        <CardTitle>Privacy</CardTitle>
        <CardDescription>Control who sees your activity and content.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        {/* Profile Visibility */}
        <div className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
          <div className="flex gap-3 items-start">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              {settings.privateAccount ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">Profile visibility</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {settings.privateAccount
                  ? "Only approved followers can see your posts and full profile."
                  : "Anyone can view your profile and posts."}
              </p>
            </div>
          </div>
          <Select
            value={settings.privateAccount ? "private" : "public"}
            onValueChange={(val) =>
              dispatch(setPref({ key: "privateAccount", value: val === "private" }))
            }
          >
            <SelectTrigger className="w-28 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">
                <span className="flex items-center gap-1.5">
                  <EyeIcon className="size-3.5" /> Public
                </span>
              </SelectItem>
              <SelectItem value="private">
                <span className="flex items-center gap-1.5">
                  <EyeOffIcon className="size-3.5" /> Private
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SettingRow
          label="Show activity status"
          description="Let people see when you're active on Blogify."
          checked={settings.showActivityStatus}
          onCheckedChange={(value) =>
            dispatch(setPref({ key: "showActivityStatus", value }))
          }
        />
      </CardContent>
    </Card>
  );
}

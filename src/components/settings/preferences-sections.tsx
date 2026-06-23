"use client";

import { BellRingIcon, MailIcon, NewspaperIcon } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectSettings, setPref } from "@/lib/store/slices/settingsSlice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettingRow } from "./setting-row";

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
        <CardDescription>Control who sees your activity.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <SettingRow
          label="Private account"
          description="Only approved followers can see your posts."
          checked={settings.privateAccount}
          onCheckedChange={(value) =>
            dispatch(setPref({ key: "privateAccount", value }))
          }
        />
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

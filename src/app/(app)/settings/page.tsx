import { BackButton } from "@/components/shared/back-button";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { AccountSection } from "@/components/settings/account-section";
import {
  NotificationsSection,
  PrivacySection,
} from "@/components/settings/preferences-sections";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";

export default function SettingsPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 lg:py-8 max-w-[640px] mx-auto pb-16">
      <BackButton className="mb-5" fallbackHref="/profile" />

      <h1 className="font-display text-2xl font-semibold tracking-tight mb-1">
        Settings
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your appearance, account, and notification preferences.
      </p>

      <div className="flex flex-col gap-5">
        <AppearanceSection />
        <AccountSection />
        <NotificationsSection />
        <PrivacySection />
        <DangerZoneSection />
      </div>
    </div>
  );
}

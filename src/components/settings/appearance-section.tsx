"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { selectTheme, setTheme, type ThemeMode } from "@/lib/store/slices/settingsSlice";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const options: { value: ThemeMode; label: string; description: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", description: "Bright background, dark text", icon: SunIcon },
  { value: "dark", label: "Dark", description: "Dark background, easy on the eyes", icon: MoonIcon },
];

export function AppearanceSection() {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  return (
    <Card className="py-5">
      <CardHeader className="px-5 pt-0">
        <CardTitle>Appearance</CardTitle>
        <CardDescription>Choose how Blogify looks on this device.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {options.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => dispatch(setTheme(option.value))}
                className={cn(
                  "flex flex-col items-start gap-3 rounded-2xl border p-4 text-left transition-colors",
                  isActive
                    ? "border-primary bg-secondary"
                    : "border-border hover:bg-muted"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{option.label}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

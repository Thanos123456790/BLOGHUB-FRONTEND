"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

import { useAppSelector } from "@/lib/store/hooks";
import { selectTheme } from "@/lib/store/slices/settingsSlice";

const Toaster = ({ ...props }: ToasterProps) => {
  const theme = useAppSelector(selectTheme);

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };

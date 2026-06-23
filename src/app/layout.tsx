import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/redux-provider";
import { ThemeSync } from "@/components/providers/theme-sync";
import { Toaster } from "@/components/ui/sonner";
import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata: Metadata = {
  title: "Blogify — Write. Share. Follow.",
  description:
    "Blogify is a place to publish blogs, follow writers, and talk in the comments.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Applies the persisted theme class before React hydrates, so there's no
// flash of the wrong theme on load.
const noFlashThemeScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("blogify-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      <html lang="en" className="h-full antialiased" suppressHydrationWarning>
        <head>
          <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
        </head>
        <body className="min-h-full bg-background text-foreground font-sans">
          <ReduxProvider>
            <ThemeSync />
            {children}
            <Toaster position="top-center" />
          </ReduxProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { Feather, MessageCircleIcon, PenSquareIcon, UsersIcon } from "lucide-react";

import { clerkAppearance } from "@/lib/clerk-appearance";

export const metadata = {
  title: "Log in — Blogify",
};

const highlights = [
  {
    icon: PenSquareIcon,
    title: "Write without friction",
    description: "A focused editor with photo, video, and emoji support built in.",
  },
  {
    icon: UsersIcon,
    title: "Follow writers you like",
    description: "Build a feed around the people and topics you actually care about.",
  },
  {
    icon: MessageCircleIcon,
    title: "Real conversations",
    description: "Comment, reply, and react — right under every post.",
  },
];

export default async function LoginPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-primary px-12 py-10 text-primary-foreground">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-80 rounded-full bg-brand-amber/30 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-16 size-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Feather className="size-4.5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Blogify
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-display text-3xl xl:text-4xl font-semibold tracking-tight leading-tight">
            Write. Share. Follow.
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-[15px] leading-relaxed">
            A calmer place to publish your writing and follow the people whose
            work you admire.
          </p>

          <div className="mt-10 flex flex-col gap-5">
            {highlights.map((h) => (
              <div key={h.title} className="flex items-start gap-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <h.icon className="size-4.5" />
                </span>
                <div>
                  <p className="text-sm font-medium">{h.title}</p>
                  <p className="text-xs text-primary-foreground/75 mt-0.5">
                    {h.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Blogify. A demo app built with Next.js, Redux Toolkit &amp; Clerk.
        </p>
      </div>

      {/* Auth panel */}
      <div className="flex flex-col items-center justify-center px-4 sm:px-8 py-10">
        <div className="w-full max-w-sm">
          <div className="flex lg:hidden items-center gap-2.5 mb-8 justify-center">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Feather className="size-4.5" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">
              Blogify
            </span>
          </div>

          <div className="mb-6 text-center lg:text-left">
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your email or Google to continue.
            </p>
          </div>

          <SignIn
            routing="path"
            path="/login"
            fallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
            appearance={clerkAppearance}
          />

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to Blogify&rsquo;s demo Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

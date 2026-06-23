"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Feather, SearchIcon } from "lucide-react";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { primaryNavItems } from "./nav-items";
import { useGetMeQuery, useGetNotificationsQuery } from "@/lib/store/api/blogifyApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/search/global-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: me } = useGetMeQuery();
  const { data: notifications } = useGetNotificationsQuery({ size: 50 });
  const unreadCount = notifications?.content.filter((n) => !n.isRead).length ?? 0;
  const { signOut } = useClerk();
  const { user: clerkUser } = useUser();

  // Prefer the user's own edited name from the backend profile (me.name),
  // but fall back to Clerk's full name if the backend name looks like a
  // system-generated handle (e.g. "user_2abc123").
  const isClerkGeneratedName = me?.name
    ? /^user_[a-zA-Z0-9]+$/.test(me.name) || me.name === me?.handle
    : false;
  const displayName =
    (isClerkGeneratedName
      ? clerkUser?.fullName ?? clerkUser?.username ?? me?.name
      : me?.name) ?? clerkUser?.fullName ?? clerkUser?.username ?? "Loading...";

  async function handleLogOut() {
    try {
      await signOut({ redirectUrl: "/login" });
    } catch {
      toast.error("Couldn't log out. Please try again.");
    }
  }

  return (
    <aside className="hidden md:flex md:w-[84px] lg:w-[268px] md:flex-col md:fixed md:inset-y-0 md:left-0 md:border-r md:border-border md:bg-sidebar md:z-40">
      <div className="flex items-center gap-2.5 px-5 lg:px-6 h-[68px] shrink-0">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
          <Feather className="size-4.5" />
        </div>
        <span className="hidden lg:inline font-display text-lg font-semibold tracking-tight">
          Blogify
        </span>
      </div>

      <div className="px-3 lg:px-4 mb-1">
        <GlobalSearch
          trigger={
            <Button
              variant="outline"
              className="w-full justify-start gap-3 text-muted-foreground md:justify-center lg:justify-start h-10 px-3 lg:px-4"
            >
              <SearchIcon className="size-4.5 shrink-0" />
              <span className="hidden lg:inline text-sm">Search Blogify</span>
            </Button>
          }
        />
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 lg:px-4 mt-1">
        {primaryNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3.5 rounded-full px-3 lg:px-4 h-12 transition-colors",
                "md:justify-center lg:justify-start",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="relative shrink-0">
                <Icon
                  className="size-5"
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex size-2.5 rounded-full bg-brand-amber ring-2 ring-sidebar" />
                )}
              </span>
              <span className="hidden lg:inline text-[15px] font-medium">
                {item.label}
              </span>
              {item.href === "/notifications" && unreadCount > 0 && (
                <Badge
                  variant="amber"
                  className="hidden lg:inline-flex ml-auto"
                >
                  {unreadCount}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 lg:px-4 pb-4 mt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-full p-2 hover:bg-muted transition-colors md:justify-center lg:justify-start">
              <Avatar className="size-9 ring-2 ring-card shrink-0">
                <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
                <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
              </Avatar>
              <span className="hidden lg:flex flex-col items-start min-w-0">
                <span className="text-sm font-medium truncate max-w-[140px]">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {me ? `@${me.handle}` : ""}
                </span>
              </span>
              <ChevronsUpDownIcon className="hidden lg:inline size-4 text-muted-foreground ml-auto shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <Avatar className="size-5">
                  <AvatarImage src={me?.avatarUrl ?? undefined} alt={me?.name} />
                  <AvatarFallback>{me?.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                View profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <SettingsIcon /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {clerkUser && (
              <>
                <DropdownMenuLabel className="font-normal">
                  Signed in via Clerk as{" "}
                  <span className="text-foreground font-medium">
                    {clerkUser.primaryEmailAddress?.emailAddress ??
                      clerkUser.username ??
                      "your account"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem variant="destructive" onSelect={handleLogOut}>
              <LogOutIcon /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

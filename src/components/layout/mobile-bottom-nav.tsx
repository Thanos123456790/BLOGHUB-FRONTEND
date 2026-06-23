"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { primaryNavItems } from "./nav-items";
import { useGetNotificationsQuery } from "@/lib/store/api/blogifyApi";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: notifications } = useGetNotificationsQuery({ size: 50 });
  const unreadCount = notifications?.content.filter((n) => !n.isRead).length ?? 0;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch justify-around h-16">
        {primaryNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          const isCreate = item.href === "/create";

          if (isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-1 items-center justify-center"
                aria-label="Create"
              >
                <span className="flex items-center justify-center size-11 rounded-full bg-primary text-primary-foreground shadow-sm">
                  <Icon className="size-5" />
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5"
              aria-label={item.label}
            >
              <span className="relative">
                <Icon
                  className={cn(
                    "size-5.5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex size-2 rounded-full bg-brand-amber ring-2 ring-card" />
                )}
              </span>
              <span
                className={cn(
                  "text-[10.5px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

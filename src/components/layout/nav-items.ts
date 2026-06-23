import {
  HomeIcon,
  UsersIcon,
  BellIcon,
  PenSquareIcon,
  UserCircleIcon,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const primaryNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/follow", label: "Follow", icon: UsersIcon },
  { href: "/create", label: "Create", icon: PenSquareIcon },
  { href: "/notifications", label: "Notifications", icon: BellIcon },
  { href: "/profile", label: "Profile", icon: UserCircleIcon },
];

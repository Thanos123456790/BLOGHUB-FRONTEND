import { Sidebar } from "./sidebar";
import { MobileTopBar } from "./mobile-topbar";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileTopBar />
      <main className="md:pl-[84px] lg:pl-[268px] pb-20 md:pb-0 min-h-screen">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}

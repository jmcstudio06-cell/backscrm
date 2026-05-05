import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";
import { HelpFab } from "./HelpFab";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Content */}
      <div className="transition-all duration-300 pl-0 lg:pl-64">
        <Header title={title} subtitle={subtitle} />

        <main className="p-3 sm:p-4 md:p-6 pb-24 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setMobileOpen(true)} />

      {/* Notification Permission Prompt */}
      <NotificationPrompt />

      {/* Floating help button */}
      <HelpFab />
    </div>
  );
}

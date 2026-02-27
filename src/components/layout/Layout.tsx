import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NotificationPrompt } from "@/components/notifications/NotificationPrompt";

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
        <Header title={title} subtitle={subtitle} onMenuClick={() => setMobileOpen(true)} />

        <main className="p-3 sm:p-4 md:p-6 pb-28 md:pb-24">{children}</main>
      </div>

       {/* Notification Permission Prompt */}
       <NotificationPrompt />
    </div>
  );
}

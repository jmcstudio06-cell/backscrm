import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";

import { HelpFab } from "./HelpFab";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerRightSlot?: ReactNode;
}

export function Layout({ children, title, subtitle, headerRightSlot }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      {/* Content */}
      <div className="transition-all duration-300 pl-0 lg:pl-64">
        <Header title={title} subtitle={subtitle} rightSlot={headerRightSlot} />

        {/* pb compensa nav bar mobile (64px) + HelpFab + margem de segurança */}
        <main className="p-3 sm:p-4 md:p-6 pb-32 lg:pb-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuClick={() => setMobileOpen(true)} />




      {/* Floating help button */}
      <HelpFab />
    </div>
  );
}

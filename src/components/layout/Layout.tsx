import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - fixa só no desktop */}
      <aside className="hidden lg:block">
        <Sidebar />
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col">
        <Header title={title} subtitle={subtitle} />

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

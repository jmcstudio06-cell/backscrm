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
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo */}
      <div
        className="transition-all duration-300
        pl-0 lg:pl-64
      "
      >
        <Header title={title} subtitle={subtitle} />

        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

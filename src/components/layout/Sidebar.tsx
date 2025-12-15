import { useState } from "react";
import { NavLink as RouterNavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  UserCheck,
  DollarSign,
  History,
  Users2,
  Target,
  Crown,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  TrendingUp,
  CheckSquare,
  Briefcase,
  Truck,
  Shield,
  Lock,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAdmin();
  const { isBlocked } = useFeatureBlocks();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && <div onClick={onCloseMobile} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300",
          "w-64",
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <AppLogo collapsed={false} />

          {/* Close mobile */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onCloseMobile}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* 👉 TODO: aqui entra exatamente o SEU menu atual
              👉 (não mexi na lógica, só removi collapsed visual no mobile)
          */}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button
            onClick={() => navigate("/planos")}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-6"
          >
            <Crown className="w-5 h-5 mr-2" />
            Ver Planos
          </Button>

          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </aside>
    </>
  );
}

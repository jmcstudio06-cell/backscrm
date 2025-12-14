import { Sparkles } from "lucide-react";
import { useAppSettings } from "@/hooks/useAppSettings";

interface AppLogoProps {
  collapsed?: boolean;
  size?: "sm" | "md" | "lg";
}

export function AppLogo({ collapsed = false, size = "md" }: AppLogoProps) {
  const { settings } = useAppSettings();

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-3">
      {settings.logo_url ? (
        <img 
          src={settings.logo_url} 
          alt={settings.app_name}
          className={`${sizeClasses[size]} rounded-xl object-cover`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-xl flex items-center justify-center bg-primary`}>
          <Sparkles className={`${iconSizeClasses[size]} text-white`} />
        </div>
      )}
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-bold text-sidebar-primary">{settings.app_name}</span>
          <span className="text-xs text-sidebar-foreground">CRM para Artistas</span>
        </div>
      )}
    </div>
  );
}

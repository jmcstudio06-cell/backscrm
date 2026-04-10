import { useAppSettings } from "@/hooks/useAppSettings";
import baIconImg from "@/assets/ba-icon.png";

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

  return (
    <div className="flex items-center gap-3">
      <img 
        src={baIconImg} 
        alt={settings.app_name}
        className={`${sizeClasses[size]} rounded-xl object-cover`}
      />
      {!collapsed && (
        <div className="flex flex-col">
          <span className="font-bold text-sidebar-primary">{settings.app_name}</span>
          <span className="text-xs text-sidebar-foreground">O coração da carreira</span>
        </div>
      )}
    </div>
  );
}

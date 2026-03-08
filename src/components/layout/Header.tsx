import { Menu, User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function Header({ title, subtitle, onMenuClick }: HeaderProps) {
  const { profile } = useProfile();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-background/70 backdrop-blur-2xl border-b border-border/50 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile menu button */}
          {onMenuClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden shrink-0 h-9 w-9 rounded-xl hover:bg-secondary/50" 
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">{title}</h1>
            {subtitle && <p className="text-[10px] text-muted-foreground truncate uppercase tracking-wider">{subtitle}</p>}
          </div>
        </div>

        {/* Profile area */}
        <div className="flex items-center gap-2">
          {/* Notification bell (decorative) */}
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-secondary/50 hidden sm:flex">
            <Bell className="w-4 h-4 text-muted-foreground" />
          </Button>
          
          {/* Profile */}
          <Button variant="ghost" size="icon" className="rounded-xl overflow-hidden shrink-0 h-9 w-9 sm:h-10 sm:w-10 hover:ring-2 hover:ring-primary/20 transition-all">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Avatar" 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}

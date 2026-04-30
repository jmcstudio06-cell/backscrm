import { useEffect, useState } from "react";
import baIconImg from "@/assets/ba-icon.png";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  // Só exibe em PWA instalado (standalone) em mobile/tablet, uma vez por sessão
  const shouldShow = (() => {
    if (typeof window === "undefined") return false;

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (!isStandalone) return false;

    const isMobileOrTablet = window.matchMedia?.("(max-width: 1024px)").matches;
    if (!isMobileOrTablet) return false;

    if (sessionStorage.getItem("splash_shown") === "1") return false;
    sessionStorage.setItem("splash_shown", "1");
    return true;
  })();

  const [isVisible, setIsVisible] = useState(shouldShow);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    document.body.style.overflow = 'hidden';

    const fadeTimer = setTimeout(() => setIsFadingOut(true), 2200);
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out",
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{
        background: "#FFFFFF"
      }}
    >
      {/* Subtle glow effect background (soft blue) */}
      <div className="absolute w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />

      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 transform transition-transform duration-1000 ease-out scale-100 hover:scale-110">
          <div className="absolute inset-0 bg-primary/10 rounded-[2rem] blur-xl animate-pulse" />
          <div className="relative w-full h-full overflow-hidden rounded-[2rem] border border-gray-100 shadow-2xl shadow-primary/10">
            <img 
              src={baIconImg} 
              alt="Backstage Pro" 
              className="w-full h-full object-cover"
            />
            {/* The "Train Line" Animation (Shimmer) - More subtle on light bg */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer-fast" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 px-6">
          <h1 className="text-3xl md:text-4xl font-black text-[#003366] tracking-tighter">
            BACKSTAGE <span className="text-primary">PRO</span>
          </h1>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-primary/30 to-transparent mx-auto" />
          <p className="text-gray-500 text-sm md:text-base font-medium tracking-widest uppercase">
            O coração da sua carreira!
          </p>
        </div>
      </div>

      {/* Simple animated loading bar at the bottom */}
      <div className="absolute bottom-12 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-primary/40 animate-progress-loading" />
      </div>

      <style>{`
        @keyframes shimmer-fast {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(150%) skewX(-20deg); }
        }
        @keyframes progress-loading {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 50%; transform: translateX(50%); }
          100% { width: 100%; transform: translateX(200%); }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-progress-loading {
          animation: progress-loading 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

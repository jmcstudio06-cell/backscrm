import { useEffect, useState } from "react";
import baIconImg from "@/assets/ba-icon.png";
import { cn } from "@/lib/utils";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Bloqueia scroll durante o splash
    document.body.style.overflow = 'hidden';

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2200);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      document.body.style.overflow = 'auto';
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ease-in-out",
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      style={{
        background: "radial-gradient(circle at center, #0088ff 0%, #004499 40%, #000000 100%)"
      }}
    >
      {/* Glow effect background */}
      <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />

      <div className="relative flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mb-8 transform transition-transform duration-1000 ease-out scale-100 hover:scale-110">
          <div className="absolute inset-0 bg-white/10 rounded-[2rem] blur-xl animate-pulse" />
          <div className="relative w-full h-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-primary/20">
            <img 
              src={baIconImg} 
              alt="Backstage Pro" 
              className="w-full h-full object-cover"
            />
            {/* The "Train Line" Animation (Shimmer) */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer-fast" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2 px-6">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">
            BACKSTAGE <span className="text-primary-foreground/80">PRO</span>
          </h1>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto" />
          <p className="text-blue-100/70 text-sm md:text-base font-medium tracking-widest uppercase">
            O coração da sua carreira!
          </p>
        </div>
      </div>

      {/* Simple animated loading bar at the bottom */}
      <div className="absolute bottom-12 w-48 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-white/40 animate-progress-loading" />
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

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { PartyPopper, Sparkles, Star, Lock, Volume2 } from "lucide-react";
import Confetti from "react-confetti";

interface WelcomeVideoModalProps {
  open: boolean;
  onFinished: () => void;
  userName?: string;
}

const VIDEO_ID = "BoqlPSE6B1s";

// Load YouTube IFrame API once
let ytApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).YT && (window as any).YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => resolve();
  });

  return ytApiPromise;
}

export function WelcomeVideoModal({ open, onFinished, userName }: WelcomeVideoModalProps) {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const finishingRef = useRef(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [ended, setEnded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (!open) return;

    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

    setShowConfetti(true);
    setEnded(false);
    setProgress(0);
    setIsMuted(true);
    finishingRef.current = false;

    const timer = setTimeout(() => setShowConfetti(false), 6000);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    let interval: number | undefined;

    loadYouTubeAPI().then(() => {
      if (cancelled || !playerContainerRef.current) return;

      const YT = (window as any).YT;

      playerRef.current = new YT.Player(playerContainerRef.current, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: (e: any) => {
            try {
              e.target.mute();
              e.target.playVideo();
            } catch {}

            interval = window.setInterval(() => {
              try {
                const duration = playerRef.current?.getDuration?.() || 0;
                const current = playerRef.current?.getCurrentTime?.() || 0;

                if (duration > 0) {
                  setProgress(Math.min(100, (current / duration) * 100));
                }
              } catch {}
            }, 500);
          },

          onStateChange: (e: any) => {
            // 0 = ended
            if (e.data === 0 && !finishingRef.current) {
              finishingRef.current = true;
              setEnded(true);
              setProgress(100);

              setTimeout(() => {
                onFinished();
              }, 1200);
            }
          },
        },
      });
    });

    return () => {
      cancelled = true;

      if (interval) {
        clearInterval(interval);
      }

      try {
        playerRef.current?.destroy?.();
      } catch {}

      playerRef.current = null;
    };
  }, [open, onFinished]);

  const handleEnableSound = () => {
    try {
      playerRef.current?.unMute?.();
      setIsMuted(false);
    } catch {}
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={350}
          colors={["#0066CC", "#00B4D8", "#FFD700", "#FF6B6B", "#4ECDC4"]}
        />
      )}

      <Dialog open={open}>
        <DialogContent
          className="sm:max-w-3xl p-0 overflow-hidden border-0 bg-gradient-to-b from-primary via-primary/95 to-accent [&>button]:hidden"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="p-6 sm:p-8">
            <div className="text-center mb-5">
              <div className="flex justify-center gap-2 mb-3">
                <PartyPopper className="w-9 h-9 text-yellow-300 animate-bounce" />
                <Sparkles className="w-8 h-8 text-cyan-200 animate-pulse" />
                <Star className="w-9 h-9 text-yellow-300 animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white">Boas-vindas, {userName || "Artista"}! 🎉</h2>

              <p className="text-white/90 mt-2 text-sm sm:text-base">
                Antes de começar, assista este vídeo rápido — preparamos com carinho para você.
              </p>
            </div>

            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
              <div ref={playerContainerRef} className="absolute inset-0 w-full h-full" />

              {isMuted && !ended && (
                <button
                  onClick={handleEnableSound}
                  className="absolute bottom-4 right-4 z-20 bg-black/70 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  Ativar som
                </button>
              )}

              <div className="absolute inset-0 z-10 pointer-events-none" />
            </div>

            <div className="mt-5">
              <div className="h-2 w-full bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-300 to-yellow-300 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 text-white/90 text-sm">
                {ended ? (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="font-semibold">Pronto! Liberando o app…</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-cyan-200" />
                    <span>Assista o vídeo até o final para continuar</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

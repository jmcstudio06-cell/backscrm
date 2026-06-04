import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ExternalLink,
  Shield,
  User,
  Phone,
  Lock,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  BookOpen,
  Gift,
  Trophy,
  Clock,
  Flame,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Music,
  Search,
  Filter,
  LayoutGrid,
  Wrench,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import baIcon from "@/assets/ba-icon.png";
import kitManual from "@/assets/kit-manual.png";
import kitArtes from "@/assets/kit-artes.png";
import kitMensagens from "@/assets/kit-mensagens.png";
import kitBackstage from "@/assets/kit-backstage.png";
import logoPattern from "@/assets/logo-pattern.png";

const LEAD_STORAGE_KEY = "kit_profissional_lead";
const VIDEO_COMPLETED_KEY = "manual_artista_video_completed";
const YT_VIDEO_ID = "xKQ8Dajx7x4";
const UNLOCK_THRESHOLD = 0.92;

type Material = {
  id: string;
  title: string;
  description: string;
  image: string;
  path: string;
  external: boolean;
  type: "bonus" | "support";
};

const materials: Material[] = [
  {
    id: "artes",
    title: "Artes editáveis no Canva",
    description: "Artes profissionais prontas para divulgar seus shows",
    image: kitArtes,
    path: "/kit-profissional/artes",
    external: false,
    type: "bonus",
  },
  {
    id: "mensagens",
    title: "Mensagens prontas para o contratante",
    description: "Copie e use mensagens profissionais para fechar mais shows",
    image: kitMensagens,
    path: "/kit-profissional/mensagens",
    external: false,
    type: "bonus",
  },
  {
    id: "erros-escrito",
    title: "Erros que fazem você perder shows (material escrito)",
    description: "Versão em texto do conteúdo — leve para qualquer lugar",
    image: kitManual,
    path: "/guia-atendimento",
    external: false,
    type: "support",
  },
  {
    id: "backstage",
    title: "Backstage Pro — Sistema completo",
    description: "O sistema que organiza sua carreira e faz você vender mais",
    image: kitBackstage,
    path: "https://backstagepro.online/landing",
    external: true,
    type: "support",
  },
];

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

type View = "academy" | "course";

export default function KitProfissional() {
  const navigate = useNavigate();
  const [isLeadRegistered, setIsLeadRegistered] = useState(false);
  const [view, setView] = useState<View>("academy");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("todos");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [showsPerMonth, setShowsPerMonth] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem(LEAD_STORAGE_KEY)) setIsLeadRegistered(true);
    if (localStorage.getItem(VIDEO_COMPLETED_KEY) === "true") {
      setVideoCompleted(true);
      setProgress(100);
    }
  }, []);

  // YouTube IFrame API — only inside course view
  useEffect(() => {
    if (view !== "course" || !isLeadRegistered || videoCompleted) return;

    const initPlayer = () => {
      if (!window.YT?.Player || !document.getElementById("yt-player")) return;
      playerRef.current = new window.YT.Player("yt-player", {
        videoId: YT_VIDEO_ID,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === 1) {
              if (intervalRef.current) window.clearInterval(intervalRef.current);
              intervalRef.current = window.setInterval(() => {
                const p = playerRef.current;
                if (!p?.getDuration) return;
                const dur = p.getDuration();
                const cur = p.getCurrentTime();
                if (dur > 0) {
                  const pct = Math.min(100, Math.round((cur / dur) * 100));
                  setProgress(pct);
                  if (cur / dur >= UNLOCK_THRESHOLD) markCompleted();
                }
              }, 1000);
            } else if (intervalRef.current) {
              window.clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (e.data === 0) markCompleted();
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      setTimeout(initPlayer, 50);
    }

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, isLeadRegistered, videoCompleted]);

  const markCompleted = () => {
    localStorage.setItem(VIDEO_COMPLETED_KEY, "true");
    setVideoCompleted(true);
    setProgress(100);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    toast.success("Bônus desbloqueados! 🎉");
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleClick = (m: Material, locked: boolean) => {
    if (locked) {
      toast.info("Assista ao curso completo para liberar este bônus");
      return;
    }
    if (m.external) {
      window.location.href = m.path;
      return;
    }
    navigate(m.path);
  };

  const handleSubmitLead = async () => {
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, "");
    
    // Validação de nome e sobrenome
    const nameParts = trimmedName.split(/\s+/);
    if (nameParts.length < 2) return toast.error("Digite seu nome e sobrenome");
    
    // Validação de telefone
    if (digits.length < 10 || digits.length > 11) return toast.error("Digite um WhatsApp válido com DDD");
    
    // Evitar números repetidos (ex: 000000000)
    const isRepetitive = /^(.)\1+$/.test(digits);
    if (isRepetitive) return toast.error("Por favor, insira um número de WhatsApp válido");

    if (!city.trim()) return toast.error("Digite sua cidade");
    if (!showsPerMonth) return toast.error("Selecione a quantidade de shows");

    setSubmitting(true);
    try {
      const leadData = { 
        name: trimmedName, 
        phone: digits,
        city: city.trim(),
        shows_per_month: showsPerMonth
      };
      
      await supabase.from("guide_leads").insert(leadData);
      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leadData));
      localStorage.setItem("guia_lead_captured", "true");
      setIsLeadRegistered(true);
      toast.success("Bem-vindo à Backstage Academy! 🎓");
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Erro ao salvar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const bonuses = materials.filter((m) => m.type === "bonus");
  const supports = materials.filter((m) => m.type === "support");

  return (
    <div className="min-h-screen bg-[#07070d] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, hsl(220 90% 60% / 0.5), transparent 70%)" }} />
      <div className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, hsl(200 90% 60% / 0.5), transparent 70%)" }} />

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <img src={baIcon} alt="Backstage" className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover ring-1 ring-white/10" />
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/40 font-bold">Backstage</span>
            <span className="font-black text-base sm:text-lg bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent -mt-0.5">
              Academy
            </span>
          </div>
        </div>
        {isLeadRegistered && view === "course" && (
          <button
            onClick={() => setView("academy")}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-white/70 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Academy
          </button>
        )}
      </header>

      {/* ACADEMY VIEW */}
      {isLeadRegistered && view === "academy" && (
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-14 space-y-12">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs font-semibold mb-4 backdrop-blur">
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white/80">Plataforma de cursos para artistas</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.05] mb-3">
              Bem-vindo à <br className="sm:hidden" />
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Backstage Academy
              </span>
            </h1>
            <p className="text-sm sm:text-base text-white/55 max-w-xl mx-auto">
              Conteúdos premium feitos para acelerar a carreira de quem vive de música.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.03] p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input 
                placeholder="Pesquisar curso ou ferramenta..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl h-11"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
              <button 
                onClick={() => setActiveCategory("todos")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0",
                  activeCategory === "todos" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveCategory("vendas")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2",
                  activeCategory === "vendas" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Vendas
              </button>
              <button 
                onClick={() => setActiveCategory("ferramentas")}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 flex items-center gap-2",
                  activeCategory === "ferramentas" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                <Wrench className="w-3.5 h-3.5" /> Ferramentas
              </button>
            </div>
          </div>

          <div className="space-y-16">
            {/* Categoria: Vendas (Trilha Horizontal) */}
            {(activeCategory === "todos" || activeCategory === "vendas") && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Cursos e Vendas</h2>
                  </div>
                </div>
                
                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-2">
                  {/* Card Principal Netflix Style */}
                  <button
                    onClick={() => setView("course")}
                    className="group relative flex-shrink-0 w-[300px] sm:w-[450px] aspect-video rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:border-blue-400/50 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                  >
                    <img src={kitManual} alt="Manual do Artista" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] font-bold uppercase tracking-wider">Novo</span>
                        <span className="text-[10px] font-bold text-white/70 flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" /> Minicurso
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors">Manual do Artista Contratado</h3>
                    </div>
                  </button>

                  {/* Placeholder para novos cursos no futuro */}
                  <div className="flex-shrink-0 w-[300px] sm:w-[450px] aspect-video rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/20">
                    <div className="text-center">
                      <PlayCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm font-bold uppercase tracking-widest">Em breve</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Categoria: Ferramentas (Trilha Horizontal) */}
            {(activeCategory === "todos" || activeCategory === "ferramentas") && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-cyan-500 rounded-full" />
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Apps e Ferramentas</h2>
                  </div>
                </div>
                
                <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide px-2">
                  {/* Card do App Sistema */}
                  <div className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.02] shadow-xl">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={kitBackstage} alt="Sistema Backstage Pro" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-cyan-500 text-[10px] font-bold text-white shadow-lg">SISTEMA</div>
                    </div>
                    <div className="p-5 space-y-4">
                      <h3 className="text-lg font-black group-hover:text-cyan-400 transition-colors">Backstage Pro</h3>
                      <p className="text-xs text-white/50 line-clamp-2">O sistema completo para gerenciar sua carreira e shows.</p>
                      <Button
                        onClick={() => window.open("https://backstagepro.online/landing", "_blank")}
                        className="w-full gap-2 py-5 bg-blue-600 hover:bg-blue-500 text-white border-0 rounded-xl font-bold text-xs shadow-lg shadow-blue-600/20"
                      >
                        Acessar App
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Artes Canva */}
                  <button
                    onClick={() => navigate("/kit-profissional/artes")}
                    className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={kitArtes} alt="Artes Editáveis" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-blue-500 text-[10px] font-bold text-white shadow-lg">CANVA</div>
                    </div>
                    <div className="p-5 text-left">
                      <h3 className="text-lg font-black group-hover:text-blue-400 transition-colors">Artes Editáveis</h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">Modelos profissionais prontos para seus shows.</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-400">
                        Começar agora <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>

                  {/* Card Mensagens Prontas */}
                  <button
                    onClick={() => navigate("/kit-profissional/mensagens")}
                    className="group relative flex-shrink-0 w-[280px] sm:w-[320px] rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] hover:border-blue-400/40 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                  >
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={kitMensagens} alt="Mensagens Prontas" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f18] via-black/20 to-transparent" />
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-emerald-500 text-[10px] font-bold text-white shadow-lg">SCRIPTS</div>
                    </div>
                    <div className="p-5 text-left">
                      <h3 className="text-lg font-black group-hover:text-emerald-400 transition-colors">Mensagens Prontas</h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-2">Scripts validados para fechar com contratantes.</p>
                      <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-emerald-400">
                        Acessar scripts <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="text-center text-[11px] sm:text-xs text-white/35 mt-6">
            Mais cursos chegando em breve na Backstage Academy 🎓
          </p>
        </section>
      )}

      {/* COURSE VIEW */}
      {isLeadRegistered && view === "course" && (
        <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-20 space-y-8 sm:space-y-10">
          {/* Course header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] sm:text-xs font-semibold mb-4">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-white/80">Acesso liberado</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Manual do{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
                Artista Contratado
              </span>
            </h1>
            <p className="text-sm text-white/55 mt-2 max-w-xl mx-auto">
              Aula principal + bônus exclusivos para você nunca mais perder um show
            </p>
          </div>

          {/* Main video — vertical/story format, side-cropped to remove black bars */}
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#07070a] shadow-[0_20px_80px_-20px_rgba(37,99,235,0.35)]">
            {/* Logo background pattern (infinite repeat) */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.08]"
              style={{ 
                backgroundImage: `url(${logoPattern})`,
                backgroundSize: '100px',
                backgroundRepeat: 'repeat',
                transform: 'rotate(-15deg) scale(1.6)',
              }}
            />

            <div className="relative z-10 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] backdrop-blur-sm">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 font-bold">Aula principal</p>
                  <h2 className="font-bold text-sm sm:text-base truncate">Erros que fazem você perder shows</h2>
                </div>
              </div>
              {videoCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                </span>
              ) : (
                <span className="text-xs font-mono text-white/50">{progress}% assistido</span>
              )}
            </div>

            {/* Vertical video container — no more black bars */}
            <div className="bg-black flex justify-center py-4 sm:py-6 px-3">
              <div className="relative w-full max-w-[380px] aspect-[9/16] rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl bg-black">
                {videoCompleted ? (
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${YT_VIDEO_ID}?rel=0&modestbranding=1&playsinline=1`}
                    title="Manual do Artista Contratado"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div id="yt-player" className="absolute inset-0 w-full h-full" />
                )}
              </div>
            </div>

            {!videoCompleted && (
              <div className="px-4 sm:px-6 py-3 border-t border-white/10">
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-[11px] sm:text-xs text-white/50 mt-2 text-center">
                  Assista até o final para desbloquear os bônus
                </p>
              </div>
            )}
          </div>

          {/* Bonuses */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-lg sm:text-xl">Bônus exclusivos</h3>
              {!videoCompleted && (
                <span className="ml-auto text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 font-semibold">
                  <Lock className="w-3 h-3 inline mr-1" /> Bloqueado
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {bonuses.map((m) => {
                const locked = !videoCompleted;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleClick(m, locked)}
                    className={cn(
                      "group relative rounded-2xl overflow-hidden text-left border transition-all duration-300 bg-white/[0.03]",
                      locked
                        ? "border-white/10 cursor-not-allowed"
                        : "border-white/10 hover:border-blue-400/50 hover:shadow-[0_20px_60px_-20px_rgba(37,99,235,0.45)] hover:-translate-y-1"
                    )}
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={m.image}
                        alt={m.title}
                        className={cn(
                          "w-full h-full object-cover transition-all duration-500",
                          locked ? "blur-md scale-110 opacity-50" : "group-hover:scale-105"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      {locked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center mb-2">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                          <p className="text-xs sm:text-sm font-semibold text-white/90">
                            Assista ao curso completo para liberar
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:p-5">
                      <h4 className="font-bold text-sm sm:text-base leading-tight">{m.title}</h4>
                      <p className="text-xs sm:text-sm text-white/55 mt-1.5 line-clamp-2">{m.description}</p>
                      {!locked && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-300">
                          Acessar bônus <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Material de apoio */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <BookOpen className="w-5 h-5 text-blue-300" />
              <h3 className="font-bold text-lg sm:text-xl">Material de apoio</h3>
              <span className="ml-auto text-[10px] sm:text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3 h-3 inline mr-1" /> Liberado
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {supports.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleClick(m, false)}
                  className="group relative rounded-2xl overflow-hidden text-left border border-white/10 bg-white/[0.03] hover:border-blue-400/50 hover:shadow-[0_20px_60px_-20px_rgba(37,99,235,0.45)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img src={m.image} alt={m.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h4 className="font-bold text-sm sm:text-base leading-tight">{m.title}</h4>
                    <p className="text-xs sm:text-sm text-white/55 mt-1.5 line-clamp-2">{m.description}</p>
                    <div className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-300">
                      {m.external ? (<>Começar agora <ExternalLink className="w-3.5 h-3.5" /></>) : (<>Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" /></>)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lead capture modal */}
      {!isLeadRegistered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f0f18] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-500 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 backdrop-blur">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Backstage Academy</h2>
              <p className="text-white/85 text-sm mt-1">
                Preencha para entrar na plataforma e liberar seu acesso
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="kit-name" className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4 text-white/50" /> Nome e sobrenome
                </label>
                <Input
                  id="kit-name"
                  placeholder="Ex: João Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="kit-phone" className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-white/50" /> WhatsApp (com DDD)
                </label>
                <Input
                  id="kit-phone"
                  placeholder="(11) 98765-4321"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  maxLength={15}
                  inputMode="tel"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="kit-city" className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-white/50" /> De qual cidade você é?
                </label>
                <Input
                  id="kit-city"
                  placeholder="Ex: São Paulo - SP"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={100}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Music className="w-4 h-4 text-white/50" /> Quantos shows você faz por mês?
                </label>
                <Select value={showsPerMonth} onValueChange={setShowsPerMonth}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f18] border-white/10 text-white">
                    <SelectItem value="0-3">0 a 3 shows</SelectItem>
                    <SelectItem value="3-5">3 a 5 shows</SelectItem>
                    <SelectItem value="5-10">5 a 10 shows</SelectItem>
                    <SelectItem value="10+">Mais de 10 shows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                className="w-full gap-2 text-base py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 border-0"
                onClick={handleSubmitLead}
                disabled={submitting}
              >
                {submitting ? "Liberando..." : "Entrar na Academy"}
                <ArrowRight className="w-4 h-4" />
              </Button>

              <p className="text-center text-xs text-white/40 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3" /> Seus dados estão seguros. Não enviamos spam.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

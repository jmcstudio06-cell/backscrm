import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Gift,
  MapPin,
  Music,
  Phone,
  Shield,
  Sparkles,
  TableProperties,
  User,
} from "lucide-react";
import { toast } from "sonner";

import baIcon from "@/assets/ba-icon.png";
import kitPlanilha from "@/assets/kit-planilha.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertGuideLeadWithFallback } from "@/lib/guide-leads";

const LEAD_STORAGE_KEY = "planilha_gratuita_lead";
const PLANILHA_URL =
  "https://drive.google.com/drive/folders/1iz32lmHUy7PfvrmcYJgn7kd49gYzx2j_?usp=sharing";

export default function PlanilhaGratuita() {
  const [unlocked, setUnlocked] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [showsPerMonth, setShowsPerMonth] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // #region debug-point A:debug-reporter
  const debugReport = (hypothesisId: string, msg: string, data: Record<string, unknown>) =>
    fetch("http://127.0.0.1:7777/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: "planilha-liberar-erro",
        runId: "pre-fix",
        hypothesisId,
        location: "src/pages/PlanilhaGratuita.tsx",
        msg: `[DEBUG] ${msg}`,
        data,
        ts: Date.now(),
      }),
    }).catch(() => {});
  // #endregion

  useEffect(() => {
    if (localStorage.getItem(LEAD_STORAGE_KEY)) {
      setUnlocked(true);
    }
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleOpenPlanilha = () => {
    window.location.href = PLANILHA_URL;
  };

  const handleSubmitLead = async () => {
    const trimmedName = name.trim();
    const digits = phone.replace(/\D/g, "");
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    // #region debug-point A:submit-start
    debugReport("A", "submit iniciado", {
      nameLength: trimmedName.length,
      phoneDigits: digits.length,
      hasCity: !!city.trim(),
      showsPerMonth,
    });
    // #endregion

    if (nameParts.length < 2) {
      return toast.error("Digite seu nome e sobrenome");
    }

    if (digits.length < 10 || digits.length > 11) {
      return toast.error("Digite um WhatsApp valido com DDD");
    }

    if (/^(.)\1+$/.test(digits)) {
      return toast.error("Por favor, insira um numero de WhatsApp valido");
    }

    if (!city.trim()) {
      return toast.error("Digite sua cidade");
    }

    if (!showsPerMonth) {
      return toast.error("Selecione a quantidade de shows");
    }

    setSubmitting(true);

    try {
      const leadData = {
        name: trimmedName,
        phone: digits,
        city: city.trim(),
        shows_per_month: showsPerMonth,
        source: "planilha_gratuita",
      };
      // #region debug-point B:before-insert
      debugReport("B", "antes do insert", {
        payloadKeys: Object.keys(leadData),
        city: leadData.city,
        showsPerMonth: leadData.shows_per_month,
        source: leadData.source,
      });
      // #endregion

      await insertGuideLeadWithFallback(leadData);
      // #region debug-point C:insert-success
      debugReport("C", "insert concluido com sucesso", {
        unlockedBeforeSet: unlocked,
      });
      // #endregion

      localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify(leadData));
      setUnlocked(true);
      toast.success("Planilha liberada com sucesso!");
    } catch (error) {
      console.error("Error saving planilha lead:", error);
      // #region debug-point D:insert-error
      debugReport("D", "erro no fluxo de liberacao", {
        errorMessage: error instanceof Error ? error.message : String(error),
        errorName: error instanceof Error ? error.name : typeof error,
      });
      // #endregion
      toast.error("Erro ao liberar a planilha. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07070d] text-white relative overflow-hidden">
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-3xl opacity-30"
        style={{ background: "radial-gradient(circle, hsl(220 90% 60% / 0.5), transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-25"
        style={{ background: "radial-gradient(circle, hsl(160 90% 45% / 0.35), transparent 70%)" }}
      />

      <header className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex items-center gap-3">
          <img src={baIcon} alt="Backstage" className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10" />
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-bold">Backstage</span>
            <span className="font-black text-lg bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent">
              Planilha Gratuita
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold backdrop-blur">
              <Gift className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-white/80">Material gratuito para artistas</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.02]">
                Baixe a
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  planilha de controle
                </span>
                <br />
                do artista
              </h1>
              <p className="text-base sm:text-lg text-white/60 max-w-2xl">
                Preencha seus dados e libere gratuitamente a mesma planilha usada no Kit Profissional para organizar
                cachês, shows e despesas.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "Controle financeiro pronto para usar",
                "Organizacao simples da rotina de shows",
                "Download gratuito e imediato",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                    <p className="text-sm text-white/75">{item}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] shadow-2xl">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={kitPlanilha} alt="Planilha de controle do artista" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07070d] via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 px-3 py-1 rounded-md bg-emerald-500 text-[10px] font-bold text-white shadow-lg uppercase tracking-wider">
                  Gratis
                </div>
              </div>

              <div className="p-6 sm:p-7">
                {unlocked ? (
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acesso liberado</span>
                    </div>

                    <div>
                      <h2 className="text-2xl font-black leading-tight">Sua planilha esta pronta para baixar</h2>
                      <p className="text-sm text-white/60 mt-2">
                        Clique no botao abaixo para abrir a mesma pasta da planilha do Kit Profissional.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 flex items-center justify-center">
                          <TableProperties className="w-5 h-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">Planilha de Controle do Artista</p>
                          <p className="text-xs text-white/50">Baixe e use gratuitamente</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleOpenPlanilha}
                        className="w-full gap-2 text-base py-6 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 border-0"
                      >
                        Baixar planilha gratuita
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      Seu cadastro fica registrado no mesmo painel do guia no admin.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-2xl font-black">Libere sua planilha gratuita</h2>
                      <p className="text-sm text-white/60 mt-2">
                        Preencha os mesmos dados do Kit Profissional para receber acesso imediato.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="planilha-name" className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <User className="w-4 h-4 text-white/50" /> Nome e sobrenome
                      </label>
                      <Input
                        id="planilha-name"
                        placeholder="Ex: Joao Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="planilha-phone" className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white/50" /> WhatsApp (com DDD)
                      </label>
                      <Input
                        id="planilha-phone"
                        placeholder="(11) 98765-4321"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        maxLength={15}
                        inputMode="tel"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="planilha-city" className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-white/50" /> De qual cidade voce e?
                      </label>
                      <Input
                        id="planilha-city"
                        placeholder="Ex: Sao Paulo - SP"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        maxLength={100}
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Music className="w-4 h-4 text-white/50" /> Quantos shows voce faz por mes?
                      </label>
                      <Select value={showsPerMonth} onValueChange={setShowsPerMonth}>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Selecione uma opcao" />
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
                      {submitting ? "Liberando..." : "Liberar planilha agora"}
                      <ArrowRight className="w-4 h-4" />
                    </Button>

                    <p className="text-center text-xs text-white/40 flex items-center justify-center gap-1.5">
                      <Shield className="w-3 h-3" /> Seus dados estao seguros. Nao enviamos spam.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

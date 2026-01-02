import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  Music,
  Clock,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
  Sparkles,
  CheckCircle2,
  Info,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

// Configuração de valores base por formação
const formacaoConfig = {
  voz_violao: { label: "Voz e Violão", base: 300, icon: "🎸" },
  duo: { label: "Duo", base: 500, icon: "🎵" },
  trio: { label: "Trio", base: 800, icon: "🎶" },
  banda: { label: "Banda Completa", base: 1500, icon: "🎤" },
};

// Configuração por estilo musical
const estiloConfig = {
  sertanejo: { label: "Sertanejo / Modão", multiplicador: 1.0 },
  pop_rock: { label: "Pop Rock", multiplicador: 1.1 },
  pop: { label: "Pop", multiplicador: 1.0 },
  mpb: { label: "MPB", multiplicador: 0.95 },
  pagode: { label: "Pagode / Samba", multiplicador: 1.05 },
  rock: { label: "Rock", multiplicador: 1.1 },
};

// Configuração por duração
const duracaoConfig = {
  "1h": { label: "1 hora", multiplicador: 0.7, horas: 1 },
  "1h30": { label: "1h30", multiplicador: 0.85, horas: 1.5 },
  "2h": { label: "2 horas", multiplicador: 1.0, horas: 2 },
  "3h": { label: "3 horas", multiplicador: 1.4, horas: 3 },
  "4h": { label: "4 horas", multiplicador: 1.7, horas: 4 },
};

// Configuração por dia da semana
const diaConfig = {
  semana: { label: "Dia de semana", multiplicador: 0.8 },
  sexta: { label: "Sexta-feira", multiplicador: 1.0 },
  sabado: { label: "Sábado", multiplicador: 1.2 },
  domingo: { label: "Domingo", multiplicador: 1.0 },
  feriado: { label: "Feriado", multiplicador: 1.3 },
};

// Configuração por tipo de local
const localConfig = {
  bar_pequeno: { label: "Bar pequeno", multiplicador: 0.8 },
  bar_medio: { label: "Bar médio", multiplicador: 1.0 },
  restaurante: { label: "Restaurante", multiplicador: 1.1 },
  evento_fechado: { label: "Evento fechado", multiplicador: 1.3 },
  festa_particular: { label: "Festa particular", multiplicador: 1.5 },
  corporativo: { label: "Evento corporativo", multiplicador: 1.8 },
};

type Formacao = keyof typeof formacaoConfig;
type Estilo = keyof typeof estiloConfig;
type Duracao = keyof typeof duracaoConfig;
type Dia = keyof typeof diaConfig;
type Local = keyof typeof localConfig;

export default function Precificacao() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formacao, setFormacao] = useState<Formacao | null>(null);
  const [estilo, setEstilo] = useState<Estilo | null>(null);
  const [duracao, setDuracao] = useState<Duracao | null>(null);
  const [dia, setDia] = useState<Dia | null>(null);
  const [local, setLocal] = useState<Local | null>(null);
  const [ajusteManual, setAjusteManual] = useState(0); // -20% a +20%
  const [showResult, setShowResult] = useState(false);

  const totalSteps = 5;

  // Cálculo do valor
  const calcularValor = () => {
    if (!formacao || !estilo || !duracao || !dia || !local) return null;

    const base = formacaoConfig[formacao].base;
    const estiloMult = estiloConfig[estilo].multiplicador;
    const duracaoMult = duracaoConfig[duracao].multiplicador;
    const diaMult = diaConfig[dia].multiplicador;
    const localMult = localConfig[local].multiplicador;

    const valorCalculado = base * estiloMult * duracaoMult * diaMult * localMult;
    const ajuste = 1 + ajusteManual / 100;

    return {
      minimo: Math.round(valorCalculado * 0.85 * ajuste / 10) * 10,
      ideal: Math.round(valorCalculado * ajuste / 10) * 10,
      maximo: Math.round(valorCalculado * 1.2 * ajuste / 10) * 10,
    };
  };

  const valores = calcularValor();

  const canProceed = () => {
    switch (step) {
      case 1: return formacao !== null;
      case 2: return estilo !== null;
      case 3: return duracao !== null;
      case 4: return dia !== null;
      case 5: return local !== null;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else if (canProceed()) {
      setShowResult(true);
    }
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGerarOrcamento = () => {
    if (valores) {
      toast.success("Redirecionando para criar orçamento...");
      navigate(`/orcamentos?valor=${valores.ideal}`);
    }
  };

  const handleCriarContrato = () => {
    if (valores) {
      toast.success("Redirecionando para criar contrato...");
      navigate(`/contratos?valor=${valores.ideal}`);
    }
  };

  const handleUsarEmMetas = () => {
    if (valores) {
      toast.success("Valor salvo! Você pode usar esse valor base nas suas metas.");
      navigate("/metas/anual");
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Music className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Qual é a formação do show?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha como você vai se apresentar
              </p>
            </div>
            <RadioGroup value={formacao || ""} onValueChange={(v) => setFormacao(v as Formacao)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(formacaoConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={key}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formacao === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={key} id={key} className="sr-only" />
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">Base: R$ {config.base}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Qual é o estilo musical?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                O estilo pode influenciar no valor do show
              </p>
            </div>
            <RadioGroup value={estilo || ""} onValueChange={(v) => setEstilo(v as Estilo)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(estiloConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={`estilo-${key}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      estilo === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={key} id={`estilo-${key}`} className="sr-only" />
                    <div>
                      <p className="font-medium">{config.label}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Clock className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Quanto tempo você vai tocar?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Duração total do show
              </p>
            </div>
            <RadioGroup value={duracao || ""} onValueChange={(v) => setDuracao(v as Duracao)}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(duracaoConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={`duracao-${key}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      duracao === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={key} id={`duracao-${key}`} className="sr-only" />
                    <p className="font-medium text-lg">{config.label}</p>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <Calendar className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Qual dia da semana?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Finais de semana e feriados costumam valer mais
              </p>
            </div>
            <RadioGroup value={dia || ""} onValueChange={(v) => setDia(v as Dia)}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(diaConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={`dia-${key}`}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                      dia === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={key} id={`dia-${key}`} className="sr-only" />
                    <p className="font-medium">{config.label}</p>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Qual é o tipo de local?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                O tipo de evento influencia no valor
              </p>
            </div>
            <RadioGroup value={local || ""} onValueChange={(v) => setLocal(v as Local)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(localConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={`local-${key}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      local === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={key} id={`local-${key}`} className="sr-only" />
                    <div>
                      <p className="font-medium">{config.label}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!valores) return null;

    return (
      <div className="space-y-6">
        {/* Resumo das escolhas */}
        <div className="flex flex-wrap gap-2 justify-center">
          {formacao && <Badge variant="secondary">{formacaoConfig[formacao].label}</Badge>}
          {estilo && <Badge variant="secondary">{estiloConfig[estilo].label}</Badge>}
          {duracao && <Badge variant="secondary">{duracaoConfig[duracao].label}</Badge>}
          {dia && <Badge variant="secondary">{diaConfig[dia].label}</Badge>}
          {local && <Badge variant="secondary">{localConfig[local].label}</Badge>}
        </div>

        {/* Valor Principal */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">Valor sugerido para este show</p>
          <div className="text-5xl font-bold text-primary">
            R$ {valores.ideal.toLocaleString("pt-BR")}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span className="text-sm text-success">Valor dentro do padrão de mercado</span>
          </div>
        </div>

        {/* Faixa de valores */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Mínimo</p>
            <p className="text-lg font-semibold text-destructive">
              R$ {valores.minimo.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary">
            <p className="text-xs text-muted-foreground mb-1">Ideal</p>
            <p className="text-lg font-semibold text-primary">
              R$ {valores.ideal.toLocaleString("pt-BR")}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Máximo</p>
            <p className="text-lg font-semibold text-success">
              R$ {valores.maximo.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Ajuste manual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Ajustar valor manualmente</Label>
            <span className="text-sm font-medium">
              {ajusteManual > 0 ? "+" : ""}{ajusteManual}%
            </span>
          </div>
          <Slider
            value={[ajusteManual]}
            onValueChange={([value]) => setAjusteManual(value)}
            min={-20}
            max={20}
            step={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground text-center">
            Use para ajustar conforme sua experiência e região
          </p>
        </div>

        <Separator />

        {/* Dica */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Dica de negociação</p>
            <p className="text-muted-foreground">
              Esse valor é justo pra você e pro contratante. Comece pelo valor ideal e negocie se necessário, mas não aceite menos que o mínimo.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            onClick={handleGerarOrcamento}
            className="flex items-center gap-2"
            variant="outline"
          >
            <FileText className="w-4 h-4" />
            Gerar Orçamento
          </Button>
          <Button
            onClick={handleCriarContrato}
            className="flex items-center gap-2"
            variant="outline"
          >
            <DollarSign className="w-4 h-4" />
            Criar Contrato
          </Button>
          <Button
            onClick={handleUsarEmMetas}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Target className="w-4 h-4" />
            Usar nas Metas
          </Button>
        </div>

        {/* Botão recalcular */}
        <Button
          onClick={() => {
            setShowResult(false);
            setStep(1);
            setFormacao(null);
            setEstilo(null);
            setDuracao(null);
            setDia(null);
            setLocal(null);
            setAjusteManual(0);
          }}
          variant="ghost"
          className="w-full"
        >
          Calcular novo valor
        </Button>
      </div>
    );
  };

  return (
    <Layout title="Precificação" subtitle="Calcule o valor ideal do seu show">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Precificação de Show</h1>
          <p className="text-muted-foreground">
            Descubra quanto cobrar pelo seu show de forma justa e profissional
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            {!showResult && (
              <div className="space-y-3">
                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i + 1 <= step ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Passo {step} de {totalSteps}
                </p>
              </div>
            )}
            {showResult && (
              <div className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Resultado da Precificação
                </CardTitle>
                <CardDescription>
                  Valor calculado com base nas suas respostas
                </CardDescription>
              </div>
            )}
          </CardHeader>

          <CardContent>
            {showResult ? renderResult() : renderStepContent()}

            {/* Navigation */}
            {!showResult && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={step === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2"
                >
                  {step === totalSteps ? "Ver Resultado" : "Próximo"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {showResult && (
              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Ajustar respostas
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calculator,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
  CheckCircle2,
  Info,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Lightbulb,
  Truck,
  Users,
  Megaphone,
  Wrench,
  Building2,
  Home,
  Store,
  PartyPopper,
  Briefcase,
  Music,
  Speaker,
} from "lucide-react";
import { toast } from "sonner";

// Configuração de tipos de ambiente
const ambienteConfig = {
  bar_pequeno: {
    label: "Bar Pequeno",
    description: "Até 50 pessoas",
    Icon: Store,
    margemRecomendada: 0.3,
  },
  bar_medio: {
    label: "Bar Médio",
    description: "50 a 150 pessoas",
    Icon: Store,
    margemRecomendada: 0.35,
  },
  restaurante: {
    label: "Restaurante",
    description: "Ambiente mais intimista",
    Icon: Building2,
    margemRecomendada: 0.35,
  },
  casa_shows: {
    label: "Casa de Shows",
    description: "Estrutura profissional",
    Icon: Music,
    margemRecomendada: 0.4,
  },
  evento_privado: {
    label: "Evento Privado",
    description: "Festas e celebrações",
    Icon: PartyPopper,
    margemRecomendada: 0.45,
  },
  corporativo: {
    label: "Evento Corporativo",
    description: "Empresas e instituições",
    Icon: Briefcase,
    margemRecomendada: 0.5,
  },
  residencia: {
    label: "Residência",
    description: "Festa em casa",
    Icon: Home,
    margemRecomendada: 0.4,
  },
};

// Opções de infraestrutura de som do local
const infraestruturaConfig = {
  completo: {
    label: "Som completo",
    description: "PA, monitores e técnico inclusos",
  },
  parcial: {
    label: "Som parcial",
    description: "Apenas PA básico, sem monitores",
  },
  inexistente: {
    label: "Sem som",
    description: "Artista precisa levar tudo",
  },
};

type Ambiente = keyof typeof ambienteConfig;
type Infraestrutura = keyof typeof infraestruturaConfig;

interface Investimento {
  id: string;
  label: string;
  Icon: React.ElementType;
  descricao: string;
}

const investimentosDisponiveis: Investimento[] = [
  { id: "som_aluguel", label: "Aluguel de som", Icon: Speaker, descricao: "Custo do sistema de som" },
  { id: "caixas", label: "Caixas adicionais", Icon: Volume2, descricao: "PA extra ou monitores" },
  { id: "iluminacao", label: "Iluminação", Icon: Lightbulb, descricao: "Luzes e efeitos" },
  { id: "tecnico", label: "Técnico de som", Icon: Wrench, descricao: "Operador de mesa" },
  { id: "transporte", label: "Transporte", Icon: Truck, descricao: "Deslocamento e frete" },
  { id: "equipe", label: "Equipe/Músicos", Icon: Users, descricao: "Cachês de músicos" },
  { id: "divulgacao", label: "Divulgação", Icon: Megaphone, descricao: "Marketing e materiais" },
];

export default function Precificacao() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [infraestrutura, setInfraestrutura] = useState<Infraestrutura | null>(null);
  const [investimentos, setInvestimentos] = useState<Record<string, number>>({});
  const [investimentosSelecionados, setInvestimentosSelecionados] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const totalSteps = 3;

  // Investimentos que devem ser ignorados quando o local tem som completo
  const investimentosSom = ["som_aluguel", "caixas", "tecnico"];

  // Filtra investimentos baseado na infraestrutura
  const investimentosVisiveis = useMemo(() => {
    if (infraestrutura === "completo") {
      return investimentosDisponiveis.filter((inv) => !investimentosSom.includes(inv.id));
    }
    return investimentosDisponiveis;
  }, [infraestrutura]);

  // Cálculo do custo total e valores recomendados
  const calcularValores = () => {
    if (!ambiente || !infraestrutura) return null;

    // Soma todos os investimentos selecionados
    let custoTotal = 0;
    investimentosSelecionados.forEach((id) => {
      // Ignora custos de som se o local já tem som completo
      if (infraestrutura === "completo" && investimentosSom.includes(id)) {
        return;
      }
      custoTotal += investimentos[id] || 0;
    });

    const margemRecomendada = ambienteConfig[ambiente].margemRecomendada;

    // Valor mínimo = custo total (apenas para cobrir custos)
    const valorMinimo = Math.round(custoTotal);

    // Valor ideal = custo + margem de lucro recomendada para o tipo de ambiente
    const valorIdeal = Math.round(custoTotal * (1 + margemRecomendada));

    // Valor confortável = custo + margem maior
    const valorConfortavel = Math.round(custoTotal * (1 + margemRecomendada + 0.15));

    return {
      custoTotal,
      valorMinimo,
      valorIdeal,
      valorConfortavel,
      margemPercentual: Math.round(margemRecomendada * 100),
    };
  };

  const valores = calcularValores();

  const canProceed = () => {
    switch (step) {
      case 1:
        return ambiente !== null;
      case 2:
        return infraestrutura !== null;
      case 3:
        return true; // Investimentos são opcionais
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
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

  const handleToggleInvestimento = (id: string) => {
    setInvestimentosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    if (!investimentos[id]) {
      setInvestimentos((prev) => ({ ...prev, [id]: 0 }));
    }
  };

  const handleInvestimentoChange = (id: string, valor: string) => {
    const numValue = parseFloat(valor.replace(/[^\d]/g, "")) || 0;
    setInvestimentos((prev) => ({ ...prev, [id]: numValue }));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleGerarOrcamento = () => {
    if (valores) {
      toast.success("Redirecionando para criar orçamento...");
      navigate(`/orcamentos?valor=${valores.valorIdeal}`);
    }
  };

  const handleCriarContrato = () => {
    if (valores) {
      toast.success("Redirecionando para criar contrato...");
      navigate(`/contratos?valor=${valores.valorIdeal}`);
    }
  };

  const handleUsarEmMetas = () => {
    if (valores) {
      toast.success("Valor salvo! Você pode usar esse valor base nas suas metas.");
      navigate("/metas/anual");
    }
  };

  const handleRecalcular = () => {
    setShowResult(false);
    setStep(1);
    setAmbiente(null);
    setInfraestrutura(null);
    setInvestimentos({});
    setInvestimentosSelecionados([]);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Qual é o tipo de ambiente?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha onde será a apresentação
              </p>
            </div>
            <RadioGroup
              value={ambiente || ""}
              onValueChange={(v) => setAmbiente(v as Ambiente)}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(ambienteConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={`ambiente-${key}`}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      ambiente === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={key}
                      id={`ambiente-${key}`}
                      className="sr-only"
                    />
                    <config.Icon className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
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
              <Volume2 className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Infraestrutura do local</h3>
              <p className="text-sm text-muted-foreground mt-1">
                O local já possui sistema de som?
              </p>
            </div>
            <RadioGroup
              value={infraestrutura || ""}
              onValueChange={(v) => {
                setInfraestrutura(v as Infraestrutura);
                // Limpa investimentos de som se o local tem som completo
                if (v === "completo") {
                  setInvestimentosSelecionados((prev) =>
                    prev.filter((id) => !investimentosSom.includes(id))
                  );
                }
              }}
            >
              <div className="space-y-3">
                {Object.entries(infraestruturaConfig).map(([key, config]) => (
                  <Label
                    key={key}
                    htmlFor={`infra-${key}`}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      infraestrutura === key
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem
                      value={key}
                      id={`infra-${key}`}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        infraestrutura === key
                          ? "border-primary bg-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {infraestrutura === key && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>

            {infraestrutura === "completo" && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-success/10 border border-success/30 mt-4">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-success">Ótimo!</p>
                  <p className="text-muted-foreground">
                    Custos com som serão desconsiderados automaticamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <DollarSign className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Seus investimentos</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Selecione e informe os custos do show
              </p>
            </div>

            <div className="space-y-3">
              {investimentosVisiveis.map((inv) => {
                const isSelected = investimentosSelecionados.includes(inv.id);
                return (
                  <div
                    key={inv.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`inv-${inv.id}`}
                        checked={isSelected}
                        onCheckedChange={() => handleToggleInvestimento(inv.id)}
                      />
                      <inv.Icon className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1">
                        <Label
                          htmlFor={`inv-${inv.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {inv.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {inv.descricao}
                        </p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 ml-8">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            R$
                          </span>
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="0,00"
                            value={
                              investimentos[inv.id]
                                ? investimentos[inv.id].toLocaleString("pt-BR")
                                : ""
                            }
                            onChange={(e) =>
                              handleInvestimentoChange(inv.id, e.target.value)
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {investimentosSelecionados.length > 0 && (
              <div className="p-4 rounded-xl bg-muted/50 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Custo total parcial:</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(
                      investimentosSelecionados.reduce(
                        (acc, id) => acc + (investimentos[id] || 0),
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const renderResult = () => {
    if (!valores || !ambiente) return null;

    return (
      <div className="space-y-6">
        {/* Resumo das escolhas */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="secondary">{ambienteConfig[ambiente].label}</Badge>
          {infraestrutura && (
            <Badge variant="secondary">
              {infraestruturaConfig[infraestrutura].label}
            </Badge>
          )}
          {investimentosSelecionados.length > 0 && (
            <Badge variant="outline">
              {investimentosSelecionados.length} investimento(s)
            </Badge>
          )}
        </div>

        {/* Custo Total */}
        <div className="p-4 rounded-xl bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Custo Total do Show</span>
            </div>
            <span className="text-xl font-bold">
              {formatCurrency(valores.custoTotal)}
            </span>
          </div>
          {valores.custoTotal === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Nenhum investimento informado
            </p>
          )}
        </div>

        {/* Valores Recomendados */}
        <div className="space-y-4">
          <h4 className="font-semibold text-center">Valores Recomendados</h4>

          <div className="grid grid-cols-1 gap-3">
            {/* Valor Mínimo */}
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">
                    Valor Mínimo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Apenas cobre custos
                  </p>
                </div>
                <span className="text-2xl font-bold text-destructive">
                  {formatCurrency(valores.valorMinimo)}
                </span>
              </div>
            </div>

            {/* Valor Ideal */}
            <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary">Valor Ideal</p>
                  <p className="text-xs text-muted-foreground">
                    Custo + {valores.margemPercentual}% de margem
                  </p>
                </div>
                <span className="text-3xl font-bold text-primary">
                  {formatCurrency(valores.valorIdeal)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-xs text-success">Recomendado para este ambiente</span>
              </div>
            </div>

            {/* Valor Confortável */}
            <div className="p-4 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success">
                    Valor Confortável
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Margem maior de lucro
                  </p>
                </div>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(valores.valorConfortavel)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhamento de custos */}
        {investimentosSelecionados.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Detalhamento dos custos</h4>
              {investimentosSelecionados.map((id) => {
                const inv = investimentosDisponiveis.find((i) => i.id === id);
                if (!inv) return null;
                const valor = investimentos[id] || 0;
                const ignorado =
                  infraestrutura === "completo" && investimentosSom.includes(id);

                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between text-sm ${
                      ignorado ? "opacity-50 line-through" : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <inv.Icon className="w-4 h-4 text-muted-foreground" />
                      {inv.label}
                      {ignorado && (
                        <Badge variant="outline" className="text-xs">
                          desconsiderado
                        </Badge>
                      )}
                    </span>
                    <span className="font-medium">{formatCurrency(valor)}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <Separator />

        {/* Dica */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">
              Precificação baseada no contexto
            </p>
            <p className="text-muted-foreground">
              Esse valor considera seus custos reais e uma margem adequada para{" "}
              <strong>{ambienteConfig[ambiente].label.toLowerCase()}</strong>.
              Negocie a partir do valor ideal.
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
        <Button onClick={handleRecalcular} variant="ghost" className="w-full">
          Calcular novo valor
        </Button>
      </div>
    );
  };

  return (
    <Layout title="Precificação" subtitle="Calcule o valor ideal do seu show">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-primary/10">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Calculadora de Preço</h2>
            <p className="text-sm text-muted-foreground">
              Baseado em ambiente e investimentos
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!showResult ? (
              <>
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index + 1 === step
                          ? "w-8 bg-primary"
                          : index + 1 < step
                          ? "w-2 bg-primary"
                          : "w-2 bg-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Step content */}
                {renderStepContent()}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <Button
                    variant="ghost"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {step} de {totalSteps}
                  </span>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex items-center gap-2"
                  >
                    {step === totalSteps ? "Ver resultado" : "Próximo"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Result header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">Precificação Calculada</h3>
                  <p className="text-sm text-muted-foreground">
                    Valores baseados no seu contexto
                  </p>
                </div>

                {renderResult()}

                {/* Back button */}
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full mt-4 flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Ajustar informações
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

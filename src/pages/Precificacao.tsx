import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  MapPin,
  DollarSign,
  TrendingUp,
  FileText,
  Target,
  Info,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Volume2,
  Truck,
  Users,
  Building2,
  Home,
  Store,
  PartyPopper,
  Briefcase,
  Music,
  Trash2,
  User,
  Utensils,
} from "lucide-react";
import { toast } from "sonner";
import { useMusicians, Musician } from "@/hooks/useMusicians";

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

interface SelectedMusician {
  id: string;
  name: string;
  instrument: string | null;
  fee: number;
}

export default function Precificacao() {
  const navigate = useNavigate();
  const { musicians, loading: musiciansLoading } = useMusicians();

  const [step, setStep] = useState(1);
  const [ambiente, setAmbiente] = useState<Ambiente | null>(null);
  const [infraestrutura, setInfraestrutura] = useState<Infraestrutura | null>(null);
  const [selectedMusicians, setSelectedMusicians] = useState<SelectedMusician[]>([]);
  const [artistFee, setArtistFee] = useState<number>(0);
  const [transportCost, setTransportCost] = useState<number>(0);
  const [foodCost, setFoodCost] = useState<number>(0);
  const [otherCosts, setOtherCosts] = useState<number>(0);
  const [showResult, setShowResult] = useState(false);

  const totalSteps = 3;


  // Calcula custo total da equipe
  const getTeamCost = () => {
    return selectedMusicians.reduce((total, m) => total + m.fee, 0);
  };

  // Cálculo do custo total e valores recomendados
  const calcularValores = () => {
    if (!ambiente) return null;

    const teamCost = getTeamCost();
    const operationalCosts = transportCost + foodCost + otherCosts;
    const custoTotal = teamCost + artistFee + operationalCosts;

    const margemRecomendada = ambienteConfig[ambiente].margemRecomendada;

    const valorMinimo = Math.round(custoTotal);
    const valorIdeal = Math.round(custoTotal * (1 + margemRecomendada));
    const valorConfortavel = Math.round(custoTotal * (1 + margemRecomendada + 0.15));

    return {
      custoTotal,
      teamCost,
      artistFee,
      operationalCosts,
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
        return true;
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

  const handleAddMusician = (musician: Musician) => {
    if (selectedMusicians.find((m) => m.id === musician.id)) {
      toast.error("Músico já adicionado");
      return;
    }
    setSelectedMusicians((prev) => [
      ...prev,
      {
        id: musician.id,
        name: musician.name,
        instrument: musician.instrument,
        fee: musician.rate || 0,
      },
    ]);
  };

  const handleRemoveMusician = (id: string) => {
    setSelectedMusicians((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMusicianFeeChange = (id: string, fee: number) => {
    setSelectedMusicians((prev) =>
      prev.map((m) => (m.id === id ? { ...m, fee } : m))
    );
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
      toast.success("Valor salvo!");
      navigate("/metas/anual");
    }
  };

  const handleRecalcular = () => {
    setShowResult(false);
    setStep(1);
    setAmbiente(null);
    setInfraestrutura(null);
    setSelectedMusicians([]);
    setArtistFee(0);
    setTransportCost(0);
    setFoodCost(0);
    setOtherCosts(0);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <MapPin className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Tipo de ambiente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Onde será a apresentação?
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
                    <RadioGroupItem value={key} id={`ambiente-${key}`} className="sr-only" />
                    <config.Icon className="w-6 h-6 text-primary shrink-0" />
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
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
              onValueChange={(v) => setInfraestrutura(v as Infraestrutura)}
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
                    <RadioGroupItem value={key} id={`infra-${key}`} className="sr-only" />
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        infraestrutura === key ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {infraestrutura === key && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{config.label}</p>
                      <p className="text-xs text-muted-foreground">{config.description}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>

          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <DollarSign className="w-12 h-12 mx-auto text-primary mb-3" />
              <h3 className="text-lg font-semibold">Custos do Show</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Equipe, cachê e custos operacionais
              </p>
            </div>

            {/* Cachê do artista */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Seu cachê
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  R$
                </span>
                <Input
                  type="number"
                  className="pl-10"
                  placeholder="Quanto você quer receber"
                  value={artistFee || ""}
                  onChange={(e) => setArtistFee(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <Separator />

            {/* Equipe */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Equipe / Músicos
              </Label>

              {musiciansLoading ? (
                <Skeleton className="h-12 w-full" />
              ) : musicians.length > 0 ? (
                <Select onValueChange={(id) => {
                  const m = musicians.find((m) => m.id === id);
                  if (m) handleAddMusician(m);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Adicionar membro da equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {musicians
                      .filter((m) => !selectedMusicians.find((sm) => sm.id === m.id))
                      .map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} {m.instrument ? `(${m.instrument})` : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-center p-4 border-2 border-dashed rounded-xl">
                  <p className="text-sm text-muted-foreground">
                    Nenhum músico cadastrado.{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={() => navigate("/equipe")}>
                      Cadastrar agora
                    </Button>
                  </p>
                </div>
              )}

              {selectedMusicians.length > 0 && (
                <div className="space-y-2">
                  {selectedMusicians.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border bg-background">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.instrument || "Músico"}</p>
                      </div>
                      <div className="relative w-28">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                          R$
                        </span>
                        <Input
                          type="number"
                          className="pl-7 h-8 text-sm"
                          value={m.fee || ""}
                          onChange={(e) => handleMusicianFeeChange(m.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleRemoveMusician(m.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Custos operacionais */}
            <div className="space-y-4">
              <Label>Custos Operacionais</Label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Transporte
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      R$
                    </span>
                    <Input
                      type="number"
                      className="pl-7 h-9"
                      placeholder="0"
                      value={transportCost || ""}
                      onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <Utensils className="w-3 h-3" /> Alimentação
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      R$
                    </span>
                    <Input
                      type="number"
                      className="pl-7 h-9"
                      placeholder="0"
                      value={foodCost || ""}
                      onChange={(e) => setFoodCost(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Outros
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                      R$
                    </span>
                    <Input
                      type="number"
                      className="pl-7 h-9"
                      placeholder="0"
                      value={otherCosts || ""}
                      onChange={(e) => setOtherCosts(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Resumo parcial */}
            <div className="p-4 rounded-xl bg-muted/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Equipe:</span>
                <span>{formatCurrency(getTeamCost())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Seu cachê:</span>
                <span>{formatCurrency(artistFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Operacional:</span>
                <span>{formatCurrency(transportCost + foodCost + otherCosts)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Custo Total:</span>
                <span className="text-primary">
                  {formatCurrency(
                    getTeamCost() + artistFee + transportCost + foodCost + otherCosts
                  )}
                </span>
              </div>
            </div>
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
            <Badge variant="secondary">{infraestruturaConfig[infraestrutura].label}</Badge>
          )}
          {selectedMusicians.length > 0 && (
            <Badge variant="outline">{selectedMusicians.length} músico(s)</Badge>
          )}
        </div>

        {/* Breakdown de custos */}
        <div className="p-4 rounded-xl bg-muted/50 border space-y-2">
          <h4 className="font-semibold text-sm mb-3">Composição do custo</h4>
          {valores.teamCost > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                Cachês da equipe
              </span>
              <span>{formatCurrency(valores.teamCost)}</span>
            </div>
          )}
          {valores.artistFee > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                Seu cachê
              </span>
              <span>{formatCurrency(valores.artistFee)}</span>
            </div>
          )}
          {valores.operationalCosts > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-muted-foreground" />
                Custos operacionais
              </span>
              <span>{formatCurrency(valores.operationalCosts)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex items-center justify-between font-bold">
            <span>Custo Total</span>
            <span className="text-lg">{formatCurrency(valores.custoTotal)}</span>
          </div>
        </div>

        {/* Valores Recomendados */}
        <div className="space-y-4">
          <h4 className="font-semibold text-center">Valores Recomendados</h4>

          <div className="grid grid-cols-1 gap-3">
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-destructive">Valor Mínimo</p>
                  <p className="text-xs text-muted-foreground">Apenas cobre custos</p>
                </div>
                <span className="text-2xl font-bold text-destructive">
                  {formatCurrency(valores.valorMinimo)}
                </span>
              </div>
            </div>

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

            <div className="p-4 rounded-xl bg-success/10 border border-success/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success">Valor Confortável</p>
                  <p className="text-xs text-muted-foreground">Margem maior de lucro</p>
                </div>
                <span className="text-2xl font-bold text-success">
                  {formatCurrency(valores.valorConfortavel)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dica */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Precificação realista</p>
            <p className="text-muted-foreground">
              Esse valor considera seus custos reais: equipamentos, equipe e operação. Negocie a
              partir do valor ideal.
            </p>
          </div>
        </div>

        {/* Ações */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button onClick={handleGerarOrcamento} variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Gerar Orçamento
          </Button>
          <Button onClick={handleCriarContrato} variant="outline" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Criar Contrato
          </Button>
          <Button onClick={handleUsarEmMetas} variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Usar nas Metas
          </Button>
        </div>

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
            <p className="text-sm text-muted-foreground">Baseado nos seus custos reais</p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {!showResult ? (
              <>
                {/* Progress */}
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

                {renderStepContent()}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  <Button variant="ghost" onClick={handleBack} disabled={step === 1} className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Voltar
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {step} de {totalSteps}
                  </span>

                  <Button onClick={handleNext} disabled={!canProceed()} className="flex items-center gap-2">
                    {step === totalSteps ? "Ver resultado" : "Próximo"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-bold">Precificação Calculada</h3>
                  <p className="text-sm text-muted-foreground">Valores baseados nos seus custos</p>
                </div>

                {renderResult()}

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

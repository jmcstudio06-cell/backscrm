import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle2, ClipboardCheck, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FormData {
  artistName: string;
  whatsapp: string;
  showsPerMonth: string;
  whoManages: string;
  difficulties: string[];
  lostOpportunities: string;
  availability: string;
}

const initialFormData: FormData = {
  artistName: "",
  whatsapp: "",
  showsPerMonth: "",
  whoManages: "",
  difficulties: [],
  lostOpportunities: "",
  availability: "",
};

const showsOptions = [
  { value: "1-2", label: "1 a 2" },
  { value: "3-5", label: "3 a 5" },
  { value: "6+", label: "6 ou mais" },
  { value: "unknown", label: "Não sei dizer" },
];

const managesOptions = [
  { value: "myself", label: "Eu mesmo" },
  { value: "friend_family", label: "Amigo / familiar" },
  { value: "manager", label: "Empresário" },
  { value: "nobody", label: "Ninguém / improviso" },
];

const difficultiesOptions = [
  { value: "organization", label: "Organização geral" },
  { value: "schedule", label: "Controle de agenda" },
  { value: "fees", label: "Controle de cachês" },
  { value: "history", label: "Histórico de shows" },
  { value: "response_time", label: "Responder contratantes com rapidez" },
  { value: "budgets_contracts", label: "Orçamentos e contratos" },
];

const lostOpportunitiesOptions = [
  { value: "yes", label: "Sim" },
  { value: "probably_yes", label: "Provavelmente sim" },
  { value: "no", label: "Não" },
  { value: "never_thought", label: "Nunca pensei nisso" },
];

const availabilityOptions = [
  { value: "weekday_morning", label: "Segunda a sexta – manhã" },
  { value: "weekday_afternoon", label: "Segunda a sexta – tarde" },
  { value: "weekday_night", label: "Segunda a sexta – noite" },
  { value: "saturday", label: "Sábado" },
];

interface ArtistAnalysisFormProps {
  triggerButton?: React.ReactNode;
}

export function ArtistAnalysisForm({ triggerButton }: ArtistAnalysisFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleWhatsAppChange = (value: string) => {
    setFormData(prev => ({ ...prev, whatsapp: formatWhatsApp(value) }));
  };

  const handleDifficultyToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(value)
        ? prev.difficulties.filter(d => d !== value)
        : [...prev.difficulties, value],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.artistName.trim()) {
      newErrors.artistName = "Nome artístico é obrigatório";
    }
    
    const whatsappNumbers = formData.whatsapp.replace(/\D/g, "");
    if (whatsappNumbers.length < 10) {
      newErrors.whatsapp = "WhatsApp inválido";
    }
    
    if (!formData.showsPerMonth) {
      newErrors.showsPerMonth = "Selecione uma opção";
    }
    
    if (!formData.whoManages) {
      newErrors.whoManages = "Selecione uma opção";
    }
    
    if (formData.difficulties.length === 0) {
      newErrors.difficulties = "Selecione pelo menos uma dificuldade";
    }
    
    if (!formData.lostOpportunities) {
      newErrors.lostOpportunities = "Selecione uma opção";
    }
    
    if (!formData.availability) {
      newErrors.availability = "Selecione uma opção";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("artist_analyses")
        .insert([{
          artist_name: formData.artistName.trim(),
          whatsapp: formData.whatsapp,
          shows_per_month: formData.showsPerMonth,
          who_manages: formData.whoManages,
          difficulties: formData.difficulties,
          lost_opportunities: formData.lostOpportunities,
          history_reflection: null,
          availability: formData.availability,
          status: 'new',
        }]);

      if (error) throw error;
      
      setSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error submitting analysis:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    if (submitted) {
      setTimeout(() => {
        setSubmitted(false);
      }, 300);
    }
  };

  const handleNewRequest = () => {
    setSubmitted(false);
    setFormData(initialFormData);
    setErrors({});
  };

  const defaultTrigger = (
    <Button 
      size="lg"
      className="bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#0055BB] hover:to-[#009ACC] text-white px-8 py-6 text-lg font-semibold shadow-lg"
    >
      <ClipboardCheck className="w-5 h-5 mr-2" />
      Solicitar Análise de Carreira
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {submitted ? (
          <Card className="border-0 shadow-none">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Sua solicitação foi recebida!
              </h3>
              <p className="text-green-700 mb-4">
                As Análises de Gestão Artística passam por uma avaliação.
              </p>
              <p className="text-green-600 text-sm">
                Se fizer sentido, entraremos em contato para agendar.
              </p>
              <div className="flex gap-3 justify-center mt-6">
                <Button 
                  onClick={handleNewRequest}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  Enviar nova solicitação
                </Button>
                <Button 
                  onClick={handleClose}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Fechar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-none">
            <CardHeader className="bg-gradient-to-r from-[#0066CC] to-[#00B4D8] text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-8 h-8" />
                <div>
                  <CardTitle className="text-xl">Análise de Carreira</CardTitle>
                  <p className="text-white/80 text-sm mt-1">
                    Identifique falhas na gestão da sua carreira
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome artístico e WhatsApp lado a lado */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="artistName" className="text-slate-700 font-medium">
                      Nome artístico *
                    </Label>
                    <Input
                      id="artistName"
                      value={formData.artistName}
                      onChange={(e) => setFormData(prev => ({ ...prev, artistName: e.target.value }))}
                      placeholder="Como você é conhecido"
                      className={errors.artistName ? "border-red-500" : ""}
                    />
                    {errors.artistName && <p className="text-red-500 text-sm">{errors.artistName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-slate-700 font-medium">
                      WhatsApp *
                    </Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleWhatsAppChange(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className={errors.whatsapp ? "border-red-500" : ""}
                    />
                    {errors.whatsapp && <p className="text-red-500 text-sm">{errors.whatsapp}</p>}
                  </div>
                </div>

                {/* Shows por mês */}
                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">
                    Em média, quantos shows você faz por mês? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {showsOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={formData.showsPerMonth === option.value ? "default" : "outline"}
                        className={`h-auto py-3 ${formData.showsPerMonth === option.value ? "bg-[#0066CC]" : ""}`}
                        onClick={() => setFormData(prev => ({ ...prev, showsPerMonth: option.value }))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  {errors.showsPerMonth && <p className="text-red-500 text-sm">{errors.showsPerMonth}</p>}
                </div>

                {/* Quem gerencia */}
                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">
                    Quem cuida hoje da sua agenda, cachês e combinados? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {managesOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={formData.whoManages === option.value ? "default" : "outline"}
                        className={`h-auto py-3 ${formData.whoManages === option.value ? "bg-[#0066CC]" : ""}`}
                        onClick={() => setFormData(prev => ({ ...prev, whoManages: option.value }))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  {errors.whoManages && <p className="text-red-500 text-sm">{errors.whoManages}</p>}
                </div>

                {/* Dificuldades (múltipla seleção) - usando botões customizados */}
                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">
                    Onde você sente mais dificuldade hoje na sua carreira? *
                  </Label>
                  <p className="text-slate-500 text-sm">Selecione todas que se aplicam</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {difficultiesOptions.map((option) => {
                      const isSelected = formData.difficulties.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "bg-[#0066CC]/10 border-[#0066CC]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                          onClick={() => handleDifficultyToggle(option.value)}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected 
                              ? "bg-[#0066CC] border-[#0066CC]" 
                              : "border-slate-300"
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className="text-sm text-slate-700">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {errors.difficulties && <p className="text-red-500 text-sm">{errors.difficulties}</p>}
                </div>

                {/* Pergunta de DOR */}
                <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <Label className="text-slate-700 font-medium">
                    Responda sinceramente, você já perdeu oportunidades ou shows por falta de organização? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {lostOpportunitiesOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={formData.lostOpportunities === option.value ? "default" : "outline"}
                        className={`h-auto py-3 ${formData.lostOpportunities === option.value ? "bg-[#0066CC]" : ""}`}
                        onClick={() => setFormData(prev => ({ ...prev, lostOpportunities: option.value }))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  {errors.lostOpportunities && <p className="text-red-500 text-sm">{errors.lostOpportunities}</p>}
                </div>

                {/* Disponibilidade */}
                <div className="space-y-3">
                  <Label className="text-slate-700 font-medium">
                    Quais dias e horários são melhores para passar pela Análise de Carreira? *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availabilityOptions.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={formData.availability === option.value ? "default" : "outline"}
                        className={`h-auto py-3 ${formData.availability === option.value ? "bg-[#0066CC]" : ""}`}
                        onClick={() => setFormData(prev => ({ ...prev, availability: option.value }))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                  {errors.availability && <p className="text-red-500 text-sm">{errors.availability}</p>}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0066CC] to-[#00B4D8] hover:from-[#0055BB] hover:to-[#009ACC] text-white py-6 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Solicitar Análise de Carreira"
                  )}
                </Button>
                
                <p className="text-center text-slate-500 text-sm">
                  Ao enviar, você concorda em receber contato pelo WhatsApp informado.
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

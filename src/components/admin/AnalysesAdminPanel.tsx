import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ClipboardCheck,
  Search,
  Phone,
  Calendar,
  Users,
  AlertTriangle,
  Clock,
  Trash2,
  Eye,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { useArtistAnalyses, ArtistAnalysis, AnalysisStatus, analysisStatusConfig } from "@/hooks/useArtistAnalyses";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const showsLabels: Record<string, string> = {
  "1-2": "1 a 2 shows/mês",
  "3-5": "3 a 5 shows/mês",
  "6+": "6+ shows/mês",
  "unknown": "Não sabe",
};

const managesLabels: Record<string, string> = {
  "myself": "Eu mesmo",
  "friend_family": "Amigo/familiar",
  "manager": "Empresário",
  "nobody": "Ninguém/improviso",
};

const difficultiesLabels: Record<string, string> = {
  "organization": "Organização geral",
  "schedule": "Controle de agenda",
  "fees": "Controle de cachês",
  "history": "Histórico de shows",
  "response_time": "Responder contratantes",
  "budgets_contracts": "Orçamentos e contratos",
};

const lostOpportunitiesLabels: Record<string, string> = {
  "yes": "Sim, perdeu",
  "probably_yes": "Provavelmente sim",
  "no": "Não perdeu",
  "never_thought": "Nunca pensou nisso",
};

const availabilityLabels: Record<string, string> = {
  "weekday_morning": "Seg-Sex manhã",
  "weekday_afternoon": "Seg-Sex tarde",
  "weekday_night": "Seg-Sex noite",
  "saturday": "Sábado",
};

export function AnalysesAdminPanel() {
  const { analyses, loading, updateAnalysisStatus, deleteAnalysis, refetch } = useArtistAnalyses();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAnalysis, setSelectedAnalysis] = useState<ArtistAnalysis | null>(null);

  const filteredAnalyses = analyses.filter(analysis => {
    const matchesSearch = 
      analysis.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.whatsapp.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || analysis.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleWhatsApp = (whatsapp: string, artistName: string) => {
    const cleanNumber = whatsapp.replace(/\D/g, "");
    const message = encodeURIComponent(`Olá ${artistName}! Sou do Backstage Pro e vi sua solicitação de Análise de Gestão Artística. Podemos agendar?`);
    window.open(`https://wa.me/55${cleanNumber}?text=${message}`, "_blank");
  };

  const getStatusBadge = (status: string) => {
    const config = analysisStatusConfig[status as AnalysisStatus] || analysisStatusConfig.new;
    return (
      <Badge variant="outline" className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const getDaysAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    return `${diffDays} dias atrás`;
  };

  // Count by status
  const statusCounts = {
    new: analyses.filter(a => a.status === 'new').length,
    analyzing: analyses.filter(a => a.status === 'analyzing').length,
    scheduled: analyses.filter(a => a.status === 'scheduled').length,
    total: analyses.length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <ClipboardCheck className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-600">Novos</p>
            <p className="text-2xl font-bold text-blue-700">{statusCounts.new}</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <Clock className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-sm text-yellow-600">Em Análise</p>
            <p className="text-2xl font-bold text-yellow-700">{statusCounts.analyzing}</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-purple-600">Agendados</p>
            <p className="text-2xl font-bold text-purple-700">{statusCounts.scheduled}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-600">Total</p>
            <p className="text-2xl font-bold text-slate-700">{statusCounts.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="analyzing">Em análise</SelectItem>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="rejected">Recusado</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Analyses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Solicitações de Análise ({filteredAnalyses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAnalyses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnalyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg truncate">
                          {analysis.artist_name}
                        </h3>
                        {getStatusBadge(analysis.status)}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {analysis.whatsapp}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {showsLabels[analysis.shows_per_month] || analysis.shows_per_month}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {getDaysAgo(analysis.created_at)}
                        </span>
                      </div>

                      {/* Dificuldades em destaque */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {analysis.difficulties.slice(0, 3).map((diff) => (
                          <Badge key={diff} variant="secondary" className="text-xs">
                            {difficultiesLabels[diff] || diff}
                          </Badge>
                        ))}
                        {analysis.difficulties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{analysis.difficulties.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Indicador de dor */}
                      {(analysis.lost_opportunities === 'yes' || analysis.lost_opportunities === 'probably_yes') && (
                        <div className="flex items-center gap-1 mt-2 text-amber-600">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {analysis.lost_opportunities === 'yes' ? 'Já perdeu oportunidades' : 'Provavelmente perdeu oportunidades'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAnalysis(analysis)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleWhatsApp(analysis.whatsapp, analysis.artist_name)}
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        WhatsApp
                      </Button>
                      <Select
                        value={analysis.status}
                        onValueChange={(value) => updateAnalysisStatus(analysis.id, value as AnalysisStatus)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="analyzing">Em análise</SelectItem>
                          <SelectItem value="approved">Aprovado</SelectItem>
                          <SelectItem value="rejected">Recusado</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                          <SelectItem value="completed">Finalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (confirm("Excluir esta análise?")) {
                            deleteAnalysis(analysis.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedAnalysis} onOpenChange={() => setSelectedAnalysis(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Detalhes da Solicitação
            </DialogTitle>
          </DialogHeader>

          {selectedAnalysis && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedAnalysis.artist_name}</h2>
                  <p className="text-muted-foreground">{selectedAnalysis.whatsapp}</p>
                </div>
                {getStatusBadge(selectedAnalysis.status)}
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Shows por mês</p>
                  <p className="font-medium">{showsLabels[selectedAnalysis.shows_per_month]}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Quem gerencia</p>
                  <p className="font-medium">{managesLabels[selectedAnalysis.who_manages]}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Disponibilidade</p>
                  <p className="font-medium">{availabilityLabels[selectedAnalysis.availability]}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Data do envio</p>
                  <p className="font-medium">
                    {format(new Date(selectedAnalysis.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Dificuldades */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Dificuldades identificadas</p>
                <div className="flex flex-wrap gap-2">
                  {selectedAnalysis.difficulties.map((diff) => (
                    <Badge key={diff} variant="secondary">
                      {difficultiesLabels[diff] || diff}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Perdeu oportunidades */}
              <div className={`p-4 rounded-lg ${
                selectedAnalysis.lost_opportunities === 'yes' || selectedAnalysis.lost_opportunities === 'probably_yes'
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-slate-50'
              }`}>
                <p className="text-sm text-muted-foreground mb-1">
                  Já perdeu oportunidades por falta de organização?
                </p>
                <p className="font-medium flex items-center gap-2">
                  {(selectedAnalysis.lost_opportunities === 'yes' || selectedAnalysis.lost_opportunities === 'probably_yes') && (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  {lostOpportunitiesLabels[selectedAnalysis.lost_opportunities]}
                </p>
              </div>

              {/* Reflexão sobre histórico */}
              {selectedAnalysis.history_reflection && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-muted-foreground mb-1">
                    Sobre o histórico de shows e valores
                  </p>
                  <p className="text-slate-700">{selectedAnalysis.history_reflection}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleWhatsApp(selectedAnalysis.whatsapp, selectedAnalysis.artist_name);
                    setSelectedAnalysis(null);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Entrar em contato
                </Button>
                <Select
                  value={selectedAnalysis.status}
                  onValueChange={(value) => {
                    updateAnalysisStatus(selectedAnalysis.id, value as AnalysisStatus);
                    setSelectedAnalysis({ ...selectedAnalysis, status: value });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Novo</SelectItem>
                    <SelectItem value="analyzing">Em análise</SelectItem>
                    <SelectItem value="approved">Aprovado</SelectItem>
                    <SelectItem value="rejected">Recusado</SelectItem>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="completed">Finalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

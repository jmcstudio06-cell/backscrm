import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Users, ThumbsUp, MessageSquare, Gift } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type NPSResponse = Database["public"]["Tables"]["nps_responses"]["Row"];

interface NPSMetrics {
  score: number;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
  referralRate: number;
  trend: "up" | "down" | "stable";
  previousScore: number;
}

export default function AdminNPS() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<NPSResponse[]>([]);
  const [metrics, setMetrics] = useState<NPSMetrics | null>(null);

  useEffect(() => {
    if (!user) return;
    loadNPSData();
  }, [user]);

  async function loadNPSData() {
    try {
      const { data, error } = await supabase
        .from("nps_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResponses(data || []);
      calculateMetrics(data || []);
    } catch (error) {
      console.error("Erro ao carregar dados NPS:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateMetrics(data: NPSResponse[]) {
    if (data.length === 0) {
      setMetrics({
        score: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
        totalResponses: 0,
        referralRate: 0,
        trend: "stable",
        previousScore: 0,
      });
      return;
    }

    // Classifica respostas
    const promoters = data.filter((r) => r.rating >= 9).length;
    const passives = data.filter((r) => r.rating >= 7 && r.rating <= 8).length;
    const detractors = data.filter((r) => r.rating <= 6).length;
    const total = data.length;

    // Calcula NPS atual
    const currentScore = Math.round(((promoters - detractors) / total) * 100);

    // Taxa de indicação (quantos disseram "sim" para indicar)
    const wouldRefer = data.filter((r) => r.would_refer === "yes").length;
    const referralRate = Math.round((wouldRefer / total) * 100);

    // Calcula NPS do período anterior (últimos 3 meses vs anteriores)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentResponses = data.filter(
      (r) => new Date(r.created_at) >= threeMonthsAgo
    );
    const oldResponses = data.filter((r) => new Date(r.created_at) < threeMonthsAgo);

    let previousScore = 0;
    let trend: "up" | "down" | "stable" = "stable";

    if (oldResponses.length > 0) {
      const oldPromoters = oldResponses.filter((r) => r.rating >= 9).length;
      const oldDetractors = oldResponses.filter((r) => r.rating <= 6).length;
      previousScore = Math.round(
        ((oldPromoters - oldDetractors) / oldResponses.length) * 100
      );

      if (currentScore > previousScore + 5) trend = "up";
      else if (currentScore < previousScore - 5) trend = "down";
    }

    setMetrics({
      score: currentScore,
      promoters,
      passives,
      detractors,
      totalResponses: total,
      referralRate,
      trend,
      previousScore,
    });
  }

  function getScoreColor(score: number) {
    if (score >= 50) return "text-green-600";
    if (score >= 0) return "text-yellow-600";
    return "text-red-600";
  }

  function getScoreLabel(score: number) {
    if (score >= 75) return "Excelente";
    if (score >= 50) return "Muito bom";
    if (score >= 0) return "Razoável";
    return "Crítico";
  }

  function getRatingBadge(rating: number) {
    if (rating >= 9) return <Badge className="bg-green-500">Promotor</Badge>;
    if (rating >= 7) return <Badge className="bg-yellow-500">Neutro</Badge>;
    return <Badge className="bg-red-500">Detrator</Badge>;
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Métricas NPS</h1>
        <p className="text-muted-foreground">
          Acompanhe a satisfação e lealdade dos clientes
        </p>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Score</CardTitle>
            {metrics?.trend === "up" && <TrendingUp className="h-4 w-4 text-green-600" />}
            {metrics?.trend === "down" && <TrendingDown className="h-4 w-4 text-red-600" />}
            {metrics?.trend === "stable" && <Minus className="h-4 w-4 text-gray-400" />}
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(metrics?.score || 0)}`}>
              {metrics?.score}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {getScoreLabel(metrics?.score || 0)}
            </p>
            {metrics && metrics.previousScore !== 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Anterior: {metrics.previousScore}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promotores</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{metrics?.promoters}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalResponses
                ? Math.round((metrics.promoters / metrics.totalResponses) * 100)
                : 0}
              % do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respostas</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.passives} neutros, {metrics?.detractors} detratores
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações</CardTitle>
            <Gift className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics?.referralRate}%</div>
            <p className="text-xs text-muted-foreground">
              Aceitaram indicar
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição e Respostas */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Notas</CardTitle>
          <CardDescription>
            Promotores (9-10) · Neutros (7-8) · Detratores (0-6)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-8 rounded-lg overflow-hidden">
            <div
              className="bg-green-500 flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: `${
                  metrics?.totalResponses
                    ? (metrics.promoters / metrics.totalResponses) * 100
                    : 0
                }%`,
              }}
            >
              {metrics?.promoters || 0}
            </div>
            <div
              className="bg-yellow-500 flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: `${
                  metrics?.totalResponses
                    ? (metrics.passives / metrics.totalResponses) * 100
                    : 0
                }%`,
              }}
            >
              {metrics?.passives || 0}
            </div>
            <div
              className="bg-red-500 flex items-center justify-center text-white text-sm font-medium"
              style={{
                width: `${
                  metrics?.totalResponses
                    ? (metrics.detractors / metrics.totalResponses) * 100
                    : 0
                }%`,
              }}
            >
              {metrics?.detractors || 0}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Respostas */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Recentes</CardTitle>
          <CardDescription>Últimas avaliações recebidas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todas ({responses.length})</TabsTrigger>
              <TabsTrigger value="promoters">
                Promotores ({metrics?.promoters || 0})
              </TabsTrigger>
              <TabsTrigger value="detractors">
                Detratores ({metrics?.detractors || 0})
              </TabsTrigger>
              <TabsTrigger value="with-feedback">
                Com feedback (
                {responses.filter((r) => r.feedback && r.feedback.trim() !== "").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <ResponseList responses={responses} />
            </TabsContent>

            <TabsContent value="promoters">
              <ResponseList responses={responses.filter((r) => r.rating >= 9)} />
            </TabsContent>

            <TabsContent value="detractors">
              <ResponseList responses={responses.filter((r) => r.rating <= 6)} />
            </TabsContent>

            <TabsContent value="with-feedback">
              <ResponseList
                responses={responses.filter(
                  (r) => r.feedback && r.feedback.trim() !== ""
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ResponseList({ responses }: { responses: NPSResponse[] }) {
  function getRatingBadge(rating: number) {
    if (rating >= 9) return <Badge className="bg-green-500">Promotor</Badge>;
    if (rating >= 7) return <Badge className="bg-yellow-500">Neutro</Badge>;
    return <Badge className="bg-red-500">Detrator</Badge>;
  }

  if (responses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Nenhuma resposta encontrada</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-96 mt-4">
      <div className="space-y-4">
        {responses.map((response) => (
          <div
            key={response.id}
            className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{response.rating}</span>
                {getRatingBadge(response.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(response.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>

            {response.feedback && response.feedback.trim() !== "" && (
              <div className="mb-2 p-3 bg-muted rounded-md">
                <p className="text-sm italic">"{response.feedback}"</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {response.would_refer === "yes" && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Gift className="h-3 w-3 mr-1" />
                  Aceitou indicar
                  {response.referral_reward_choice === "discount" && " (Desconto)"}
                  {response.referral_reward_choice === "extra_month" && " (+1 mês)"}
                </Badge>
              )}
              {response.would_refer === "no" && (
                <Badge variant="outline" className="text-gray-500 border-gray-400">
                  Não quer indicar
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

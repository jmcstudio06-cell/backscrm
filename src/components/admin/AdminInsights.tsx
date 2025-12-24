import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLandingInsights } from "@/hooks/useLandingInsights";
import {
  TrendingUp,
  Users,
  UserCheck,
  Percent,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Loader2,
} from "lucide-react";

export function AdminInsights() {
  const { insights, loading } = useLandingInsights();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const weekConversionRate = insights.weekVisits > 0 
    ? ((insights.weekConversions / insights.weekVisits) * 100).toFixed(1)
    : "0.0";

  const monthConversionRate = insights.monthVisits > 0 
    ? ((insights.monthConversions / insights.monthVisits) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total de Visitas</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">{insights.totalVisits}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Conversões</p>
                <p className="text-3xl font-bold text-green-700 mt-1">{insights.conversions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{insights.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Hoje</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">{insights.todayVisits}</p>
                <p className="text-xs text-amber-500 mt-1">{insights.todayConversions} conversões</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-cyan-500" />
              Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Visitas</span>
              <span className="font-semibold text-foreground">{insights.weekVisits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conversões</span>
              <span className="font-semibold text-green-600">{insights.weekConversions}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Conversão</span>
                <Badge variant="outline" className={Number(weekConversionRate) >= 5 ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                  {weekConversionRate}%
                </Badge>
              </div>
              <Progress value={Number(weekConversionRate)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Últimos 30 Dias
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Visitas</span>
              <span className="font-semibold text-foreground">{insights.monthVisits}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conversões</span>
              <span className="font-semibold text-green-600">{insights.monthConversions}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Taxa de Conversão</span>
                <Badge variant="outline" className={Number(monthConversionRate) >= 5 ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}>
                  {monthConversionRate}%
                </Badge>
              </div>
              <Progress value={Number(monthConversionRate)} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Como funciona</h3>
              <p className="text-sm text-muted-foreground">
                Os dados são coletados automaticamente quando visitantes acessam a página /landing.
                Uma conversão é registrada quando o visitante se cadastra no app.
                Quanto maior a taxa de conversão, mais efetiva está sua landing page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

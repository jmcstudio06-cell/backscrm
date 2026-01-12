import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Gift, 
  Users, 
  Trophy, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  MessageCircle,
  Sparkles,
  Star,
  Zap,
  ArrowRight
} from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { useProfile } from "@/hooks/useProfile";
import { ReferralModal } from "@/components/indicacoes/ReferralModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", icon: Clock },
  valid: { label: "Válida", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30", icon: CheckCircle },
  invalid: { label: "Inválida", color: "bg-red-500/10 text-red-600 border-red-500/30", icon: XCircle },
};

const milestoneRewards = [
  { milestone: 10, reward: "+1 mês", icon: Trophy, color: "text-amber-600" },
  { milestone: 30, reward: "+2 meses", icon: Star, color: "text-blue-500" },
  { milestone: 60, reward: "+3 meses", icon: Sparkles, color: "text-purple-500" },
];

export default function Indicacoes() {
  const { referrals, config, stats, loading, addReferral, claimReward } = useReferrals();
  const { profile } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddReferral = async (name: string, phone: string) => {
    const result = await addReferral(name, phone);
    if (result.success && result.phone) {
      const message = encodeURIComponent(
        `Olá ${name}! 👋\n\nVocê foi indicado(a) por *${profile?.artist_name || profile?.name || "um amigo"}* para conhecer o *Backstage* - a plataforma que ajuda artistas a organizarem sua carreira, gerenciar shows e crescer profissionalmente.\n\n🎵 Crie sua conta grátis e comece agora:\nhttps://backstage.app\n\nQualquer dúvida, pode me chamar!`
      );
      window.open(`https://wa.me/55${result.phone}?text=${message}`, "_blank");
      setModalOpen(false);
    }
    return result.success;
  };

  if (!config?.campaign_active) {
    return (
      <Layout title="Indique e Ganhe" subtitle="Campanha de indicações">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                <Gift className="w-10 h-10 text-amber-500" />
              </div>
              <CardTitle className="text-xl">Campanha Pausada</CardTitle>
              <CardDescription>
                A campanha de indicações está temporariamente pausada. Volte em breve!
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Indique e Ganhe" subtitle="Ganhe tempo extra indicando artistas">
      <div className="space-y-6">
        {/* Hero Banner - Unique Visual */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 md:p-8 text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:20px_20px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shrink-0">
                <Gift className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium text-white/80">Programa de Indicações</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1">Indique e Ganhe</h1>
                <p className="text-white/80 text-sm md:text-base">
                  Convide artistas e ganhe meses grátis no seu plano
                </p>
              </div>
            </div>
            
            <Button 
              onClick={() => setModalOpen(true)} 
              size="lg"
              className="bg-white text-orange-600 hover:bg-white/90 font-bold shadow-lg shadow-black/20 gap-2"
            >
              <Plus className="w-5 h-5" />
              Nova Indicação
            </Button>
          </div>

          {/* Floating elements for decoration */}
          <Gift className="absolute top-4 right-4 w-12 h-12 opacity-20" />
          <Star className="absolute bottom-4 left-1/3 w-10 h-10 opacity-20" />
          <Sparkles className="absolute top-1/2 right-1/4 w-8 h-8 opacity-20" />
        </div>

        {/* Stats Row - Gamified Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
              <p className="text-xs text-blue-600/70">Total Indicadas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-700">{stats.valid}</p>
              <p className="text-xs text-emerald-600/70">Válidas</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-amber-50 to-amber-100/50">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              <p className="text-xs text-amber-600/70">Pendentes</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-rose-50 to-rose-100/50">
            <CardContent className="p-4 text-center">
              <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-rose-700">{stats.invalid}</p>
              <p className="text-xs text-rose-600/70">Inválidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Reward - Gamified */}
        {stats.nextMilestone > 0 && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Próxima Recompensa</CardTitle>
                    <CardDescription>
                      Faltam <span className="font-bold text-orange-600">{stats.nextMilestone - stats.valid}</span> indicações válidas
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-orange-600">{stats.valid}</span>
                  <span className="text-muted-foreground">/{stats.nextMilestone}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Progress value={stats.progressToNext} className="h-4 bg-orange-100" />
                <div 
                  className="absolute inset-0 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${stats.progressToNext}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones - Trophy Cards */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              <CardTitle>Recompensas</CardTitle>
            </div>
            <CardDescription>
              Acumule indicações válidas e desbloqueie prêmios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {milestoneRewards.map(({ milestone, reward, icon: MilestoneIcon, color }) => {
                const isClaimed = stats.claimedMilestones.includes(milestone);
                const canClaim = stats.valid >= milestone && !isClaimed;
                const progress = Math.min(100, (stats.valid / milestone) * 100);

                return (
                  <div
                    key={milestone}
                    className={`relative p-5 rounded-xl border-2 transition-all ${
                      isClaimed 
                        ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 border-emerald-300" 
                        : canClaim
                        ? "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 animate-pulse"
                        : "bg-card border-border"
                    }`}
                  >
                    {isClaimed && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className="text-center mb-3">
                      <MilestoneIcon className={`w-10 h-10 mx-auto ${color}`} />
                    </div>
                    
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold">{milestone}</p>
                      <p className="text-sm text-muted-foreground">indicações</p>
                    </div>

                    <div className="text-center mb-4">
                      <Badge 
                        variant="outline" 
                        className={isClaimed ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-amber-100 text-amber-700 border-amber-300"}
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        {reward}
                      </Badge>
                    </div>

                    {!isClaimed && (
                      <>
                        <Progress value={progress} className="h-2 mb-3" />
                        <Button
                          size="sm"
                          className={`w-full ${
                            canClaim 
                              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" 
                              : ""
                          }`}
                          disabled={!canClaim}
                          onClick={() => claimReward(milestone)}
                        >
                          {canClaim ? (
                            <>
                              <Gift className="w-4 h-4 mr-1" />
                              Resgatar Prêmio
                            </>
                          ) : (
                            `${stats.valid}/${milestone}`
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Referrals List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Suas Indicações
                </CardTitle>
                <CardDescription>Acompanhe o status de cada indicação</CardDescription>
              </div>
              {referrals.length > 0 && (
                <Button onClick={() => setModalOpen(true)} variant="outline" size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Indicar mais
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma indicação ainda</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Comece a indicar artistas e ganhe meses grátis no seu plano!
                </p>
                <Button 
                  onClick={() => setModalOpen(true)} 
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  <Gift className="w-4 h-4" />
                  Fazer primeira indicação
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => {
                  const { label, color, icon: StatusIcon } = statusConfig[referral.status];
                  return (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <Users className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold">{referral.referred_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.referred_phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(referral.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${color} border`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ReferralModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleAddReferral}
        userName={profile?.artist_name || profile?.name || ""}
      />
    </Layout>
  );
}

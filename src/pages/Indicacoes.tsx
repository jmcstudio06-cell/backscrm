import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Trophy, Clock, CheckCircle, XCircle, Plus, MessageCircle } from "lucide-react";
import { useReferrals } from "@/hooks/useReferrals";
import { useProfile } from "@/hooks/useProfile";
import { ReferralModal } from "@/components/indicacoes/ReferralModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
  valid: { label: "Válida", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  invalid: { label: "Inválida", color: "bg-red-500/10 text-red-500", icon: XCircle },
};

const milestoneRewards = [
  { milestone: 10, reward: "+1 mês de plano" },
  { milestone: 20, reward: "+2 meses de plano" },
  { milestone: 30, reward: "+3 meses de plano" },
];

export default function Indicacoes() {
  const { referrals, config, stats, loading, addReferral, claimReward } = useReferrals();
  const { profile } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAddReferral = async (name: string, phone: string) => {
    const result = await addReferral(name, phone);
    if (result.success && result.phone) {
      // Open WhatsApp with pre-filled message
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
      <Layout title="Indique e Ganhe" subtitle="Indique artistas e ganhe tempo extra">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md text-center">
            <CardHeader>
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <CardTitle>Campanha Pausada</CardTitle>
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
    <Layout title="Indique e Ganhe" subtitle="Indique artistas e ganhe tempo extra">
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Indicação
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Indicações</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Indicações Válidas</p>
                  <p className="text-2xl font-bold text-green-500">{stats.valid}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inválidas</p>
                  <p className="text-2xl font-bold text-red-500">{stats.invalid}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Reward */}
        {stats.nextMilestone > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Próxima Recompensa
              </CardTitle>
              <CardDescription>
                Faltam {stats.nextMilestone - stats.valid} indicações válidas para alcançar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stats.valid} válidas</span>
                  <span>{stats.nextMilestone} indicações</span>
                </div>
                <Progress value={stats.progressToNext} className="h-3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle>Recompensas</CardTitle>
            <CardDescription>
              Acumule indicações válidas e ganhe tempo extra no seu plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {milestoneRewards.map(({ milestone, reward }) => {
                const isClaimed = stats.claimedMilestones.includes(milestone);
                const canClaim = stats.valid >= milestone && !isClaimed;
                const progress = Math.min(100, (stats.valid / milestone) * 100);

                return (
                  <div
                    key={milestone}
                    className={`p-4 rounded-lg border ${
                      isClaimed ? "bg-green-500/10 border-green-500/30" : "bg-card"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy
                          className={`w-5 h-5 ${isClaimed ? "text-green-500" : "text-yellow-500"}`}
                        />
                        <span className="font-semibold">{milestone} indicações</span>
                      </div>
                      {isClaimed && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                          Resgatado
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{reward}</p>
                    {!isClaimed && (
                      <>
                        <Progress value={progress} className="h-2 mb-3" />
                        <Button
                          size="sm"
                          className="w-full"
                          disabled={!canClaim}
                          onClick={() => claimReward(milestone)}
                        >
                          {canClaim ? "Resgatar" : `${stats.valid}/${milestone}`}
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
        <Card>
          <CardHeader>
            <CardTitle>Suas Indicações</CardTitle>
            <CardDescription>Acompanhe o status de cada indicação</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Você ainda não fez nenhuma indicação</p>
                <Button onClick={() => setModalOpen(true)} className="mt-4 gap-2">
                  <Plus className="w-4 h-4" />
                  Fazer primeira indicação
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => {
                  const { label, color, icon: StatusIcon } = statusConfig[referral.status];
                  return (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.referred_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {referral.referred_phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(referral.created_at), "dd MMM yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge className={color}>
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

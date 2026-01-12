import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Gift, Settings, Users, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { useReferralsAdmin } from "@/hooks/useReferrals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendente", color: "bg-yellow-500/10 text-yellow-500", icon: Clock },
  valid: { label: "Válida", color: "bg-green-500/10 text-green-500", icon: CheckCircle },
  invalid: { label: "Inválida", color: "bg-red-500/10 text-red-500", icon: XCircle },
};

export function ReferralsAdminPanel() {
  const { allReferrals, config, loading, updateConfig, updateReferralStatus, deleteReferral } =
    useReferralsAdmin();

  const [localConfig, setLocalConfig] = useState(config);
  const [filter, setFilter] = useState<string>("all");

  // Sync local config when fetched
  if (config && !localConfig) {
    setLocalConfig(config);
  }

  const handleSaveConfig = () => {
    if (localConfig) {
      updateConfig({
        min_active_days: localConfig.min_active_days,
        reward_10: localConfig.reward_10,
        reward_20: localConfig.reward_20,
        reward_30: localConfig.reward_30,
        campaign_active: localConfig.campaign_active,
      });
    }
  };

  const filteredReferrals =
    filter === "all" ? allReferrals : allReferrals.filter((r) => r.status === filter);

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Config Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações da Campanha
          </CardTitle>
          <CardDescription>Gerencie as regras e recompensas do programa de indicações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {localConfig && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Campanha Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativa ou desativa o programa de indicações
                  </p>
                </div>
                <Switch
                  checked={localConfig.campaign_active}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, campaign_active: checked })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Dias mínimos de atividade</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localConfig.min_active_days}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, min_active_days: parseInt(e.target.value) || 7 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recompensa 10 indicações (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localConfig.reward_10}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, reward_10: parseInt(e.target.value) || 30 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recompensa 20 indicações (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localConfig.reward_20}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, reward_20: parseInt(e.target.value) || 60 })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Recompensa 30 indicações (dias)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={localConfig.reward_30}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, reward_30: parseInt(e.target.value) || 90 })
                    }
                  />
                </div>
              </div>

              <Button onClick={handleSaveConfig}>Salvar Configurações</Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Referrals Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Todas as Indicações
              </CardTitle>
              <CardDescription>{allReferrals.length} indicações no total</CardDescription>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="valid">Válidas</SelectItem>
                <SelectItem value="invalid">Inválidas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReferrals.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhuma indicação encontrada</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Indicado</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferrals.map((referral) => {
                    const { label, color, icon: StatusIcon } = statusConfig[referral.status];
                    return (
                      <TableRow key={referral.id}>
                        <TableCell className="font-medium">{referral.referrer_name}</TableCell>
                        <TableCell>{referral.referred_name}</TableCell>
                        <TableCell>
                          {referral.referred_phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(referral.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={referral.status}
                            onValueChange={(value: "pending" | "valid" | "invalid") =>
                              updateReferralStatus(referral.id, value)
                            }
                          >
                            <SelectTrigger className="w-[130px]">
                              <Badge className={color}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pendente</SelectItem>
                              <SelectItem value="valid">Válida</SelectItem>
                              <SelectItem value="invalid">Inválida</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir indicação?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. A indicação de {referral.referred_name}{" "}
                                  será removida permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteReferral(referral.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

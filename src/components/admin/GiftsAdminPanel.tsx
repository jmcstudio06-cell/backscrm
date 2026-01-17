import { useState, useEffect } from "react";
import { Gift, Clock, CheckCircle, XCircle, Trash2, Search, UserPlus, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAdminGifts, UserGiftWithProfile } from "@/hooks/useUserGifts";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Profile {
  user_id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

export function GiftsAdminPanel() {
  const { allGifts, loading, enableGift, disableGift, deleteGift } = useAdminGifts();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [campaignActive, setCampaignActive] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(true);

  // Fetch campaign status
  useEffect(() => {
    const fetchCampaignStatus = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "gift_auto_campaign_active")
        .single();
      
      if (data) {
        setCampaignActive(data.setting_value === "true");
      }
      setCampaignLoading(false);
    };
    fetchCampaignStatus();
  }, []);

  // Toggle campaign
  const toggleCampaign = async () => {
    const newValue = !campaignActive;
    setCampaignActive(newValue);
    
    const { error } = await supabase
      .from("app_settings")
      .update({ setting_value: newValue ? "true" : "false" })
      .eq("setting_key", "gift_auto_campaign_active");
    
    if (error) {
      setCampaignActive(!newValue);
      toast({
        title: "Erro ao atualizar campanha",
        variant: "destructive"
      });
    } else {
      toast({
        title: newValue ? "Campanha ativada!" : "Campanha desativada",
        description: newValue 
          ? "Novos usuários receberão bônus automaticamente ao cadastrar."
          : "Bônus só serão liberados manualmente."
      });
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, name, email, created_at")
        .order("created_at", { ascending: false });
      
      if (data) setProfiles(data);
    };
    fetchProfiles();
  }, []);

  const filteredGifts = allGifts.filter(gift => {
    const searchLower = searchTerm.toLowerCase();
    return (
      gift.profile?.name?.toLowerCase().includes(searchLower) ||
      gift.profile?.email?.toLowerCase().includes(searchLower)
    );
  });

  const getGiftStatus = (gift: UserGiftWithProfile) => {
    if (gift.is_claimed) {
      return { label: "Resgatado", color: "bg-green-500", icon: CheckCircle };
    }
    if (!gift.is_enabled) {
      return { label: "Desativado", color: "bg-gray-500", icon: XCircle };
    }
    if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
      return { label: "Expirado", color: "bg-red-500", icon: Clock };
    }
    return { label: "Aguardando", color: "bg-amber-500", icon: Gift };
  };

  const handleEnableGift = async () => {
    if (!selectedUserId) return;
    await enableGift(selectedUserId);
    setSelectedUserId("");
    setDialogOpen(false);
  };

  // Get users without active gifts
  const usersWithoutGifts = profiles.filter(
    p => !allGifts.some(g => g.user_id === p.user_id && g.is_enabled && !g.is_claimed)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              Bônus de Presente
            </CardTitle>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Liberar Bônus
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Liberar Bônus para Usuário</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Selecione o usuário</label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolher usuário..." />
                      </SelectTrigger>
                      <SelectContent>
                        {usersWithoutGifts.map(profile => (
                          <SelectItem key={profile.user_id} value={profile.user_id}>
                            {profile.name || profile.email || "Sem nome"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      ⏱️ O usuário terá <strong>10 minutos</strong> para resgatar o bônus após a liberação.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleEnableGift} 
                    disabled={!selectedUserId}
                    className="w-full"
                  >
                    Liberar Bônus
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Campaign Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${campaignActive ? 'bg-green-500' : 'bg-gray-400'} flex items-center justify-center transition-colors`}>
                <Power className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium">Campanha Automática</p>
                <p className="text-sm text-muted-foreground">
                  {campaignActive 
                    ? "Novos usuários recebem bônus ao cadastrar" 
                    : "Bônus liberados apenas manualmente"}
                </p>
              </div>
            </div>
            <Switch
              checked={campaignActive}
              onCheckedChange={toggleCampaign}
              disabled={campaignLoading}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Carregando...</p>
        ) : filteredGifts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {searchTerm ? "Nenhum bônus encontrado" : "Nenhum bônus liberado ainda"}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredGifts.map(gift => {
              const status = getGiftStatus(gift);
              const StatusIcon = status.icon;
              
              return (
                <div
                  key={gift.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${status.color} flex items-center justify-center`}>
                      <StatusIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {gift.profile?.name || gift.profile?.email || "Usuário"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {gift.profile?.email}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {status.label}
                        </Badge>
                        {gift.is_claimed && gift.claimed_at && (
                          <span className="text-xs text-muted-foreground">
                            Resgatado {formatDistanceToNow(new Date(gift.claimed_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        )}
                        {!gift.is_claimed && gift.expires_at && new Date(gift.expires_at) > new Date() && (
                          <span className="text-xs text-amber-600">
                            Expira em {formatDistanceToNow(new Date(gift.expires_at), { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {gift.is_enabled && !gift.is_claimed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => disableGift(gift.id)}
                      >
                        Desativar
                      </Button>
                    )}
                    {!gift.is_enabled && !gift.is_claimed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => enableGift(gift.user_id)}
                      >
                        Reativar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGift(gift.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

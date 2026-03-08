import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Musician } from "@/hooks/useMusicians";
import { MusicianStats } from "@/hooks/useMusicianStats";
import {
  Music,
  Phone,
  Mail,
  DollarSign,
  Star,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  MessageCircle,
  TrendingUp,
  Award,
} from "lucide-react";

interface MusicianProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  musician: Musician | null;
  stats: MusicianStats | null;
  onEdit: () => void;
  onDelete: () => void;
}

export function MusicianProfileModal({
  open,
  onOpenChange,
  musician,
  stats,
  onEdit,
  onDelete,
}: MusicianProfileModalProps) {
  if (!musician) return null;

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const initials = musician.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const avgFee =
    stats && stats.completedShows > 0
      ? stats.totalEarned / stats.completedShows
      : 0;

  const handleWhatsApp = () => {
    if (!musician.phone) return;
    const clean = musician.phone.replace(/\D/g, "");
    const phone = clean.startsWith("55") ? clean : `55${clean}`;
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  const statusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    if (status === "cancelled") return <XCircle className="w-3.5 h-3.5 text-destructive" />;
    return <Clock className="w-3.5 h-3.5 text-warning" />;
  };

  const statusLabel = (status: string) => {
    if (status === "completed") return "Realizado";
    if (status === "cancelled") return "Cancelado";
    if (status === "confirmed") return "Confirmado";
    return "Agendado";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Perfil do Músico</DialogTitle>
        </DialogHeader>

        {/* Profile Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-lg font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground truncate">{musician.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              {musician.instrument && (
                <Badge variant="secondary" className="text-xs">
                  <Music className="w-3 h-3 mr-1" />
                  {musician.instrument}
                </Badge>
              )}
              <Badge variant={musician.member_type === "fixo" ? "default" : "outline"} className="text-xs">
                {musician.member_type === "fixo" ? "Fixo" : "Freelancer"}
              </Badge>
            </div>
            {musician.rating && (
              <div className="flex items-center gap-1 mt-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < (musician.rating || 0)
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4">
          <StatMini
            icon={<Award className="w-4 h-4" />}
            value={String(stats?.completedShows || 0)}
            label="Shows juntos"
            color="text-primary"
          />
          <StatMini
            icon={<DollarSign className="w-4 h-4" />}
            value={`R$ ${fmt(stats?.totalEarned || 0)}`}
            label="Total pago"
            color="text-success"
          />
          <StatMini
            icon={<XCircle className="w-4 h-4" />}
            value={String(stats?.cancelledShows || 0)}
            label="Cancelados"
            color="text-destructive"
          />
          <StatMini
            icon={<TrendingUp className="w-4 h-4" />}
            value={avgFee > 0 ? `R$ ${fmt(avgFee)}` : "—"}
            label="Cachê médio"
            color="text-primary"
          />
        </div>

        {/* Contact Info */}
        <div className="space-y-2 py-3 border-t border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contato</p>
          <div className="flex flex-wrap gap-2">
            {musician.phone && (
              <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-success" />
                {musician.phone}
              </Button>
            )}
            {musician.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`mailto:${musician.email}`, "_blank")}
              >
                <Mail className="w-3.5 h-3.5 mr-1.5 text-primary" />
                {musician.email}
              </Button>
            )}
            {musician.rate && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-sm">
                <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium">Cachê: R$ {fmt(musician.rate)}</span>
              </div>
            )}
          </div>
          {musician.notes && (
            <p className="text-sm text-muted-foreground mt-2 italic">"{musician.notes}"</p>
          )}
        </div>

        {/* Show History */}
        {stats && stats.showHistory.length > 0 && (
          <div className="py-3 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Histórico de Shows ({stats.showHistory.length})
            </p>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {stats.showHistory.map((show) => (
                <div
                  key={show.show_id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {statusIcon(show.show_status)}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {show.show_title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(show.show_date + "T12:00:00").toLocaleDateString("pt-BR")}
                        {show.show_venue && <span>· {show.show_venue}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-sm font-semibold text-foreground">R$ {fmt(show.fee)}</p>
                    <p className="text-xs text-muted-foreground">{statusLabel(show.show_status)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <Button variant="outline" className="flex-1" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatMini({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/30 border border-border/30">
      <span className={color}>{icon}</span>
      <p className="text-sm font-bold text-foreground mt-1.5 leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

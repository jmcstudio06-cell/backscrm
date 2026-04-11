import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Music,
  Star,
  DollarSign,
  Award,
  XCircle,
  Eye,
  Users2,
  Key,
  Copy,
} from "lucide-react";
import { useMusicians, Musician } from "@/hooks/useMusicians";
import { useMusicianStats } from "@/hooks/useMusicianStats";
import { MusicianModal } from "@/components/equipe/MusicianModal";
import { MusicianProfileModal } from "@/components/equipe/MusicianProfileModal";

export default function Equipe() {
  const { musicians, loading, addMusician, updateMusician, deleteMusician } = useMusicians();
  const { getStats, loading: statsLoading } = useMusicianStats();
  const [filter, setFilter] = useState<"all" | "fixo" | "freelancer">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);

  const filteredMusicians = musicians
    .filter((m) => {
      if (filter !== "all" && m.member_type !== filter) return false;
      if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const handleAdd = () => {
    setSelectedMusician(null);
    setModalOpen(true);
  };

  const handleEdit = (musician: Musician) => {
    setSelectedMusician(musician);
    setProfileOpen(false);
    setModalOpen(true);
  };

  const handleViewProfile = (musician: Musician) => {
    setSelectedMusician(musician);
    setProfileOpen(true);
  };

  const handleSave = async (data: Partial<Musician> & { member_type?: string; rating?: number; payment_request_date?: string }) => {
    if (selectedMusician) {
      await updateMusician(selectedMusician.id, data);
    } else {
      await addMusician(data);
    }
  };

  const handleDelete = async (musician: Musician) => {
    setProfileOpen(false);
    await deleteMusician(musician.id);
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <Layout title="Banda & Músicos" subtitle="Gerencie sua banda e colaboradores">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Banda & Músicos" subtitle="Gerencie sua banda e colaboradores">
      <div className="space-y-6">
        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar músico..."
                className="pl-9 w-56 bg-secondary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              {(["all", "fixo", "freelancer"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={filter === f ? "bg-primary/10" : ""}
                >
                  {f === "all" ? "Todos" : f === "fixo" ? "Fixos" : "Freelancers"}
                </Button>
              ))}
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Músico
          </Button>
        </div>

        {/* Musicians Grid */}
        {filteredMusicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum músico encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione membros da sua banda para começar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMusicians.map((musician) => {
              const stats = getStats(musician.id);
              const initials = musician.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return (
                <div
                  key={musician.id}
                  className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-5 shadow-card hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  onClick={() => handleViewProfile(musician)}
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-foreground truncate">{musician.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {musician.instrument && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {musician.instrument}
                          </span>
                        )}
                      </div>
                      {musician.rating && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < (musician.rating || 0)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-muted-foreground/20"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={musician.member_type === "fixo" ? "default" : "outline"}
                      className="text-[10px] flex-shrink-0"
                    >
                      {musician.member_type === "fixo" ? "Fixo" : "Freelancer"}
                    </Badge>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                      <Award className="w-3.5 h-3.5 text-primary mb-1" />
                      <span className="text-sm font-bold text-foreground">{stats.completedShows}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight">Shows</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                      <DollarSign className="w-3.5 h-3.5 text-success mb-1" />
                      <span className="text-sm font-bold text-foreground">
                        {stats.totalEarned > 0 ? `R$ ${stats.totalEarned.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "R$ 0,00"}
                      </span>
                      <span className="text-[9px] text-muted-foreground leading-tight">Pago</span>
                    </div>
                    <div className="flex flex-col items-center p-2 rounded-lg bg-muted/30">
                      <XCircle className="w-3.5 h-3.5 text-destructive mb-1" />
                      <span className="text-sm font-bold text-foreground">{stats.cancelledShows}</span>
                      <span className="text-[9px] text-muted-foreground leading-tight">Cancel.</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      Cachê: <span className="font-semibold text-foreground">R$ {fmt(musician.rate || 0)}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      {musician.pix_key && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(musician.pix_key!);
                            toast.success("Chave PIX copiada!");
                          }}
                        >
                          <Key className="w-3 h-3 mr-1" />
                          PIX
                          <Copy className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewProfile(musician);
                        }}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Perfil
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MusicianModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSave}
        editingMusician={selectedMusician}
      />

      <MusicianProfileModal
        open={profileOpen}
        onOpenChange={setProfileOpen}
        musician={selectedMusician}
        stats={selectedMusician ? getStats(selectedMusician.id) : null}
        onEdit={() => selectedMusician && handleEdit(selectedMusician)}
        onDelete={() => selectedMusician && handleDelete(selectedMusician)}
      />
    </Layout>
  );
}

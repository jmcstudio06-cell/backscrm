import { useState, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Music,
  Star,
  Award,
  XCircle,
  Eye,
  Users2,
  Key,
  Copy,
  LayoutGrid,
  List,
  ArrowUpDown,
  DollarSign,
} from "lucide-react";
import { useMusicians, Musician } from "@/hooks/useMusicians";
import { useMusicianStats } from "@/hooks/useMusicianStats";
import { MusicianModal } from "@/components/equipe/MusicianModal";
import { MusicianProfileModal } from "@/components/equipe/MusicianProfileModal";

type ViewMode = "grid" | "list";
type SortKey = "name" | "rating" | "rate" | "totalPaid";

const sortLabels: Record<SortKey, string> = {
  name: "Alfabética (A-Z)",
  rating: "Mais estrelas",
  rate: "Maior cachê",
  totalPaid: "Mais pago (total)",
};

export default function Equipe() {
  const { musicians, loading, addMusician, updateMusician, deleteMusician } = useMusicians();
  const { getStats } = useMusicianStats();
  const [filter, setFilter] = useState<"all" | "fixo" | "freelancer">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMusician, setSelectedMusician] = useState<Musician | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const filteredMusicians = useMemo(() => {
    const arr = musicians.filter((m) => {
      if (filter !== "all" && m.member_type !== filter) return false;
      if (searchTerm && !m.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
    arr.sort((a, b) => {
      switch (sortKey) {
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "rate":
          return (b.rate || 0) - (a.rate || 0);
        case "totalPaid":
          return (getStats(b.id).totalEarned || 0) - (getStats(a.id).totalEarned || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name, "pt-BR");
      }
    });
    return arr;
  }, [musicians, filter, searchTerm, sortKey, getStats]);

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
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  {sortLabels[sortKey]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(sortLabels) as SortKey[]).map((k) => (
                  <DropdownMenuItem key={k} onClick={() => setSortKey(k)}>
                    {sortLabels[k]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View mode toggle */}
            <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode("grid")}
                title="Visualização em grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setViewMode("list")}
                title="Visualização em lista"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Button className="bg-primary hover:bg-primary/90" onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Músico
            </Button>
          </div>
        </div>

        {/* Musicians */}
        {filteredMusicians.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Users2 className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Nenhum músico encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione membros da sua banda para começar</p>
          </div>
        ) : viewMode === "grid" ? (
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
        ) : (
          /* List view */
          <div className="rounded-2xl border border-border/50 bg-card overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground font-medium border-b border-border/50">
              <div className="col-span-4">Músico</div>
              <div className="col-span-2">Função</div>
              <div className="col-span-1 text-center">Avaliação</div>
              <div className="col-span-1 text-center">Shows</div>
              <div className="col-span-2 text-right">Cachê</div>
              <div className="col-span-2 text-right pr-2">Total Pago</div>
            </div>
            <ul className="divide-y divide-border/50">
              {filteredMusicians.map((musician) => {
                const stats = getStats(musician.id);
                const initials = musician.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase();
                return (
                  <li
                    key={musician.id}
                    className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => handleViewProfile(musician)}
                  >
                    <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                      <Avatar className="h-9 w-9 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate text-sm">{musician.name}</p>
                        <Badge
                          variant={musician.member_type === "fixo" ? "default" : "outline"}
                          className="text-[9px] mt-0.5"
                        >
                          {musician.member_type === "fixo" ? "Fixo" : "Freelancer"}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-2 text-xs text-muted-foreground flex items-center gap-1">
                      <Music className="w-3 h-3" />
                      <span className="truncate">{musician.instrument || "—"}</span>
                    </div>
                    <div className="col-span-6 md:col-span-1 flex md:justify-center items-center gap-0.5">
                      {musician.rating ? (
                        <>
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-semibold">{musician.rating}</span>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                    <div className="col-span-6 md:col-span-1 md:text-center text-xs font-semibold text-foreground">
                      {stats.completedShows}
                    </div>
                    <div className="col-span-6 md:col-span-2 md:text-right text-xs font-medium text-foreground">
                      R$ {fmt(musician.rate || 0)}
                    </div>
                    <div className="col-span-12 md:col-span-2 md:text-right md:pr-2 text-xs font-bold text-success">
                      R$ {fmt(stats.totalEarned || 0)}
                    </div>
                  </li>
                );
              })}
            </ul>
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

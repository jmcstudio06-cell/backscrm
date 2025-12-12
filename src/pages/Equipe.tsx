import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Phone, 
  Mail, 
  MoreHorizontal, 
  Music,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMusicians } from "@/hooks/useMusicians";

export default function Equipe() {
  const { musicians, loading, deleteMusician } = useMusicians();
  const [filter, setFilter] = useState<"all" | "fixo" | "freelancer">("all");

  const handleAddMember = () => {
    toast.info("Funcionalidade de adicionar membro em desenvolvimento!");
  };

  const handleDeleteMember = async (musician: { id: string; name: string }) => {
    await deleteMusician(musician.id);
  };

  const handleEditMember = (musicianId: string) => {
    toast.info("Editando músico...");
  };

  const handleCallMember = (phone: string | null, name: string) => {
    if (!phone) {
      toast.error("Músico não possui telefone cadastrado");
      return;
    }
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`tel:${formattedPhone}`, '_self');
    toast.info(`Ligando para ${name}...`);
  };

  const handleEmailMember = (email: string | null, name: string) => {
    if (!email) {
      toast.error("Músico não possui email cadastrado");
      return;
    }
    window.open(`mailto:${email}`, '_blank');
    toast.info(`Enviando email para ${name}...`);
  };

  if (loading) {
    return (
      <Layout title="Equipe & Freelancer" subtitle="Gerencie sua banda e colaboradores">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Equipe & Freelancer" subtitle="Gerencie sua banda e colaboradores">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ChartCard title="Total da Equipe">
            <div className="text-3xl font-bold text-primary">{musicians.length}</div>
            <p className="text-sm text-muted-foreground">membros cadastrados</p>
          </ChartCard>
          <ChartCard title="Membros Fixos">
            <div className="text-3xl font-bold text-green-600">0</div>
            <p className="text-sm text-muted-foreground">contratados</p>
          </ChartCard>
          <ChartCard title="Freelancers">
            <div className="text-3xl font-bold text-amber-600">0</div>
            <p className="text-sm text-muted-foreground">disponíveis</p>
          </ChartCard>
          <ChartCard title="Média de Avaliação">
            <div className="text-3xl font-bold text-primary">-</div>
            <p className="text-sm text-muted-foreground">⭐ estrelas</p>
          </ChartCard>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant={filter === "all" ? "outline" : "ghost"} 
              size="sm"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-primary/10" : ""}
            >
              Todos
            </Button>
            <Button 
              variant={filter === "fixo" ? "outline" : "ghost"} 
              size="sm"
              onClick={() => setFilter("fixo")}
              className={filter === "fixo" ? "bg-primary/10" : ""}
            >
              Fixos
            </Button>
            <Button 
              variant={filter === "freelancer" ? "outline" : "ghost"} 
              size="sm"
              onClick={() => setFilter("freelancer")}
              className={filter === "freelancer" ? "bg-primary/10" : ""}
            >
              Freelancers
            </Button>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAddMember}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Membro
          </Button>
        </div>

        {/* Team Table */}
        <ChartCard title="Membros da Equipe">
          {musicians.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum músico cadastrado</p>
              <p className="text-sm text-muted-foreground">Adicione membros da sua equipe para começar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Cachê</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {musicians.map((musician) => (
                  <TableRow key={musician.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {musician.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{musician.name}</p>
                          {musician.email && (
                            <p className="text-sm text-muted-foreground">{musician.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        <span>{musician.instrument || "Não informado"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        R$ {(musician.rate || 0).toLocaleString("pt-BR")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleCallMember(musician.phone, musician.name)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEmailMember(musician.email, musician.name)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditMember(musician.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteMember(musician)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ChartCard>
      </div>
    </Layout>
  );
}

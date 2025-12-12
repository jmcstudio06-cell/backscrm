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
  Mic2, 
  Guitar,
  Trash2,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  type: string;
  phone: string;
  email: string;
  shows: number;
  rating: number;
}

const initialTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Carlos Silva",
    role: "Baterista",
    type: "Fixo",
    phone: "(11) 99999-1111",
    email: "carlos@email.com",
    shows: 45,
    rating: 4.9,
  },
  {
    id: 2,
    name: "Ana Paula",
    role: "Vocalista",
    type: "Fixo",
    phone: "(11) 99999-2222",
    email: "ana@email.com",
    shows: 42,
    rating: 5.0,
  },
  {
    id: 3,
    name: "Roberto Santos",
    role: "Baixista",
    type: "Freelancer",
    phone: "(11) 99999-3333",
    email: "roberto@email.com",
    shows: 15,
    rating: 4.7,
  },
  {
    id: 4,
    name: "Mariana Costa",
    role: "Tecladista",
    type: "Freelancer",
    phone: "(11) 99999-4444",
    email: "mariana@email.com",
    shows: 8,
    rating: 4.8,
  },
];

const roleIcons: Record<string, React.ElementType> = {
  Baterista: Music,
  Vocalista: Mic2,
  Baixista: Guitar,
  Tecladista: Music,
};

export default function Equipe() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [filter, setFilter] = useState<"all" | "fixo" | "freelancer">("all");

  const filteredMembers = teamMembers.filter(member => {
    if (filter === "all") return true;
    if (filter === "fixo") return member.type === "Fixo";
    if (filter === "freelancer") return member.type === "Freelancer";
    return true;
  });

  const handleAddMember = () => {
    toast.info("Funcionalidade de adicionar membro em desenvolvimento!");
  };

  const handleDeleteMember = (member: TeamMember) => {
    setTeamMembers(teamMembers.filter(m => m.id !== member.id));
    toast.success(`Membro "${member.name}" removido com sucesso!`);
  };

  const handleEditMember = (member: TeamMember) => {
    toast.info(`Editando ${member.name}...`);
  };

  const handleCallMember = (phone: string, name: string) => {
    const formattedPhone = phone.replace(/\D/g, '');
    window.open(`tel:${formattedPhone}`, '_self');
    toast.info(`Ligando para ${name}...`);
  };

  const handleEmailMember = (email: string, name: string) => {
    window.open(`mailto:${email}`, '_blank');
    toast.info(`Enviando email para ${name}...`);
  };

  const fixedCount = teamMembers.filter(m => m.type === "Fixo").length;
  const freelancerCount = teamMembers.filter(m => m.type === "Freelancer").length;
  const avgRating = (teamMembers.reduce((sum, m) => sum + m.rating, 0) / teamMembers.length).toFixed(2);

  return (
    <Layout title="Equipe & Freelancer" subtitle="Gerencie sua banda e colaboradores">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ChartCard title="Total da Equipe">
            <div className="text-3xl font-bold text-primary">{teamMembers.length}</div>
            <p className="text-sm text-muted-foreground">membros ativos</p>
          </ChartCard>
          <ChartCard title="Membros Fixos">
            <div className="text-3xl font-bold text-green-600">{fixedCount}</div>
            <p className="text-sm text-muted-foreground">contratados</p>
          </ChartCard>
          <ChartCard title="Freelancers">
            <div className="text-3xl font-bold text-amber-600">{freelancerCount}</div>
            <p className="text-sm text-muted-foreground">disponíveis</p>
          </ChartCard>
          <ChartCard title="Média de Avaliação">
            <div className="text-3xl font-bold text-primary">{avgRating}</div>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Membro</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Shows</TableHead>
                <TableHead>Avaliação</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => {
                const RoleIcon = roleIcons[member.role] || Music;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RoleIcon className="w-4 h-4 text-primary" />
                        <span>{member.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.type === "Fixo" ? "default" : "secondary"}
                        className={member.type === "Fixo" ? "bg-green-500" : ""}
                      >
                        {member.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleCallMember(member.phone, member.name)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEmailMember(member.email, member.name)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{member.shows} shows</TableCell>
                    <TableCell>
                      <span className="text-amber-500">⭐</span> {member.rating}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditMember(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ChartCard>
      </div>
    </Layout>
  );
}
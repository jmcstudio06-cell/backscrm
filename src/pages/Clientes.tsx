import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  events: number;
  totalSpent: number;
  lastEvent: string;
  rating: number;
  status: string;
}

const initialClients: Client[] = [
  {
    id: 1,
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-1111",
    events: 3,
    totalSpent: 25500,
    lastEvent: "2024-12-15",
    rating: 5,
    status: "active",
  },
  {
    id: 2,
    name: "João Mendes",
    email: "joao@empresa.com",
    phone: "(11) 99999-2222",
    events: 5,
    totalSpent: 48000,
    lastEvent: "2024-11-20",
    rating: 4,
    status: "active",
  },
  {
    id: 3,
    name: "Ana Costa",
    email: "ana@email.com",
    phone: "(11) 99999-3333",
    events: 2,
    totalSpent: 21500,
    lastEvent: "2024-10-10",
    rating: 5,
    status: "active",
  },
  {
    id: 4,
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    phone: "(11) 99999-4444",
    events: 1,
    totalSpent: 6800,
    lastEvent: "2024-09-28",
    rating: 4,
    status: "inactive",
  },
  {
    id: 5,
    name: "Patricia Lima",
    email: "patricia@email.com",
    phone: "(11) 99999-5555",
    events: 4,
    totalSpent: 38000,
    lastEvent: "2024-12-01",
    rating: 5,
    status: "active",
  },
];

export default function Clientes() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const totalEvents = clients.reduce((sum, c) => sum + c.events, 0);
  const avgRating = (clients.reduce((sum, c) => sum + c.rating, 0) / clients.length).toFixed(1);

  const handleAddClient = () => {
    toast.info("Funcionalidade de novo cliente em desenvolvimento!");
  };

  const handleViewClient = (client: Client) => {
    toast.info(`Abrindo perfil de ${client.name}...`);
  };

  const handleEditClient = (client: Client) => {
    toast.info(`Editando ${client.name}...`);
  };

  const handleDeleteClient = (client: Client) => {
    setClients(clients.filter(c => c.id !== client.id));
    toast.success(`Cliente "${client.name}" removido com sucesso!`);
  };

  return (
    <Layout title="Clientes" subtitle="Gerencie sua base de clientes">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalClients}</p>
              <p className="text-xs text-muted-foreground">Total de Clientes</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ {(totalRevenue / 1000).toFixed(0)}k</p>
              <p className="text-xs text-muted-foreground">Faturamento Total</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
              <p className="text-xs text-muted-foreground">Eventos Realizados</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgRating}</p>
              <p className="text-xs text-muted-foreground">Avaliação Média</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar clientes..." 
              className="pl-9 w-64 bg-secondary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddClient}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Clients Table */}
      <ChartCard title="Lista de Clientes" subtitle="Todos os seus clientes ativos">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead>Total Gasto</TableHead>
              <TableHead>Último Evento</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{client.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-foreground">{client.events}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-success">
                    R$ {client.totalSpent.toLocaleString("pt-BR")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">
                    {new Date(client.lastEvent).toLocaleDateString("pt-BR")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < client.rating ? "text-warning fill-warning" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      client.status === "active"
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted text-muted-foreground"
                    }
                  >
                    {client.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewClient(client)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClient(client)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteClient(client)}
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
      </ChartCard>
    </Layout>
  );
}
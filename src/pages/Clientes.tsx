import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useClients, Client } from "@/hooks/useClients";
import { ClientModal } from "@/components/clientes/ClientModal";
import { ClientProfileModal } from "@/components/clientes/ClientProfileModal";

type SortOption = "name" | "total_spent" | "shows_count";

export default function Clientes() {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filteredClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, 'pt-BR');
      } else if (sortBy === "total_spent") {
        return (b.total_spent || 0) - (a.total_spent || 0);
      } else if (sortBy === "shows_count") {
        return (b.shows_count || 0) - (a.shows_count || 0);
      }
      return 0;
    });

  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalEvents = clients.reduce((sum, c) => sum + (c.shows_count || 0), 0);

  const handleAddClient = () => {
    setSelectedClient(null);
    setModalOpen(true);
  };

  const handleViewProfile = (client: Client) => {
    setSelectedClient(client);
    setProfileModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setProfileModalOpen(false);
    setModalOpen(true);
  };

  const handleSaveClient = async (data: Partial<Client>) => {
    if (selectedClient) {
      await updateClient(selectedClient.id, data);
    } else {
      await addClient(data);
    }
  };

  const handleDeleteClient = async (client: Client) => {
    setProfileModalOpen(false);
    await deleteClient(client.id);
  };

  if (loading) {
    return (
      <Layout title="Clientes" subtitle="Gerencie sua base de clientes">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

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
              <p className="text-2xl font-bold text-foreground">-</p>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                {sortBy === "name" ? "A-Z" : sortBy === "total_spent" ? "Maior Valor" : "Mais Shows"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setSortBy("name")}>
                Ordem Alfabética (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("total_spent")}>
                Maior Valor Gasto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("shows_count")}>
                Mais Shows
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={handleAddClient}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Clients Table */}
      <ChartCard title="Lista de Clientes" subtitle="Todos os seus clientes">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
            <p className="text-sm text-muted-foreground">Adicione seu primeiro cliente para começar</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => handleViewProfile(client)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">{client.name?.charAt(0)?.toUpperCase() || "?"}</span>
                      </div>
                      <span className="font-medium text-foreground">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {client.email && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-foreground">{client.shows_count || 0}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-success">
                      R$ {(client.total_spent || 0).toLocaleString("pt-BR")}
                    </span>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(client)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Ver perfil
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ChartCard>

      <ClientModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        client={selectedClient}
        onSave={handleSaveClient}
      />

      <ClientProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        client={selectedClient}
        onEdit={() => handleEditClient(selectedClient!)}
        onDelete={() => handleDeleteClient(selectedClient!)}
      />
    </Layout>
  );
}

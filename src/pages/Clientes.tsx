import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Eye,
  TrendingUp,
  Crown,
  MessageCircle,
  Users,
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
      if (sortBy === "name") return a.name.localeCompare(b.name, 'pt-BR');
      if (sortBy === "total_spent") return (b.total_spent || 0) - (a.total_spent || 0);
      if (sortBy === "shows_count") return (b.shows_count || 0) - (a.shows_count || 0);
      return 0;
    });

  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const totalEvents = clients.reduce((sum, c) => sum + (c.shows_count || 0), 0);
  const topClient = [...clients].sort((a, b) => (b.total_spent || 0) - (a.total_spent || 0))[0];

  const handleAddClient = () => { setSelectedClient(null); setModalOpen(true); };
  const handleViewProfile = (client: Client) => { setSelectedClient(client); setProfileModalOpen(true); };
  const handleEditClient = (client: Client) => { setSelectedClient(client); setProfileModalOpen(false); setModalOpen(true); };
  const handleSaveClient = async (data: Partial<Client>) => {
    if (selectedClient) await updateClient(selectedClient.id, data);
    else await addClient(data);
  };
  const handleDeleteClient = async (client: Client) => { setProfileModalOpen(false); await deleteClient(client.id); };

  const handleWhatsApp = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!client.phone) return;
    let phone = client.phone.replace(/\D/g, '');
    if (!phone.startsWith('55')) phone = '55' + phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Olá ${client.name}! Tudo bem?`)}`, '_blank');
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
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalClients}</p>
                  <p className="text-xs text-muted-foreground">Total de Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {(totalRevenue / 1000).toFixed(0)}k
                  </p>
                  <p className="text-xs text-muted-foreground">Faturamento Total</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
                  <p className="text-xs text-muted-foreground">Eventos Realizados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-primary/10">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground truncate">
                    {topClient?.name || "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Melhor Cliente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  {sortBy === "name" ? "A-Z" : sortBy === "total_spent" ? "Maior Valor" : "Mais Shows"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setSortBy("name")}>Ordem Alfabética (A-Z)</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("total_spent")}>Maior Valor Gasto</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("shows_count")}>Mais Shows</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button onClick={handleAddClient}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>

        {/* Clients Table */}
        <ChartCard title="Lista de Clientes" subtitle={`${filteredClients.length} clientes`}>
          {clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Nenhum cliente cadastrado</p>
              <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro cliente para começar</p>
              <Button onClick={handleAddClient}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-primary">
                  <TableHead className="text-primary-foreground font-bold">Cliente</TableHead>
                  <TableHead className="text-primary-foreground font-bold">Contato</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-center">Eventos</TableHead>
                  <TableHead className="text-primary-foreground font-bold">Total Gasto</TableHead>
                  <TableHead className="text-primary-foreground font-bold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, idx) => (
                  <TableRow
                    key={client.id}
                    className={`cursor-pointer transition-colors hover:bg-primary/5 ${idx % 2 === 0 ? "bg-muted/30" : ""}`}
                    onClick={() => handleViewProfile(client)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-primary-foreground">
                            {client.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{client.name}</span>
                            {(client.shows_count || 0) >= 5 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                                VIP
                              </Badge>
                            )}
                          </div>
                          {client.company && (
                            <span className="text-xs text-muted-foreground">{client.company}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {client.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            {client.phone}
                          </div>
                        )}
                        {client.email && (
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[180px]">{client.email}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold text-foreground">{client.shows_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        R$ {(client.total_spent || 0).toLocaleString("pt-BR")}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`w-8 h-8 rounded-xl ${client.phone ? "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10" : "invisible"}`}
                          onClick={(e) => client.phone && handleWhatsApp(client, e)}
                          tabIndex={client.phone ? 0 : -1}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-[100px]"
                          onClick={() => handleViewProfile(client)}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Ver perfil
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ChartCard>
      </div>

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

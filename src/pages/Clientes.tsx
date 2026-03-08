import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Eye,
  TrendingUp,
  Crown,
  MessageCircle,
  ArrowUpRight,
  Users,
} from "lucide-react";
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
  const avgTicket = totalEvents > 0 ? totalRevenue / totalEvents : 0;
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
        {/* Hero Stats */}
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
                    R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    R$ {avgTicket.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Ticket Médio</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Client Highlight */}
        {topClient && (topClient.total_spent || 0) > 0 && (
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent overflow-hidden">
            <CardContent className="p-4 md:p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">Melhor Cliente</span>
                  </div>
                  <p className="font-bold text-foreground text-lg truncate">{topClient.name}</p>
                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span>{topClient.shows_count || 0} eventos</span>
                    <span>•</span>
                    <span className="font-semibold text-primary">
                      R$ {(topClient.total_spent || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 border-primary/30 text-primary hover:bg-primary/10"
                  onClick={() => handleViewProfile(topClient)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search & Actions */}
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

        {/* Client Cards */}
        {clients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Nenhum cliente cadastrado</p>
              <p className="text-sm text-muted-foreground mb-4">Adicione seu primeiro cliente para começar</p>
              <Button onClick={handleAddClient}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-muted-foreground">
                {filteredClients.length} {filteredClients.length === 1 ? "cliente" : "clientes"}
                {searchTerm && ` encontrado${filteredClients.length !== 1 ? "s" : ""}`}
              </p>
            </div>

            <div className="grid gap-2.5">
              {filteredClients.map((client) => {
                const revenuePercent = totalRevenue > 0 ? ((client.total_spent || 0) / totalRevenue) * 100 : 0;

                return (
                  <Card
                    key={client.id}
                    className="cursor-pointer hover:border-primary/30 transition-all duration-200 hover:shadow-md group"
                    onClick={() => handleViewProfile(client)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 shadow-sm">
                          <span className="text-sm font-bold text-primary-foreground">
                            {client.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground truncate">{client.name}</p>
                            {(client.shows_count || 0) >= 5 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary shrink-0">
                                VIP
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {client.phone && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </span>
                            )}
                            {client.email && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
                                <Mail className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{client.email}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="hidden md:flex items-center gap-6 shrink-0">
                          <div className="text-center">
                            <p className="text-sm font-bold text-foreground">{client.shows_count || 0}</p>
                            <p className="text-[10px] text-muted-foreground">eventos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-primary">
                              R$ {(client.total_spent || 0).toLocaleString("pt-BR")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">total</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {client.phone && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-xl text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10"
                              onClick={(e) => handleWhatsApp(client, e)}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => handleViewProfile(client)}
                          >
                            <ArrowUpRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Mobile stats */}
                      <div className="flex items-center gap-4 mt-3 md:hidden">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{client.shows_count || 0} eventos</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <DollarSign className="w-3 h-3" />
                          <span>R$ {(client.total_spent || 0).toLocaleString("pt-BR")}</span>
                        </div>
                      </div>

                      {/* Revenue share bar */}
                      {revenuePercent > 0 && (
                        <div className="mt-2.5">
                          <Progress value={revenuePercent} className="h-1" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
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

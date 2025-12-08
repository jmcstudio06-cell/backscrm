import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  Music,
  Calendar,
  DollarSign,
  Star,
  MoreVertical,
  FileText,
} from "lucide-react";

const musicians = [
  {
    id: 1,
    name: "Pedro Silva",
    instrument: "Guitarra",
    phone: "(11) 99999-1111",
    email: "pedro@email.com",
    shows: 45,
    totalPaid: 22500,
    rating: 5,
    status: "active",
    avatar: "PS",
  },
  {
    id: 2,
    name: "Ana Santos",
    instrument: "Vocal",
    phone: "(11) 99999-2222",
    email: "ana@email.com",
    shows: 52,
    totalPaid: 31200,
    rating: 5,
    status: "active",
    avatar: "AS",
  },
  {
    id: 3,
    name: "Carlos Mendes",
    instrument: "Bateria",
    phone: "(11) 99999-3333",
    email: "carlos@email.com",
    shows: 38,
    totalPaid: 19000,
    rating: 4,
    status: "active",
    avatar: "CM",
  },
  {
    id: 4,
    name: "Julia Costa",
    instrument: "Teclado",
    phone: "(11) 99999-4444",
    email: "julia@email.com",
    shows: 28,
    totalPaid: 14000,
    rating: 5,
    status: "active",
    avatar: "JC",
  },
  {
    id: 5,
    name: "Ricardo Lima",
    instrument: "Baixo",
    phone: "(11) 99999-5555",
    email: "ricardo@email.com",
    shows: 41,
    totalPaid: 20500,
    rating: 4,
    status: "inactive",
    avatar: "RL",
  },
  {
    id: 6,
    name: "Fernanda Oliveira",
    instrument: "Saxofone",
    phone: "(11) 99999-6666",
    email: "fernanda@email.com",
    shows: 22,
    totalPaid: 11000,
    rating: 5,
    status: "active",
    avatar: "FO",
  },
];

const instrumentColors: Record<string, string> = {
  Guitarra: "bg-primary/10 text-primary",
  Vocal: "bg-accent/10 text-accent",
  Bateria: "bg-warning/10 text-warning",
  Teclado: "bg-success/10 text-success",
  Baixo: "bg-destructive/10 text-destructive",
  Saxofone: "bg-purple-500/10 text-purple-500",
};

export default function Musicos() {
  return (
    <Layout title="Músicos da Banda" subtitle="Gerencie sua equipe de músicos">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-xs text-muted-foreground">Músicos Ativos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">R$ 118k</p>
              <p className="text-xs text-muted-foreground">Total Pago</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">226</p>
              <p className="text-xs text-muted-foreground">Shows Totais</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">4.7</p>
              <p className="text-xs text-muted-foreground">Avaliação Média</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar músicos..." className="pl-9 w-64 bg-secondary" />
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Músico
        </Button>
      </div>

      {/* Musicians Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {musicians.map((musician) => (
          <div key={musician.id} className="p-5 rounded-xl glass card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-lg font-bold text-primary-foreground">
                  {musician.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{musician.name}</h3>
                  <Badge className={instrumentColors[musician.instrument]}>
                    <Music className="w-3 h-3 mr-1" />
                    {musician.instrument}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                {musician.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                {musician.email}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2 rounded-lg bg-secondary/50 text-center">
                <p className="text-lg font-bold text-foreground">{musician.shows}</p>
                <p className="text-xs text-muted-foreground">Shows</p>
              </div>
              <div className="p-2 rounded-lg bg-secondary/50 text-center">
                <p className="text-lg font-bold text-success">
                  R$ {(musician.totalPaid / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-muted-foreground">Pago</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < musician.rating ? "text-warning fill-warning" : "text-muted"
                    }`}
                  />
                ))}
              </div>
              <Badge
                variant="outline"
                className={
                  musician.status === "active"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-muted text-muted-foreground"
                }
              >
                {musician.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

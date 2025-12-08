import { Layout } from "@/components/layout/Layout";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Eye,
  Download,
  MoreVertical,
  Calculator,
  DollarSign,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const budgets = [
  {
    id: 1,
    title: "Casamento Silva & Santos",
    client: "Maria Silva",
    value: 8500,
    date: "2024-12-15",
    status: "approved",
    createdAt: "2024-11-15",
    validUntil: "2024-12-01",
  },
  {
    id: 2,
    title: "Evento Corporativo TechCorp",
    client: "João Mendes",
    value: 12000,
    date: "2024-12-18",
    status: "sent",
    createdAt: "2024-11-20",
    validUntil: "2024-12-10",
  },
  {
    id: 3,
    title: "Formatura Medicina USP",
    client: "Ana Costa",
    value: 15000,
    date: "2024-12-28",
    status: "pending",
    createdAt: "2024-12-01",
    validUntil: "2024-12-15",
  },
  {
    id: 4,
    title: "Aniversário 15 anos",
    client: "Patricia Lima",
    value: 5500,
    date: "2024-12-20",
    status: "rejected",
    createdAt: "2024-11-25",
    validUntil: "2024-12-05",
  },
  {
    id: 5,
    title: "Reveillon Club",
    client: "Ricardo Almeida",
    value: 25000,
    date: "2024-12-31",
    status: "approved",
    createdAt: "2024-11-10",
    validUntil: "2024-11-25",
  },
];

const statusConfig = {
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  sent: { label: "Enviado", color: "bg-accent/10 text-accent border-accent/20", icon: Send },
  approved: { label: "Aprovado", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default function Orcamentos() {
  const totalApproved = budgets.filter((b) => b.status === "approved").reduce((acc, b) => acc + b.value, 0);
  const totalPending = budgets.filter((b) => b.status === "pending" || b.status === "sent").reduce((acc, b) => acc + b.value, 0);

  return (
    <Layout title="Orçamentos" subtitle="Crie e gerencie propostas comerciais">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">48</p>
              <p className="text-xs text-muted-foreground">Total de Orçamentos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">32</p>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {(totalPending / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Em Negociação</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                R$ {(totalApproved / 1000).toFixed(0)}k
              </p>
              <p className="text-xs text-muted-foreground">Valor Aprovado</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar orçamentos..." className="pl-9 w-64 bg-secondary" />
        </div>
        <Button variant="gradient">
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Budgets Table */}
      <ChartCard title="Lista de Orçamentos" subtitle="Todas as propostas enviadas">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orçamento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Data Evento</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgets.map((budget) => {
              const status = statusConfig[budget.status as keyof typeof statusConfig];
              const StatusIcon = status.icon;

              return (
                <TableRow key={budget.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground">{budget.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{budget.client}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-success">
                      R$ {budget.value.toLocaleString("pt-BR")}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(budget.date).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(budget.validUntil).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ChartCard>
    </Layout>
  );
}

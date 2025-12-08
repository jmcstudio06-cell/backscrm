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
  Clock,
  Send,
  PenTool,
  Download,
  Eye,
  MoreVertical,
  FileSignature,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const contracts = [
  {
    id: 1,
    title: "Casamento Silva & Santos",
    client: "Maria Silva",
    value: 8500,
    date: "2024-12-15",
    status: "signed",
    createdAt: "2024-11-20",
  },
  {
    id: 2,
    title: "Evento Corporativo TechCorp",
    client: "João Mendes",
    value: 12000,
    date: "2024-12-18",
    status: "sent",
    createdAt: "2024-11-25",
  },
  {
    id: 3,
    title: "Formatura Medicina USP",
    client: "Ana Costa",
    value: 15000,
    date: "2024-12-28",
    status: "pending",
    createdAt: "2024-12-01",
  },
  {
    id: 4,
    title: "Aniversário 50 anos",
    client: "Carlos Oliveira",
    value: 6800,
    date: "2024-12-22",
    status: "draft",
    createdAt: "2024-12-05",
  },
];

const templates = [
  { name: "Contrato Padrão - Casamento", uses: 45 },
  { name: "Contrato Padrão - Corporativo", uses: 32 },
  { name: "Contrato Padrão - Formatura", uses: 28 },
  { name: "Contrato Padrão - Aniversário", uses: 21 },
];

const statusConfig = {
  draft: { label: "Rascunho", color: "bg-muted text-muted-foreground", icon: FileText },
  pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  sent: { label: "Enviado", color: "bg-accent/10 text-accent border-accent/20", icon: Send },
  signed: { label: "Assinado", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
};

export default function Contratos() {
  return (
    <Layout title="Contratos" subtitle="Gerencie seus contratos e documentos">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">156</p>
              <p className="text-xs text-muted-foreground">Total de Contratos</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">124</p>
              <p className="text-xs text-muted-foreground">Assinados</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">18</p>
              <p className="text-xs text-muted-foreground">Enviados</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl glass">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">14</p>
              <p className="text-xs text-muted-foreground">Aguardando</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Actions Bar */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Buscar contratos..." className="pl-9 w-64 bg-secondary" />
            </div>
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>

          {/* Contracts Table */}
          <ChartCard title="Contratos Recentes" subtitle="Últimos contratos criados">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Data Evento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => {
                  const status = statusConfig[contract.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileSignature className="w-5 h-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{contract.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{contract.client}</TableCell>
                      <TableCell>
                        <span className="font-semibold text-success">
                          R$ {contract.value.toLocaleString("pt-BR")}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(contract.date).toLocaleDateString("pt-BR")}
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Templates */}
          <ChartCard title="Modelos Prontos" subtitle="Use templates para agilizar">
            <div className="space-y-3">
              {templates.map((template, index) => (
                <button
                  key={index}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{template.name}</span>
                  </div>
                  <Badge variant="secondary">{template.uses}</Badge>
                </button>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Criar Modelo
            </Button>
          </ChartCard>

          {/* Quick Actions */}
          <ChartCard title="Ações Rápidas">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <PenTool className="w-4 h-4 mr-2" />
                Assinar Contrato
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Send className="w-4 h-4 mr-2" />
                Enviar para Cliente
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
            </div>
          </ChartCard>
        </div>
      </div>
    </Layout>
  );
}

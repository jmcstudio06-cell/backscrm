import { useMemo, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CalendarClock, MapPin, MessageCircle, Search, Wallet } from "lucide-react";
import { useShows } from "@/contexts/shows/ShowsContext";
import { useClients } from "@/hooks/useClients";
import { normalizeShowStatus } from "@/lib/showStatus";
import { formatDateBR, parseLocalDate } from "@/lib/utils";

// Status cobráveis: shows passados que ainda têm valor a receber
// confirmed = show confirmado mas pagamento pendente (status mais comum)
// pending = pagamento pendente
// negotiation = em negociação
// partial = pagamento parcial (saldo restante)
const CHARGEABLE_STATUSES = new Set(["confirmed", "negotiation", "pending", "partial", "scheduled"]);

const STATUS_INFO: Record<string, { label: string; className: string }> = {
  confirmed:   { label: "Pagamento pendente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  scheduled:   { label: "Pagamento pendente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  negotiation: { label: "Em negociação",      className: "bg-amber-100 text-amber-700 border-amber-200" },
  pending:     { label: "Pagamento pendente", className: "bg-orange-100 text-orange-700 border-orange-200" },
  partial:     { label: "Pagamento parcial",  className: "bg-blue-100 text-blue-700 border-blue-200" },
};

const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2 });

interface Charge {
  id: string;
  title: string;
  venue: string | null;
  showDate: string;
  dueDate: string;
  status: string;
  amount: number;
  clientName: string | null;
  clientPhone: string | null;
  daysLate: number;
}

export default function Cobrancas() {
  const { shows, loading } = useShows();
  const { clients } = useClients();
  const [search, setSearch] = useState("");

  const charges = useMemo<Charge[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const clientById = new Map((clients || []).map((c) => [c.id, c]));

    return shows
      .filter((show) => {
        const status = normalizeShowStatus(show.status);
        if (!CHARGEABLE_STATUSES.has(status)) return false;
        const showDay = parseLocalDate(show.date);
        showDay.setHours(0, 0, 0, 0);
        return showDay.getTime() < today.getTime();
      })
      .map((show) => {
        const status = normalizeShowStatus(show.status);
        const cachet = Number(show.cachet) || 0;
        const advance = Number(show.advance_amount) || 0;

        // Parcial: somente o valor que ainda falta receber e a data do saldo.
        const amount = status === "partial" ? Math.max(cachet - advance, 0) : cachet;
        const dueDate = status === "partial" ? show.balance_due_date || show.date : show.date;

        const dueDay = parseLocalDate(dueDate);
        dueDay.setHours(0, 0, 0, 0);
        const daysLate = Math.max(0, Math.round((today.getTime() - dueDay.getTime()) / 86400000));

        const client = show.client_id ? clientById.get(show.client_id) : undefined;

        return {
          id: show.id,
          title: show.title,
          venue: show.venue,
          showDate: show.date,
          dueDate,
          status,
          amount,
          clientName: client?.name ?? null,
          clientPhone: client?.phone ?? null,
          daysLate,
        };
      })
      .filter((charge) => charge.amount > 0)
      // Mais atrasadas no topo (ordem crescente de dueDate = mais antiga primeiro)
      .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  }, [shows, clients]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return charges;
    return charges.filter((c) =>
      [c.title, c.venue ?? "", c.clientName ?? ""].some((v) => v.toLowerCase().includes(term)),
    );
  }, [charges, search]);

  const total = filtered.reduce((sum, c) => sum + c.amount, 0);
  const partialTotal = filtered
    .filter((c) => c.status === "partial")
    .reduce((sum, c) => sum + c.amount, 0);

  const whatsappLink = (charge: Charge) => {
    const digits = (charge.clientPhone || "").replace(/\D/g, "");
    if (!digits) return null;
    const phone = digits.length > 11 ? digits : `55${digits}`;
    const message = `Olá${charge.clientName ? `, ${charge.clientName}` : ""}! Passando para alinhar o pagamento do show "${charge.title}" do dia ${formatDateBR(charge.showDate)}. Valor a receber: ${formatBRL(charge.amount)}. Obrigado!`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <Layout title="Cobranças" subtitle="Valores de shows passados que ainda faltam receber">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Total a receber
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatBRL(total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Cobranças abertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{filtered.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CalendarClock className="w-4 h-4" /> Saldos parciais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatBRL(partialTotal)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por show, local ou cliente..."
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando cobranças...</div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">Nenhuma cobrança pendente por aqui. Tudo em dia!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((charge) => {
              const info = STATUS_INFO[charge.status] ?? {
                label: charge.status,
                className: "bg-muted text-muted-foreground",
              };
              const link = whatsappLink(charge);

              return (
                <Card key={charge.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold truncate">{charge.title}</p>
                        <Badge variant="outline" className={info.className}>{info.label}</Badge>
                      </div>
                      {charge.venue && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {charge.venue}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Show em {formatDateBR(charge.showDate)}
                        {charge.status === "partial" && ` • Saldo previsto para ${formatDateBR(charge.dueDate)}`}
                        {charge.daysLate > 0 && ` • ${charge.daysLate} dia${charge.daysLate > 1 ? "s" : ""} em atraso`}
                      </p>
                      {charge.clientName && (
                        <p className="text-xs text-muted-foreground">Cliente: {charge.clientName}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {charge.status === "partial" ? "Falta receber" : "A receber"}
                        </p>
                        <p className="text-lg font-bold text-primary">{formatBRL(charge.amount)}</p>
                      </div>
                      {link && (
                        <Button asChild variant="outline" size="sm" className="gap-1">
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="w-4 h-4" /> Cobrar
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}

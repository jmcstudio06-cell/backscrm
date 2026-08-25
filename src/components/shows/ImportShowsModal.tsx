import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useShows } from "@/contexts/shows/ShowsContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOwnerId } from "@/hooks/useWorkspace";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEMPLATE_HEADERS = [
  "titulo",
  "data",
  "hora_inicio",
  "hora_fim",
  "local",
  "endereco",
  "cachet",
  "status",
  "tipo_evento",
  "cliente",
  "observacoes",
];

const TEMPLATE_EXAMPLES = [
  ["Show Casamento João e Maria", "2026-06-15", "20:00", "23:00", "Espaço Villa", "Rua das Flores, 123 - SP", "3500", "confirmed", "Casamento", "Cerimônia + festa"],
  ["Show Aniversário 30 anos", "2026-07-20", "21:00", "01:00", "Buffet Estrela", "Av. Brasil, 500 - RJ", "2800", "confirmed", "Aniversário", ""],
  ["Show Realizado - Bar do Zé", "2026-04-10", "22:00", "02:00", "Bar do Zé", "", "1500", "completed", "Bar", "Pago via PIX"],
];

function toTitleCase(value: string): string {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((w) => (w.length > 2 ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ")
    .trim();
}

function normalizeName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}


const STATUS_MAP: Record<string, string> = {
  confirmado: "confirmed",
  confirmed: "confirmed",
  realizado: "completed",
  completed: "completed",
  finalizado: "completed",
  agendado: "scheduled",
  scheduled: "scheduled",
  negociacao: "negotiation",
  "negociação": "negotiation",
  negotiation: "negotiation",
  pendente: "pending",
  pending: "pending",
  cancelado: "cancelled",
  cancelled: "cancelled",
};

function parseDate(value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const m = v.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (m) {
    const d = m[1].padStart(2, "0");
    const mo = m[2].padStart(2, "0");
    let y = m[3];
    if (y.length === 2) y = "20" + y;
    return `${y}-${mo}-${d}`;
  }
  return null;
}

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === "," || c === ";") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function ImportShowsModal({ open, onOpenChange }: Props) {
  const { addShow } = useShows();
  const { user } = useAuth();
  const ownerId = useOwnerId();
  const queryClient = useQueryClient();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ ok: number; fail: number; errors: string[] } | null>(null);


  const downloadTemplate = () => {
    const sep = ";";
    // SECURITY/UX: a planilha modelo NÃO contém linhas de exemplo.
    // Isso evita que o usuário envie por engano dados fictícios para a própria agenda.
    const rows = [TEMPLATE_HEADERS];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(sep))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo-importar-shows.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Planilha modelo baixada! Preencha com seus shows e envie de volta.");
  };

  // Assinaturas das linhas de exemplo (título + endereço normalizados).
  // Linhas iguais a esses exemplos serão IGNORADAS na importação como salvaguarda
  // para usuários antigos que baixaram a versão anterior do modelo com exemplos.
  const EXAMPLE_SIGNATURES = new Set(
    TEMPLATE_EXAMPLES.map((row) => `${row[0]}|${row[5]}`.toLowerCase().trim()),
  );

  const handleFile = async (file: File) => {
    setImporting(true);
    setResult(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length < 2) {
        toast.error("Planilha vazia ou sem dados.");
        setImporting(false);
        return;
      }
      const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
      const idx = (key: string) => headers.indexOf(key);

      const iTitulo = idx("titulo");
      const iData = idx("data");
      const iIni = idx("hora_inicio");
      const iFim = idx("hora_fim");
      const iLocal = idx("local");
      const iEnd = idx("endereco");
      const iCachet = idx("cachet");
      const iStatus = idx("status");
      const iTipo = idx("tipo_evento");
      const iCliente = idx("cliente") >= 0 ? idx("cliente") : idx("nome_do_cliente");
      const iObs = idx("observacoes");

      if (iTitulo < 0 || iData < 0) {
        toast.error("Cabeçalhos obrigatórios faltando: 'titulo' e 'data'.");
        setImporting(false);
        return;
      }

      // Clientes já cadastrados (para reaproveitar em vez de duplicar).
      const clientMap = new Map<string, string>();
      const { data: existingClients } = await supabase.from("clients").select("id, name");
      (existingClients || []).forEach((c: any) => {
        if (c?.name) clientMap.set(normalizeName(c.name), c.id);
      });
      let createdClients = 0;

      const ensureClient = async (rawName: string): Promise<string | null> => {
        const key = normalizeName(rawName);
        if (!key) return null;
        const existing = clientMap.get(key);
        if (existing) return existing;
        const { data, error } = await supabase
          .from("clients")
          .insert([{ name: toTitleCase(rawName), user_id: ownerId ?? user?.id }])
          .select("id")
          .single();
        if (error || !data) return null;
        clientMap.set(key, data.id);
        createdClients++;
        return data.id;
      };

      let ok = 0;
      let fail = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        const titulo = (row[iTitulo] || "").trim();

        const dataStr = (row[iData] || "").trim();
        if (!titulo || !dataStr) { fail++; errors.push(`Linha ${r + 1}: título ou data faltando`); continue; }
        const date = parseDate(dataStr);
        if (!date) { fail++; errors.push(`Linha ${r + 1}: data inválida "${dataStr}"`); continue; }

        // Ignora linhas de exemplo do modelo antigo para evitar importação acidental.
        const endereco = iEnd >= 0 ? (row[iEnd] || "").trim() : "";
        const signature = `${titulo}|${endereco}`.toLowerCase().trim();
        if (EXAMPLE_SIGNATURES.has(signature)) {
          skipped++;
          continue;
        }

        const rawStatus = (iStatus >= 0 ? row[iStatus] : "").trim().toLowerCase();
        const status = STATUS_MAP[rawStatus] || "confirmed";

        try {
          await addShow({
            title: titulo,
            date,
            start_time: iIni >= 0 ? (row[iIni] || "").trim() || null : null,
            end_time: iFim >= 0 ? (row[iFim] || "").trim() || null : null,
            venue: iLocal >= 0 ? (row[iLocal] || "").trim() || null : null,
            address: iEnd >= 0 ? (row[iEnd] || "").trim() || null : null,
            cachet: iCachet >= 0 ? parseNumber(row[iCachet] || "") : 0,
            status,
            event_type: iTipo >= 0 ? (row[iTipo] || "").trim() || null : null,
            notes: iObs >= 0 ? (row[iObs] || "").trim() || null : null,
          });
          ok++;
        } catch (e: any) {
          fail++;
          errors.push(`Linha ${r + 1}: ${e?.message || "erro ao inserir"}`);
        }
      }

      setResult({ ok, fail, errors: errors.slice(0, 10) });
      if (ok > 0) toast.success(`${ok} show(s) importado(s) com sucesso!`);
      if (fail > 0) toast.error(`${fail} linha(s) com erro.`);
      if (skipped > 0) toast.info(`${skipped} linha(s) de exemplo do modelo foram ignoradas.`);
    } catch (e: any) {
      toast.error("Erro ao processar arquivo: " + (e?.message || ""));
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Importar Shows na Agenda
          </DialogTitle>
          <DialogDescription>
            Baixe a planilha modelo, preencha com seus shows e envie de volta para importar tudo de uma vez.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1 */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">1</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Baixe a planilha modelo</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Vem apenas com os cabeçalhos. Preencha com seus próprios shows usando Excel, Google Sheets ou qualquer editor de planilhas.
                </p>
                <Button onClick={downloadTemplate} variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Modelo CSV
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">2</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Preencha os dados</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Colunas obrigatórias: <code className="px-1 py-0.5 bg-background rounded text-xs">titulo</code> e <code className="px-1 py-0.5 bg-background rounded text-xs">data</code> (formato AAAA-MM-DD ou DD/MM/AAAA).
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>Status aceitos:</strong> confirmado, realizado, agendado, negociação, pendente, cancelado.</p>
                  <p><strong>Cachê:</strong> use apenas números (ex: 1500 ou 1.500,00).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">3</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Envie a planilha preenchida</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Aceita arquivos CSV (separador vírgula ou ponto-e-vírgula).
                </p>
                <label className="inline-flex">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    disabled={importing}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                      e.target.value = "";
                    }}
                  />
                  <Button asChild size="sm" disabled={importing}>
                    <span>
                      {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                      {importing ? "Importando..." : "Selecionar Arquivo CSV"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </div>

          {result && (
            <div className="rounded-xl border border-border/60 p-4 space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-green-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> {result.ok} importado(s)
                </span>
                {result.fail > 0 && (
                  <span className="flex items-center gap-1.5 text-destructive font-medium">
                    <AlertCircle className="w-4 h-4" /> {result.fail} com erro
                  </span>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className="text-xs text-muted-foreground space-y-0.5 max-h-32 overflow-y-auto">
                  {result.errors.map((e, i) => <div key={i}>• {e}</div>)}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

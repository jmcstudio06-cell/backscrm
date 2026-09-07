import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Copy,
  Check,
  ShieldAlert,
  Key,
  Download,
  Loader2,
  Code2,
  Database,
  AlertTriangle,
  Info,
} from "lucide-react";

interface MigrationTable {
  table_name: string;
  row_count: number;
  column_count: number;
  has_user_id: boolean;
  rls_enabled: boolean;
}

/** Código das edge functions embutido no build (sem chamadas de rede). */
const FUNCTION_SOURCES = import.meta.glob("/supabase/functions/**/*.ts", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const PROJECT_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

function functionNames(): string[] {
  const names = new Set<string>();
  Object.keys(FUNCTION_SOURCES).forEach((path) => {
    const match = path.match(/^\/supabase\/functions\/([^/]+)\//);
    if (match && match[1] !== "_shared") names.add(match[1]);
  });
  return [...names].sort();
}

function download(filename: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function classify(t: MigrationTable): { label: string; variant: "default" | "secondary" | "outline" } {
  if (/_log|_logs|history|historico|queue|visits|notifications_sent/i.test(t.table_name))
    return { label: "Histórico", variant: "secondary" };
  if (t.row_count === 0) return { label: "Ignorar", variant: "outline" };
  return { label: "Essencial", variant: "default" };
}

export function MigrationPanel() {
  const [tables, setTables] = useState<MigrationTable[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const fetchRows = async (table: string) => {
    const { data, error } = await supabase.rpc("admin_read_query", {
      sql_query: `select * from public."${table}"`,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown[];
  };

  const exportTable = async (table: string) => {
    setExporting(table);
    try {
      const rows = await fetchRows(table);
      download(`${table}.json`, JSON.stringify(rows, null, 2));
      toast({ title: `${table}: ${rows.length} registros baixados` });
    } catch (e) {
      toast({ title: `Erro em ${table}`, description: (e as Error).message, variant: "destructive" });
    }
    setExporting(null);
  };

  const exportAll = async () => {
    if (!tables) return;
    const out: Record<string, unknown[]> = {};
    for (const t of tables.filter((x) => x.row_count > 0)) {
      setExporting(t.table_name);
      try {
        out[t.table_name] = await fetchRows(t.table_name);
      } catch {
        out[t.table_name] = [];
      }
    }
    setExporting(null);
    download("dados-completos.json", JSON.stringify(out, null, 2));
    toast({ title: `${Object.keys(out).length} tabelas exportadas` });
  };


  const names = functionNames();

  const copy = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
    toast({ title: `${label} copiado` });
  };

  const loadTables = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_migration_tables");
    setLoading(false);
    if (error) {
      toast({ title: "Não foi possível carregar as tabelas", description: error.message, variant: "destructive" });
      return;
    }
    setTables((data ?? []) as MigrationTable[]);
    toast({ title: `${(data ?? []).length} tabelas encontradas` });
  };

  const downloadFunctions = () => {
    const parts = Object.entries(FUNCTION_SOURCES)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, code]) => `// ═══ ${path.replace("/supabase/functions/", "")} ═══\n\n${code}`);
    download("edge-functions.ts", parts.join("\n\n\n"));
    toast({ title: `${names.length} funções exportadas` });
  };

  const downloadTablesList = () => {
    if (!tables) return;
    const lines = tables.map(
      (t) =>
        `${t.table_name}\t${t.row_count} registros\t${t.column_count} campos\t${
          t.has_user_id ? "por usuário" : "geral"
        }\t${classify(t).label}`,
    );
    download("tabelas.txt", `tabela\tregistros\tcampos\tescopo\tclassificação\n${lines.join("\n")}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Painel de Migração
          </CardTitle>
          <CardDescription>
            Reúne, na ordem, o que você precisa para recriar este projeto em outro Supabase. Visível apenas para você.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={loadTables} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Carregar tabelas
          </Button>
          <Button variant="outline" onClick={downloadFunctions}>
            <Download className="h-4 w-4 mr-2" /> Baixar edge-functions.ts
          </Button>
        </CardContent>
      </Card>

      {/* Passo 1 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" /> Passo 1 — Endereço do projeto
          </CardTitle>
          <CardDescription>
            Estes dois valores são públicos e podem ser copiados. A chave secreta do banco não fica disponível aqui —
            você a pega direto no projeto de destino.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Project URL", value: PROJECT_URL },
            { label: "Anon Key", value: ANON_KEY },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 rounded-lg border p-2">
              <span className="text-sm font-medium w-28 shrink-0">{item.label}</span>
              <code className="text-xs truncate flex-1">{item.value}</code>
              <Button size="icon" variant="ghost" onClick={() => copy(item.label, item.value)}>
                {copied === item.label ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Passo 2 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4" /> Passo 2 — Funções ({names.length})
          </CardTitle>
          <CardDescription>Baixe o código de todas as funções em um único arquivo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {names.map((n) => (
              <Badge key={n} variant="secondary" className="font-mono text-[11px]">
                {n}
              </Badge>
            ))}
          </div>
          <Button variant="outline" onClick={downloadFunctions}>
            <Download className="h-4 w-4 mr-2" /> Baixar edge-functions.ts
          </Button>
        </CardContent>
      </Card>

      {/* Passo 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-4 w-4" /> Passo 3 — Chaves e senhas de serviços
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p className="flex gap-2">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            Os valores das chaves (pagamentos, e-mail, notificações) não são exibidos em tela por segurança. No projeto
            de destino você cadastra cada uma novamente com o mesmo nome, pegando o valor no painel de cada serviço.
          </p>
          <p className="flex gap-2">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            Depois de migrar, atualize a URL do webhook de pagamento para o endereço novo, senão as ativações param.
          </p>
        </CardContent>
      </Card>

      {/* Passo 4 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4" /> Passo 4 — Conferência das tabelas
            {tables && <Badge variant="outline">{tables.length}</Badge>}
          </CardTitle>
          <CardDescription>Use para confirmar que tudo chegou no destino com a mesma quantidade.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!tables ? (
            <Button onClick={loadTables} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Carregar tabelas
            </Button>
          ) : (
            <>
              <div className="max-h-80 overflow-auto rounded-lg border divide-y">
                {tables.map((t) => {
                  const c = classify(t);
                  return (
                    <div key={t.table_name} className="flex items-center gap-2 p-2 text-sm">
                      <span className="font-mono text-xs flex-1 truncate">{t.table_name}</span>
                      <span className="text-xs text-muted-foreground">{t.row_count} reg.</span>
                      <span className="text-xs text-muted-foreground">{t.column_count} campos</span>
                      <Badge variant={c.variant} className="text-[10px]">
                        {c.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <Button variant="outline" onClick={downloadTablesList}>
                <Download className="h-4 w-4 mr-2" /> Baixar lista
              </Button>
            </>
          )}
          <p className="text-xs text-muted-foreground flex gap-2">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            As senhas dos usuários viajam criptografadas e continuam válidas no destino; as pessoas que estiverem
            logadas podem precisar entrar de novo.
          </p>
        </CardContent>
      </Card>

      {/* Passo 5 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4" /> Passo 5 — Exportar o conteúdo das tabelas
          </CardTitle>
          <CardDescription>
            Baixe os registros de cada tabela em arquivo (até 5.000 por vez) para conferir ou importar no destino.
            Somente leitura: nada é alterado aqui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!tables ? (
            <Button onClick={loadTables} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Carregar tabelas
            </Button>
          ) : (
            <div className="max-h-80 overflow-auto rounded-lg border divide-y">
              {tables
                .filter((t) => t.row_count > 0)
                .map((t) => (
                  <div key={t.table_name} className="flex items-center gap-2 p-2 text-sm">
                    <span className="font-mono text-xs flex-1 truncate">{t.table_name}</span>
                    <span className="text-xs text-muted-foreground">{t.row_count} reg.</span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={exporting === t.table_name}
                      onClick={() => exportTable(t.table_name)}
                    >
                      {exporting === t.table_name ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                ))}
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" disabled={!tables || exporting !== null} onClick={exportAll}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Baixar tudo em um arquivo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


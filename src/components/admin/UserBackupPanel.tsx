import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, Search, Loader2 } from "lucide-react";

interface ProfileRow {
  user_id: string;
  name: string | null;
  artist_name: string | null;
  email: string | null;
  plan: string | null;
}

const currency = (v: unknown) => Number(v ?? 0);

function slug(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function UserBackupPanel() {
  const [search, setSearch] = useState("");
  const [exportingId, setExportingId] = useState<string | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-backup-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, name, artist_name, email, plan")
        .order("created_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as ProfileRow[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return profiles.slice(0, 30);
    return profiles
      .filter((p) =>
        [p.artist_name, p.name, p.email].some((v) => v?.toLowerCase().includes(term)),
      )
      .slice(0, 30);
  }, [profiles, search]);

  const handleExport = async (profile: ProfileRow) => {
    setExportingId(profile.user_id);
    try {
      const { data, error } = await supabase.functions.invoke("admin-export-user-data", {
        body: { userId: profile.user_id },
      });
      if (error) throw error;

      const shows = (data?.shows ?? []) as Record<string, unknown>[];
      const transactions = (data?.transactions ?? []) as Record<string, unknown>[];

      const showsSheet = shows.map((s) => ({
        Data: s.date ?? "",
        Hora: s.start_time ?? "",
        Evento: s.title ?? "",
        Tipo: s.event_type ?? "",
        Local: s.venue ?? "",
        Cidade: s.address ?? "",
        Status: s.status ?? "",
        "Cachê (R$)": currency(s.cachet),
        "Sinal (R$)": currency(s.advance_amount),
        Observações: s.notes ?? "",
      }));

      const txSheet = transactions.map((t) => ({
        Data: t.date ?? "",
        Tipo: t.type === "income" ? "Entrada" : "Saída",
        Categoria: t.category ?? "",
        Descrição: t.description ?? "",
        "Valor (R$)": currency(t.amount),
        Sinal: t.is_advance_payment ? "Sim" : "Não",
      }));

      const totalIn = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + currency(t.amount), 0);
      const totalOut = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + currency(t.amount), 0);

      const resumo = [
        { Informação: "Artista", Valor: profile.artist_name || profile.name || "" },
        { Informação: "E-mail", Valor: profile.email || "" },
        { Informação: "Plano", Valor: profile.plan || "" },
        { Informação: "Total de shows", Valor: shows.length },
        { Informação: "Entradas (R$)", Valor: totalIn },
        { Informação: "Saídas (R$)", Valor: totalOut },
        { Informação: "Saldo (R$)", Valor: totalIn - totalOut },
        { Informação: "Gerado em", Valor: new Date().toLocaleString("pt-BR") },
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumo), "Resumo");
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(showsSheet.length ? showsSheet : [{ Data: "", Evento: "Sem shows" }]),
        "Agenda",
      );
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(txSheet.length ? txSheet : [{ Data: "", Descrição: "Sem lançamentos" }]),
        "Financeiro",
      );

      const name = slug(profile.artist_name || profile.name || profile.email || "artista");
      XLSX.writeFile(wb, `backup-${name}-${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Backup gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível gerar o backup deste artista.");
    } finally {
      setExportingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Backup por artista (Agenda + Financeiro)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            className="pl-9"
          />
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando artistas...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum artista encontrado.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {filtered.map((p) => (
              <div key={p.user_id} className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {p.artist_name || p.name || "Sem nome"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.email} {p.plan ? `· ${p.plan}` : ""}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExport(p)}
                  disabled={exportingId === p.user_id}
                >
                  {exportingId === p.user_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span className="ml-1.5 hidden sm:inline">Excel</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

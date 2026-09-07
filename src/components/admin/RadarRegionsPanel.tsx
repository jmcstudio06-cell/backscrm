import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RegionPicker } from "@/components/radar/RegionPicker";
import { toast } from "sonner";
import { Loader2, MapPin, Radar, Search, Pencil } from "lucide-react";

interface RadarProfile {
  id: string;
  user_id: string;
  name: string | null;
  artist_name: string | null;
  email: string | null;
  plan: string | null;
  radar_state: string | null;
  radar_city: string | null;
  radar_cep: string | null;
}

export function RadarRegionsPanel() {
  const [rows, setRows] = useState<RadarProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<RadarProfile | null>(null);
  const [draft, setDraft] = useState({ state: "", city: "", cep: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, name, artist_name, email, plan, radar_state, radar_city, radar_cep")
      .in("plan", ["mensal_executivo", "anual_executivo"])
      .order("radar_city", { ascending: true });
    if (error) toast.error("Erro ao carregar regiões");
    else setRows((data ?? []) as RadarProfile[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (row: RadarProfile) => {
    setEditing(row);
    setDraft({
      state: row.radar_state ?? "",
      city: row.radar_city ?? "",
      cep: row.radar_cep ?? "",
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!draft.state || !draft.city) {
      toast.error("Selecione estado e cidade");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        radar_state: draft.state,
        radar_city: draft.city,
        radar_cep: draft.cep.replace(/\D/g, "") || null,
        radar_configured_at: new Date().toISOString(),
      })
      .eq("user_id", editing.user_id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar região");
      return;
    }
    toast.success("Região atualizada");
    setEditing(null);
    load();
  };

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [r.name, r.artist_name, r.email, r.radar_city, r.radar_state]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q));
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Radar className="h-4 w-4 text-primary" /> Regiões do Backs Radar
        </CardTitle>
        <CardDescription>
          Artistas do plano Executivo e a região configurada para as buscas de contatos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por artista, e-mail ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum artista do plano Executivo encontrado.
          </p>
        ) : (
          <div className="space-y-2">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/60 p-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {row.artist_name || row.name || "Sem nome"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{row.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {row.radar_city ? `${row.radar_city} / ${row.radar_state}` : "Não configurada"}
                  </span>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => openEdit(row)}>
                    <Pencil className="h-3.5 w-3.5" /> Alterar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Região de {editing?.artist_name || editing?.name || "artista"}
            </DialogTitle>
          </DialogHeader>
          <RegionPicker
            state={draft.state}
            city={draft.city}
            cep={draft.cep}
            onChange={setDraft}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1.5" />}
              Salvar região
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

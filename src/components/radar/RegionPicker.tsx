import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MapPin, Search } from "lucide-react";
import { toast } from "sonner";

export const UF_LIST = [
  { uf: "AC", name: "Acre" },
  { uf: "AL", name: "Alagoas" },
  { uf: "AP", name: "Amapá" },
  { uf: "AM", name: "Amazonas" },
  { uf: "BA", name: "Bahia" },
  { uf: "CE", name: "Ceará" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "GO", name: "Goiás" },
  { uf: "MA", name: "Maranhão" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PA", name: "Pará" },
  { uf: "PB", name: "Paraíba" },
  { uf: "PR", name: "Paraná" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "PI", name: "Piauí" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "RO", name: "Rondônia" },
  { uf: "RR", name: "Roraima" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "SP", name: "São Paulo" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
];

const cityCache = new Map<string, string[]>();

export async function fetchCities(uf: string): Promise<string[]> {
  if (cityCache.has(uf)) return cityCache.get(uf)!;
  const res = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  if (!res.ok) throw new Error("IBGE request failed");
  const data = (await res.json()) as Array<{ nome: string }>;
  const names = data.map((c) => c.nome).sort((a, b) => a.localeCompare(b, "pt-BR"));
  cityCache.set(uf, names);
  return names;
}

const normalize = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

interface RegionPickerProps {
  state: string;
  city: string;
  cep?: string;
  onChange: (value: { state: string; city: string; cep: string }) => void;
}

export function RegionPicker({ state, city, cep = "", onChange }: RegionPickerProps) {
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [cepLoading, setCepLoading] = useState(false);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    let active = true;
    setLoadingCities(true);
    fetchCities(state)
      .then((list) => {
        if (active) setCities(list);
      })
      .catch(() => {
        if (active) toast.error("Não foi possível carregar as cidades");
      })
      .finally(() => {
        if (active) setLoadingCities(false);
      });
    return () => {
      active = false;
    };
  }, [state]);

  const filtered = useMemo(() => {
    const q = normalize(cityQuery.trim());
    const list = q ? cities.filter((c) => normalize(c).includes(q)) : cities;
    return list.slice(0, 200);
  }, [cities, cityQuery]);

  const lookupCep = async (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data?.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      onChange({ state: data.uf, city: data.localidade, cep: digits });
      setCityQuery("");
      toast.success(`${data.localidade} / ${data.uf}`);
    } catch {
      toast.error("Não foi possível consultar o CEP");
    } finally {
      setCepLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Estado</Label>
          <Select
            value={state}
            onValueChange={(uf) => {
              setCityQuery("");
              onChange({ state: uf, city: "", cep });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {UF_LIST.map((s) => (
                <SelectItem key={s.uf} value={s.uf}>
                  {s.name} ({s.uf})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">CEP (opcional, preenche automático)</Label>
          <div className="relative">
            <Input
              value={cep}
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
              onChange={(e) => onChange({ state, city, cep: e.target.value })}
              onBlur={(e) => lookupCep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") lookupCep((e.target as HTMLInputElement).value);
              }}
            />
            {cepLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Cidade</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={cityQuery}
            disabled={!state}
            placeholder={state ? "Digite as primeiras letras da cidade" : "Escolha o estado primeiro"}
            onChange={(e) => setCityQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {city && (
          <p className="text-xs text-primary flex items-center gap-1.5 pt-1">
            <MapPin className="h-3.5 w-3.5" />
            Selecionada: <span className="font-semibold">{city} / {state}</span>
          </p>
        )}

        {state && (
          <div className="mt-2 max-h-56 overflow-y-auto rounded-xl border divide-y">
            {loadingCities ? (
              <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando cidades...
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">Nenhuma cidade encontrada</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onChange({ state, city: c, cep })}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                    c === city ? "bg-primary/10 font-semibold text-primary" : ""
                  }`}
                >
                  {c}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

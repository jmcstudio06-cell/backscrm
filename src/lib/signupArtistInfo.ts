import { z } from "zod";

export const BRAZIL_STATES = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"] as const;
export const MONTHLY_SHOW_RANGES = ["0 a 2", "2 a 5", "5 a 10", "10 a 15", "Mais de 15"] as const;
export const signupArtistInfoSchema = z.object({
  city: z.string().trim().min(2, "Informe sua cidade.").max(100).regex(/^[\p{L}\s'.-]+$/u, "Informe uma cidade válida."),
  state: z.enum(BRAZIL_STATES, { errorMap: () => ({ message: "Selecione seu estado." }) }),
  monthly_show_range: z.enum(MONTHLY_SHOW_RANGES, { errorMap: () => ({ message: "Selecione sua média mensal de shows." }) }),
});
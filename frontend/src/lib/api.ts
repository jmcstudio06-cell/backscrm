import { toast } from "sonner";

export const API_BASE_URL = "https://backscrm.onrender.com";
const TOKEN_KEY = "bzc_token";
const USER_KEY = "bzc_user";

export type LicenseStatus = "active" | "expired" | "trial";
export type Plan = "mensal" | "trimestral" | "anual" | null;

export interface User {
  id: string;
  _id?: string;
  email: string;
  role?: "admin" | "user";
  plan?: Plan;
  status?: LicenseStatus;
  expiresAt?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as User; } catch { return null; }
}
export function setAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("bzc-auth-change"));
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (typeof window !== "undefined") window.dispatchEvent(new Event("bzc-auth-change"));
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (e) {
    throw new ApiError("Falha de conexão com o servidor. Tente novamente.", 0);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (res.status === 401 ? "Credenciais inválidas ou sessão expirada." :
       res.status === 404 ? "Recurso não encontrado." :
       `Erro ${res.status}`);
    if (res.status === 401) clearAuth();
    throw new ApiError(message, res.status);
  }
  return data as T;
}

function safeJson(text: string) {
  try { return JSON.parse(text); } catch { return text; }
}

export function showApiError(e: unknown, fallback = "Algo deu errado") {
  const msg = e instanceof Error ? e.message : fallback;
  toast.error(msg);
}


import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  clearing: boolean;
}

const RELOAD_FLAG = "bp_error_auto_reloaded";

async function clearAllCachesAndReload() {
  try {
    // Unregister service workers
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    // Clear CacheStorage
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
    // Clear storages (preserve supabase auth)
    try {
      const preserve: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith("sb-") || k.includes("supabase"))) {
          preserve[k] = localStorage.getItem(k) ?? "";
        }
      }
      localStorage.clear();
      Object.entries(preserve).forEach(([k, v]) => localStorage.setItem(k, v));
    } catch {}
    try {
      sessionStorage.clear();
    } catch {}
  } catch (e) {
    console.error("[ErrorBoundary] Falha ao limpar cache:", e);
  } finally {
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
  }
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, clearing: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, clearing: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Limpa cache e recarrega automaticamente (apenas 1x por sessão para evitar loop)
    const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
    if (!alreadyReloaded) {
      this.setState({ clearing: true });
      void clearAllCachesAndReload();
    }
  }

  handleRetry = () => {
    sessionStorage.removeItem(RELOAD_FLAG);
    this.setState({ clearing: true });
    void clearAllCachesAndReload();
  };

  render() {
    if (this.state.hasError) {
      if (this.state.clearing) {
        return (
          <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full text-center space-y-4">
              <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
              <h2 className="text-lg font-semibold text-foreground">
                Atualizando o app...
              </h2>
              <p className="text-sm text-muted-foreground">
                Estamos limpando o cache e recarregando automaticamente.
              </p>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              {this.props.fallbackMessage || "Ops! Algo deu errado"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Vamos limpar o cache e recarregar pra resolver.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Limpar cache e recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

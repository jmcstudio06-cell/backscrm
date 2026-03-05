import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">
              {this.props.fallbackMessage || "Ops! Algo deu errado"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar novamente
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Ir ao Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

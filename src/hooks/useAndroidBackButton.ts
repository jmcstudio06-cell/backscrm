import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Gerencia o botão "voltar" físico do Android quando o app roda via Capacitor.
 *
 * Comportamento:
 * - Se houver histórico de navegação → volta para a página anterior (history.back)
 * - Se estiver na rota raiz/dashboard → mostra confirmação de saída
 * - Não faz nada no browser web normal (só ativa no Android nativo)
 */
export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Só registra o listener se estiver rodando dentro do Capacitor
    const isCapacitor =
      typeof (window as any).Capacitor !== "undefined" &&
      (window as any).Capacitor.isNativePlatform?.();

    if (!isCapacitor) return;

    let cleanup: (() => void) | undefined;

    const setup = async () => {
      try {
        const { App } = await import("@capacitor/app");

        const rootRoutes = ["/", "/dashboard", "/auth"];
        const isRoot = rootRoutes.includes(location.pathname);

        const handle = await App.addListener("backButton", ({ canGoBack }) => {
          if (!isRoot && canGoBack) {
            // Volta no histórico do React Router
            navigate(-1);
          } else if (!isRoot) {
            // Sem histórico mas não está na raiz → vai para dashboard
            navigate("/dashboard", { replace: true });
          } else {
            // Na raiz: minimiza o app (não fecha)
            App.minimizeApp();
          }
        });

        cleanup = () => handle.remove();
      } catch (err) {
        // Plugin não disponível no ambiente web — ignora silenciosamente
        console.debug("[BackButton] Plugin @capacitor/app não disponível:", err);
      }
    };

    setup();
    return () => cleanup?.();
  }, [location.pathname, navigate]);
}

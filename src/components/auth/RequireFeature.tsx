import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Props {
  featureKey: string;
  children: ReactNode;
}

export function RequireFeature({ featureKey, children }: Props) {
  const { isBlocked, loading } = useFeatureBlocks();
  const { isMember, allowedFeatures } = useWorkspace();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isBlocked(featureKey)) {
    // Team members never see the upsell — send them to a tab they can use.
    if (isMember) {
      const fallback = (allowedFeatures ?? []).find((f) => f !== featureKey);
      const target =
        fallback === "dashboard" || !fallback
          ? "/dashboard"
          : fallback === "ideias-post"
            ? "/planejamento-conteudo"
            : `/${fallback}`;
      return <Navigate to={target} replace />;
    }
    return <Navigate to="/planos" replace state={{ blockedFeature: featureKey }} />;
  }

  return <>{children}</>;
}

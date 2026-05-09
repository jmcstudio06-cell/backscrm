import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";

interface Props {
  featureKey: string;
  children: ReactNode;
}

export function RequireFeature({ featureKey, children }: Props) {
  const { isBlocked, loading } = useFeatureBlocks();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (isBlocked(featureKey)) {
    return <Navigate to="/planos" replace state={{ blockedFeature: featureKey }} />;
  }

  return <>{children}</>;
}

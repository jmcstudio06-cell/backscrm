import { useMemo, useState, type ImgHTMLAttributes, type ReactNode } from "react";

type SafeImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  srcCandidates: Array<string | null | undefined>;
  fallback?: ReactNode;
};

export function SafeImage({
  srcCandidates,
  fallback = null,
  onError,
  loading,
  decoding,
  ...imgProps
}: SafeImageProps) {
  const candidates = useMemo(
    () =>
      srcCandidates
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean),
    [srcCandidates]
  );

  const [index, setIndex] = useState(0);

  if (candidates.length === 0 || index >= candidates.length) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...imgProps}
      src={candidates[index]}
      loading={loading ?? "lazy"}
      decoding={decoding ?? "async"}
      onError={(e) => {
        setIndex((i) => (i + 1 >= candidates.length ? candidates.length : i + 1));
        onError?.(e);
      }}
    />
  );
}

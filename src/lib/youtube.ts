export function normalizeUrl(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  return trimmed.length ? trimmed : null;
}

export function extractYouTubeVideoId(url: string | null | undefined): string | null {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;

  // If it's already an embed URL
  const embedMatch = normalized.match(/youtube\.com\/embed\/([^&\n?#/]+)/);
  if (embedMatch?.[1]) return embedMatch[1];

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#/]+)/,
    /youtube\.com\/shorts\/([^&\n?#/]+)/,
    /youtube\.com\/live\/([^&\n?#/]+)/,
    /m\.youtube\.com\/watch\?v=([^&\n?#/]+)/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function getYouTubeThumbnailCandidates(url: string | null | undefined): string[] {
  const id = extractYouTubeVideoId(url);
  if (!id) return [];

  // Order matters: try best quality first and fall back if 404.
  const sizes = ["maxresdefault", "hqdefault", "mqdefault", "default"] as const;
  return sizes.map((s) => `https://img.youtube.com/vi/${id}/${s}.jpg`);
}

export function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  const id = extractYouTubeVideoId(url);
  if (!id) return null;
  return `https://www.youtube.com/embed/${id}?autoplay=1`;
}

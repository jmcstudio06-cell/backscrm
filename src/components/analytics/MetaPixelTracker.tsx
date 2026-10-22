import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/metaPixel";

/** Registers a PageView on every route change (the app is a single-page app). */
export function MetaPixelTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}

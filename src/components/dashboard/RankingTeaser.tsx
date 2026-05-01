import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronRight, Instagram } from "lucide-react";

const INSTAGRAM_POST_URL = "https://www.instagram.com/p/DXxfzcmD55S/";

export function RankingTeaser() {
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc("get_monthly_show_ranking");
      if (data && data.length > 0) setHasData(true);
    };
    fetch();
  }, []);

  if (!hasData) return null;

  return (
    <a
      href={INSTAGRAM_POST_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500/10 via-fuchsia-500/10 to-purple-500/10 border border-pink-500/20 p-4 text-left transition-all hover:shadow-elevated hover:border-pink-500/40 flex items-center gap-3"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md flex-shrink-0">
        <Instagram className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400">
          Confira no Instagram
        </p>
        <p className="text-sm font-bold text-foreground truncate">
          TOP 3 do ranking de Abril
        </p>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
    </a>
  );
}

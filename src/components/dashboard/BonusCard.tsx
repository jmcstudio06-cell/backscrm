import { Gift, ArrowRight, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function BonusCard() {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30 border-sky-200 dark:border-sky-800 p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/50">
          <Gift className="w-6 h-6 text-sky-600 dark:text-sky-400" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
            Ganhe Bônus
          </h3>
        </div>
      </div>

      {/* Content */}
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 leading-relaxed">
        Convide outros artistas e ganhe bônus exclusivos.
      </p>

      {/* CTA */}
      <Link to="/indicacoes">
        <Button 
          className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white group"
        >
          <Users className="w-4 h-4 mr-2" />
          Indicar e Ganhar
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </Link>
    </div>
  );
}

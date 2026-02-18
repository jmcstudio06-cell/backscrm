import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  Shield,
  HeadphonesIcon,
  XCircle,
  Quote,
  AlertTriangle,
  Sparkles,
  Briefcase,
  Crown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/layout/AppLogo";

/* LINKS MENSAIS */
const STARTER_URL = "https://invoice.infinitepay.io/plans/backstagegroup/7HAAjraSOn";
const PRO_URL = "https://invoice.infinitepay.io/plans/backstagegroup/o81tUzQqP";
const FULL_URL = "https://invoice.infinitepay.io/plans/backstagegroup/j7EFHeAeZ";

/* LINKS ANUAIS */
const STARTER_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/jHWwPyTRH";
const PRO_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/62KukbQ1H";
const FULL_YEARLY_URL = "https://invoice.infinitepay.io/plans/backstagegroup/CZrFywU7b";

export default function Planos() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <Layout title="" subtitle="">
      <div className="pt-8 pb-16">
        {/* TOGGLE GLOBAL */}
        <div className="flex justify-center mb-10">
          <div className="flex bg-muted p-1 rounded-full border">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                !isYearly ? "bg-white shadow text-foreground" : "text-muted-foreground",
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                isYearly ? "bg-white shadow text-foreground" : "text-muted-foreground",
              )}
            >
              Anual 🔥
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {/* STARTER */}
            <Card className="rounded-3xl border shadow-xl flex flex-col">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2">Starter</h3>

                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{isYearly ? "R$ 199,90" : "R$ 19,90"}</span>
                    <span className="text-sm text-muted-foreground mb-1">{isYearly ? "/ano" : "/mês"}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {isYearly ? "Cobrança anual." : "Cobrança mensal pré-paga."}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button
                    className="w-full rounded-2xl"
                    onClick={() => window.open(isYearly ? STARTER_YEARLY_URL : STARTER_URL, "_blank")}
                  >
                    Escolher Starter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PROFISSIONAL */}
            <Card className="rounded-3xl border shadow-xl flex flex-col">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2">Profissional</h3>

                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{isYearly ? "R$ 298,80" : "R$ 34,90"}</span>
                    <span className="text-sm text-muted-foreground mb-1">{isYearly ? "/ano" : "/mês"}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {isYearly ? "Cobrança anual." : "Cobrança mensal pré-paga."}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button
                    className="w-full rounded-2xl"
                    onClick={() => window.open(isYearly ? PRO_YEARLY_URL : PRO_URL, "_blank")}
                  >
                    Escolher Profissional
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* COMPLETO */}
            <Card className="rounded-3xl border shadow-xl flex flex-col">
              <CardContent className="p-8 flex flex-col h-full">
                <h3 className="text-xl font-bold mb-2">Completo</h3>

                <div className="mb-6">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-bold">{isYearly ? "R$ 418,80" : "R$ 49,99"}</span>
                    <span className="text-sm text-muted-foreground mb-1">{isYearly ? "/ano" : "/mês"}</span>
                  </div>

                  <p className="text-xs text-muted-foreground mt-1">
                    {isYearly ? "Cobrança anual." : "Cobrança mensal pré-paga."}
                  </p>
                </div>

                <div className="mt-auto">
                  <Button
                    className="w-full rounded-2xl"
                    onClick={() => window.open(isYearly ? FULL_YEARLY_URL : FULL_URL, "_blank")}
                  >
                    Escolher Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

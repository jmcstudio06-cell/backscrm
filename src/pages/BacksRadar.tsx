import { Layout } from "@/components/layout/Layout";
import { Radar, Sparkles, Rocket, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BacksRadar() {
  return (
    <Layout
      title="Backs Radar"
      subtitle="Descubra oportunidades, tendências e movimentação do mercado da música em um só lugar"
    >
      <div className="max-w-3xl mx-auto mt-8 sm:mt-12">
        <div className="relative overflow-hidden rounded-3xl border bg-card/80 backdrop-blur-xl p-8 sm:p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />

          <div className="relative">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
              <Radar className="h-10 w-10" />
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              Lançamento em breve
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              O Backs Radar está chegando
            </h1>

            <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
              Em breve você vai poder acompanhar oportunidades de shows, calendário de eventos,
              tendências do mercado e muito mais — tudo para impulsionar sua carreira artística.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="outline"
                className="rounded-full px-6 gap-2"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.open("https://www.instagram.com/backstageprooficiall/", "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <Rocket className="h-4 w-4" />
                Fique por dentro no Instagram
              </Button>
              <Button
                variant="ghost"
                className="rounded-full px-6 gap-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/dashboard";
                  }
                }}
              >
                <Bell className="h-4 w-4" />
                Voltar para o Dashboard
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Oportunidades de shows", value: "Em breve" },
            { label: "Tendências do mercado", value: "Em breve" },
            { label: "Conexões estratégicas", value: "Em breve" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border bg-card/60 backdrop-blur-md p-5 text-center"
            >
              <p className="text-2xl font-bold text-primary mb-1">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default function Planos() {
  return (
    <Layout title="" subtitle="">
      <div className="pt-4">
        {/* HERO */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="flex justify-center mb-4">
            <AppLogo size="lg" collapsed />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Organize sua carreira como uma empresa</h1>

          <p className="text-base md:text-lg text-muted-foreground">
            Menos improviso. Mais controle. Escolha um plano e comece hoje.
          </p>
        </div>

        {/* PLANS */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p) => (
              <Card
                key={p.id}
                className={cn(
                  "relative h-full overflow-hidden rounded-3xl transition-all duration-500 shadow-xl hover:-translate-y-2 hover:shadow-2xl",

                  p.id === "starter" && "bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200",

                  p.id === "pro" &&
                    "bg-gradient-to-br from-blue-100 via-white to-cyan-100 border-2 border-blue-500 scale-[1.02]",

                  p.id === "full" && "bg-gradient-to-br from-amber-50 via-white to-orange-100 border border-amber-300",
                )}
              >
                {p.badgeText && (
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-bold text-white shadow-md",
                        p.id === "pro" && "bg-blue-600",
                        p.id === "full" && "bg-amber-500",
                      )}
                    >
                      {p.badgeText}
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6 flex flex-col h-full">
                  {/* HEADER */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center">
                      <AppLogo size="sm" collapsed />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold">{p.name}</h3>
                      <p className="text-sm text-muted-foreground">{p.subtitle}</p>
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="mb-5">
                    <div className="flex items-end gap-2">
                      <span className="text-4xl font-bold">{p.price}</span>
                      <span className="text-sm text-muted-foreground mb-1">{p.period}</span>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      Cobrança mensal pré-paga. Cancele quando quiser.
                    </p>
                  </div>

                  {/* FEATURES */}
                  <div className="rounded-2xl bg-white/70 backdrop-blur-sm border border-border p-5 flex-1">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">O que inclui:</p>

                    <ul className="space-y-2">
                      {p.features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-sm">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA */}
                  <div className="mt-6">
                    <Button
                      size="lg"
                      className={cn(
                        "w-full rounded-xl text-white shadow-md transition-all duration-300",
                        p.id === "starter" && "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90",
                        p.id === "pro" && "bg-gradient-to-r from-blue-700 to-indigo-600 hover:opacity-90",
                        p.id === "full" && "bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90",
                      )}
                      onClick={() => window.open(p.url, "_blank")}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {p.buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </Button>

                    <p className="text-[11px] text-muted-foreground mt-2 text-center">
                      {p.highlight
                        ? "Recomendado para quem quer fechar mais shows."
                        : "Ideal para o seu momento atual."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

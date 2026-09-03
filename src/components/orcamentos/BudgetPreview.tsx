import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle, Printer } from "lucide-react";
import { Budget, BudgetItem } from "@/hooks/useBudgets";
import { formatDateBR } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { useCustomization, type BudgetTemplate } from "@/hooks/useCustomization";
import { toast } from "sonner";

interface BudgetPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget | null;
  items: BudgetItem[];
}

type ExportPreset = "print" | "phone";

export function BudgetPreview({ isOpen, onClose, budget, items }: BudgetPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const { settings } = useCustomization();

  if (!budget) return null;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const taxAmount = budget.subtotal * (budget.tax / 100);

  /**
   * ✅ Export sem distorção
   * - phone: IMAGEM A4 (mesmo visual do PDF), otimizada pro WhatsApp (1080px de largura, altura proporcional A4)
   * - print: A4 retrato (1 página)
   */
  const createExportStage = (preset: ExportPreset) => {
    const source = printRef.current;
    if (!source) return null;

    const stage = document.createElement("div");
    stage.style.position = "fixed";
    stage.style.left = "-99999px";
    stage.style.top = "0";
    stage.style.zIndex = "999999";
    stage.style.margin = "0";
    stage.style.padding = "0";
    stage.style.boxSizing = "border-box";
    stage.style.background = "#ffffff";

    // clone do conteúdo (não mexe na UI)
    const clone = source.cloneNode(true) as HTMLDivElement;
    clone.style.margin = "0";
    clone.style.boxSizing = "border-box";
    clone.style.background = "#ffffff";

    if (preset === "phone") {
      /**
       * ✅ WHATSAPP (A4-LIKE)
       */
      stage.style.width = "760px";
      stage.style.display = "block";

      clone.style.width = "760px";
      clone.style.minWidth = "760px";
      clone.style.maxWidth = "760px";
      clone.style.padding = "22px";

      stage.appendChild(clone);
      document.body.appendChild(stage);
      return stage;
    }

    /**
     * ✅ PRINT (A4 RETRATO)
     * Captura exatamente o visual da prévia (sem reflow manual)
     */
    const sourceWidth = Math.max(source.clientWidth, 760);
    stage.style.width = `${sourceWidth}px`;
    stage.style.display = "block";

    clone.style.width = `${sourceWidth}px`;
    clone.style.minWidth = `${sourceWidth}px`;
    clone.style.maxWidth = `${sourceWidth}px`;

    stage.appendChild(clone);
    document.body.appendChild(stage);
    return stage;
  };

  const renderToCanvas = async (preset: ExportPreset) => {
    const stage = createExportStage(preset);
    if (!stage) return null;

    try {
      const html2canvas = (await import("html2canvas")).default;

      // maior fidelidade no PDF para evitar layout "quebrado"
      const scale = preset === "phone" ? 3 : 3;

      const canvas = await html2canvas(stage, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      return canvas;
    } catch (error) {
      console.error("Erro ao renderizar canvas:", error);
      return null;
    } finally {
      stage.remove();
    }
  };

  const generateImage = async (preset: ExportPreset): Promise<Blob | null> => {
    const canvas = await renderToCanvas(preset);
    if (!canvas) return null;

    // ✅ WHATSAPP: exporta em A4 (igual PDF), largura 1080px, altura proporcional A4
    if (preset === "phone") {
      const targetW = 1080;
      // proporção A4 retrato = √2 ≈ 1.4142
      const targetH = Math.round(targetW * 1.41421356237); // ~1528

      const out = document.createElement("canvas");
      out.width = targetW;
      out.height = targetH;

      const ctx = out.getContext("2d");
      if (!ctx) return null;

      ctx.imageSmoothingEnabled = true;
      (ctx as any).imageSmoothingQuality = "high";

      // fundo branco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);

      // desenha "contain" e centraliza (igual PDF, sem cortar)
      const srcW = canvas.width;
      const srcH = canvas.height;

      const scale = Math.min(targetW / srcW, targetH / srcH);
      const drawW = Math.round(srcW * scale);
      const drawH = Math.round(srcH * scale);
      const dx = Math.round((targetW - drawW) / 2);
      const dy = Math.round((targetH - drawH) / 2);

      ctx.drawImage(canvas, dx, dy, drawW, drawH);

      return new Promise((resolve) => {
        out.toBlob((blob) => resolve(blob), "image/png", 1);
      });
    }

    // ✅ PRINT: mantém como está
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.98);
    });
  };

  /**
   * ✅ PDF A4 real (sem depender do print do navegador)
   */
  const handlePrintPDF = async () => {
    const source = printRef.current;
    if (!source) return;

    toast.loading("Preparando impressão...", { id: "pdf" });

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Permita pop-ups e tente novamente.", { id: "pdf" });
      return;
    }

    // Clone the actual HTML instead of using html2canvas (preserves flexbox alignment perfectly)
    const clonedHtml = source.outerHTML;

    win.document.open();
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Orçamento ${budget.budget_number}</title><style>*{margin:0;padding:0;box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4 portrait;margin:8mm}html,body{width:100%;font-family:'Segoe UI',Arial,sans-serif;background:#fff}#root{max-width:800px;margin:0 auto;padding:20px 0}table{border-collapse:collapse;width:100%}img{max-width:100%}</style></head><body><div id="root">${clonedHtml}</div><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
    win.document.close();

    toast.success("Abrindo impressão...", { id: "pdf" });
  };


  const artistName = profile?.name || "Sua Empresa";
  const artistEmail = profile?.email || "";
  const artistPhone = profile?.phone || "";
  const template = settings.budgetTemplate || "classico";

  // ✅ Color schemes per template
  const colors = {
    classico: { primary: "#6366f1", bg: "#ffffff", text: "#333", heading: "#1a1a2e", muted: "#888", row: "#fafafa", accent: "#f0f0ff", accentBorder: "#e0e0ff" },
    minimalista: { primary: "#8b7355", bg: "#faf9f7", text: "#4a4540", heading: "#2c2825", muted: "#9e9790", row: "#f5f3f0", accent: "#f0ede8", accentBorder: "#e5e0d8" },
    elegante: { primary: "#c9a84c", bg: "#ffffff", text: "#333", heading: "#1a1a2e", muted: "#888", row: "#f8f8f8", accent: "#1a1a2e", accentBorder: "#c9a84c" },
  };
  const c = colors[template];

  const thBase: React.CSSProperties = {
    color: template === "minimalista" ? c.primary : template === "elegante" ? "#ffffff" : "#fff",
    padding: 0,
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: template === "minimalista" ? 1.2 : 0.8,
    verticalAlign: "middle",
  };

  const thInner = (align: "left" | "right" | "center"): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center",
    minHeight: 44,
    padding: "2px 14px",
    lineHeight: 1.2,
    whiteSpace: "nowrap",
  });

  const renderHeader = () => {
    if (template === "minimalista") {
      return (
        <>
          {/* Warm refined header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: c.accent, border: `1px solid ${c.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Logo" style={{ width: 56, height: 56, objectFit: "cover", display: "block" }} crossOrigin="anonymous" />
                ) : (
                  <span style={{ color: c.primary, fontSize: 22, fontWeight: 600 }}>{artistName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: c.heading }}>{artistName}</div>
                <div style={{ fontSize: 11, color: c.muted, lineHeight: 1.5, marginTop: 2 }}>
                  {artistPhone && <span>{artistPhone}</span>}
                  {artistPhone && artistEmail && <span> · </span>}
                  {artistEmail && <span>{artistEmail}</span>}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: c.primary, textTransform: "uppercase", letterSpacing: 1.5 }}>Orçamento</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c.heading, marginTop: 2 }}>{budget!.budget_number}</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>
                {new Date(budget!.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
          {/* Warm divider */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${c.accentBorder}, ${c.primary}40, ${c.accentBorder})`, marginBottom: 28 }} />
          {/* Client card */}
          <div style={{ background: c.accent, borderRadius: 10, padding: "16px 20px", marginBottom: 28, border: `1px solid ${c.accentBorder}` }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: c.primary, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Para</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: c.heading }}>{budget!.client_name}</div>
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.6, marginTop: 2 }}>
              {budget!.client_company && <span>{budget!.client_company}</span>}
              {budget!.client_company && budget!.client_address && <span> · </span>}
              {budget!.client_address && <span>{budget!.client_address}</span>}
            </div>
            {budget!.valid_until && (
              <div style={{ fontSize: 11, color: c.muted, marginTop: 6 }}>Válido até {formatDateBR(budget!.valid_until)}</div>
            )}
          </div>
        </>
      );
    }
    if (template === "elegante") {
      return (
        <>
          {/* Top accent bar */}
          <div style={{ height: 6, background: `linear-gradient(90deg, #1a1a2e 0%, ${c.primary} 50%, #1a1a2e 100%)`, marginBottom: 28 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, paddingBottom: 20, borderBottom: `2px solid ${c.primary}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: 8, background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Logo" style={{ width: 60, height: 60, objectFit: "cover", display: "block" }} crossOrigin="anonymous" />
                ) : (
                  <span style={{ color: c.primary, fontSize: 24, fontWeight: 700 }}>{artistName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e", marginBottom: 2 }}>{artistName}</div>
                <div style={{ fontSize: 11, color: c.muted, lineHeight: 1.5 }}>
                  {artistPhone && <span>{artistPhone}<br /></span>}
                  {artistEmail && <span>{artistEmail}</span>}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: "#1a1a2e", letterSpacing: 3, lineHeight: 1.15 }}>ORÇAMENTO</div>
              <div style={{ width: "92%", height: 2, background: c.primary, marginTop: 10, marginLeft: "auto", borderRadius: 2 }} />
              <div style={{ fontSize: 12, color: c.muted, marginTop: 8 }}>
                Nº {budget!.budget_number}
              </div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>
                {new Date(budget!.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </>
      );
    }
    // classico
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, paddingBottom: 24, borderBottom: `3px solid ${c.primary}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 70, height: 70, background: c.primary, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Logo" style={{ width: 70, height: 70, objectFit: "cover", display: "block" }} crossOrigin="anonymous" />
            ) : (
              <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>{artistName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: c.heading, marginBottom: 2 }}>{artistName}</div>
            <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5 }}>
              {artistPhone && <span>{artistPhone}<br /></span>}
              {artistEmail && <span>{artistEmail}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: c.primary, letterSpacing: 1 }}>ORÇAMENTO</div>
          <div style={{ fontSize: 13, color: c.muted, marginTop: 6 }}>
            {new Date(budget!.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
          </div>
        </div>
      </div>
    );
  };

  const theadBg = template === "minimalista" ? c.accent : template === "elegante" ? "#1a1a2e" : c.primary;
  const theadStyle: React.CSSProperties = template === "minimalista"
    ? { backgroundColor: theadBg, borderBottom: `1px solid ${c.accentBorder}` }
    : template === "elegante"
      ? { backgroundColor: theadBg, borderBottom: "1px solid rgba(255,255,255,0.22)" }
      : { backgroundColor: theadBg };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-background p-0">
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle>Pré-visualização do Orçamento</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="gradient" size="sm" onClick={handlePrintPDF}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Área capturada */}
        <div ref={printRef} style={{ background: c.bg, padding: 40, width: "100%", boxSizing: "border-box" }}>
          <div style={{ maxWidth: 800, margin: "0 auto", fontFamily: "'Segoe UI', Arial, sans-serif", color: c.text, lineHeight: 1.5 }}>
            {renderHeader()}

            {/* Client & Budget Info — skip for minimalista (already in header) */}
            {template !== "minimalista" && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, ...(template === "elegante" ? { borderLeft: `3px solid ${c.primary}`, paddingLeft: 16 } : {}) }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Para:</div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: c.heading }}>{budget!.client_name}</div>
                  <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.5, marginTop: 2 }}>
                    {budget!.client_address && <span>{budget!.client_address}<br /></span>}
                    {budget!.client_company && <span>{budget!.client_company}</span>}
                  </div>
                </div>
                {template === "classico" && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.primary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Nº do Orçamento</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: c.heading }}>{budget!.budget_number}</div>
                    {budget!.valid_until && (
                      <div style={{ fontSize: 12, color: c.muted, marginTop: 2 }}>Válido até: {formatDateBR(budget!.valid_until)}</div>
                    )}
                  </div>
                )}
                {template === "elegante" && budget!.valid_until && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: c.muted }}>Válido até: {formatDateBR(budget!.valid_until)}</div>
                  </div>
                )}
              </div>
            )}

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
              <thead>
                <tr style={theadStyle}>
                  <th style={{ ...thBase, borderRadius: template === "classico" ? "6px 0 0 6px" : template === "elegante" ? "6px 0 0 6px" : 0, width: "50%", textAlign: "left" }}>
                    <div style={thInner("left")}>Descrição</div>
                  </th>
                  <th style={{ ...thBase, width: "20%", textAlign: "right", ...(template === "elegante" ? { borderLeft: "1px solid rgba(255,255,255,0.22)" } : {}) }}>
                    <div style={thInner("right")}>Preço Unit.</div>
                  </th>
                  <th style={{ ...thBase, width: "10%", textAlign: "center", ...(template === "elegante" ? { borderLeft: "1px solid rgba(255,255,255,0.22)" } : {}) }}>
                    <div style={thInner("center")}>Qtd</div>
                  </th>
                  <th style={{ ...thBase, borderRadius: template === "classico" ? "0 6px 6px 0" : template === "elegante" ? "0 6px 6px 0" : 0, width: "20%", textAlign: "right", ...(template === "elegante" ? { borderLeft: "1px solid rgba(255,255,255,0.22)" } : {}) }}>
                    <div style={thInner("right")}>Total</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: template === "minimalista" ? "1px solid #eee" : `1px solid ${template === "elegante" ? "#e5e5e5" : "#eee"}`, backgroundColor: index % 2 === 0 ? c.row : "#fff" }}>
                    <td style={{ padding: "12px 14px", fontSize: 13, verticalAlign: "middle" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", minHeight: 36 }}>
                        {template === "elegante" && <span style={{ color: c.primary, fontWeight: 700, fontSize: 12, minWidth: 20, display: "inline-flex", alignItems: "center", lineHeight: 1 }}>{String(index + 1).padStart(2, "0")}</span>}
                        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ fontWeight: 500, color: c.text, lineHeight: 1.25 }}>{item.description}</div>
                          {item.details && <div style={{ fontSize: 11, color: c.muted, marginTop: 2, lineHeight: 1.25 }}>{item.details}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, textAlign: "right", color: c.muted, whiteSpace: "nowrap", verticalAlign: "middle", lineHeight: 1.25 }}>{formatCurrency(item.unit_price)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, textAlign: "center", color: c.muted, verticalAlign: "middle", lineHeight: 1.25 }}>{item.quantity}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, textAlign: "right", fontWeight: 600, color: c.text, whiteSpace: "nowrap", verticalAlign: "middle", lineHeight: 1.25 }}>{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
              <div style={{ width: 280 }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: c.muted }}>
                  <span>Subtotal</span>
                  <span>{formatCurrency(budget!.subtotal)}</span>
                </div>
                {budget!.tax > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: c.muted }}>
                    <span>Taxa ({budget!.tax}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {budget!.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, color: c.muted }}>
                    <span>Desconto</span>
                    <span>- {formatCurrency(budget!.discount)}</span>
                  </div>
                )}
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  ...(template === "minimalista" ? {
                    backgroundColor: c.primary, color: "#fff",
                    padding: "12px 16px", borderRadius: 8,
                  } : {
                    backgroundColor: template === "classico" ? c.primary : "#1a1a2e",
                    color: "#fff", padding: "12px 16px", borderRadius: 6,
                  }),
                  fontSize: 15, fontWeight: 700, marginTop: 8, minHeight: 46, lineHeight: 1,
                }}>
                  <span style={{ display: "flex", alignItems: "center", lineHeight: 1 }}>TOTAL</span>
                  <span style={{ display: "flex", alignItems: "center", lineHeight: 1, ...(template === "elegante" ? { color: "#c9a84c" } : {}) }}>{formatCurrency(budget!.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            {template === "minimalista" ? (
              <>
                <div style={{ background: c.accent, borderRadius: 10, padding: "18px 20px", border: `1px solid ${c.accentBorder}`, display: "flex", gap: 24 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: c.primary, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Pagamento</div>
                    <div style={{ fontSize: 11, color: c.text, lineHeight: 1.6 }}>{budget!.payment_conditions || "A combinar"}</div>
                  </div>
                  <div style={{ width: 1, background: c.accentBorder }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: c.primary, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>Observações</div>
                    <div style={{ fontSize: 11, color: c.text, lineHeight: 1.6 }}>{budget!.terms_conditions || "Sujeito a disponibilidade."}</div>
                  </div>
                </div>
                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: c.heading }}>Obrigado pela preferência!</div>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{artistEmail}{artistPhone && artistEmail ? " · " : ""}{artistPhone}</div>
                </div>
              </>
            ) : template === "elegante" ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #e5e5e5", gap: 16, marginBottom: 0 }}>
                  {[
                    { title: "Contato", content: <>{artistEmail && <div>Email: {artistEmail}</div>}{artistPhone && <div>Tel: {artistPhone}</div>}</> },
                    { title: "Pagamento", content: <>{budget!.payment_conditions || "A combinar"}</> },
                    { title: "Observações", content: <>{budget!.terms_conditions || "Sujeito a disponibilidade."}</> },
                  ].map(({ title, content }) => (
                    <div key={title} style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a1a2e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
                      <div style={{ fontSize: 11, color: c.muted, lineHeight: 1.6 }}>{content}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: "14px 20px", backgroundColor: "#1a1a2e", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 48 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.primary, display: "flex", alignItems: "center", lineHeight: 1 }}>Obrigado pela preferência!</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", lineHeight: 1 }}>{artistPhone || artistEmail}</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid #eee", gap: 16 }}>
                  {[
                    { title: "Contato", content: <>{artistEmail && <div>Email: {artistEmail}</div>}{artistPhone && <div>Tel: {artistPhone}</div>}</> },
                    { title: "Pagamento", content: <>{budget!.payment_conditions || "A combinar"}</> },
                    { title: "Observações", content: <>{budget!.terms_conditions || "Sujeito a disponibilidade."}</> },
                  ].map(({ title, content }) => (
                    <div key={title} style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: c.heading, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
                      <div style={{ fontSize: 11, color: c.muted, lineHeight: 1.6 }}>{content}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 28, padding: "14px 20px", backgroundColor: "#f0f0ff", borderRadius: 8, textAlign: "center", border: "1px solid #e0e0ff" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: c.primary }}>Obrigado pela preferência!</div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

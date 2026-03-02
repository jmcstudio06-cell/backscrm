import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, MessageCircle, X } from "lucide-react";
import { Budget, BudgetItem } from "@/hooks/useBudgets";
import { formatDateBR } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
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

  if (!budget) return null;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const taxAmount = budget.subtotal * (budget.tax / 100);

  /**
   * ✅ Export sem distorção
   * - phone: 1080x1920 (celular/story) — SEM BORDA, com escala + downscale (texto fica MUITO mais nítido)
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

    // clone do conteúdo (não mexe na UI)
    const clone = source.cloneNode(true) as HTMLDivElement;
    clone.style.margin = "0";
    clone.style.boxSizing = "border-box";
    clone.style.background = "#ffffff";

    if (preset === "phone") {
      // ✅ Frame 9:16 padrão celular (Story)
      stage.style.width = "1080px";
      stage.style.height = "1920px";
      stage.style.display = "flex";
      stage.style.alignItems = "center";
      stage.style.justifyContent = "center";
      stage.style.background = "#ffffff"; // ✅ sem borda/moldura

      // base consistente do orçamento (sem distorcer)
      clone.style.width = "920px";
      clone.style.minWidth = "920px";
      clone.style.maxWidth = "920px";
      clone.style.padding = "24px";

      const pad = 64; // “respiro” na imagem final (fica mais premium no WhatsApp)
      const viewport = document.createElement("div");
      viewport.style.width = "1080px";
      viewport.style.height = "1920px";
      viewport.style.display = "flex";
      viewport.style.alignItems = "center";
      viewport.style.justifyContent = "center";
      viewport.style.padding = `${pad}px`;
      viewport.style.margin = "0";
      viewport.style.boxSizing = "border-box";
      viewport.style.background = "#ffffff";
      viewport.style.overflow = "hidden";

      // wrapper define o tamanho REAL (escalado) para o flex centralizar direito
      const wrapper = document.createElement("div");
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.justifyContent = "center";
      wrapper.style.boxSizing = "border-box";

      // scaler aplica transform sem distorcer
      const scaler = document.createElement("div");
      scaler.style.transformOrigin = "top left";
      scaler.style.display = "inline-block";
      scaler.style.boxSizing = "border-box";

      scaler.appendChild(clone);
      wrapper.appendChild(scaler);
      viewport.appendChild(wrapper);
      stage.appendChild(viewport);

      document.body.appendChild(stage);

      // ✅ AUTO-ESCALA (depois de estar no DOM)
      const availableW = 1080 - pad * 2;
      const availableH = 1920 - pad * 2;

      // mede o conteúdo real
      const contentRect = clone.getBoundingClientRect();
      const contentW = Math.max(clone.scrollWidth || 0, contentRect.width || 0, 920);
      const contentH = Math.max(clone.scrollHeight || 0, contentRect.height || 0, 1200);

      // escala para CABER (sem cortar)
      const scale = Math.min(availableW / contentW, availableH / contentH);

      // define tamanhos para centralização perfeita
      wrapper.style.width = `${Math.round(contentW * scale)}px`;
      wrapper.style.height = `${Math.round(contentH * scale)}px`;

      scaler.style.width = `${Math.round(contentW)}px`;
      scaler.style.height = `${Math.round(contentH)}px`;
      scaler.style.transform = `scale(${scale})`;

      return stage;
    } else {
      /**
       * ✅ PRINT (A4 RETRATO)
       */
      stage.style.width = "760px";
      stage.style.background = "#ffffff";
      stage.style.display = "block";

      clone.style.width = "760px";
      clone.style.minWidth = "760px";
      clone.style.maxWidth = "760px";
      clone.style.padding = "22px";

      stage.appendChild(clone);

      document.body.appendChild(stage);
      return stage;
    }
  };

  const renderToCanvas = async (preset: ExportPreset) => {
    const stage = createExportStage(preset);
    if (!stage) return null;

    try {
      const html2canvas = (await import("html2canvas")).default;

      /**
       * ✅ O segredo da qualidade no WhatsApp:
       * - renderiza o phone em 2x (fica super nítido)
       * - depois a gente reduz para 1080x1920 com smoothing HIGH
       */
      const scale = preset === "phone" ? 2 : 2;

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

    // ✅ PHONE: downscale para 1080x1920 mantendo ALTÍSSIMA nitidez
    if (preset === "phone") {
      const targetW = 1080;
      const targetH = 1920;

      const out = document.createElement("canvas");
      out.width = targetW;
      out.height = targetH;

      const ctx = out.getContext("2d");
      if (!ctx) return null;

      // melhora bastante o texto/linhas na redução
      ctx.imageSmoothingEnabled = true;
      // @ts-expect-error - alguns browsers suportam
      ctx.imageSmoothingQuality = "high";

      ctx.clearRect(0, 0, targetW, targetH);

      // canvas original deve estar na proporção do stage (2x)
      ctx.drawImage(canvas, 0, 0, targetW, targetH);

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
   * ✅ PDF (Imprimir) A4 em pé e 1 página
   */
  const handlePrintPDF = async () => {
    toast.loading("Preparando para imprimir...", { id: "pdf" });

    const canvas = await renderToCanvas("print");
    if (!canvas) {
      toast.error("Erro ao preparar impressão. Tente novamente.", { id: "pdf" });
      return;
    }

    const dataUrl = canvas.toDataURL("image/png", 1.0);

    const win = window.open("", "_blank");
    if (!win) {
      toast.error("Seu navegador bloqueou o pop-up. Permita pop-ups e tente novamente.", { id: "pdf" });
      return;
    }

    win.document.open();
    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Orçamento ${budget.budget_number}</title>
          <style>
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #fff !important;
            }

            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            .page {
              width: 100%;
              height: 100vh;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              box-sizing: border-box;
            }

            img {
              display: block;
              width: 100% !important;
              height: auto !important;
              max-height: calc(297mm - 20mm);
              object-fit: contain;
            }

            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <img src="${dataUrl}" alt="Orçamento" />
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => window.print(), 300);
            };
          </script>
        </body>
      </html>
    `);
    win.document.close();

    toast.success("Abrindo impressão (A4 em pé)...", { id: "pdf" });
  };

  /**
   * ✅ WhatsApp: imagem 1080x1920 (9:16) com qualidade alta
   */
  const handleWhatsApp = async () => {
    toast.loading("Gerando imagem (tamanho de celular)...", { id: "whatsapp" });

    const blob = await generateImage("phone");
    if (!blob) {
      toast.error("Erro ao gerar o orçamento.", { id: "whatsapp" });
      return;
    }

    const navAny = navigator as any;
    const hasShare = typeof navAny?.share === "function";

    if (hasShare) {
      try {
        const file = new File([blob], `orcamento-${budget.budget_number}.png`, {
          type: "image/png",
        });

        const shareData = {
          files: [file],
          title: `Orçamento ${budget.budget_number}`,
          text: `Orçamento ${budget.budget_number} - ${formatCurrency(budget.total)}`,
        };

        if (typeof navAny?.canShare !== "function" || navAny.canShare(shareData)) {
          toast.dismiss("whatsapp");
          await navAny.share(shareData);
          return;
        }
      } catch {
        // fallback abaixo
      }
    }

    // Fallback: baixa a imagem e abre WhatsApp com texto
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orcamento-${budget.budget_number}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    let phone = budget.client_phone?.replace(/\D/g, "") || "";
    if (phone && !phone.startsWith("55")) phone = "55" + phone;

    const message = encodeURIComponent(
      `Olá ${budget.client_name}!\n\nSegue o orçamento ${budget.budget_number} no valor de ${formatCurrency(
        budget.total,
      )}.\n\n✅ A imagem foi gerada no tamanho padrão de celular (alta qualidade). É só anexar no WhatsApp.`,
    );

    toast.success("Imagem pronta! Anexe no WhatsApp.", { id: "whatsapp" });

    setTimeout(() => {
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    }, 500);
  };

  const artistName = profile?.name || "Sua Empresa";
  const artistEmail = profile?.email || "";
  const artistPhone = profile?.phone || "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-background p-0">
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle>Pré-visualização do Orçamento</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="gradient" size="sm" onClick={handlePrintPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF (A4 em pé)
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Área capturada */}
        <div
          ref={printRef}
          style={{
            background: "#ffffff",
            padding: 40,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              fontFamily: "'Segoe UI', Arial, sans-serif",
              color: "#333",
              lineHeight: 1.5,
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 32,
                paddingBottom: 24,
                borderBottom: "3px solid #6366f1",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 70,
                    height: 70,
                    background: "#6366f1",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                  }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Logo"
                      style={{
                        width: 70,
                        height: 70,
                        objectFit: "cover",
                        display: "block",
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <span style={{ color: "white", fontSize: 28, fontWeight: 700 }}>
                      {artistName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>{artistName}</div>
                  <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>
                    {artistPhone && (
                      <span>
                        {artistPhone}
                        <br />
                      </span>
                    )}
                    {artistEmail && <span>{artistEmail}</span>}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#6366f1", letterSpacing: 1 }}>ORÇAMENTO</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
                  {new Date(budget.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Client & Budget Info */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  Para:
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>{budget.client_name}</div>
                <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5, marginTop: 2 }}>
                  {budget.client_address && (
                    <span>
                      {budget.client_address}
                      <br />
                    </span>
                  )}
                  {budget.client_company && <span>{budget.client_company}</span>}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#6366f1",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 6,
                  }}
                >
                  Nº do Orçamento
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e" }}>{budget.budget_number}</div>
                {budget.valid_until && (
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    Válido até: {formatDateBR(budget.valid_until)}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
              <thead>
                <tr style={{ backgroundColor: "#6366f1" }}>
                  <th
                    style={{
                      color: "#fff",
                      padding: "12px 14px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      borderRadius: "6px 0 0 6px",
                      width: "50%",
                    }}
                  >
                    Descrição
                  </th>
                  <th
                    style={{
                      color: "#fff",
                      padding: "12px 14px",
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      width: "20%",
                    }}
                  >
                    Preço Unit.
                  </th>
                  <th
                    style={{
                      color: "#fff",
                      padding: "12px 14px",
                      textAlign: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      width: "10%",
                    }}
                  >
                    Qtd
                  </th>
                  <th
                    style={{
                      color: "#fff",
                      padding: "12px 14px",
                      textAlign: "right",
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                      borderRadius: "0 6px 6px 0",
                      width: "20%",
                    }}
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    style={{ borderBottom: "1px solid #eee", backgroundColor: index % 2 === 0 ? "#fafafa" : "#fff" }}
                  >
                    <td style={{ padding: "12px 14px", fontSize: 13, verticalAlign: "top" }}>
                      <div style={{ fontWeight: 500, color: "#333" }}>{item.description}</div>
                      {item.details && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{item.details}</div>}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 13,
                        textAlign: "right",
                        color: "#555",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, textAlign: "center", color: "#555" }}>
                      {item.quantity}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        fontSize: 13,
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#333",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 32 }}>
              <div style={{ width: 280 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    fontSize: 13,
                    color: "#888",
                  }}
                >
                  <span>Subtotal</span>
                  <span>{formatCurrency(budget.subtotal)}</span>
                </div>

                {budget.tax > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: 13,
                      color: "#888",
                    }}
                  >
                    <span>Taxa ({budget.tax}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}

                {budget.discount > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: 13,
                      color: "#888",
                    }}
                  >
                    <span>Desconto</span>
                    <span>- {formatCurrency(budget.discount)}</span>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    backgroundColor: "#6366f1",
                    color: "#fff",
                    padding: "12px 16px",
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 700,
                    marginTop: 8,
                  }}
                >
                  <span>TOTAL</span>
                  <span>{formatCurrency(budget.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 20,
                borderTop: "1px solid #eee",
                gap: 16,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Contato
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  {artistEmail && <div>Email: {artistEmail}</div>}
                  {artistPhone && <div>Tel: {artistPhone}</div>}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Pagamento
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  {budget.payment_conditions || "A combinar"}
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#1a1a2e",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Termos e Condições
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  {budget.terms_conditions || "Sujeito a disponibilidade."}
                </div>
              </div>
            </div>

            {/* Thanks */}
            <div
              style={{
                marginTop: 28,
                padding: "14px 20px",
                backgroundColor: "#f0f0ff",
                borderRadius: 8,
                textAlign: "center",
                border: "1px solid #e0e0ff",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6366f1" }}>Obrigado pela preferência!</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

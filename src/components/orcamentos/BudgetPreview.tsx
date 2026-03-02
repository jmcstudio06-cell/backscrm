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

type ExportPreset = "desktop" | "phone";

export function BudgetPreview({ isOpen, onClose, budget, items }: BudgetPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  if (!budget) return null;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const taxAmount = budget.subtotal * (budget.tax / 100);

  const createExportStage = (preset: ExportPreset) => {
    const source = printRef.current;
    if (!source) return null;

    const stage = document.createElement("div");
    stage.style.position = "fixed";
    stage.style.left = "-99999px";
    stage.style.top = "0";
    stage.style.zIndex = "999999";
    stage.style.background = "#f6f7fb";
    stage.style.padding = "0";
    stage.style.margin = "0";
    stage.style.boxSizing = "border-box";

    const clone = source.cloneNode(true) as HTMLDivElement;
    clone.style.padding = "0";
    clone.style.background = "transparent";

    if (preset === "phone") {
      stage.style.width = "1080px";
      stage.style.height = "1920px";
      stage.style.display = "flex";
      stage.style.alignItems = "center";
      stage.style.justifyContent = "center";

      const phoneSafeArea = document.createElement("div");
      phoneSafeArea.style.width = "980px";
      phoneSafeArea.style.maxHeight = "1800px";
      phoneSafeArea.style.padding = "32px";
      phoneSafeArea.style.boxSizing = "border-box";
      phoneSafeArea.style.display = "flex";
      phoneSafeArea.style.alignItems = "center";
      phoneSafeArea.style.justifyContent = "center";

      const invoice = clone.querySelector(".invoice-container") as HTMLDivElement | null;

      if (invoice) {
        invoice.style.maxWidth = "980px";
        invoice.style.width = "980px";
        invoice.style.padding = "44px";
        invoice.style.borderRadius = "18px";
        invoice.style.boxShadow = "0 10px 40px rgba(0,0,0,0.10)";
      }

      phoneSafeArea.appendChild(clone);
      stage.appendChild(phoneSafeArea);
    } else {
      stage.style.width = "1200px";
      stage.style.padding = "24px";
      stage.appendChild(clone);
    }

    document.body.appendChild(stage);
    return stage;
  };

  const renderToCanvas = async (preset: ExportPreset) => {
    const stage = createExportStage(preset);
    if (!stage) return null;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const scale = preset === "phone" ? 1 : 2;

      const canvas = await html2canvas(stage, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f6f7fb",
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

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  };

  const generatePDFBlob = async (): Promise<Blob | null> => {
    const canvas = await renderToCanvas("desktop");
    if (!canvas) return null;

    try {
      const mod = await import("jspdf");
      const jsPDF = mod.jsPDF;

      // 👇 jsPDF em "pt" (pontos) evita dor de cabeça de tipagem
      const pxToPt = (px: number) => px * 0.75; // aproximação boa p/ print
      const w = pxToPt(canvas.width);
      const h = pxToPt(canvas.height);

      const pdf = new jsPDF({
        orientation: h >= w ? "portrait" : "landscape",
        unit: "pt",
        format: [w, h] as any, // <- evita erro de tipagem em algumas versões
        compress: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      pdf.addImage(imgData, "PNG", 0, 0, w, h, undefined, "FAST");

      return pdf.output("blob");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    toast.loading("Gerando PDF para impressão...", { id: "pdf" });

    const pdfBlob = await generatePDFBlob();
    if (!pdfBlob) {
      toast.error("Erro ao gerar o PDF. Tente novamente.", { id: "pdf" });
      return;
    }

    const url = URL.createObjectURL(pdfBlob);
    const win = window.open(url, "_blank");

    toast.success("Abrindo PDF para impressão...", { id: "pdf" });

    if (win) {
      const tryPrint = () => {
        try {
          win.focus();
          win.print();
        } catch {}
      };

      // tenta imprimir depois de um tempinho
      setTimeout(tryPrint, 700);
      setTimeout(tryPrint, 2000);
    }
  };

  const handleWhatsApp = async () => {
    toast.loading("Gerando imagem no formato do celular...", {
      id: "whatsapp",
    });

    const blob = await generateImage("phone");
    if (!blob) {
      toast.error("Erro ao gerar a imagem.", { id: "whatsapp" });
      return;
    }

    // ✅ Tipagem safe (sem brigar com TS)
    const navAny = navigator as any;
    const canShare = typeof navAny?.canShare === "function";
    const share = typeof navAny?.share === "function";

    if (share) {
      try {
        const file = new File([blob], `orcamento-${budget.budget_number}.png`, { type: "image/png" });

        const shareData = {
          files: [file],
          title: `Orçamento ${budget.budget_number}`,
          text: `Orçamento ${budget.budget_number} - ${formatCurrency(budget.total)}`,
        };

        if (!canShare || navAny.canShare(shareData)) {
          toast.dismiss("whatsapp");
          await navAny.share(shareData);
          return;
        }
      } catch {
        // segue pro fallback
      }
    }

    // Fallback: baixa + abre WhatsApp
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
      )}.\n\n✅ A imagem foi baixada no formato de celular. É só anexar no WhatsApp.`,
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
              <Button variant="gradient" size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF (Imprimir)
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 bg-[#f6f7fb]" ref={printRef}>
          <div
            className="invoice-container"
            style={{
              maxWidth: 860,
              margin: "0 auto",
              background: "#fff",
              padding: 44,
              borderRadius: 16,
              boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
              border: "1px solid #eef0f4",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 20,
                marginBottom: 34,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                    borderRadius: 16,
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
                        width: 64,
                        height: 64,
                        objectFit: "cover",
                        borderRadius: 16,
                        aspectRatio: "1/1",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        color: "white",
                        fontSize: 26,
                        fontWeight: 800,
                      }}
                    >
                      {artistName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div>
                  <h1
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 6,
                      letterSpacing: -0.3,
                    }}
                  >
                    {artistName}
                  </h1>

                  <div
                    style={{
                      fontSize: 13,
                      color: "#64748b",
                      lineHeight: 1.6,
                    }}
                  >
                    {artistPhone && <div>{artistPhone}</div>}
                    {artistEmail && <div>{artistEmail}</div>}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 900,
                    color: "#4f46e5",
                    letterSpacing: 2,
                    lineHeight: 1,
                  }}
                >
                  ORÇAMENTO
                </div>

                <div style={{ fontSize: 13, color: "#64748b", marginTop: 10 }}>
                  {new Date(budget.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "inline-flex",
                    gap: 8,
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    color: "#0f172a",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Nº {budget.budget_number}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: "50%",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#4f46e5",
                  }}
                >
                  Para
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#0f172a",
                    marginTop: 6,
                  }}
                >
                  {budget.client_name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    lineHeight: 1.6,
                    marginTop: 8,
                  }}
                >
                  {budget.client_company && <div>{budget.client_company}</div>}
                  {budget.client_address && <div>{budget.client_address}</div>}
                </div>
              </div>

              <div
                style={{
                  width: "50%",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  padding: 16,
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    color: "#4f46e5",
                  }}
                >
                  Informações
                </div>

                {budget.valid_until && (
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 10 }}>
                    Válido até: <strong style={{ color: "#0f172a" }}>{formatDateBR(budget.valid_until)}</strong>
                  </div>
                )}

                <div style={{ fontSize: 13, color: "#64748b", marginTop: 10 }}>
                  Pagamento: <strong style={{ color: "#0f172a" }}>{budget.payment_conditions || "A combinar"}</strong>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 14,
                overflow: "hidden",
                marginBottom: 22,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr
                    style={{
                      background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                    }}
                  >
                    <th
                      style={{
                        color: "white",
                        padding: "14px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                      }}
                    >
                      Descrição
                    </th>
                    <th
                      style={{
                        color: "white",
                        padding: "14px 16px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        width: 140,
                      }}
                    >
                      Unit.
                    </th>
                    <th
                      style={{
                        color: "white",
                        padding: "14px 16px",
                        textAlign: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        width: 80,
                      }}
                    >
                      Qtd
                    </th>
                    <th
                      style={{
                        color: "white",
                        padding: "14px 16px",
                        textAlign: "right",
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        width: 160,
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
                      style={{
                        borderBottom: index < items.length - 1 ? "1px solid #eef0f4" : "none",
                        background: index % 2 === 0 ? "#ffffff" : "#fbfdff",
                      }}
                    >
                      <td style={{ padding: 16, fontSize: 14 }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.description}</div>
                        {item.details && (
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginTop: 5,
                            }}
                          >
                            {item.details}
                          </div>
                        )}
                      </td>

                      <td
                        style={{
                          padding: 16,
                          fontSize: 14,
                          textAlign: "center",
                          color: "#0f172a",
                          fontWeight: 600,
                        }}
                      >
                        {formatCurrency(item.unit_price)}
                      </td>

                      <td
                        style={{
                          padding: 16,
                          fontSize: 14,
                          textAlign: "center",
                          color: "#0f172a",
                          fontWeight: 700,
                        }}
                      >
                        {item.quantity}
                      </td>

                      <td
                        style={{
                          padding: 16,
                          fontSize: 14,
                          textAlign: "right",
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Section */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 20,
                marginTop: 18,
              }}
            >
              <div style={{ width: "56%" }}>
                {budget.notes ? (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 900,
                        color: "#4f46e5",
                      }}
                    >
                      Observações
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#475569",
                        lineHeight: 1.65,
                        marginTop: 8,
                      }}
                    >
                      {budget.notes}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                      borderRadius: 14,
                      padding: 16,
                      color: "#64748b",
                      fontSize: 13,
                    }}
                  >
                    Sem observações.
                  </div>
                )}
              </div>

              <div style={{ width: "44%" }}>
                <div
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: 14,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: 14,
                      color: "#475569",
                    }}
                  >
                    <span>Subtotal</span>
                    <strong style={{ color: "#0f172a" }}>{formatCurrency(budget.subtotal)}</strong>
                  </div>

                  {budget.tax > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: 14,
                        color: "#475569",
                      }}
                    >
                      <span>Taxa ({budget.tax}%)</span>
                      <strong style={{ color: "#0f172a" }}>{formatCurrency(taxAmount)}</strong>
                    </div>
                  )}

                  {budget.discount > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "6px 0",
                        fontSize: 14,
                        color: "#475569",
                      }}
                    >
                      <span>Desconto</span>
                      <strong style={{ color: "#0f172a" }}>- {formatCurrency(budget.discount)}</strong>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                      color: "white",
                      padding: "14px 14px",
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 900,
                      letterSpacing: 0.3,
                    }}
                  >
                    <span>TOTAL</span>
                    <span>{formatCurrency(budget.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                marginTop: 26,
                paddingTop: 18,
                borderTop: "1px solid #eef0f4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                }}
              >
                <div style={{ width: "33%" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    Contato
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                    {artistEmail && <div>Email: {artistEmail}</div>}
                    {artistPhone && <div>Tel: {artistPhone}</div>}
                  </div>
                </div>

                <div style={{ width: "33%" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    Termos
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                    {budget.terms_conditions || "Sujeito a disponibilidade."}
                  </div>
                </div>

                <div style={{ width: "33%" }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: "#0f172a",
                      marginBottom: 8,
                    }}
                  >
                    Status
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>
                    {budget.valid_until ? (
                      <div>Válido até {formatDateBR(budget.valid_until)}</div>
                    ) : (
                      <div>Validade: a combinar</div>
                    )}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
                  border: "1px solid #e2e8f0",
                  borderRadius: 14,
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 900, color: "#4f46e5" }}>Obrigado pela preferência!</div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#64748b" }}>
                  Se quiser ajustar algo no orçamento, é só chamar.
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

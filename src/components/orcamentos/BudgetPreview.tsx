import { useRef, useEffect, useState } from "react";
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

export function BudgetPreview({ isOpen, onClose, budget, items }: BudgetPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  if (!budget) return null;

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  };

  const taxAmount = budget.subtotal * (budget.tax / 100);

  const generateImage = async (): Promise<Blob | null> => {
    const printContent = printRef.current;
    if (!printContent) return null;

    try {
      // Force a fixed width so the capture always looks good regardless of screen size
      const originalStyle = printContent.style.cssText;
      printContent.style.width = "900px";
      printContent.style.minWidth = "900px";
      printContent.style.maxWidth = "900px";
      printContent.style.overflow = "visible";

      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(printContent, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 900,
        windowWidth: 900,
      });

      // Restore original style
      printContent.style.cssText = originalStyle;

      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 1);
      });
    } catch (error) {
      console.error("Erro ao gerar imagem:", error);
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    toast.loading("Gerando PDF...", { id: "pdf" });
    const blob = await generateImage();
    if (!blob) {
      toast.error("Erro ao gerar o orçamento. Tente novamente.", { id: "pdf" });
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orcamento-${budget.budget_number}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Orçamento baixado com sucesso!", { id: "pdf" });
  };

  const handleWhatsApp = async () => {
    toast.loading("Gerando orçamento para enviar...", { id: "whatsapp" });
    const blob = await generateImage();
    if (!blob) {
      toast.error("Erro ao gerar o orçamento.", { id: "whatsapp" });
      return;
    }

    // Try Web Share API (works on Android)
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], `orcamento-${budget.budget_number}.png`, { type: "image/png" });
      const shareData = {
        files: [file],
        title: `Orçamento ${budget.budget_number}`,
        text: `Orçamento ${budget.budget_number} - ${formatCurrency(budget.total)}`,
      };
      if (navigator.canShare(shareData)) {
        try {
          toast.dismiss("whatsapp");
          await navigator.share(shareData);
          return;
        } catch (e) {
          // User cancelled or error, fallback below
        }
      }
    }

    // Fallback: download the image then open WhatsApp
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orcamento-${budget.budget_number}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    let phone = budget.client_phone?.replace(/\D/g, "") || "";
    if (phone && !phone.startsWith("55")) {
      phone = "55" + phone;
    }
    const message = encodeURIComponent(
      `Olá ${budget.client_name}!\n\nSegue o orçamento ${budget.budget_number} no valor de ${formatCurrency(budget.total)}.\n\nAnexe a imagem que foi baixada.`,
    );
    toast.success("Imagem baixada! Anexe no WhatsApp.", { id: "whatsapp" });
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
                PDF
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div ref={printRef} style={{ background: "#ffffff", padding: 40, width: "100%", boxSizing: "border-box" }}>
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
                      style={{ width: 70, height: 70, objectFit: "cover", display: "block" }}
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

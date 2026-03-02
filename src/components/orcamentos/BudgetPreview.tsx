import { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function BudgetPreview({
  isOpen,
  onClose,
  budget,
  items,
}: BudgetPreviewProps) {
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
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#f8f9fc",
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
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
      const shareData = { files: [file], title: `Orçamento ${budget.budget_number}`, text: `Orçamento ${budget.budget_number} - ${formatCurrency(budget.total)}` };
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
      `Olá ${budget.client_name}!\n\nSegue o orçamento ${budget.budget_number} no valor de ${formatCurrency(budget.total)}.\n\nAnexe a imagem que foi baixada.`
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

        <div className="p-8 bg-[#f8f9fc]" ref={printRef}>
          <div className="invoice-container" style={{ 
            maxWidth: 800, 
            margin: "0 auto", 
            background: "#fff", 
            padding: 50, 
            borderRadius: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ 
                  width: 60, 
                  height: 60, 
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Logo" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 12, aspectRatio: "1/1" }} />
                  ) : (
                    <span style={{ color: "white", fontSize: 24, fontWeight: 700 }}>
                      {artistName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>
                    {artistName.split(" ")[0]}
                    <span style={{ color: "#6366f1" }}>{artistName.split(" ").slice(1).join(" ") ? ` ${artistName.split(" ").slice(1).join(" ")}` : ""}</span>
                  </h1>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginTop: 8 }}>
                    {artistPhone && <div>{artistPhone}</div>}
                    {artistEmail && <div>{artistEmail}</div>}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#6366f1", letterSpacing: 2 }}>
                  ORÇAMENTO
                </div>
                <div style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                  {new Date(budget.created_at).toLocaleDateString("pt-BR", { 
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
              <div style={{ width: "48%" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", marginBottom: 8 }}>
                  Para:
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
                  {budget.client_name}
                </div>
                <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                  {budget.client_address && <div>{budget.client_address}</div>}
                  {budget.client_company && <div>{budget.client_company}</div>}
                </div>
              </div>
              <div style={{ width: "48%", textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", marginBottom: 8 }}>
                  Nº do Orçamento:
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#1a1a2e", marginBottom: 4 }}>
                  {budget.budget_number}
                </div>
                {budget.valid_until && (
                  <div style={{ fontSize: 13, color: "#666" }}>
                    Válido até: {formatDateBR(budget.valid_until)}
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
              <thead>
                <tr style={{ background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)" }}>
                  <th style={{ color: "white", padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, borderRadius: "6px 0 0 6px" }}>
                    Descrição
                  </th>
                  <th style={{ color: "white", padding: "14px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Preço Unit.
                  </th>
                  <th style={{ color: "white", padding: "14px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Qtd
                  </th>
                  <th style={{ color: "white", padding: "14px 16px", textAlign: "right", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, borderRadius: "0 6px 6px 0" }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: index < items.length - 1 ? "1px solid #eef0f4" : "none" }}>
                    <td style={{ padding: 16, fontSize: 14 }}>
                      <div style={{ fontWeight: 500, color: "#333" }}>{item.description}</div>
                      {item.details && (
                        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{item.details}</div>
                      )}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, textAlign: "center", color: "#333" }}>
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, textAlign: "center", color: "#333" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: 16, fontSize: 14, textAlign: "right", fontWeight: 500, color: "#333" }}>
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bottom Section */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 30 }}>
              {/* Notes */}
              <div style={{ width: "55%" }}>
                {budget.notes && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#6366f1", marginBottom: 8 }}>
                      Observações:
                    </div>
                    <div style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                      {budget.notes}
                    </div>
                  </>
                )}
              </div>

              {/* Totals */}
              <div style={{ width: "40%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#666" }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(budget.subtotal)}</span>
                </div>
                {budget.tax > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#666" }}>
                    <span>Taxa ({budget.tax}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {budget.discount > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, color: "#666" }}>
                    <span>Desconto:</span>
                    <span>- {formatCurrency(budget.discount)}</span>
                  </div>
                )}
                <div style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                  color: "white",
                  padding: "14px 16px",
                  borderRadius: 6,
                  fontSize: 16,
                  fontWeight: 700,
                  marginTop: 12
                }}>
                  <span>TOTAL:</span>
                  <span>{formatCurrency(budget.total)}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50, paddingTop: 30, borderTop: "1px solid #eef0f4" }}>
              <div style={{ width: "30%" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>
                  Contato
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  {artistEmail && <div>Email: {artistEmail}</div>}
                  {artistPhone && <div>Tel: {artistPhone}</div>}
                </div>
              </div>
              <div style={{ width: "30%" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>
                  Pagamento
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  {budget.payment_conditions || "A combinar"}
                </div>
              </div>
              <div style={{ width: "30%" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", marginBottom: 8 }}>
                  Termos e Condições
                </div>
                <div style={{ fontSize: 11, color: "#888", lineHeight: 1.6 }}>
                  {budget.terms_conditions || "Sujeito a disponibilidade."}
                </div>
              </div>
            </div>

            {/* Thanks */}
            <div style={{ 
              marginTop: 40, 
              padding: 20, 
              background: "linear-gradient(135deg, #f8f9fc 0%, #eef0f4 100%)",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#6366f1" }}>
                Obrigado pela preferência!
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

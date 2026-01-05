import { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, MessageCircle, X } from "lucide-react";
import { Budget, BudgetItem } from "@/hooks/useBudgets";
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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Não foi possível abrir a janela de impressão");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Orçamento ${budget.budget_number}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              background: #f8f9fc; 
              color: #333;
              min-height: 100vh;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: #fff;
              padding: 50px;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 40px;
            }
            .company-section {
              display: flex;
              align-items: flex-start;
              gap: 16px;
            }
            .company-logo {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }
            .company-logo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .company-logo-placeholder {
              color: white;
              font-size: 24px;
              font-weight: 700;
            }
            .company-info h1 {
              font-size: 24px;
              font-weight: 700;
              color: #1a1a2e;
              margin-bottom: 4px;
            }
            .company-info h1 span {
              color: #6366f1;
            }
            .company-address {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
              margin-top: 8px;
            }
            .invoice-title-section {
              text-align: right;
            }
            .invoice-label {
              font-size: 32px;
              font-weight: 700;
              color: #6366f1;
              letter-spacing: 2px;
            }
            .invoice-date {
              font-size: 14px;
              color: #666;
              margin-top: 8px;
            }
            .parties-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 40px;
            }
            .party-box {
              width: 48%;
            }
            .party-label {
              font-size: 12px;
              font-weight: 600;
              color: #6366f1;
              margin-bottom: 8px;
            }
            .party-name {
              font-size: 16px;
              font-weight: 600;
              color: #1a1a2e;
              margin-bottom: 4px;
            }
            .party-details {
              font-size: 13px;
              color: #666;
              line-height: 1.6;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            .items-table thead tr {
              background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
            }
            .items-table th {
              color: white;
              padding: 14px 16px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .items-table th:first-child { border-radius: 6px 0 0 6px; }
            .items-table th:last-child { border-radius: 0 6px 6px 0; text-align: right; }
            .items-table th.center { text-align: center; }
            .items-table tbody tr {
              border-bottom: 1px solid #eef0f4;
            }
            .items-table tbody tr:last-child {
              border-bottom: none;
            }
            .items-table td {
              padding: 16px;
              font-size: 14px;
              color: #333;
            }
            .items-table td:last-child { text-align: right; }
            .items-table td.center { text-align: center; }
            .item-description {
              font-weight: 500;
            }
            .item-details {
              font-size: 12px;
              color: #888;
              margin-top: 4px;
            }
            .bottom-section {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-top: 30px;
            }
            .notes-section {
              width: 55%;
            }
            .notes-title {
              font-size: 12px;
              font-weight: 600;
              color: #6366f1;
              margin-bottom: 8px;
            }
            .notes-content {
              font-size: 12px;
              color: #666;
              line-height: 1.6;
            }
            .totals-section {
              width: 40%;
            }
            .totals-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              color: #666;
            }
            .totals-row.highlight {
              background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%);
              color: white;
              padding: 14px 16px;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 700;
              margin-top: 12px;
            }
            .footer-section {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding-top: 30px;
              border-top: 1px solid #eef0f4;
            }
            .footer-column {
              width: 30%;
            }
            .footer-title {
              font-size: 12px;
              font-weight: 600;
              color: #1a1a2e;
              margin-bottom: 8px;
            }
            .footer-content {
              font-size: 11px;
              color: #888;
              line-height: 1.6;
            }
            .thanks-section {
              margin-top: 40px;
              padding: 20px;
              background: linear-gradient(135deg, #f8f9fc 0%, #eef0f4 100%);
              border-radius: 8px;
              text-align: center;
            }
            .thanks-text {
              font-size: 16px;
              font-weight: 600;
              color: #6366f1;
            }
            @media print { 
              body { padding: 0; background: white; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; } 
              .invoice-container { box-shadow: none; padding: 30px; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
              .items-table thead tr { background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%) !important; }
              .items-table th { color: white !important; background: #6366f1 !important; }
              .totals-row.highlight { background: linear-gradient(90deg, #6366f1 0%, #4f46e5 100%) !important; color: white !important; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá ${budget.client_name}!\n\n` +
      `Segue o orçamento ${budget.budget_number} no valor de ${formatCurrency(budget.total)}.\n\n` +
      `Por favor, entre em contato para mais detalhes.`
    );
    let phone = budget.client_phone?.replace(/\D/g, "") || "";
    if (phone && !phone.startsWith("55")) {
      phone = "55" + phone;
    }
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Orçamento ${budget.budget_number}`);
    const body = encodeURIComponent(
      `Olá ${budget.client_name},\n\n` +
      `Segue o orçamento ${budget.budget_number} no valor de ${formatCurrency(budget.total)}.\n\n` +
      `Itens:\n` +
      items.map((item, i) => `${i + 1}. ${item.description} - ${formatCurrency(item.total)}`).join("\n") +
      `\n\nAtenciosamente,\n${profile?.name || "Sua Empresa"}`
    );
    window.open(`mailto:${budget.client_email}?subject=${subject}&body=${body}`, "_blank");
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
              <Button variant="outline" size="sm" onClick={handleEmail}>
                <Send className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="gradient" size="sm" onClick={handlePrint}>
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
                    <img src={profile.avatar_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                    Válido até: {new Date(budget.valid_until).toLocaleDateString("pt-BR")}
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

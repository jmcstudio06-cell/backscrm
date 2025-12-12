import { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, MessageCircle, X } from "lucide-react";
import { Budget, BudgetItem } from "@/hooks/useBudgets";
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

  if (!budget) return null;

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
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; background: #fff; color: #333; }
            .invoice { max-width: 800px; margin: 0 auto; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
            .title { font-size: 32px; font-weight: bold; color: #1e40af; text-align: right; }
            .invoice-info { text-align: right; font-size: 14px; color: #666; margin-top: 8px; }
            .parties { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .party { width: 45%; }
            .party-title { font-size: 12px; color: #2563eb; font-weight: bold; margin-bottom: 8px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; }
            .party-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
            .party-info { font-size: 13px; color: #666; line-height: 1.6; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th { background: #2563eb; color: white; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; }
            .items-table th:first-child { border-radius: 4px 0 0 4px; }
            .items-table th:last-child { border-radius: 0 4px 4px 0; text-align: right; }
            .items-table td { padding: 16px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
            .items-table td:last-child { text-align: right; }
            .item-num { width: 40px; color: #666; }
            .item-desc { font-weight: 500; }
            .item-details { font-size: 12px; color: #666; margin-top: 4px; }
            .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .totals-box { width: 280px; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
            .totals-row.total { border-top: 2px solid #2563eb; font-size: 18px; font-weight: bold; padding-top: 12px; margin-top: 8px; }
            .totals-row.total span:last-child { color: #2563eb; }
            .footer { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb; }
            .footer-section { width: 30%; }
            .footer-title { font-size: 12px; font-weight: bold; color: #2563eb; margin-bottom: 8px; }
            .footer-content { font-size: 12px; color: #666; line-height: 1.6; }
            .terms { margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px; }
            .terms-title { font-size: 14px; font-weight: bold; margin-bottom: 8px; }
            .terms-content { font-size: 12px; color: #666; line-height: 1.6; }
            .thanks { text-align: center; margin-top: 40px; font-size: 18px; font-weight: bold; color: #2563eb; }
            @media print { body { padding: 20px; } }
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
      `Segue o orçamento ${budget.budget_number} no valor de R$ ${budget.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.\n\n` +
      `Por favor, entre em contato para mais detalhes.`
    );
    const phone = budget.client_phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Orçamento ${budget.budget_number}`);
    const body = encodeURIComponent(
      `Olá ${budget.client_name},\n\n` +
      `Segue o orçamento ${budget.budget_number} no valor de R$ ${budget.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.\n\n` +
      `Itens:\n` +
      items.map((item, i) => `${i + 1}. ${item.description} - R$ ${item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`).join("\n") +
      `\n\nAtenciosamente.`
    );
    window.open(`mailto:${budget.client_email}?subject=${subject}&body=${body}`, "_blank");
  };

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

        <div className="p-8 bg-white" ref={printRef}>
          <div className="invoice">
            {/* Header */}
            <div className="header" style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
              <div>
                <div className="logo" style={{ fontSize: 28, fontWeight: "bold", color: "#2563eb" }}>
                  {budget.logo_url ? (
                    <img src={budget.logo_url} alt="Logo" style={{ height: 60 }} />
                  ) : (
                    "Sua Empresa"
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="title" style={{ fontSize: 32, fontWeight: "bold", color: "#1e40af" }}>
                  ORÇAMENTO
                </div>
                <div className="invoice-info" style={{ fontSize: 14, color: "#666", marginTop: 8 }}>
                  <div>Nº: {budget.budget_number}</div>
                  <div>Data: {new Date(budget.created_at).toLocaleDateString("pt-BR")}</div>
                  {budget.valid_until && (
                    <div>Válido até: {new Date(budget.valid_until).toLocaleDateString("pt-BR")}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Parties */}
            <div className="parties" style={{ display: "flex", justifyContent: "space-between", marginBottom: 40 }}>
              <div className="party" style={{ width: "45%" }}>
                <div className="party-title" style={{ fontSize: 12, color: "#2563eb", fontWeight: "bold", marginBottom: 8, borderBottom: "2px solid #2563eb", paddingBottom: 4 }}>
                  Para:
                </div>
                <div className="party-name" style={{ fontSize: 18, fontWeight: "bold", marginBottom: 4 }}>
                  {budget.client_name}
                </div>
                <div className="party-info" style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
                  {budget.client_company && <div>{budget.client_company}</div>}
                  {budget.client_phone && <div>Tel: {budget.client_phone}</div>}
                  {budget.client_email && <div>Email: {budget.client_email}</div>}
                  {budget.client_address && <div>{budget.client_address}</div>}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="items-table" style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
              <thead>
                <tr>
                  <th style={{ background: "#2563eb", color: "white", padding: "12px 16px", textAlign: "left", fontSize: 12, textTransform: "uppercase", borderRadius: "4px 0 0 4px" }}>
                    Nº
                  </th>
                  <th style={{ background: "#2563eb", color: "white", padding: "12px 16px", textAlign: "left", fontSize: 12, textTransform: "uppercase" }}>
                    Descrição
                  </th>
                  <th style={{ background: "#2563eb", color: "white", padding: "12px 16px", textAlign: "center", fontSize: 12, textTransform: "uppercase" }}>
                    Preço
                  </th>
                  <th style={{ background: "#2563eb", color: "white", padding: "12px 16px", textAlign: "center", fontSize: 12, textTransform: "uppercase" }}>
                    Qtd
                  </th>
                  <th style={{ background: "#2563eb", color: "white", padding: "12px 16px", textAlign: "right", fontSize: 12, textTransform: "uppercase", borderRadius: "0 4px 4px 0" }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id}>
                    <td style={{ padding: 16, borderBottom: "1px solid #e5e7eb", fontSize: 14, color: "#666" }}>
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td style={{ padding: 16, borderBottom: "1px solid #e5e7eb", fontSize: 14 }}>
                      <div style={{ fontWeight: 500 }}>{item.description}</div>
                      {item.details && (
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>{item.details}</div>
                      )}
                    </td>
                    <td style={{ padding: 16, borderBottom: "1px solid #e5e7eb", fontSize: 14, textAlign: "center" }}>
                      R$ {item.unit_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: 16, borderBottom: "1px solid #e5e7eb", fontSize: 14, textAlign: "center" }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: 16, borderBottom: "1px solid #e5e7eb", fontSize: 14, textAlign: "right", fontWeight: 500 }}>
                      R$ {item.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="totals" style={{ display: "flex", justifyContent: "flex-end", marginBottom: 40 }}>
              <div className="totals-box" style={{ width: 280 }}>
                <div className="totals-row" style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
                  <span>Subtotal:</span>
                  <span>R$ {budget.subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                {budget.discount > 0 && (
                  <div className="totals-row" style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
                    <span>Desconto:</span>
                    <span>- R$ {budget.discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {budget.tax > 0 && (
                  <div className="totals-row" style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14 }}>
                    <span>Taxa ({budget.tax}%):</span>
                    <span>R$ {(budget.subtotal * budget.tax / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="totals-row total" style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", fontSize: 18, fontWeight: "bold", borderTop: "2px solid #2563eb", marginTop: 8 }}>
                  <span>Total:</span>
                  <span style={{ color: "#2563eb" }}>R$ {budget.total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Payment Conditions */}
            {budget.payment_conditions && (
              <div className="footer-section" style={{ marginBottom: 20 }}>
                <div className="footer-title" style={{ fontSize: 12, fontWeight: "bold", color: "#2563eb", marginBottom: 8 }}>
                  Condições de Pagamento:
                </div>
                <div className="footer-content" style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                  {budget.payment_conditions}
                </div>
              </div>
            )}

            {/* Terms */}
            {budget.terms_conditions && (
              <div className="terms" style={{ marginTop: 30, padding: 20, background: "#f8fafc", borderRadius: 8 }}>
                <div className="terms-title" style={{ fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
                  Termos & Condições:
                </div>
                <div className="terms-content" style={{ fontSize: 12, color: "#666", lineHeight: 1.6 }}>
                  {budget.terms_conditions}
                </div>
              </div>
            )}

            {/* Thanks */}
            <div className="thanks" style={{ textAlign: "center", marginTop: 40, fontSize: 18, fontWeight: "bold", color: "#2563eb" }}>
              Obrigado pela preferência!
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

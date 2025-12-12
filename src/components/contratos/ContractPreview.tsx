import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, MessageCircle, X } from "lucide-react";
import { Contract } from "@/hooks/useContracts";
import { toast } from "sonner";

interface ContractPreviewProps { isOpen: boolean; onClose: () => void; contract: Contract | null; }

export function ContractPreview({ isOpen, onClose, contract }: ContractPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  if (!contract) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Não foi possível abrir a janela de impressão"); return; }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Contrato ${contract.contract_number}</title>
      <style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: 'Times New Roman', serif; padding: 60px 80px; background: #fff; color: #333; line-height: 1.8; font-size: 14px; }
      .header { text-align: center; margin-bottom: 40px; border-bottom: 3px double #333; padding-bottom: 20px; }
      .company-name { font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
      .company-info { font-size: 11px; color: #666; margin-top: 8px; }
      .title { font-size: 20px; font-weight: bold; text-align: center; margin: 30px 0; text-transform: uppercase; letter-spacing: 1px; }
      .intro { text-align: justify; margin-bottom: 20px; }
      .party { margin-bottom: 15px; }
      .party-label { font-weight: bold; }
      .clause { margin: 25px 0; text-align: justify; }
      .clause-title { font-weight: bold; text-transform: uppercase; margin-bottom: 8px; }
      .clause-content { text-indent: 2em; }
      .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
      .signature-box { width: 45%; text-align: center; }
      .signature-line { border-top: 1px solid #333; margin-top: 60px; padding-top: 10px; }
      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      @media print { body { padding: 40px 60px; } }</style></head><body>${printContent.innerHTML}</body></html>`);
    printWindow.document.close(); printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Olá ${contract.client_name}!\n\nSegue o contrato ${contract.contract_number} referente ao evento do dia ${contract.event_date ? new Date(contract.event_date).toLocaleDateString("pt-BR") : "a definir"}.\n\nPor favor, confira e entre em contato.`);
    const phone = contract.client_phone?.replace(/\D/g, "") || "";
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Contrato ${contract.contract_number} - ${contract.title}`);
    const body = encodeURIComponent(`Olá ${contract.client_name},\n\nSegue em anexo o contrato de prestação de serviços.\n\nContrato: ${contract.contract_number}\nEvento: ${contract.event_date ? new Date(contract.event_date).toLocaleDateString("pt-BR") : "A definir"}\nValor: R$ ${contract.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\nAtenciosamente.`);
    window.open(`mailto:${contract.client_email}?subject=${subject}&body=${body}`, "_blank");
  };

  const finalValue = contract.total_value - contract.discount;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-background p-0">
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle>Pré-visualização do Contrato</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleWhatsApp}><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
              <Button variant="outline" size="sm" onClick={handleEmail}><Send className="w-4 h-4 mr-2" />Email</Button>
              <Button variant="gradient" size="sm" onClick={handlePrint}><Download className="w-4 h-4 mr-2" />PDF</Button>
              <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </DialogHeader>
        <div className="p-8 bg-white" ref={printRef} style={{ fontFamily: "'Times New Roman', serif", lineHeight: 1.8, fontSize: 14, color: "#333" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 40, borderBottom: "3px double #333", paddingBottom: 20 }}>
            <div style={{ fontSize: 24, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 }}>{contract.artist_name || "EMPRESA"}</div>
            {contract.artist_address && <div style={{ fontSize: 11, color: "#666", marginTop: 8 }}>{contract.artist_address}</div>}
          </div>

          <div style={{ fontSize: 20, fontWeight: "bold", textAlign: "center", margin: "30px 0", textTransform: "uppercase", letterSpacing: 1 }}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS ARTÍSTICOS</div>

          <div style={{ textAlign: "justify", marginBottom: 20 }}>Pelo presente instrumento particular, de um lado:</div>

          <div style={{ marginBottom: 15 }}>
            <span style={{ fontWeight: "bold" }}>CONTRATADA: </span>
            {contract.artist_name}{contract.artist_document && `, portador do CPF/CNPJ nº ${contract.artist_document}`}{contract.artist_address && `, com endereço em ${contract.artist_address}`}.
          </div>

          <div style={{ marginBottom: 20 }}>E de outro lado:</div>

          <div style={{ marginBottom: 15 }}>
            <span style={{ fontWeight: "bold" }}>CONTRATANTE: </span>
            {contract.client_name}{contract.client_document && `, portador do CPF/CNPJ nº ${contract.client_document}`}{contract.client_address && `, residente em ${contract.client_address}`}.
          </div>

          <div style={{ textAlign: "center", fontStyle: "italic", margin: "20px 0" }}>As partes têm entre si justo e contratado o que segue:</div>

          {/* Clauses */}
          {contract.clauses.map((clause, index) => (
            <div key={index} style={{ margin: "25px 0", textAlign: "justify" }}>
              <div style={{ fontWeight: "bold", textTransform: "uppercase", marginBottom: 8 }}>CLÁUSULA {index + 1} – {clause.title}</div>
              <div style={{ whiteSpace: "pre-wrap" }}>{clause.content.replace("[VALOR]", `R$ ${finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`).replace("[CIDADE]", contract.event_location?.split(",")[0] || "").replace("[ESTADO]", "")}</div>
              {index === 0 && contract.event_date && (
                <ul style={{ marginTop: 10, paddingLeft: 40 }}>
                  <li>Data do evento: {new Date(contract.event_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</li>
                  {contract.event_time && <li>Horário: {contract.event_time}</li>}
                  {contract.event_duration && <li>Duração aproximada: {contract.event_duration}</li>}
                  {contract.event_type && <li>Tipo: {contract.event_type}</li>}
                  {contract.event_location && <li>Local: {contract.event_location}</li>}
                </ul>
              )}
            </div>
          ))}

          {/* Signatures */}
          <div style={{ marginTop: 60, textAlign: "center" }}>
            <p>{contract.event_location?.split(",")[0] || "Local"}, ___ de __________ de {new Date().getFullYear()}.</p>
          </div>

          <div style={{ marginTop: 60, display: "flex", justifyContent: "space-between" }}>
            <div style={{ width: "45%", textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #333", marginTop: 60, paddingTop: 10 }}>
                <strong>CONTRATANTE:</strong><br />{contract.client_name}{contract.client_document && <><br />CPF/CNPJ: {contract.client_document}</>}
              </div>
            </div>
            <div style={{ width: "45%", textAlign: "center" }}>
              <div style={{ borderTop: "1px solid #333", marginTop: 60, paddingTop: 10 }}>
                <strong>CONTRATADA:</strong><br />{contract.artist_name}{contract.artist_document && <><br />CPF/CNPJ: {contract.artist_document}</>}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

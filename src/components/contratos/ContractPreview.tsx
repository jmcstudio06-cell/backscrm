import { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, MessageCircle, X } from "lucide-react";
import { Contract } from "@/hooks/useContracts";
import { formatDateBR } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

interface ContractPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export function ContractPreview({ isOpen, onClose, contract }: ContractPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();

  if (!contract) return null;

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
        <title>Contrato ${contract.contract_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px 50px; background: #fff; color: #333; line-height: 1.6; font-size: 12px; }
          .contract-container { max-width: 800px; margin: 0 auto; }
          .header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #333; }
          .logo-section { display: flex; align-items: center; gap: 15px; }
          .logo { width: 80px; height: 80px; background: #f0f0f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #666; overflow: hidden; }
          .logo img { width: 100%; height: 100%; object-fit: cover; }
          .company-details { font-size: 11px; color: #666; }
          .company-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 4px; }
          .page-number { font-size: 11px; color: #999; }
          .title-section { background: #333; color: #fff; text-align: center; padding: 12px 20px; margin: 20px 0; font-size: 16px; font-weight: bold; letter-spacing: 1px; }
          .subtitle { font-size: 13px; font-weight: bold; margin: 15px 0 10px; border-bottom: 1px solid #333; padding-bottom: 5px; }
          .party-section { margin-bottom: 15px; text-align: justify; }
          .party-label { font-weight: bold; }
          .separator { text-align: center; margin: 15px 0; font-style: italic; }
          .clause { margin: 15px 0; text-align: justify; }
          .clause-title { font-weight: bold; background: #f5f5f5; padding: 8px 12px; margin-bottom: 8px; border-left: 4px solid #333; }
          .clause-content { padding: 0 12px; white-space: pre-wrap; }
          .clause-content ul { margin: 10px 0 10px 20px; }
          .clause-content li { margin-bottom: 5px; }
          .event-details { margin: 10px 0 10px 20px; }
          .event-details li { margin-bottom: 3px; }
          .signature-section { margin-top: 40px; text-align: center; }
          .signature-date { margin-bottom: 50px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 30px; }
          .signature-box { width: 45%; text-align: center; }
          .signature-line { border-top: 1px solid #333; padding-top: 10px; margin-top: 50px; }
          .signature-name { font-weight: bold; }
          .signature-doc { font-size: 11px; color: #666; }
          .footer-logo { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
          .footer-logo .logo { margin: 0 auto; }
          @media print { body { padding: 30px 40px; } }
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
      `Olá ${contract.client_name}!\n\nSegue o contrato ${contract.contract_number} referente ao evento do dia ${
        contract.event_date ? formatDateBR(contract.event_date) : "a definir"
      }.\n\nPor favor, confira e entre em contato.`,
    );
    let phone = contract.client_phone?.replace(/\D/g, "") || "";
    if (phone && !phone.startsWith("55")) {
      phone = "55" + phone;
    }
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Contrato ${contract.contract_number} - ${contract.title}`);
    const body = encodeURIComponent(
      `Olá ${contract.client_name},\n\nSegue em anexo o contrato de prestação de serviços.\n\nContrato: ${contract.contract_number}\nEvento: ${
        contract.event_date ? formatDateBR(contract.event_date) : "A definir"
      }\nValor: R$ ${contract.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}\n\nAtenciosamente.`,
    );
    window.open(`mailto:${contract.client_email}?subject=${subject}&body=${body}`, "_blank");
  };

  const finalValue = contract.total_value - contract.discount;
  const artistName = profile?.name || contract.artist_name || "NOME DO ARTISTA";
  const artistEmail = profile?.email || contract.artist_email || "";
  const artistPhone = profile?.phone || contract.artist_phone || "";
  const artistCity = profile?.city || "";
  const artistAddress = contract.artist_address || "";
  const artistDocument = contract.artist_document || "";
  const artistInitial = artistName.charAt(0).toUpperCase();

  // Format contract creation date
  const creationDate = new Date(contract.created_at);
  const creationDay = creationDate.getDate();
  const creationMonth = creationDate.toLocaleDateString("pt-BR", { month: "long" });
  const creationYear = creationDate.getFullYear();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-background p-0">
        <DialogHeader className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between">
            <DialogTitle>Pré-visualização do Contrato</DialogTitle>
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
          <div
            className="contract-container"
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 12,
              color: "#333",
              lineHeight: 1.6,
              maxWidth: 800,
              margin: "0 auto",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: "2px solid #333",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: "#f0f0f0",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: "bold",
                    color: "#666",
                    overflow: "hidden",
                  }}
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Logo"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    artistInitial
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 2 }}>
                    [{artistName.toUpperCase()}]
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    Escritório de vendas de shows e músicas
                    <br />
                    {artistAddress || "[ENDEREÇO COMPLETO DA EMPRESA]"}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#999", textAlign: "right" }}>1/2</div>
            </div>

            {/* Title */}
            <div
              style={{
                background: "#333",
                color: "#fff",
                textAlign: "center",
                padding: "12px 20px",
                margin: "20px 0",
                fontSize: 16,
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              CONTRATO OFICIAL
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 13,
                fontWeight: "bold",
                margin: "15px 0 10px",
                borderBottom: "1px solid #333",
                paddingBottom: 5,
              }}
            >
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS ARTÍSTICOS
            </div>

            <p style={{ textAlign: "justify", marginBottom: 15 }}>Pelo presente instrumento particular, de um lado:</p>

            {/* Contratada */}
            <div style={{ marginBottom: 15, textAlign: "justify" }}>
              <span style={{ fontWeight: "bold" }}>CONTRATADA:</span> {artistName}, representada por seu responsável,
              portador do CPF nº {artistDocument || "XXX.XXX.XXX-XX"}, com endereço na {artistAddress || "[XXXX]"},
              doravante denominada EMPRESA REPRESENTANTE, responsável pela gestão, agenciamento e administração da
              carreira do artista [{artistName.toUpperCase()}].
            </div>

            <p style={{ marginBottom: 15 }}>E de outro lado:</p>

            {/* Contratante */}
            <div style={{ marginBottom: 15, textAlign: "justify" }}>
              <span style={{ fontWeight: "bold" }}>CONTRATANTE:</span> [{contract.client_name.toUpperCase()}], portador
              do CPF nº {contract.client_document || "XXX.XXX.XXX-XX"} e RG nº XX.XXX.XXX-X, residente em [
              {contract.client_address || "CIDADE E UF"}].
            </div>

            <p style={{ textAlign: "center", fontStyle: "italic", margin: "20px 0" }}>
              As partes têm entre si justo e contratado o que segue:
            </p>

            {/* Clauses */}
            {contract.clauses.map((clause, index) => (
              <div key={index} style={{ margin: "15px 0" }}>
                <div
                  style={{
                    fontWeight: "bold",
                    background: "#f5f5f5",
                    padding: "8px 12px",
                    marginBottom: 8,
                    borderLeft: "4px solid #333",
                  }}
                >
                  CLÁUSULA {index + 1} – {clause.title.toUpperCase()}
                </div>
                <div style={{ padding: "0 12px", whiteSpace: "pre-wrap", textAlign: "justify" }}>
                  {clause.content
                    .replace("[VALOR]", `R$ ${finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`)
                    .replace("[NOME DA EMPRESA]", artistName)
                    .replace("[NOME DO ARTISTA]", artistName)
                    .replace("[CIDADE]", contract.event_location?.split(",")[0] || "CIDADE")
                    .replace("[ESTADO]", "UF")
                    .replace("[CIDADE E UF]", contract.event_location || "CIDADE E UF")}
                </div>
                {/* Event details after OBJETO clause */}
                {clause.title.toUpperCase() === "OBJETO" && contract.event_date && (
                  <ul style={{ margin: "10px 0 10px 30px", listStyleType: "disc" }}>
                    <li>
                      <strong>Data do evento:</strong>{" "}
                      {formatDateBR(contract.event_date, { day: "2-digit", month: "long", year: "numeric" })}
                    </li>
                    {contract.event_time && (
                      <li>
                        <strong>Horário:</strong> das {contract.event_time}
                      </li>
                    )}
                    {contract.event_duration && (
                      <li>
                        <strong>Duração aproximada:</strong> {contract.event_duration}
                      </li>
                    )}
                    {contract.event_type && (
                      <li>
                        <strong>Projeto:</strong> {contract.event_type}
                      </li>
                    )}
                    {contract.event_location && (
                      <li>
                        <strong>Local:</strong> {contract.event_location}
                      </li>
                    )}
                  </ul>
                )}
                {/* Payment details after PAGAMENTO clause */}
                {clause.title.toUpperCase() === "PAGAMENTO" && (
                  <div style={{ padding: "0 12px", marginTop: 10 }}>
                    <p>
                      O valor total acordado para o show é de{" "}
                      <strong>R$ {finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                      {contract.discount > 0 &&
                        ` (já incluso desconto de R$ ${contract.discount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} sobre o valor original de R$ ${contract.total_value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`}
                      .
                    </p>
                    {contract.payment_terms && (
                      <p style={{ marginTop: 5 }}>
                        O pagamento será realizado da seguinte forma: {contract.payment_terms}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Signature Section */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <p>
                {artistCity ? `${artistCity.toUpperCase()}` : "[CIDADE E UF]"}, {creationDay} de {creationMonth} de{" "}
                {creationYear}.
              </p>
            </div>

            <p style={{ textAlign: "center", marginTop: 15 }}>
              E, por estarem justos e contratados, firmam o presente contrato em duas vias de igual teor e forma,
              assinadas por ambas as partes.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50 }}>
              <div style={{ width: "45%", textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #333", paddingTop: 10, marginTop: 50 }}>
                  <strong>CONTRATANTE:</strong>
                  <br />[{contract.client_name.toUpperCase()}]<br />
                  <span style={{ fontSize: 11, color: "#666" }}>
                    CPF: {contract.client_document || "XXX.XXX.XXX-XX"} | RG: XX.XXX.XXX-X
                  </span>
                </div>
              </div>
              <div style={{ width: "45%", textAlign: "center" }}>
                <div style={{ borderTop: "1px solid #333", paddingTop: 10, marginTop: 50 }}>
                  <strong>CONTRATADA / REPRESENTANTE:</strong>
                  <br />
                  {artistName.toUpperCase()}
                  <br />
                  <span style={{ fontSize: 11, color: "#666" }}>
                    Responsável: CPF {artistDocument || "XXX.XXX.XXX-XX"}
                    <br />
                    Representante da carreira do artista [{artistName.toUpperCase()}]
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Logo */}
            <div style={{ textAlign: "center", marginTop: 40, paddingTop: 20, borderTop: "1px solid #ddd" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  background: "#f0f0f0",
                  borderRadius: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "#666",
                  overflow: "hidden",
                }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Logo"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  artistInitial
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

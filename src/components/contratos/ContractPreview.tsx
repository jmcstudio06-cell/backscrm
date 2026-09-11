import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Send, MessageCircle, X, Loader2 } from "lucide-react";
import { Contract } from "@/hooks/useContracts";
import { formatDateBR } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ContractPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

export function ContractPreview({ isOpen, onClose, contract }: ContractPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { profile } = useProfile();
  const [generating, setGenerating] = useState(false);
  const [scale, setScale] = useState(1);

  // Calcula o scale proporcional ao container disponível
  useEffect(() => {
    if (!isOpen) return;
    const calculate = () => {
      const container = scrollRef.current;
      if (!container) return;
      const available = container.clientWidth - 32; // padding 16px cada lado
      const contentWidth = 870; // maxWidth 800 + padding 35*2
      const s = available < contentWidth ? available / contentWidth : 1;
      setScale(Math.max(s, 0.35));
    };
    // Aguarda o Dialog abrir e renderizar
    const t = setTimeout(calculate, 80);
    window.addEventListener("resize", calculate);
    return () => { clearTimeout(t); window.removeEventListener("resize", calculate); };
  }, [isOpen]);

  if (!contract) return null;

  const handlePrint = async () => {
    const printContent = printRef.current;
    if (!printContent) return;

    setGenerating(true);
    try {
      const canvas = await html2canvas(printContent, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Contrato-${contract.contract_number}.pdf`);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintLegacy = () => {
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
          @page {
            size: A4;
            margin: 0;
          }

          html,
          body {
            margin: 0;
            padding: 15mm 12mm;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            color: #333;
            line-height: 1.6;
            font-size: 12px;
          }

          /* Barra de ações — só aparece na tela, não imprime */
          .no-print {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px 16px;
            background: #f8f8f8;
            border-bottom: 1px solid #ddd;
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .no-print button {
            padding: 6px 16px;
            border-radius: 6px;
            border: 1px solid #ccc;
            cursor: pointer;
            font-size: 13px;
            font-weight: 600;
            background: #fff;
          }
          .no-print .btn-print {
            background: #4f46e5;
            color: #fff;
            border-color: #4f46e5;
          }
          @media print {
            .no-print { display: none !important; }
            html, body { padding: 10mm; }
          }

          .contract-container {
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
            padding: 30px 35px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-decoration-break: clone;
            -webkit-box-decoration-break: clone;
          }

          .contract-clause {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .contract-clause-title {
            break-after: avoid;
            page-break-after: avoid;
          }

          .header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #333;
          }

          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .logo {
            width: 80px;
            height: 80px;
            background: #f0f0f0;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            color: #666;
            overflow: hidden;
          }

          .logo img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .company-details {
            font-size: 11px;
            color: #666;
          }

          .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }

          .page-number {
            font-size: 11px;
            color: #999;
          }

          .title-section {
            background: #333;
            color: #fff;
            text-align: center;
            padding: 12px 20px;
            margin: 20px 0;
            font-size: 16px;
            font-weight: bold;
            letter-spacing: 1px;
          }

          .subtitle {
            font-size: 13px;
            font-weight: bold;
            margin: 15px 0 10px;
            border-bottom: 1px solid #333;
            padding-bottom: 5px;
          }

          .party-section {
            margin-bottom: 15px;
            text-align: justify;
          }

          .party-label {
            font-weight: bold;
          }

          .separator {
            text-align: center;
            margin: 15px 0;
            font-style: italic;
          }

          .clause {
            margin: 15px 0;
            text-align: justify;
          }

          .clause-title {
            font-weight: bold;
            background: #f5f5f5;
            padding: 8px 12px;
            margin-bottom: 8px;
            border-left: 4px solid #333;
          }

          .clause-content {
            padding: 0 12px;
            white-space: pre-wrap;
          }

          .clause-content ul {
            margin: 10px 0 10px 20px;
          }

          .clause-content li {
            margin-bottom: 5px;
          }

          .event-details {
            margin: 10px 0 10px 20px;
          }

          .event-details li {
            margin-bottom: 3px;
          }

          .signature-section {
            margin-top: 40px;
            text-align: center;
          }

          .signature-date {
            margin-bottom: 50px;
          }

          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
          }

          .signature-box {
            width: 45%;
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 50px;
          }

          .signature-name {
            font-weight: bold;
          }

          .signature-doc {
            font-size: 11px;
            color: #666;
          }

          .footer-logo {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }

          .footer-logo .logo {
            margin: 0 auto;
          }

          @media print {
            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .contract-container {
              max-width: none;
              width: 100%;
              padding: 14mm 12mm !important;
              border: 1px solid #ddd !important;
              border-radius: 4px !important;
              box-decoration-break: clone;
              -webkit-box-decoration-break: clone;
            }

            .contract-clause {
              break-inside: avoid;
              page-break-inside: avoid;
            }

            .contract-clause-title {
              break-after: avoid;
              page-break-after: avoid;
            }
          }
        </style>
      </head>

      <body>
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
          <button onclick="window.close()">✕ Fechar</button>
          <span style="font-size:12px;color:#888;margin-left:8px">Contrato ${contract.contract_number} — ${contract.client_name}</span>
        </div>
        ${printContent.outerHTML}
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
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
  const companyName = profile?.name || contract.artist_name || "NOME DA EMPRESA";
  const artistName = profile?.artist_name || profile?.name || contract.artist_name || "NOME DO ARTISTA";
  const artistEmail = profile?.email || contract.artist_email || "";
  const artistPhone = profile?.phone || contract.artist_phone || "";
  const artistCity = profile?.city || profile?.base_city || "";
  const artistAddress = contract.artist_address || "";
  const artistDocument = contract.artist_document || "";
  const artistInitial = (artistName || companyName).charAt(0).toUpperCase();

  const eventCity = contract.event_location?.split(",")[0]?.trim() || artistCity;

  // Substitui todos os marcadores por dados reais do contrato/perfil
  const fillTokens = (text: string) => {
    const map: Record<string, string> = {
      "[VALOR]": `R$ ${finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "[VALOR TOTAL]": `R$ ${finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "[NOME DA EMPRESA]": companyName,
      "[NOME DO ARTISTA]": artistName,
      "[NOME DO CONTRATANTE]": contract.client_name || "",
      "[CPF DO CONTRATANTE]": contract.client_document || "",
      "[CPF]": artistDocument,
      "[TELEFONE]": artistPhone,
      "[EMAIL]": artistEmail,
      "[ENDEREÇO]": artistAddress || artistCity,
      "[LOCAL]": contract.event_location || "",
      "[DATA]": contract.event_date ? formatDateBR(contract.event_date) : "",
      "[HORARIO]": contract.event_time || "",
      "[HORÁRIO]": contract.event_time || "",
      "[DURACAO]": contract.event_duration || "",
      "[DURAÇÃO]": contract.event_duration || "",
      "[FORMATO]": contract.event_type || "",
      "[CIDADE]": eventCity,
      "[ESTADO]": contract.event_location?.split(",")[1]?.trim() || "",
      "[CIDADE E UF]": contract.event_location || artistCity,
      "[FORMA DE PAGAMENTO]": contract.payment_terms || "",
      "XXXX": "",
      "XXX.XXX.XXX-XX": artistDocument || "não informado",
    };
    let out = text;
    for (const [k, v] of Object.entries(map)) out = out.split(k).join(v);
    return out.replace(/\[[A-ZÀ-Ú ÇÃÉÍÓÚ]+\]/g, "").replace(/ {2,}/g, " ");
  };


  // Format contract creation date
  const creationDate = new Date(contract.created_at);
  const creationDay = creationDate.getDate();
  const creationMonth = creationDate.toLocaleDateString("pt-BR", { month: "long" });
  const creationYear = creationDate.getFullYear();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] flex flex-col bg-background p-0">
        {/* Header sticky */}
        <DialogHeader className="p-3 sm:p-4 border-b sticky top-0 bg-background z-10 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <DialogTitle className="text-sm sm:text-base truncate">
              Contrato {contract.contract_number}
            </DialogTitle>
            {/* Controles de zoom */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setScale(s => Math.max(0.35, parseFloat((s - 0.1).toFixed(2))))}
                className="h-7 w-7 rounded-md border bg-muted/50 hover:bg-muted flex items-center justify-center text-base font-bold leading-none"
                title="Diminuir zoom"
              >−</button>
              <button
                onClick={() => setScale(1)}
                className="h-7 min-w-[42px] rounded-md border bg-muted/50 hover:bg-muted text-xs font-semibold px-1"
                title="Zoom original"
              >{Math.round(scale * 100)}%</button>
              <button
                onClick={() => setScale(s => Math.min(2, parseFloat((s + 0.1).toFixed(2))))}
                className="h-7 w-7 rounded-md border bg-muted/50 hover:bg-muted flex items-center justify-center text-base font-bold leading-none"
                title="Aumentar zoom"
              >+</button>
              <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7 ml-1" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo scrollável */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-auto">
          {/* Wrapper de escala — mantém o visual A4 proporcional */}
          <div style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            paddingTop: 16,
            paddingBottom: 16,
          }}>
            <div style={{
              transformOrigin: "top center",
              transform: `scale(${scale})`,
              width: 870,
              minWidth: 870,
              // Compensa o espaço "encolhido" pelo scale para não deixar gap embaixo
              marginBottom: scale < 1 ? `calc((${scale} - 1) * 870px)` : 0,
            }}>
          <div className="p-4 sm:p-8 bg-white">
            <div
              ref={printRef}
              className="contract-container"
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                color: "#333",
                lineHeight: 1.6,
                maxWidth: 800,
                margin: "0 auto",
                padding: "30px 35px",
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 4,
                boxSizing: "border-box",
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
                    {companyName.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: "#666" }}>
                    Escritório de vendas de shows e músicas
                    <br />
                    {artistAddress || artistCity || ""}
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
              <span style={{ fontWeight: "bold" }}>CONTRATADA:</span> {companyName}, representada por seu responsável,
              portador do CPF/CNPJ nº {artistDocument || "não informado"}{artistAddress ? `, com endereço em ${artistAddress}` : ""},
              doravante denominada EMPRESA REPRESENTANTE, responsável pela gestão, agenciamento e administração da
              carreira do artista {artistName.toUpperCase()}.
            </div>

            <p style={{ marginBottom: 15 }}>E de outro lado:</p>

            {/* Contratante */}
            <div style={{ marginBottom: 15, textAlign: "justify" }}>
              <span style={{ fontWeight: "bold" }}>CONTRATANTE:</span> {contract.client_name.toUpperCase()}, portador
              do CPF/CNPJ nº {contract.client_document || "não informado"}{contract.client_address ? `, residente em ${contract.client_address}` : ""}.
            </div>

            <p style={{ textAlign: "center", fontStyle: "italic", margin: "20px 0" }}>
              As partes têm entre si justo e contratado o que segue:
            </p>

            {/* Clauses */}
            {contract.clauses.map((clause, index) => (
              <div key={index} className="contract-clause" style={{ margin: "15px 0" }}>
                <div
                  className="contract-clause-title"
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
                  {fillTokens(clause.content)}
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
                {(eventCity || artistCity || "").toUpperCase()}{eventCity || artistCity ? ", " : ""}{creationDay} de {creationMonth} de{" "}
                {creationYear}.
              </p>
            </div>

            <p style={{ textAlign: "center", marginTop: 15 }}>
              E, por estarem justos e contratados, firmam o presente contrato em duas vias de igual teor e forma,
              assinadas por ambas as partes.
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 50 }}>
              <div style={{ width: "45%", textAlign: "center" }}>
                <div style={{ height: 46 }} />
                <div style={{ borderTop: "1px solid #333", paddingTop: 8 }}>
                  <strong>CONTRATANTE</strong>
                  <br />{contract.client_name.toUpperCase()}<br />
                  <span style={{ fontSize: 11, color: "#666" }}>
                    CPF/CNPJ: {contract.client_document || "não informado"}
                  </span>
                </div>
              </div>
              <div style={{ width: "45%", textAlign: "center" }}>
                <div style={{ height: 46 }} />
                <div style={{ borderTop: "1px solid #333", paddingTop: 8 }}>
                  <strong>CONTRATADA / REPRESENTANTE</strong>
                  <br />
                  {companyName.toUpperCase()}
                  <br />
                  <span style={{ fontSize: 11, color: "#666" }}>
                    CPF/CNPJ: {artistDocument || "não informado"}
                    <br />
                    Representante da carreira do artista {artistName.toUpperCase()}
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
          </div>{/* fim printRef */}
          </div>{/* fim p-4 wrapper */}
          </div>{/* fim scale wrapper */}
          </div>{/* fim flex center */}
        </div>{/* fim scrollRef */}

        {/* ── Barra de ações fixa no bottom ── */}
        <div className="shrink-0 border-t bg-background px-3 py-3 flex flex-wrap gap-2">
          <Button
            variant="gradient"
            size="sm"
            className="flex-1 min-w-[120px] gap-2"
            onClick={handlePrint}
            disabled={generating}
          >
            {generating
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            Baixar PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[100px] gap-2"
            onClick={handlePrintLegacy}
          >
            <Send className="w-4 h-4" />
            Imprimir
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-[120px] gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

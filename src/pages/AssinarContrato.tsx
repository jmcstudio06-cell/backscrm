import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, ShieldCheck, PenLine, Download, CheckCircle2, AlertTriangle, Clock, Sparkles, Lock, FileText, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDateBR } from "@/lib/utils";
import type { Contract, ContractClause } from "@/hooks/useContracts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface SignLink {
  id: string;
  contract_id: string;
  token: string;
  status: string;
  artist_signature_name: string | null;
  artist_signed_at: string | null;
  client_signature_name: string | null;
  client_signature_document: string | null;
  client_signature_email: string | null;
  client_signed_at: string | null;
  expires_at: string;
}

export default function AssinarContrato() {
  const { token, slug } = useParams<{ token: string; slug?: string }>();
  const [artistProfile, setArtistProfile] = useState<{ artist_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<SignLink | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientDoc, setClientDoc] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("get_signature_link_by_token", { _token: token });
      if (rpcError) throw rpcError;
      if (!data) {
        setError("Link não encontrado. Verifique se o endereço está correto.");
        return;
      }
      const payload = data as unknown as { link: SignLink; contract: Contract & { clauses: string | ContractClause[] } };
      const parsedContract: Contract = {
        ...payload.contract,
        clauses:
          typeof payload.contract.clauses === "string"
            ? JSON.parse(payload.contract.clauses)
            : payload.contract.clauses || [],
      };
      setLink(payload.link);
      setContract(parsedContract);
      setClientName(payload.link.client_signature_name || parsedContract.client_name || "");
      setClientDoc(payload.link.client_signature_document || parsedContract.client_document || "");
      setClientEmail(payload.link.client_signature_email || parsedContract.client_email || "");
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar o contrato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("artist_public_profiles")
        .select("artist_name, avatar_url")
        .eq("slug", slug)
        .maybeSingle();
      if (data) setArtistProfile(data);
    })();
  }, [slug]);

  useEffect(() => {
    load();
    document.title = "Assinatura de Contrato · Backstage PRO";
  }, [token]);

  const handleSign = async () => {
    if (!clientName.trim() || clientName.trim().length < 3) {
      toast.error("Digite seu nome completo");
      return;
    }
    if (!accepted) {
      toast.error("Você precisa concordar com os termos do contrato");
      return;
    }
    setSigning(true);
    try {
      const { error: rpcError } = await supabase.rpc("public_sign_contract", {
        _token: token!,
        _client_name: clientName.trim(),
        _client_document: clientDoc || null,
        _client_email: clientEmail || null,
      });
      if (rpcError) throw rpcError;
      toast.success("Contrato assinado com sucesso!");
      await load();
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { message?: string })?.message || "";
      if (msg.includes("artist_not_signed")) toast.error("O artista ainda não assinou este contrato.");
      else if (msg.includes("link_expired")) toast.error("Este link de assinatura expirou.");
      else if (msg.includes("already_signed")) toast.error("Contrato já foi assinado.");
      else toast.error("Erro ao assinar contrato");
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = async () => {
    if (!contractRef.current || !contract) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
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
      toast.success("PDF baixado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !link || !contract) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-warning mb-4" />
        <h1 className="text-xl font-bold mb-2">Link indisponível</h1>
        <p className="text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const isExpired = new Date(link.expires_at) < new Date();
  const artistSigned = !!link.artist_signed_at;
  const clientSigned = !!link.client_signed_at;
  const isSigned = link.status === "signed";
  const isCancelled = link.status === "cancelled";
  const finalValue = contract.total_value - contract.discount;
  const artistName = contract.artist_name || "ARTISTA";
  const artistDocument = contract.artist_document || "";
  const artistAddress = contract.artist_address || "";

  const fillTokens = (text: string) => {
    const map: Record<string, string> = {
      "[VALOR]": `R$ ${finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "[VALOR TOTAL]": `R$ ${finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      "[NOME DO ARTISTA]": artistName,
      "[NOME DA EMPRESA]": artistName,
      "[NOME DO CONTRATANTE]": contract.client_name || "",
      "[CPF DO CONTRATANTE]": contract.client_document || "",
      "[CPF]": artistDocument,
      "[ENDEREÇO]": artistAddress,
      "[LOCAL]": contract.event_location || "",
      "[DATA]": contract.event_date ? formatDateBR(contract.event_date) : "",
      "[HORARIO]": contract.event_time || "",
      "[HORÁRIO]": contract.event_time || "",
      "[DURACAO]": contract.event_duration || "",
      "[DURAÇÃO]": contract.event_duration || "",
      "[FORMATO]": contract.event_type || "",
      "[CIDADE]": contract.event_location?.split(",")[0]?.trim() || "",
      "[CIDADE E UF]": contract.event_location || "",
      "[FORMA DE PAGAMENTO]": contract.payment_terms || "",
      "XXXX": "",
      "XXX.XXX.XXX-XX": artistDocument || "não informado",
    };
    let out = text;
    for (const [k, v] of Object.entries(map)) out = out.split(k).join(v);
    return out.replace(/\[[A-ZÀ-Ú ÇÃÉÍÓÚ]+\]/g, "").replace(/ {2,}/g, " ");
  };

  const creationDate = new Date(contract.created_at);
  const creationDay = creationDate.getDate();
  const creationMonth = creationDate.toLocaleDateString("pt-BR", { month: "long" });
  const creationYear = creationDate.getFullYear();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky brand header */}
      <div className="bg-gradient-to-r from-primary to-primary/70 text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {artistProfile?.avatar_url ? (
              <img src={artistProfile.avatar_url} alt={artistProfile.artist_name || "Artista"} className="w-9 h-9 rounded-full object-cover ring-2 ring-white/40" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {(artistProfile?.artist_name || contract?.artist_name || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="font-bold truncate">{artistProfile?.artist_name || contract?.artist_name || "Backstage PRO"}</div>
              <div className="text-[11px] opacity-80 truncate">Assinatura digital de contrato</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs bg-white/15 rounded-full px-3 py-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Documento oficial
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
        {/* Status banner */}
        <div className={`rounded-2xl p-5 shadow-sm border ${
          isSigned ? "bg-success/10 border-success/30" :
          isCancelled ? "bg-muted border-muted-foreground/20" :
          isExpired ? "bg-warning/10 border-warning/30" :
          !artistSigned ? "bg-warning/10 border-warning/30" :
          "bg-accent/10 border-accent/30"
        }`}>
          <div className="flex items-start gap-3">
            {isSigned ? <CheckCircle2 className="w-6 h-6 text-success mt-0.5" /> :
             isCancelled ? <AlertTriangle className="w-6 h-6 text-muted-foreground mt-0.5" /> :
             isExpired ? <AlertTriangle className="w-6 h-6 text-warning mt-0.5" /> :
             <Clock className="w-6 h-6 text-warning mt-0.5" />}
            <div className="flex-1">
              <h2 className="font-bold text-lg">
                {isSigned ? "Contrato assinado!" :
                 isCancelled ? "Link cancelado" :
                 isExpired ? "Link expirado" :
                 !artistSigned ? "Aguardando assinatura do artista" :
                 "Aguardando sua assinatura"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isSigned
                  ? `Assinado por ${link.client_signature_name} em ${formatDateBR(link.client_signed_at || "")}. Você já pode baixar o PDF oficial.`
                  : isCancelled
                    ? "Este link foi cancelado pelo artista. Solicite um novo link."
                    : isExpired
                      ? "Peça ao artista para gerar um novo link de assinatura."
                      : !artistSigned
                        ? "O artista ainda precisa assinar antes de você. Aguarde a atualização."
                        : `Confira o contrato abaixo, preencha seus dados e clique em "Assinar contrato".`}
              </p>
            </div>
          </div>

          {isSigned && (
            <Button onClick={handleDownload} className="w-full sm:w-auto mt-4" disabled={downloading} variant="gradient">
              {downloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Baixar contrato assinado (PDF)
            </Button>
          )}
        </div>

        {/* Progresso da assinatura */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 md:p-5">
          <div className="flex items-center justify-between gap-2">
            {[
              { label: "Contrato emitido", done: true, icon: FileText },
              { label: "Assinatura do artista", done: artistSigned, icon: PenLine },
              { label: "Assinatura do contratante", done: clientSigned, icon: Users },
              { label: "Documento válido", done: isSigned, icon: ShieldCheck },
            ].map((step, i, arr) => {
              const StepIcon = step.icon;
              return (
                <div key={step.label} className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="flex flex-col items-center gap-1.5 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 ${step.done ? "bg-success/15 border-success text-success" : "bg-muted border-border text-muted-foreground"}`}>
                      {step.done ? <CheckCircle2 className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] md:text-xs text-center leading-tight ${step.done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`h-0.5 flex-1 rounded ${arr[i + 1].done ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contract render */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-4 md:p-8">
            <div
              ref={contractRef}
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 12,
                color: "#333",
                lineHeight: 1.6,
                background: "#fff",
                padding: "20px 10px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingBottom: 15, borderBottom: "2px solid #333" }}>
                <div style={{ fontSize: 16, fontWeight: "bold" }}>{artistName.toUpperCase()}</div>
                <div style={{ fontSize: 11, color: "#999" }}>{contract.contract_number}</div>
              </div>

              <div style={{ background: "#333", color: "#fff", textAlign: "center", padding: "12px 20px", margin: "16px 0", fontSize: 15, fontWeight: "bold", letterSpacing: 1 }}>
                CONTRATO OFICIAL
              </div>

              <div style={{ fontSize: 13, fontWeight: "bold", margin: "15px 0 10px", borderBottom: "1px solid #333", paddingBottom: 5 }}>
                CONTRATO DE PRESTAÇÃO DE SERVIÇOS ARTÍSTICOS
              </div>

              <p style={{ textAlign: "justify", marginBottom: 12 }}>Pelo presente instrumento particular, de um lado:</p>
              <div style={{ marginBottom: 12, textAlign: "justify" }}>
                <strong>CONTRATADA:</strong> {artistName}, portador do CPF/CNPJ nº {artistDocument || "não informado"}
                {artistAddress ? `, com endereço em ${artistAddress}` : ""}.
              </div>
              <p style={{ marginBottom: 12 }}>E de outro lado:</p>
              <div style={{ marginBottom: 12, textAlign: "justify" }}>
                <strong>CONTRATANTE:</strong> {(link.client_signature_name || contract.client_name).toUpperCase()},
                portador do CPF/CNPJ nº {link.client_signature_document || contract.client_document || "não informado"}
                {contract.client_address ? `, residente em ${contract.client_address}` : ""}.
              </div>

              <p style={{ textAlign: "center", fontStyle: "italic", margin: "18px 0" }}>
                As partes têm entre si justo e contratado o que segue:
              </p>

              {contract.clauses.map((clause, index) => (
                <div key={index} style={{ margin: "14px 0" }}>
                  <div style={{ fontWeight: "bold", background: "#f5f5f5", padding: "8px 12px", marginBottom: 8, borderLeft: "4px solid #333" }}>
                    CLÁUSULA {index + 1} – {clause.title.toUpperCase()}
                  </div>
                  <div style={{ padding: "0 12px", whiteSpace: "pre-wrap", textAlign: "justify" }}>
                    {fillTokens(clause.content)}
                  </div>
                  {clause.title.toUpperCase() === "OBJETO" && contract.event_date && (
                    <ul style={{ margin: "10px 0 10px 30px" }}>
                      <li><strong>Data do evento:</strong> {formatDateBR(contract.event_date, { day: "2-digit", month: "long", year: "numeric" })}</li>
                      {contract.event_time && <li><strong>Horário:</strong> {contract.event_time}</li>}
                      {contract.event_duration && <li><strong>Duração:</strong> {contract.event_duration}</li>}
                      {contract.event_type && <li><strong>Projeto:</strong> {contract.event_type}</li>}
                      {contract.event_location && <li><strong>Local:</strong> {contract.event_location}</li>}
                    </ul>
                  )}
                  {clause.title.toUpperCase() === "PAGAMENTO" && (
                    <div style={{ padding: "0 12px", marginTop: 8 }}>
                      <p>Valor total: <strong>R$ {finalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong></p>
                      {contract.payment_terms && <p style={{ marginTop: 4 }}>Forma de pagamento: {contract.payment_terms}</p>}
                    </div>
                  )}
                </div>
              ))}

              <div style={{ marginTop: 30, textAlign: "center" }}>
                <p>{creationDay} de {creationMonth} de {creationYear}.</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, gap: 20 }}>
                <div style={{ width: "48%", textAlign: "center" }}>
                  <div style={{ height: 46, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    {clientSigned ? (
                      <span style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 24, color: "#1a56db", lineHeight: 1 }}>
                        {link.client_signature_name}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: "#bbb" }}>Aguardando assinatura</span>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 8 }}>
                    <strong>CONTRATANTE</strong><br />
                    <span style={{ fontSize: 11 }}>{(link.client_signature_name || contract.client_name).toUpperCase()}</span><br />
                    <span style={{ fontSize: 10, color: "#666" }}>
                      CPF/CNPJ: {link.client_signature_document || contract.client_document || "não informado"}
                    </span>
                    {clientSigned && (
                      <>
                        <br />
                        <span style={{ fontSize: 10, color: "#666" }}>
                          Assinado digitalmente em {fmtStamp(link.client_signed_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ width: "48%", textAlign: "center" }}>
                  <div style={{ height: 46, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    {artistSigned ? (
                      <span style={{ fontFamily: "'Brush Script MT', cursive", fontSize: 24, color: "#1a56db", lineHeight: 1 }}>
                        {link.artist_signature_name}
                      </span>
                    ) : (
                      <span style={{ fontSize: 10, color: "#bbb" }}>Aguardando assinatura</span>
                    )}
                  </div>
                  <div style={{ borderTop: "1px solid #333", paddingTop: 8 }}>
                    <strong>CONTRATADA</strong><br />
                    <span style={{ fontSize: 11 }}>{(link.artist_signature_name || artistName).toUpperCase()}</span><br />
                    <span style={{ fontSize: 10, color: "#666" }}>
                      CPF/CNPJ: {artistDocument || "não informado"}
                    </span>
                    {artistSigned && (
                      <>
                        <br />
                        <span style={{ fontSize: 10, color: "#666" }}>
                          Assinado digitalmente em {fmtStamp(link.artist_signed_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>


              {isSigned && (
                <div style={{ marginTop: 30, padding: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, fontSize: 11, textAlign: "center", color: "#166534" }}>
                  ✔ Documento assinado digitalmente pelas duas partes via Backstage PRO — token: {link.token.slice(0, 12)}…
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client signature form */}
        {!isSigned && !isCancelled && !isExpired && artistSigned && (
          <div className="bg-white rounded-2xl shadow-sm border p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Assine seu contrato</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Confirme seus dados abaixo para registrar sua assinatura digital neste documento.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Nome completo *</Label>
                <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Como aparecerá na assinatura" />
              </div>
              <div>
                <Label>CPF / Documento</Label>
                <Input value={clientDoc} onChange={(e) => setClientDoc(e.target.value)} placeholder="000.000.000-00" />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="voce@email.com" />
              </div>
            </div>

            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Prévia da sua assinatura</p>
              <div style={{ fontFamily: "'Brush Script MT', cursive" }} className="text-3xl text-primary min-h-[44px] flex items-center justify-center">
                {clientName.trim() || "seu nome aqui"}
              </div>
            </div>

            <label className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-pointer">
              <Checkbox checked={accepted} onCheckedChange={(v) => setAccepted(!!v)} className="mt-0.5" />
              <span className="text-sm">
                Li e concordo com todos os termos e cláusulas deste contrato, e reconheço esta assinatura digital
                como válida e legalmente vinculativa.
              </span>
            </label>

            <Button variant="gradient" className="w-full" onClick={handleSign} disabled={signing || !accepted}>
              {signing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenLine className="w-4 h-4 mr-2" />}
              Assinar contrato
            </Button>
            <p className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3" /> Assinatura registrada com data, hora e token único de verificação.
            </p>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground py-4">
          Documento gerenciado por <strong>Backstage PRO</strong> · Assinatura digital rastreável
        </div>
      </div>
    </div>
  );
}

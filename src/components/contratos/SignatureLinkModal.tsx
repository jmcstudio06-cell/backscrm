import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, PenLine, Link2, Trash2, Clock, ShieldCheck, MessageCircle, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Contract } from "@/hooks/useContracts";
import { useContractSignatureLinks, ContractSignatureLink } from "@/hooks/useContractSignatureLinks";
import { formatDateBR } from "@/lib/utils";
import { useProfile } from "@/hooks/useProfile";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contract: Contract | null;
}

const statusMap = {
  awaiting_artist: { label: "Aguardando você assinar", color: "bg-warning/10 text-warning border-warning/20", icon: PenLine },
  awaiting_client: { label: "Aguardando cliente assinar", color: "bg-accent/10 text-accent border-accent/20", icon: Clock },
  signed: { label: "Assinado", color: "bg-success/10 text-success border-success/20", icon: ShieldCheck },
  cancelled: { label: "Cancelado", color: "bg-muted text-muted-foreground", icon: Trash2 },
} as const;

export function SignatureLinkModal({ isOpen, onClose, contract }: Props) {
  const { profile } = useProfile();
  const { links, loading, createLink, signAsArtist, cancelLink, deleteLink } = useContractSignatureLinks(contract?.id);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signatureName, setSignatureName] = useState("");
  const [creating, setCreating] = useState(false);

  if (!contract) return null;

  const PUBLIC_DOMAIN = "https://backstagepro.online";
  const slug = profile?.slug;
  const publicUrl = (token: string) =>
    slug ? `${PUBLIC_DOMAIN}/assinar/${slug}/${token}` : `${PUBLIC_DOMAIN}/assinar/${token}`;

  const handleCreate = async () => {
    setCreating(true);
    await createLink(contract.id);
    setCreating(false);
  };

  const handleCopy = async (link: ContractSignatureLink) => {
    try {
      await navigator.clipboard.writeText(publicUrl(link.token));
      setCopiedId(link.id);
      toast.success("Link copiado!");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Não foi possível copiar. Copie manualmente.");
    }
  };

  const handleWhatsApp = (link: ContractSignatureLink) => {
    const url = publicUrl(link.token);
    const msg = encodeURIComponent(
      `Olá ${contract.client_name}! 👋\n\nSegue o link para você conferir e assinar o contrato do nosso evento:\n\n${url}\n\nQualquer dúvida estou à disposição!`
    );
    let phone = contract.client_phone?.replace(/\D/g, "") || "";
    if (phone && !phone.startsWith("55")) phone = "55" + phone;
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
  };

  const handleSign = async (linkId: string) => {
    await signAsArtist(linkId, signatureName);
    setSigningId(null);
    setSignatureName("");
  };

  const activeLinks = links.filter((l) => l.status !== "cancelled");
  const canCreate = activeLinks.length === 0 || activeLinks.every((l) => l.status === "signed");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Link de Assinatura Online
          </DialogTitle>
          <DialogDescription>
            Contrato <strong>{contract.contract_number}</strong> · {contract.client_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-primary/30 bg-primary/5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <AlertDescription className="text-xs leading-relaxed">
              Gere um link público, assine primeiro como artista e envie ao cliente por WhatsApp ou e-mail.
              Assim que o cliente assinar, o contrato é marcado como <strong>assinado</strong> e fica disponível para download.
            </AlertDescription>
          </Alert>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : links.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl">
              <Link2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">Ainda não há link de assinatura para este contrato.</p>
              <Button variant="gradient" onClick={handleCreate} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Gerar link de assinatura
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const st = statusMap[link.status as keyof typeof statusMap] || statusMap.awaiting_artist;
                const StIcon = st.icon;
                const url = publicUrl(link.token);
                const isExpired = new Date(link.expires_at) < new Date();
                return (
                  <div key={link.id} className="border rounded-xl p-4 space-y-3 bg-card">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Badge variant="outline" className={st.color}>
                        <StIcon className="w-3 h-3 mr-1" />
                        {st.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Criado em {formatDateBR(link.created_at)}
                      </span>
                    </div>

                    {isExpired && link.status !== "signed" && (
                      <div className="flex items-center gap-2 text-xs text-warning">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Link expirado. Gere um novo.
                      </div>
                    )}

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 text-xs font-mono break-all">
                      <Link2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="flex-1">{url}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-muted/40">
                        <div className="text-muted-foreground mb-0.5">Artista</div>
                        {link.artist_signed_at ? (
                          <div className="font-medium text-success flex items-center gap-1">
                            <Check className="w-3 h-3" /> {link.artist_signature_name}
                          </div>
                        ) : (
                          <div className="text-warning">Aguardando</div>
                        )}
                      </div>
                      <div className="p-2 rounded-lg bg-muted/40">
                        <div className="text-muted-foreground mb-0.5">Cliente</div>
                        {link.client_signed_at ? (
                          <div className="font-medium text-success flex items-center gap-1">
                            <Check className="w-3 h-3" /> {link.client_signature_name}
                          </div>
                        ) : (
                          <div className="text-warning">Aguardando</div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    {link.status === "awaiting_artist" && !isExpired && (
                      signingId === link.id ? (
                        <div className="space-y-2 border-t pt-3">
                          <Label className="text-xs">Confirme seu nome completo para assinar</Label>
                          <Input
                            value={signatureName}
                            onChange={(e) => setSignatureName(e.target.value)}
                            placeholder={profile?.artist_name || profile?.name || "Seu nome"}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" variant="gradient" onClick={() => handleSign(link.id)} disabled={!signatureName.trim()}>
                              <PenLine className="w-3.5 h-3.5 mr-1" /> Confirmar assinatura
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setSigningId(null); setSignatureName(""); }}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button size="sm" variant="gradient" onClick={() => { setSigningId(link.id); setSignatureName(profile?.artist_name || profile?.name || ""); }} className="w-full">
                          <PenLine className="w-4 h-4 mr-2" /> Assinar como artista
                        </Button>
                      )
                    )}

                    {link.status === "awaiting_client" && !isExpired && (
                      <div className="grid grid-cols-3 gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleCopy(link)}>
                          {copiedId === link.id ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          {copiedId === link.id ? "Copiado" : "Copiar"}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleWhatsApp(link)} className="col-span-1">
                          <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => cancelLink(link.id)} className="text-destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Cancelar
                        </Button>
                      </div>
                    )}

                    {link.status === "signed" && (
                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="text-xs text-muted-foreground">
                          Assinado em {formatDateBR(link.client_signed_at || "")}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => handleCopy(link)}>
                          {copiedId === link.id ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                          Copiar link
                        </Button>
                      </div>
                    )}

                    {link.status === "cancelled" && (
                      <Button size="sm" variant="ghost" onClick={() => deleteLink(link.id)} className="text-destructive w-full">
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Excluir do histórico
                      </Button>
                    )}
                  </div>
                );
              })}

              {canCreate && (
                <Button variant="outline" onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Gerar novo link
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

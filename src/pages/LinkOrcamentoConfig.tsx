import { useEffect, useRef, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { useProfile } from "@/hooks/useProfile";
import { useFeatureBlocks } from "@/hooks/useFeatureBlocks";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { processImage, formatFileSize } from "@/lib/imageUtils";
import { LivePreviewFrame } from "@/components/configuracoes/LivePreviewFrame";
import {
  Copy,
  Check,
  ExternalLink,
  FileText,
  Lock,
  Crown,
  Image as ImageIcon,
  Camera,
  Loader2,
  Trash2,
  Youtube,
  Plus,
  X,
  Sparkles,
  Quote,
  Star,
} from "lucide-react";
import { toast } from "sonner";

const PUBLIC_DOMAIN = "https://backstagepro.online";
const FEATURE_KEY = "link-orcamento";

type Pkg = {
  title: string;
  subtitle: string;
  price_text: string;
  features: string[];
  highlighted: boolean;
};

type Review = {
  author: string;
  role: string;
  text: string;
  rating: number;
  image_url: string;
};

const emptyPkg = (): Pkg => ({
  title: "",
  subtitle: "",
  price_text: "",
  features: [""],
  highlighted: false,
});

const emptyReview = (): Review => ({
  author: "",
  role: "",
  text: "",
  rating: 5,
  image_url: "",
});

export default function LinkOrcamentoConfig() {
  const { profile, updateProfile } = useProfile();
  const { isBlocked } = useFeatureBlocks();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingReviewIdx, setUploadingReviewIdx] = useState<number | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const blocked = isBlocked(FEATURE_KEY);
  const orcamentoUrl = profile?.slug ? `${PUBLIC_DOMAIN}/orcamento/${profile.slug}` : null;

  const [enabled, setEnabled] = useState(true);
  const [headline, setHeadline] = useState("");
  const [intro, setIntro] = useState("");
  const [bgImageUrl, setBgImageUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverType, setCoverType] = useState<"photo" | "video">("photo");
  const [videoUrl, setVideoUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!profile) return;
    const p: any = profile;
    setEnabled(p.budget_link_enabled ?? true);
    setHeadline(p.budget_headline || "");
    setIntro(p.budget_intro || "");
    setBgImageUrl(p.budget_bg_image_url || "");
    setCoverImageUrl(p.budget_cover_image_url || "");
    setCoverType((p.budget_cover_type as "photo" | "video") || "photo");
    setVideoUrl(p.budget_video_url || "");
    setWhatsapp(p.budget_whatsapp || "");
    const pkgs = Array.isArray(p.budget_packages) ? p.budget_packages : [];
    setPackages(
      pkgs.length
        ? pkgs.map((x: any) => ({
            title: x?.title || "",
            subtitle: x?.subtitle || "",
            price_text: x?.price_text || "",
            features: Array.isArray(x?.features) ? x.features : [""],
            highlighted: !!x?.highlighted,
          }))
        : []
    );
    const revs = Array.isArray(p.budget_reviews) ? p.budget_reviews : [];
    setReviews(
      revs.map((x: any) => ({
        author: x?.author || "",
        role: x?.role || "",
        text: x?.text || "",
        rating: Number(x?.rating) || 5,
        image_url: x?.image_url || "",
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.user_id]);

  const uploadImage = async (
    file: File,
    prefix: string
  ): Promise<string | null> => {
    if (!profile) return null;
    const result = await processImage(file);
    if (!result.valid || !result.file) {
      toast.error(result.error || "Erro ao processar imagem");
      return null;
    }
    const processed = result.file;
    const ext = processed.type === "image/webp" ? "webp" : "jpg";
    const fileName = `${profile.user_id}/${prefix}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(fileName, processed, {
      upsert: true,
      contentType: processed.type,
    });
    if (upErr) {
      toast.error("Erro ao enviar imagem");
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    toast.success(`Imagem atualizada (${formatFileSize(processed.size)})`);
    return data.publicUrl || null;
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    const url = await uploadImage(file, "budget-bg");
    if (url) {
      setBgImageUrl(url);
      await updateProfile({ budget_bg_image_url: url } as any);
    }
    setUploadingBg(false);
    if (bgInputRef.current) bgInputRef.current.value = "";
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    const url = await uploadImage(file, "budget-cover");
    if (url) {
      setCoverImageUrl(url);
      await updateProfile({ budget_cover_image_url: url } as any);
    }
    setUploadingCover(false);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleReviewImageUpload = async (idx: number, file: File) => {
    setUploadingReviewIdx(idx);
    const url = await uploadImage(file, `review-${idx}`);
    if (url) {
      const next = [...reviews];
      next[idx] = { ...next[idx], image_url: url };
      setReviews(next);
    }
    setUploadingReviewIdx(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        budget_link_enabled: enabled,
        budget_headline: headline || null,
        budget_intro: intro || null,
        budget_bg_image_url: bgImageUrl || null,
        budget_cover_image_url: coverImageUrl || null,
        budget_cover_type: coverType,
        budget_video_url: videoUrl || null,
        budget_whatsapp: whatsapp.replace(/\D/g, "") || null,
        budget_packages: packages.filter((p) => p.title || p.price_text) as any,
        budget_reviews: reviews.filter((r) => r.author || r.text) as any,
      } as any);
      toast.success("Link Orçamento atualizado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!orcamentoUrl) return;
    navigator.clipboard.writeText(orcamentoUrl);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const addPkg = () => setPackages([...packages, emptyPkg()]);
  const removePkg = (i: number) => setPackages(packages.filter((_, x) => x !== i));
  const updatePkg = (i: number, patch: Partial<Pkg>) =>
    setPackages(packages.map((p, x) => (x === i ? { ...p, ...patch } : p)));
  const addFeature = (i: number) =>
    updatePkg(i, { features: [...packages[i].features, ""] });
  const updateFeature = (i: number, fi: number, v: string) => {
    const f = [...packages[i].features];
    f[fi] = v;
    updatePkg(i, { features: f });
  };
  const removeFeature = (i: number, fi: number) =>
    updatePkg(i, { features: packages[i].features.filter((_, x) => x !== fi) });

  const addReview = () => setReviews([...reviews, emptyReview()]);
  const removeReview = (i: number) => setReviews(reviews.filter((_, x) => x !== i));
  const updateReview = (i: number, patch: Partial<Review>) =>
    setReviews(reviews.map((r, x) => (x === i ? { ...r, ...patch } : r)));

  return (
    <Layout
      title="Link Orçamento"
      subtitle="Página exclusiva para apresentar seus pacotes e receber pedidos de orçamento"
    >
      <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {!blocked && (
          <LivePreviewFrame
            url={orcamentoUrl}
            title="Sua página Link Orçamento"
            subtitle="Veja como sua página aparece para contratantes"
            refreshKey={(profile as any)?.updated_at}
          />
        )}

        {/* Card do Link */}
        <div className="rounded-2xl border border-border/50 bg-card shadow-card overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">Link Orçamento</h3>
                  {blocked && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-warning/15 text-warning">
                      <Crown className="w-3 h-3" />
                      Profissional
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Envie para contratantes e feche mais shows com uma página de apresentação
                  profissional.
                </p>
              </div>
            </div>

            {blocked ? (
              <div className="mt-4 rounded-lg bg-secondary/30 border border-dashed border-border p-4 flex flex-col sm:flex-row items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                <p className="text-sm text-muted-foreground flex-1 text-center sm:text-left">
                  Recurso disponível no plano{" "}
                  <span className="font-semibold text-foreground">Profissional</span> ou superior
                </p>
                <Button size="sm" variant="gradient" onClick={() => navigate("/planos")}>
                  <Crown className="w-4 h-4 mr-1.5" /> Garantir acesso
                </Button>
              </div>
            ) : orcamentoUrl ? (
              <div className="mt-4 flex items-center gap-2 p-3 bg-secondary/30 rounded-lg border border-border/50">
                <code className="flex-1 text-xs sm:text-sm text-foreground truncate">
                  {orcamentoUrl}
                </code>
                <Button size="sm" variant="outline" onClick={handleCopy} className="h-9 px-3">
                  {copied ? (
                    <Check className="w-4 h-4 text-success mr-1.5" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1.5" />
                  )}
                  Copiar
                </Button>
                <Button size="sm" variant="outline" asChild className="h-9 w-9 p-0">
                  <a href={orcamentoUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            ) : (
              <p className="mt-4 text-xs text-muted-foreground italic text-center py-3 bg-secondary/30 rounded-lg border border-border/50">
                Configure seu nome artístico no Perfil Artístico para gerar este link
              </p>
            )}
          </div>
        </div>

        {blocked && <div />}

        {!blocked && (
          <>
            {/* Publicação */}
            <Card className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Página publicada</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Desative para tirar sua página do ar temporariamente.
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={async (v) => {
                  setEnabled(v);
                  await updateProfile({ budget_link_enabled: v } as any);
                }}
              />
            </Card>

            {/* Capa e fundo */}
            <Card className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Capa e Fundo</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize o visual da sua página de orçamento.
                </p>
              </div>

              {/* Fundo */}
              <div>
                <Label>Imagem de fundo (aparece desfocada)</Label>
                <input
                  ref={bgInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBgUpload}
                />
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border/60 bg-secondary/30 flex items-center justify-center shrink-0">
                    {bgImageUrl ? (
                      <img src={bgImageUrl} alt="Fundo" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => bgInputRef.current?.click()}
                      disabled={uploadingBg}
                    >
                      {uploadingBg ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-1.5" />
                          {bgImageUrl ? "Trocar" : "Enviar"}
                        </>
                      )}
                    </Button>
                    {bgImageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          setBgImageUrl("");
                          await updateProfile({ budget_bg_image_url: null } as any);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Capa tipo */}
              <div>
                <Label>Capa em destaque</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {(["photo", "video"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={async () => {
                        setCoverType(t);
                        await updateProfile({ budget_cover_type: t } as any);
                      }}
                      className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                        coverType === t
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border/60 bg-secondary/20 hover:border-border"
                      }`}
                    >
                      {coverType === t && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md mb-3 ${
                          t === "photo"
                            ? "bg-gradient-to-br from-sky-500 to-blue-600"
                            : "bg-gradient-to-br from-red-500 to-rose-600"
                        }`}
                      >
                        {t === "photo" ? (
                          <ImageIcon className="w-5 h-5" />
                        ) : (
                          <Youtube className="w-5 h-5" />
                        )}
                      </div>
                      <p className="font-semibold text-foreground">
                        {t === "photo" ? "Foto" : "Vídeo do YouTube"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t === "photo"
                          ? "Mostra uma foto como capa principal."
                          : "Toca ao clicar. Configure o link abaixo."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Foto de capa customizada */}
              <div>
                <Label>Foto de capa (opcional)</Label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
                <div className="mt-2 flex items-center gap-3">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-border/60 bg-secondary/30 flex items-center justify-center shrink-0">
                    {coverImageUrl ? (
                      <img src={coverImageUrl} alt="Capa" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                    >
                      {uploadingCover ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Enviando...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-1.5" />
                          {coverImageUrl ? "Trocar" : "Enviar"}
                        </>
                      )}
                    </Button>
                    {coverImageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          setCoverImageUrl("");
                          await updateProfile({ budget_cover_image_url: null } as any);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Remover
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Se não enviar, será usada sua foto de perfil.
                </p>
              </div>

              {coverType === "video" && (
                <div>
                  <Label>Vídeo do YouTube</Label>
                  <Input
                    className="mt-1"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}
            </Card>

            {/* Textos */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Apresentação</h3>
              <div>
                <Label>Título principal</Label>
                <Input
                  className="mt-1"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Faça seu evento inesquecível"
                />
              </div>
              <div>
                <Label>Texto de apresentação</Label>
                <Textarea
                  className="mt-1"
                  value={intro}
                  onChange={(e) => setIntro(e.target.value)}
                  rows={4}
                  placeholder="Conte quem você é, seu diferencial e o que oferece..."
                />
              </div>
              <div>
                <Label>WhatsApp para orçamento (opcional)</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm text-muted-foreground font-mono shrink-0">
                    https://wa.me/
                  </span>
                  <Input
                    inputMode="numeric"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                    placeholder="5511999999999"
                    maxLength={15}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Deixe em branco para usar o WhatsApp do seu perfil ou o Link da bio.
                </p>
              </div>
            </Card>

            {/* Pacotes */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" /> Pacotes / Formatos
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Ex: Voz e Violão, Trio, Banda Completa...
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addPkg}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>

              {packages.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-6 bg-secondary/20 rounded-lg border border-dashed border-border">
                  Nenhum pacote adicionado ainda.
                </p>
              )}

              {packages.map((pkg, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Pacote {i + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Switch
                          checked={pkg.highlighted}
                          onCheckedChange={(v) => updatePkg(i, { highlighted: v })}
                        />
                        Destaque
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removePkg(i)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Título</Label>
                      <Input
                        value={pkg.title}
                        onChange={(e) => updatePkg(i, { title: e.target.value })}
                        placeholder="Voz e Violão"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Subtítulo</Label>
                      <Input
                        value={pkg.subtitle}
                        onChange={(e) => updatePkg(i, { subtitle: e.target.value })}
                        placeholder="Perfeito para bares e eventos íntimos"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Preço (texto livre)</Label>
                    <Input
                      value={pkg.price_text}
                      onChange={(e) => updatePkg(i, { price_text: e.target.value })}
                      placeholder="Ex: A partir de R$ 800"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs">O que está incluso</Label>
                      <Button type="button" size="sm" variant="ghost" onClick={() => addFeature(i)}>
                        <Plus className="w-3 h-3 mr-1" /> Item
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {pkg.features.map((f, fi) => (
                        <div key={fi} className="flex items-center gap-2">
                          <Input
                            value={f}
                            onChange={(e) => updateFeature(i, fi, e.target.value)}
                            placeholder="Ex: 3 horas de apresentação"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFeature(i, fi)}
                            className="text-destructive shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            {/* Depoimentos */}
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Quote className="w-4 h-4 text-amber-500" /> Depoimentos
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Prova social é o que fecha o orçamento.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={addReview}>
                  <Plus className="w-4 h-4 mr-1" /> Adicionar
                </Button>
              </div>

              {reviews.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-6 bg-secondary/20 rounded-lg border border-dashed border-border">
                  Nenhum depoimento ainda.
                </p>
              )}

              {reviews.map((r, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Depoimento {i + 1}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeReview(i)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div>
                    <Label className="text-xs">Depoimento</Label>
                    <Textarea
                      value={r.text}
                      onChange={(e) => updateReview(i, { text: e.target.value })}
                      rows={3}
                      placeholder="O show foi incrível, superou nossas expectativas..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Nome</Label>
                      <Input
                        value={r.author}
                        onChange={(e) => updateReview(i, { author: e.target.value })}
                        placeholder="Ana Silva"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Papel / Evento</Label>
                      <Input
                        value={r.role}
                        onChange={(e) => updateReview(i, { role: e.target.value })}
                        placeholder="Casamento — Nov/2025"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <Label className="text-xs">Estrelas</Label>
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => updateReview(i, { rating: s })}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                s <= r.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1">
                      <Label className="text-xs">Foto (opcional)</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {r.image_url && (
                          <img
                            src={r.image_url}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-border/60"
                          />
                        )}
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleReviewImageUpload(i, f);
                            }}
                          />
                          <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-border bg-background hover:bg-secondary/50">
                            {uploadingReviewIdx === i ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Camera className="w-3 h-3" />
                            )}
                            {r.image_url ? "Trocar" : "Enviar"}
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Card>

            <div className="sticky bottom-4 flex justify-end">
              <Button size="lg" onClick={handleSave} disabled={saving} className="shadow-lg">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...
                  </>
                ) : (
                  <>Salvar alterações</>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

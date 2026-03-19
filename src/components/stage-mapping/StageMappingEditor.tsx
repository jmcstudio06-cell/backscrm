import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  MapPin,
  List,
  Package,
  Info
} from "lucide-react";
import { StageCanvas } from "./StageCanvas";
import { InputList } from "./InputList";
import { MaterialsChecklist } from "./MaterialsChecklist";
import { EventInfo } from "./EventInfo";
import { 
  StageMapping, 
  StageElement, 
  InputChannel, 
  MaterialsChecklist as MaterialsChecklistType 
} from "@/hooks/useStageMappings";
import { toast } from "sonner";
import html2canvas from "html2canvas";
// Importar imagens para o PDF
import drummerImg from '@/assets/stage/drummer.png';
import guitaristImg from '@/assets/stage/guitarist.png';
import keyboardistImg from '@/assets/stage/keyboardist.png';
import bassistImg from '@/assets/stage/bassist.png';
import singerImg from '@/assets/stage/singer.png';
import ampImg from '@/assets/stage/amp.png';
import accordionistImg from '@/assets/stage/accordionist.png';
import acousticImg from '@/assets/stage/acoustic.png';
import brassImg from '@/assets/stage/brass.png';
import power110vImg from '@/assets/stage/power110v.png';
import power220vImg from '@/assets/stage/power220v.png';
import siderImg from '@/assets/stage/sider.png';
import rackImg from '@/assets/stage/rack.png';
import monitor1Img from '@/assets/stage/monitor1.png';
import monitor2Img from '@/assets/stage/monitor2.png';
import stairsImg from '@/assets/stage/stairs.png';
import riserImg from '@/assets/stage/riser.png';
import pedalboardImg from '@/assets/stage/pedalboard.png';

const ELEMENT_TYPE_IMAGES: Record<string, string> = {
  vocal: singerImg,
  backing: singerImg,
  guitar: guitaristImg,
  acoustic: acousticImg,
  bass: bassistImg,
  keyboard: keyboardistImg,
  drums: drummerImg,
  accordion: accordionistImg,
  brass: brassImg,
  amp: ampImg,
  pedalboard: pedalboardImg,
  sider: siderImg,
  monitor1: monitor1Img,
  monitor2: monitor2Img,
  rack: rackImg,
  stairs: stairsImg,
  riser: riserImg,
  power110v: power110vImg,
  power220v: power220vImg,
};

const ELEMENT_TYPE_SIZES: Record<string, { width: number; height: number }> = {
  vocal: { width: 65, height: 85 },
  backing: { width: 65, height: 85 },
  guitar: { width: 70, height: 85 },
  acoustic: { width: 70, height: 85 },
  bass: { width: 70, height: 85 },
  keyboard: { width: 90, height: 85 },
  drums: { width: 100, height: 85 },
  accordion: { width: 70, height: 85 },
  brass: { width: 65, height: 85 },
  amp: { width: 50, height: 40 },
  pedalboard: { width: 60, height: 35 },
  sider: { width: 45, height: 70 },
  monitor1: { width: 70, height: 45 },
  monitor2: { width: 65, height: 55 },
  rack: { width: 80, height: 55 },
  stairs: { width: 100, height: 80 },
  riser: { width: 100, height: 100 },
  power110v: { width: 40, height: 45 },
  power220v: { width: 40, height: 45 },
};

function generateStageHtml(stageLayout: StageElement[], artistName: string): string {
  const elements = stageLayout.map((el) => {
    const image = ELEMENT_TYPE_IMAGES[el.type] || "";
    const size = ELEMENT_TYPE_SIZES[el.type] || { width: 60, height: 60 };
    const scale = el.scale || 1;
    const rotation = el.rotation || 0;
    const width = size.width * scale;
    const height = size.height * scale;

    return `
      <div style="position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${width}px; height: ${height}px;">
        <img src="${image}" style="width: 100%; height: 100%; object-fit: contain; transform: rotate(${rotation}deg);" />
        <div style="position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%); white-space: nowrap;">
          <span style="font-weight: bold; font-size: 9px; color: #333; background: rgba(255,255,255,0.9); padding: 2px 4px; border-radius: 3px;">${el.name}</span>
        </div>
      </div>
    `;
  }).join("");

  return `
    <div style="position: relative; width: 1000px; aspect-ratio: 16/9; background: white; border: 2px solid #555; overflow: hidden; font-family: Arial, sans-serif;">
      <div style="background: #1a1a1a; padding: 12px 16px; text-align: center;">
        <h3 style="margin: 0; color: white; font-size: 18px; letter-spacing: 2px;">MAPEAMENTO DE PALCO</h3>
        ${artistName ? `<p style="margin: 4px 0 0; color: #ccc; font-size: 12px;">${artistName}</p>` : ""}
      </div>
      <div style="display: flex; justify-content: space-between; padding: 4px 16px; background: #f5f5f5; border-bottom: 1px solid #ddd; font-size: 10px; color: #666;">
        <span>8M (MÍNIMO)</span>
        <span>6M (MÍNIMO)</span>
      </div>
      <div style="position: relative; height: calc(100% - 60px); background: linear-gradient(to bottom, #fafafa, #f0f0f0);">
        ${artistName ? `<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;"><span style="font-weight: bold; color: rgba(0,0,0,0.06); font-size: 60px; text-transform: uppercase; letter-spacing: 8px;">${artistName}</span></div>` : ""}
        ${elements}
      </div>
    </div>
  `;
}

interface StageMappingEditorProps {
  mapping: StageMapping;
  onSave: (updates: Partial<StageMapping>) => Promise<void>;
  onBack: () => void;
}

export function StageMappingEditor({ mapping, onSave, onBack }: StageMappingEditorProps) {
  const [name, setName] = useState(mapping.name);
  const [artistName, setArtistName] = useState(mapping.artist_name || "");
  const [eventName, setEventName] = useState(mapping.event_name || "");
  const [eventDate, setEventDate] = useState(mapping.event_date || "");
  const [eventLocation, setEventLocation] = useState(mapping.event_location || "");
  const [technicalContact, setTechnicalContact] = useState(mapping.technical_contact || "");
  const [technicalPhone, setTechnicalPhone] = useState(mapping.technical_phone || "");
  const [stageLayout, setStageLayout] = useState<StageElement[]>(mapping.stage_layout);
  const [inputList, setInputList] = useState<InputChannel[]>(mapping.input_list);
  const [materialsChecklist, setMaterialsChecklist] = useState<MaterialsChecklistType>(mapping.materials_checklist);
  const [observations, setObservations] = useState(mapping.observations || "");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getCurrentData = useCallback(() => ({
    name,
    artist_name: artistName || null,
    event_name: eventName || null,
    event_date: eventDate || null,
    event_location: eventLocation || null,
    technical_contact: technicalContact || null,
    technical_phone: technicalPhone || null,
    stage_layout: stageLayout,
    input_list: inputList,
    materials_checklist: materialsChecklist,
    observations: observations || null,
  }), [name, artistName, eventName, eventDate, eventLocation, technicalContact, technicalPhone, stageLayout, inputList, materialsChecklist, observations]);

  // Auto-save after 3 seconds of inactivity
  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await onSave(getCurrentData());
        setLastSaved(new Date());
      } finally {
        setSaving(false);
      }
    }, 3000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [name, artistName, eventName, eventDate, eventLocation, technicalContact, technicalPhone, stageLayout, inputList, materialsChecklist, observations]);

  const handleSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    try {
      await onSave(getCurrentData());
      setLastSaved(new Date());
    } finally {
      setSaving(false);
    }
  };

  const handleEventInfoChange = (field: string, value: string) => {
    switch (field) {
      case "artist_name": setArtistName(value); break;
      case "event_name": setEventName(value); break;
      case "event_date": setEventDate(value); break;
      case "event_location": setEventLocation(value); break;
      case "technical_contact": setTechnicalContact(value); break;
      case "technical_phone": setTechnicalPhone(value); break;
    }
  };

  const handleElementAdded = (newChannels: InputChannel[]) => {
    const maxChannel = inputList.length > 0 
      ? Math.max(...inputList.map(c => c.channel)) 
      : 0;
    
    const channelsWithNumbers = newChannels.map((channel, index) => ({
      ...channel,
      channel: maxChannel + index + 1,
    }));
    
    setInputList([...inputList, ...channelsWithNumbers]);
  };

  const handlePrint = async () => {
    if (generatingPdf) return;

    setGeneratingPdf(true);
    toast.info("Gerando rider técnico...");

    try {
      const materialLabels: Record<string, string> = {
        microfones: "Microfones",
        pedestais: "Pedestais",
        di_box: "DI Box",
        cabos: "Cabos",
        retornos_palco: "Retornos de Palco",
        monitores: "Monitores",
        mesa_som: "Mesa de Som",
        energia_eletrica: "Energia Elétrica",
        iluminacao_basica: "Iluminação Básica",
      };

      // Gerar o mapeamento de palco em um container temporário offscreen
      let stageImageSrc = "";
      const tempContainer = document.createElement("div");
      tempContainer.style.cssText = "position: absolute; left: -9999px; top: 0; width: 1000px; background: white;";
      document.body.appendChild(tempContainer);

      try {
        // Renderizar o stage layout manualmente no container temporário
        const stageHtml = generateStageHtml(stageLayout, artistName);
        tempContainer.innerHTML = stageHtml;

        // Aguardar as imagens carregarem
        const images = tempContainer.querySelectorAll("img");
        await Promise.all(
          Array.from(images).map(
            (img) =>
              new Promise((resolve) => {
                if (img.complete) resolve(true);
                else {
                  img.onload = () => resolve(true);
                  img.onerror = () => resolve(true);
                }
              })
          )
        );

        await new Promise((r) => setTimeout(r, 300));

        const canvas = await html2canvas(tempContainer, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          width: 1000,
          windowWidth: 1000,
        });

        stageImageSrc = canvas.toDataURL("image/png", 1.0);
      } catch (error) {
        console.error("Erro ao capturar canvas:", error);
      } finally {
        document.body.removeChild(tempContainer);
      }

      const printContent = `
        <html>
          <head>
            <title>Rider Técnico - ${artistName || name}</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              @media print {
                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                .toolbar { display: none !important; }
                .stage-drawing { page-break-inside: avoid !important; }
                .info-grid { page-break-inside: avoid !important; }
                table { page-break-inside: avoid !important; }
                .materials { page-break-inside: avoid !important; }
                h2 { page-break-after: avoid !important; }
                img { page-break-inside: avoid !important; }
              }

              body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; background: white; }
              .toolbar { display: flex; gap: 10px; justify-content: center; margin: 0 0 16px; position: sticky; top: 0; background: white; padding: 10px 0; border-bottom: 1px solid #eee; z-index: 100; }
              .btn { background: #111; color: #fff; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 700; }
              .btn.secondary { background: #fff; color: #111; border: 1px solid #ddd; }

              h1 { color: #333; border-bottom: 3px solid #333; padding-bottom: 10px; text-align: center; font-size: 28px; margin-bottom: 20px; page-break-after: avoid; }
              h2 { color: #333; margin-top: 30px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px; page-break-after: avoid; }
              .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; page-break-inside: avoid; }
              .info-item { padding: 12px; background: #f8f8f8; border-radius: 6px; border-left: 4px solid #333; }
              .info-label { font-weight: bold; color: #555; font-size: 11px; text-transform: uppercase; }
              .info-value { font-size: 14px; margin-top: 4px; color: #111; }
              .stage-drawing { margin: 25px 0; text-align: center; page-break-inside: avoid; }
              .stage-drawing img { width: 100%; max-width: 900px; height: auto; border: 2px solid #333; display: block; margin: 0 auto; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; page-break-inside: avoid; }
              th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
              th { background: #333 !important; color: white !important; font-weight: bold; text-transform: uppercase; font-size: 11px; }
              tr:nth-child(even) { background: #f9f9f9 !important; }
              .materials { background: #f0f0f0 !important; padding: 15px 20px; border-radius: 8px; margin: 20px 0; page-break-inside: avoid; }
              .materials-list { display: flex; flex-wrap: wrap; gap: 10px; }
              .material-item { background: #333 !important; color: white !important; padding: 6px 12px; border-radius: 4px; font-size: 12px; }
              .observations { background: #fffbeb !important; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; page-break-inside: avoid; }
              .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <button class="btn" onclick="window.print()">Baixar PDF / Imprimir</button>
              <button class="btn secondary" onclick="window.close()">Fechar</button>
            </div>

            <h1>RIDER TÉCNICO</h1>
            
            <div class="info-grid">
              <div class="info-item"><div class="info-label">Artista/Banda</div><div class="info-value">${artistName || "-"}</div></div>
              <div class="info-item"><div class="info-label">Evento</div><div class="info-value">${eventName || "-"}</div></div>
              <div class="info-item"><div class="info-label">Data</div><div class="info-value">${eventDate ? new Date(eventDate).toLocaleDateString("pt-BR") : "-"}</div></div>
              <div class="info-item"><div class="info-label">Local</div><div class="info-value">${eventLocation || "-"}</div></div>
              <div class="info-item"><div class="info-label">Contato Técnico</div><div class="info-value">${technicalContact || "-"}</div></div>
              <div class="info-item"><div class="info-label">Telefone</div><div class="info-value">${technicalPhone || "-"}</div></div>
            </div>

            <h2>MAPEAMENTO DE PALCO</h2>
            <div class="stage-drawing">
              ${stageImageSrc ? `<img src="${stageImageSrc}" alt="Mapeamento de Palco" />` : "<p>Erro ao gerar imagem do palco</p>"}
            </div>

            <h2>INPUT LIST</h2>
            ${inputList.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th style="width: 60px;">Canal</th>
                    <th>Instrumento / Função</th>
                    <th>Microfone</th>
                    <th style="width: 60px;">DI</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  ${inputList.map(channel => `
                    <tr>
                      <td style="text-align: center; font-weight: bold;">${channel.channel}</td>
                      <td>${channel.instrument}</td>
                      <td>${channel.micType || "-"}</td>
                      <td style="text-align: center;">${channel.di ? "✓" : "-"}</td>
                      <td>${channel.observations || "-"}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            ` : "<p>Nenhum canal configurado</p>"}

            <h2>MATERIAL SOLICITADO</h2>
            <div class="materials">
              ${Object.entries(materialsChecklist).filter(([_, value]) => value).length > 0 ? `
                <div class="materials-list">
                  ${Object.entries(materialsChecklist)
                    .filter(([_, value]) => value)
                    .map(([key]) => `<span class="material-item">${materialLabels[key] || key}</span>`)
                    .join("")}
                </div>
              ` : "Nenhum material selecionado"}
            </div>

            ${observations ? `
              <h2>OBSERVAÇÕES</h2>
              <div class="observations">${observations}</div>
            ` : ""}

            <div class="footer">
              Rider gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
            </div>
          </body>
        </html>
      `;

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast.error("Não foi possível abrir a prévia. Libere pop-ups e tente novamente.");
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      toast.success("Prévia aberta em uma nova aba. Clique em 'Baixar PDF / Imprimir'.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button variant="ghost" onClick={onBack} size="sm">
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="w-full sm:w-auto">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base sm:text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0 w-full"
              placeholder="Nome do Mapeamento"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {lastSaved && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              {saving ? "Salvando..." : `Salvo às ${lastSaved.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint} disabled={generatingPdf} className="flex-1 sm:flex-initial">
            <Printer className="w-4 h-4 sm:mr-1" />
            <span className="hidden sm:inline">{generatingPdf ? "Gerando..." : "Gerar PDF"}</span>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1 sm:flex-initial">
            <Save className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{saving ? "Salvando..." : "Salvar"}</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stage" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stage" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="hidden sm:inline">Palco</span>
          </TabsTrigger>
          <TabsTrigger value="input" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">Input List</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Materiais</span>
          </TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            <span className="hidden sm:inline">Evento</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stage" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Desenho do Palco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <StageCanvas 
                elements={stageLayout} 
                onChange={setStageLayout}
                onElementAdded={handleElementAdded}
                artistName={artistName}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="input" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                Input List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InputList 
                channels={inputList} 
                onChange={setInputList} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Material Solicitado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MaterialsChecklist 
                checklist={materialsChecklist}
                observations={observations}
                onChange={setMaterialsChecklist}
                onObservationsChange={setObservations}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Identificação do Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EventInfo
                artistName={artistName}
                eventName={eventName}
                eventDate={eventDate}
                eventLocation={eventLocation}
                technicalContact={technicalContact}
                technicalPhone={technicalPhone}
                onChange={handleEventInfoChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
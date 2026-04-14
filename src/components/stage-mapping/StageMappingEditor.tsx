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
import acousticImg from '@/assets/stage/acoustic-transparent.png';
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

      const dateFormatted = eventDate ? new Date(eventDate).toLocaleDateString("pt-BR") : "-";
      const now = new Date();
      const generatedAt = `${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`;
      const totalChannels = inputList.length;
      const totalDI = inputList.filter(c => c.di).length;
      const activeMaterials = Object.entries(materialsChecklist).filter(([_, v]) => v);

      const printContent = `
        <html>
          <head>
            <title>Rider Técnico - ${artistName || name}</title>
            <meta charset="utf-8" />
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              :root {
                --gold: #D4A853;
                --gold-light: #F0DBA8;
                --dark: #111111;
                --dark-2: #1a1a1a;
                --dark-3: #222222;
                --gray-1: #333333;
                --gray-2: #666666;
                --gray-3: #999999;
                --gray-4: #cccccc;
                --gray-5: #f0f0f0;
                --white: #ffffff;
              }
              
              @media print {
                body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                .toolbar { display: none !important; }
                .page-break { page-break-before: always; }
                section { page-break-inside: avoid; }
              }
              
              body {
                font-family: 'Inter', Arial, sans-serif;
                background: var(--white);
                color: var(--dark);
                padding: 0;
                margin: 0;
              }

              .toolbar {
                display: flex; gap: 12px; justify-content: center; align-items: center;
                padding: 16px; background: var(--dark); position: sticky; top: 0; z-index: 100;
              }
              .btn {
                background: var(--gold); color: var(--dark); border: none;
                padding: 12px 24px; border-radius: 8px; cursor: pointer;
                font-weight: 700; font-size: 14px; letter-spacing: 0.5px;
                transition: all 0.2s;
              }
              .btn:hover { background: var(--gold-light); }
              .btn.secondary { background: transparent; color: var(--white); border: 1px solid rgba(255,255,255,0.3); }
              .btn.secondary:hover { border-color: var(--white); }

              .page { max-width: 900px; margin: 0 auto; padding: 40px 32px; }

              /* === HEADER === */
              .header {
                text-align: center; padding: 10px 0 20px; margin-bottom: 32px;
              }
              .header h1 {
                color: var(--dark); font-size: 32px; font-weight: 800;
                letter-spacing: 1px; border-bottom: 3px solid var(--dark);
                padding-bottom: 12px; margin-bottom: 8px;
              }
              .header .subtitle {
                color: var(--gray-2); font-size: 14px; font-weight: 500;
                margin-top: 4px;
              }
              .header .generated {
                color: var(--gray-3); font-size: 11px; margin-top: 8px;
              }

              /* === INFO GRID === */
              .info-section { margin-bottom: 32px; }
              .info-grid {
                display: grid; grid-template-columns: 1fr 1fr 1fr;
                gap: 0; border: 1px solid var(--gray-4); border-radius: 12px; overflow: hidden;
              }
              .info-cell {
                padding: 16px 20px; border-right: 1px solid var(--gray-4);
                border-bottom: 1px solid var(--gray-4); background: var(--white);
              }
              .info-cell:nth-child(3), .info-cell:nth-child(6) { border-right: none; }
              .info-cell:nth-child(4), .info-cell:nth-child(5), .info-cell:nth-child(6) { border-bottom: none; }
              .info-cell .label {
                font-size: 10px; font-weight: 700; text-transform: uppercase;
                letter-spacing: 1.2px; color: var(--gray-3); margin-bottom: 6px;
              }
              .info-cell .value { font-size: 15px; font-weight: 600; color: var(--dark); }

              /* === SECTION HEADER === */
              .section-header {
                display: flex; align-items: center; gap: 12px;
                margin: 36px 0 20px; padding-bottom: 12px;
                border-bottom: 2px solid var(--dark);
              }
              .section-number {
                background: var(--dark); color: var(--white);
                width: 32px; height: 32px; border-radius: 8px;
                display: flex; align-items: center; justify-content: center;
                font-weight: 800; font-size: 14px; flex-shrink: 0;
              }
              .section-header h2 {
                font-size: 18px; font-weight: 800; letter-spacing: 1px;
                text-transform: uppercase; color: var(--dark);
              }

              /* === STAGE MAP === */
              .stage-container {
                border: 2px solid var(--dark); border-radius: 12px; overflow: hidden;
                margin-bottom: 8px; background: var(--white);
              }
              .stage-container img { width: 100%; display: block; }

              /* === STATS BAR === */
              .stats-bar {
                display: flex; gap: 12px; margin: 20px 0 0;
              }
              .stat-chip {
                display: flex; align-items: center; gap: 6px;
                background: var(--gray-5); padding: 8px 16px; border-radius: 8px;
                font-size: 13px; font-weight: 600; color: var(--gray-1);
              }
              .stat-chip .num {
                background: var(--dark); color: var(--white);
                padding: 2px 8px; border-radius: 4px; font-weight: 800;
              }

              /* === TABLE === */
              .input-table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; border: 1px solid var(--gray-4); }
              .input-table thead th {
                background: var(--dark) !important; color: var(--white) !important;
                padding: 14px 16px; text-align: left;
                font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
              }
              .input-table tbody td {
                padding: 12px 16px; border-bottom: 1px solid var(--gray-5);
                font-size: 13px; color: var(--gray-1);
              }
              .input-table tbody tr:last-child td { border-bottom: none; }
              .input-table tbody tr:nth-child(even) { background: #fafafa !important; }
              .input-table .channel-num {
                font-weight: 800; font-size: 15px; color: var(--dark);
                text-align: center; width: 50px;
              }
              .input-table .di-yes {
                background: var(--dark) !important; color: var(--white) !important;
                padding: 3px 10px; border-radius: 4px; font-weight: 700; font-size: 11px;
                display: inline-block;
              }
              .input-table .di-no { color: var(--gray-3); }

              /* === MATERIALS === */
              .materials-grid {
                display: flex; flex-wrap: wrap; gap: 10px;
              }
              .material-tag {
                background: var(--dark) !important; color: var(--white) !important;
                padding: 10px 18px; border-radius: 8px;
                font-size: 13px; font-weight: 600;
                display: flex; align-items: center; gap: 8px;
              }
              .material-tag .check { color: var(--gold); font-weight: 800; }
              .no-materials {
                background: var(--gray-5); padding: 20px; border-radius: 12px;
                text-align: center; color: var(--gray-3); font-size: 14px;
              }

              /* === OBSERVATIONS === */
              .obs-box {
                background: linear-gradient(135deg, #FFFBF0, #FFF8E7) !important;
                border: 1px solid var(--gold-light);
                border-left: 4px solid var(--gold) !important;
                padding: 20px 24px; border-radius: 12px; margin-top: 8px;
                font-size: 14px; line-height: 1.7; color: var(--gray-1);
              }

              /* === FOOTER === */
              .footer-bar {
                margin-top: 48px; padding: 24px 0;
                border-top: 2px solid var(--dark);
                display: flex; justify-content: space-between; align-items: center;
              }
              .footer-logo {
                font-weight: 800; font-size: 14px; color: var(--dark);
                letter-spacing: 0.5px;
              }
              .footer-logo span { color: var(--gold); }
              .footer-info { font-size: 11px; color: var(--gray-3); }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <button class="btn" onclick="window.print()">⬇ Baixar PDF / Imprimir</button>
              <button class="btn secondary" onclick="window.close()">Fechar</button>
            </div>

            <div class="page">
              <!-- HEADER -->
              <div class="header">
                <h1>RIDER TÉCNICO</h1>
                ${(artistName || eventName) ? `<div class="subtitle">${artistName || ''}${artistName && eventName ? ' — ' : ''}${eventName || ''}</div>` : ''}
                <div class="generated">Documento gerado em ${generatedAt}</div>
              </div>

              <!-- EVENT INFO -->
              <div class="info-section">
                <div class="info-grid">
                  <div class="info-cell">
                    <div class="label">Artista / Banda</div>
                    <div class="value">${artistName || "-"}</div>
                  </div>
                  <div class="info-cell">
                    <div class="label">Evento</div>
                    <div class="value">${eventName || "-"}</div>
                  </div>
                  <div class="info-cell">
                    <div class="label">Data</div>
                    <div class="value">${dateFormatted}</div>
                  </div>
                  <div class="info-cell">
                    <div class="label">Local</div>
                    <div class="value">${eventLocation || "-"}</div>
                  </div>
                  <div class="info-cell">
                    <div class="label">Contato Técnico</div>
                    <div class="value">${technicalContact || "-"}</div>
                  </div>
                  <div class="info-cell">
                    <div class="label">Telefone</div>
                    <div class="value">${technicalPhone || "-"}</div>
                  </div>
                </div>
              </div>

              <!-- STAGE MAP -->
              <section>
                <div class="section-header">
                  <div class="section-number">1</div>
                  <h2>Mapeamento de Palco</h2>
                </div>
                <div class="stage-container">
                  ${stageImageSrc ? `<img src="${stageImageSrc}" alt="Mapeamento de Palco" />` : "<p style='padding:40px;text-align:center;color:#999;'>Nenhum elemento no palco</p>"}
                </div>
                <div class="stats-bar">
                  <div class="stat-chip"><span class="num">${stageLayout.length}</span> elementos no palco</div>
                  <div class="stat-chip"><span class="num">${totalChannels}</span> canais</div>
                  ${totalDI > 0 ? `<div class="stat-chip"><span class="num">${totalDI}</span> DI boxes</div>` : ''}
                </div>
              </section>

              <!-- INPUT LIST -->
              <section>
                <div class="section-header">
                  <div class="section-number">2</div>
                  <h2>Input List</h2>
                </div>
                ${inputList.length > 0 ? `
                  <table class="input-table">
                    <thead>
                      <tr>
                        <th style="width:50px;text-align:center;">CH</th>
                        <th>Instrumento / Função</th>
                        <th>Microfone</th>
                        <th style="width:70px;text-align:center;">DI</th>
                        <th>Observações</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${inputList.map(ch => `
                        <tr>
                          <td class="channel-num">${String(ch.channel).padStart(2, '0')}</td>
                          <td style="font-weight:600;">${ch.instrument}</td>
                          <td>${ch.micType || "-"}</td>
                          <td style="text-align:center;">${ch.di ? '<span class="di-yes">DI</span>' : '<span class="di-no">—</span>'}</td>
                          <td style="color:#666;">${ch.observations || "-"}</td>
                        </tr>
                      `).join("")}
                    </tbody>
                  </table>
                ` : '<div class="no-materials">Nenhum canal configurado</div>'}
              </section>

              <!-- MATERIALS -->
              <section>
                <div class="section-header">
                  <div class="section-number">3</div>
                  <h2>Material Solicitado</h2>
                </div>
                ${activeMaterials.length > 0 ? `
                  <div class="materials-grid">
                    ${activeMaterials.map(([key]) => `
                      <div class="material-tag">
                        <span class="check">✓</span>
                        ${materialLabels[key] || key}
                      </div>
                    `).join("")}
                  </div>
                ` : '<div class="no-materials">Nenhum material selecionado</div>'}
              </section>

              <!-- OBSERVATIONS -->
              ${observations ? `
                <section>
                  <div class="section-header">
                    <div class="section-number">4</div>
                    <h2>Observações</h2>
                  </div>
                  <div class="obs-box">${observations.replace(/\n/g, '<br/>')}</div>
                </section>
              ` : ""}

              <!-- FOOTER -->
              <div class="footer-bar">
                <div class="footer-logo">Backstage<span>Pro</span></div>
                <div class="footer-info">Rider gerado em ${generatedAt}</div>
              </div>
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
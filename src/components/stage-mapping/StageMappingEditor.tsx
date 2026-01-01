import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  Mail,
  MapPin,
  List,
  Package,
  Info
} from "lucide-react";
import { StageCanvas, StageElement as CanvasStageElement, generateStageLayoutSVG } from "./StageCanvas";
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
  const printRef = useRef<HTMLDivElement>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
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
      });
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

  // Quando um elemento é adicionado ao palco, adiciona os canais correspondentes
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

  const generatePrintContent = async () => {
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

    const selectedMaterials = Object.entries(materialsChecklist)
      .filter(([_, value]) => value)
      .map(([key]) => materialLabels[key])
      .join(", ");

    // Gerar SVG do palco com imagens reais (agora é async)
    const stageSVG = await generateStageLayoutSVG(stageLayout, artistName);

    return `
      <html>
        <head>
          <title>Rider Técnico - ${artistName || name}</title>
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 900px; margin: 0 auto; background: white; }
            h1 { color: #333; border-bottom: 3px solid #333; padding-bottom: 10px; text-align: center; font-size: 28px; margin-bottom: 20px; }
            h2 { color: #333; margin-top: 30px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 20px 0; }
            .info-item { padding: 12px; background: #f8f8f8; border-radius: 6px; border-left: 4px solid #333; }
            .info-label { font-weight: bold; color: #555; font-size: 11px; text-transform: uppercase; }
            .info-value { font-size: 14px; margin-top: 4px; color: #111; }
            .stage-drawing { margin: 25px 0; text-align: center; border: 2px solid #333; padding: 10px; background: white; }
            .stage-drawing svg { max-width: 100%; height: auto; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background: #333; color: white; font-weight: bold; text-transform: uppercase; font-size: 11px; }
            tr:nth-child(even) { background: #f9f9f9; }
            .materials { background: #f0f0f0; padding: 15px 20px; border-radius: 8px; margin: 20px 0; }
            .materials-list { display: flex; flex-wrap: wrap; gap: 10px; }
            .material-item { background: #333; color: white; padding: 6px 12px; border-radius: 4px; font-size: 12px; }
            .observations { background: #fffbeb; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { margin-top: 40px; text-align: center; color: #999; font-size: 11px; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
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
            ${stageSVG}
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
            ${selectedMaterials ? `
              <div class="materials-list">
                ${Object.entries(materialsChecklist)
                  .filter(([_, value]) => value)
                  .map(([key]) => `<span class="material-item">${materialLabels[key]}</span>`)
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
  };

  const handlePrint = async () => {
    const printContent = await generatePrintContent();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Rider Técnico - ${artistName || name}`);
    const body = encodeURIComponent(
      `RIDER TÉCNICO\n\n` +
      `Artista: ${artistName || "-"}\n` +
      `Evento: ${eventName || "-"}\n` +
      `Data: ${eventDate ? new Date(eventDate).toLocaleDateString("pt-BR") : "-"}\n` +
      `Local: ${eventLocation || "-"}\n\n` +
      `INPUT LIST:\n` +
      inputList.map(c => `Canal ${c.channel}: ${c.instrument} - ${c.micType}${c.di ? " (DI)" : ""}`).join("\n") +
      `\n\nContato: ${technicalContact} - ${technicalPhone}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-semibold border-none shadow-none px-0 focus-visible:ring-0"
              placeholder="Nome do Mapeamento"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-1" />
            Email
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
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

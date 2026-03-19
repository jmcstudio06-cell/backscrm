import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Trash2, Plus, Minus, Monitor, Tablet, Copy, 
  RotateCcw, Grid3X3, Pencil, Check, ChevronDown, ChevronRight,
  User, Music, Plug, Box
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { InputChannel } from '@/hooks/useStageMappings';
import { useIsMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

// Importar imagens
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

export interface StageElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

interface StageCanvasProps {
  elements: StageElement[];
  onChange: (elements: StageElement[]) => void;
  onElementAdded?: (channels: InputChannel[]) => void;
  artistName?: string;
}

interface ElementCategory {
  label: string;
  icon: React.ElementType;
  types: ElementTypeInfo[];
}

interface ElementTypeInfo {
  type: string;
  label: string;
  image: string;
  width: number;
  height: number;
}

const MUSICIANS: ElementTypeInfo[] = [
  { type: 'vocal', label: 'Cantor', image: singerImg, width: 65, height: 85 },
  { type: 'backing', label: 'Backing', image: singerImg, width: 65, height: 85 },
  { type: 'guitar', label: 'Guitarrista', image: guitaristImg, width: 70, height: 85 },
  { type: 'acoustic', label: 'Violão', image: acousticImg, width: 70, height: 85 },
  { type: 'bass', label: 'Baixista', image: bassistImg, width: 70, height: 85 },
  { type: 'keyboard', label: 'Tecladista', image: keyboardistImg, width: 90, height: 85 },
  { type: 'drums', label: 'Baterista', image: drummerImg, width: 100, height: 85 },
  { type: 'accordion', label: 'Sanfoneiro', image: accordionistImg, width: 70, height: 85 },
  { type: 'brass', label: 'Sopro', image: brassImg, width: 65, height: 85 },
];

const EQUIPMENT: ElementTypeInfo[] = [
  { type: 'amp', label: 'Cubo', image: ampImg, width: 50, height: 40 },
  { type: 'pedalboard', label: 'Pedalboard', image: pedalboardImg, width: 60, height: 35 },
  { type: 'monitor1', label: 'Retorno 1', image: monitor1Img, width: 70, height: 45 },
  { type: 'monitor2', label: 'Retorno 2', image: monitor2Img, width: 65, height: 55 },
  { type: 'rack', label: 'Rack', image: rackImg, width: 80, height: 55 },
  { type: 'sider', label: 'Sider', image: siderImg, width: 45, height: 70 },
];

const STAGE_INFRA: ElementTypeInfo[] = [
  { type: 'stairs', label: 'Escadaria', image: stairsImg, width: 100, height: 80 },
  { type: 'riser', label: 'Elevado', image: riserImg, width: 100, height: 100 },
  { type: 'power110v', label: '110V', image: power110vImg, width: 40, height: 45 },
  { type: 'power220v', label: '220V', image: power220vImg, width: 40, height: 45 },
];

const ELEMENT_CATEGORIES: ElementCategory[] = [
  { label: 'Músicos', icon: User, types: MUSICIANS },
  { label: 'Equipamentos', icon: Music, types: EQUIPMENT },
  { label: 'Palco', icon: Box, types: STAGE_INFRA },
];

const ALL_ELEMENT_TYPES = [...MUSICIANS, ...EQUIPMENT, ...STAGE_INFRA];

const ELEMENT_INPUT_CHANNELS: Record<string, { instrument: string; micType: string; di: boolean }[]> = {
  vocal: [{ instrument: 'Voz Principal', micType: 'SM58', di: false }],
  backing: [{ instrument: 'Backing Vocal', micType: 'SM58', di: false }],
  guitar: [{ instrument: 'Guitarra', micType: 'SM57', di: false }],
  acoustic: [{ instrument: 'Violão', micType: '', di: true }],
  bass: [{ instrument: 'Baixo', micType: '', di: true }],
  keyboard: [
    { instrument: 'Teclado L', micType: '', di: true },
    { instrument: 'Teclado R', micType: '', di: true },
  ],
  drums: [
    { instrument: 'Bumbo', micType: 'Beta 52', di: false },
    { instrument: 'Caixa', micType: 'SM57', di: false },
    { instrument: 'Hi-Hat', micType: 'SM81', di: false },
    { instrument: 'Tom 1', micType: 'E604', di: false },
    { instrument: 'Tom 2', micType: 'E604', di: false },
    { instrument: 'Surdo', micType: 'E602', di: false },
    { instrument: 'Overhead L', micType: 'SM81', di: false },
    { instrument: 'Overhead R', micType: 'SM81', di: false },
  ],
  accordion: [{ instrument: 'Sanfona', micType: '', di: true }],
  brass: [{ instrument: 'Sopro', micType: 'SM57', di: false }],
  amp: [], pedalboard: [], sider: [], monitor1: [], monitor2: [], rack: [], stairs: [], riser: [], power110v: [], power220v: [],
};

const GRID_SIZE = 25;

function snapToGrid(value: number, enabled: boolean): number {
  if (!enabled) return value;
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function StageCanvas({ elements, onChange, onElementAdded, artistName }: StageCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({ 'Músicos': true, 'Equipamentos': true, 'Palco': true });
  const isMobile = useIsMobile();

  const toggleCategory = (label: string) => {
    setExpandedCategories(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const addElement = useCallback((type: string) => {
    const elementType = ALL_ELEMENT_TYPES.find(e => e.type === type);
    if (!elementType) return;

    const existingOfType = elements.filter(e => e.type === type);
    const number = existingOfType.length + 1;

    const stageWidth = stageRef.current?.offsetWidth || 800;
    const stageHeight = stageRef.current?.offsetHeight || 450;

    const newElement: StageElement = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${elementType.label} ${number}`,
      x: snapToGrid((stageWidth / 2) - (elementType.width / 2), snapEnabled),
      y: snapToGrid((stageHeight / 2) - (elementType.height / 2), snapEnabled),
      scale: 1,
      rotation: 0,
    };

    onChange([...elements, newElement]);
    setSelectedElement(newElement.id);

    const inputChannels = ELEMENT_INPUT_CHANNELS[type] || [];
    if (inputChannels.length > 0 && onElementAdded) {
      const channels: InputChannel[] = inputChannels.map((channel) => ({
        id: crypto.randomUUID(),
        channel: 0,
        instrument: number > 1 ? `${channel.instrument} ${number}` : channel.instrument,
        micType: channel.micType,
        di: channel.di,
        observations: '',
      }));
      onElementAdded(channels);
    }
  }, [elements, onChange, onElementAdded, snapEnabled]);

  const duplicateElement = useCallback((id: string) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const newElement: StageElement = {
      ...el,
      id: `${el.type}-${Date.now()}`,
      name: `${el.name} (cópia)`,
      x: el.x + 30,
      y: el.y + 30,
    };
    onChange([...elements, newElement]);
    setSelectedElement(newElement.id);
  }, [elements, onChange]);

  const removeElement = (id: string) => {
    onChange(elements.filter(e => e.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const scaleElement = (id: string, delta: number) => {
    onChange(elements.map(el => {
      if (el.id === id) {
        const newScale = Math.max(0.4, Math.min(2.5, (el.scale || 1) + delta));
        return { ...el, scale: newScale };
      }
      return el;
    }));
  };

  const rotateElement = (id: string, newRotation: number) => {
    onChange(elements.map(el => el.id === id ? { ...el, rotation: newRotation } : el));
  };

  const startRename = (el: StageElement) => {
    setEditingName(el.id);
    setEditNameValue(el.name);
  };

  const commitRename = () => {
    if (editingName && editNameValue.trim()) {
      onChange(elements.map(el => el.id === editingName ? { ...el, name: editNameValue.trim() } : el));
    }
    setEditingName(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = elements.find(el => el.id === elementId);
    if (!element || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setDragging(elementId);
    setSelectedElement(elementId);
    setDragOffset({ x: e.clientX - rect.left - element.x, y: e.clientY - rect.top - element.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const element = elements.find(el => el.id === dragging);
    const elementType = ALL_ELEMENT_TYPES.find(t => t.type === element?.type);
    if (!element || !elementType) return;

    const scale = element.scale || 1;
    const width = elementType.width * scale;
    const height = elementType.height * scale;

    let newX = snapToGrid(e.clientX - rect.left - dragOffset.x, snapEnabled);
    let newY = snapToGrid(e.clientY - rect.top - dragOffset.y, snapEnabled);
    newX = Math.max(0, Math.min(newX, rect.width - width));
    newY = Math.max(0, Math.min(newY, rect.height - height));

    onChange(elements.map(el => el.id === dragging ? { ...el, x: newX, y: newY } : el));
  };

  const handleMouseUp = () => setDragging(null);

  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    const touch = e.touches[0];
    const element = elements.find(el => el.id === elementId);
    if (!element || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    setDragging(elementId);
    setSelectedElement(elementId);
    setDragOffset({ x: touch.clientX - rect.left - element.x, y: touch.clientY - rect.top - element.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !stageRef.current) return;
    const touch = e.touches[0];
    const rect = stageRef.current.getBoundingClientRect();
    const element = elements.find(el => el.id === dragging);
    const elementType = ALL_ELEMENT_TYPES.find(t => t.type === element?.type);
    if (!element || !elementType) return;

    const scale = element.scale || 1;
    const width = elementType.width * scale;
    const height = elementType.height * scale;

    let newX = snapToGrid(touch.clientX - rect.left - dragOffset.x, snapEnabled);
    let newY = snapToGrid(touch.clientY - rect.top - dragOffset.y, snapEnabled);
    newX = Math.max(0, Math.min(newX, rect.width - width));
    newY = Math.max(0, Math.min(newY, rect.height - height));

    onChange(elements.map(el => el.id === dragging ? { ...el, x: newX, y: newY } : el));
  };

  const handleTouchEnd = () => setDragging(null);

  const handleStageClick = (e: React.MouseEvent) => {
    if (e.target === stageRef.current) setSelectedElement(null);
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  if (isMobile) {
    return (
      <Card className="p-6 bg-amber-500/10 border-amber-500/30">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex gap-3">
            <Monitor className="w-12 h-12 text-amber-500" />
            <Tablet className="w-12 h-12 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Mapeamento de Palco</h3>
            <p className="text-muted-foreground">
              Esta funcionalidade está disponível apenas em <span className="font-semibold text-amber-500">computadores</span> ou <span className="font-semibold text-amber-500">tablets</span>.
            </p>
            <p className="text-sm text-muted-foreground">
              Para uma melhor experiência de edição do mapa de palco, acesse pelo computador ou tablet em modo paisagem.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Categorized Elements Toolbar */}
        <Card className="p-4 bg-card border-border shadow-md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Elementos</p>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={snapEnabled ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs gap-1.5"
                    onClick={() => setSnapEnabled(!snapEnabled)}
                  >
                    <Grid3X3 className="w-3.5 h-3.5" />
                    Snap
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {snapEnabled ? 'Desativar encaixe na grade' : 'Ativar encaixe na grade'}
                </TooltipContent>
              </Tooltip>
              <Badge variant="secondary" className="text-xs">
                {elements.length} no palco
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            {ELEMENT_CATEGORIES.map(({ label, icon: Icon, types }) => (
              <div key={label}>
                <button
                  onClick={() => toggleCategory(label)}
                  className="flex items-center gap-2 w-full text-left text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
                >
                  {expandedCategories[label] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                  <span className="text-muted-foreground/60">({types.length})</span>
                </button>
                {expandedCategories[label] && (
                  <div className="grid grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-1.5 mt-1 ml-5">
                    {types.map((elementType) => (
                      <Tooltip key={elementType.type}>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex flex-col items-center justify-center gap-0.5 h-auto py-1.5 px-1 hover:border-primary hover:bg-primary/5 hover:scale-105 transition-all"
                            onClick={() => addElement(elementType.type)}
                          >
                            <img src={elementType.image} alt={elementType.label} className="w-8 h-8 object-contain" />
                            <span className="text-[8px] font-medium text-foreground leading-tight text-center truncate w-full">{elementType.label}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Adicionar {elementType.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Stage Canvas */}
        <div 
          className="relative bg-white rounded-xl border-2 border-zinc-300 overflow-hidden shadow-xl print:shadow-none print:border-zinc-900 flex flex-col mx-auto w-full max-w-[1200px]" 
          id="stage-canvas-print" 
          style={{ aspectRatio: '16/9', minHeight: '500px' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 py-2.5 px-4">
            <h3 className="text-center font-bold text-lg tracking-[0.2em] text-white uppercase">
              Mapeamento de Palco
            </h3>
            {artistName && (
              <p className="text-center text-sm font-medium text-zinc-300 mt-0.5">{artistName}</p>
            )}
          </div>

          {/* Dimensions */}
          <div className="flex justify-between px-4 py-1 bg-zinc-50 text-[10px] font-mono text-zinc-500 border-b border-zinc-200">
            <span>← 8M (MÍNIMO) →</span>
            <span>↕ 6M (MÍNIMO)</span>
          </div>

          {/* Stage Floor */}
          <div
            ref={stageRef}
            className="relative bg-gradient-to-b from-zinc-50/80 to-zinc-100/80 cursor-crosshair select-none flex-1"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onClick={handleStageClick}
          >
            {/* Grid */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full" style={{
                backgroundImage: snapEnabled 
                  ? `linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)`
                  : `linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
              }} />
            </div>

            {/* Center lines */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px pointer-events-none" style={{ transform: 'translateX(-50%)', borderLeft: '1px dashed rgba(0,0,0,0.12)' }} />
            <div className="absolute left-0 right-0 top-1/2 h-px pointer-events-none" style={{ transform: 'translateY(-50%)', borderTop: '1px dashed rgba(0,0,0,0.08)' }} />

            {/* Zone labels */}
            <div className="absolute left-3 top-3 text-[10px] text-zinc-400 font-semibold uppercase pointer-events-none tracking-wide">Fundo</div>
            <div className="absolute left-3 bottom-3 text-[10px] text-zinc-400 font-semibold uppercase pointer-events-none tracking-wide">Frente</div>
            <div className="absolute top-3 left-1/4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Esq</div>
            <div className="absolute top-3 left-1/2 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Centro</div>
            <div className="absolute top-3 left-3/4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Dir</div>

            {/* Artist watermark */}
            {artistName && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="font-black text-zinc-100/40 uppercase tracking-[0.3em] text-5xl select-none">{artistName}</span>
              </div>
            )}

            {/* Elements */}
            {elements.map((element) => {
              const elementType = ALL_ELEMENT_TYPES.find(t => t.type === element.type);
              if (!elementType) return null;

              const scale = element.scale || 1;
              const rotation = element.rotation || 0;
              const width = elementType.width * scale;
              const height = elementType.height * scale;
              const isSelected = selectedElement === element.id;

              return (
                <div
                  key={element.id}
                  className={`absolute cursor-move group transition-shadow ${dragging === element.id ? 'z-50' : 'z-10'} ${isSelected ? 'z-40' : ''}`}
                  style={{
                    left: element.x,
                    top: element.y,
                    width: width,
                    height: height,
                    transition: dragging === element.id ? 'none' : 'all 0.1s ease',
                    filter: isSelected ? 'drop-shadow(0 0 8px hsl(220, 90%, 56%))' : 'drop-shadow(0 2px 3px rgba(0,0,0,0.15))',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  onTouchStart={(e) => handleTouchStart(e, element.id)}
                >
                  <img
                    src={elementType.image}
                    alt={element.name}
                    className="w-full h-full object-contain pointer-events-none"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    draggable={false}
                  />
                  
                  {/* Label */}
                  <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    {editingName === element.id ? (
                      <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                        <Input
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingName(null); }}
                          onBlur={commitRename}
                          className="h-5 text-[9px] px-1 w-20 bg-white"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span 
                        className={`font-bold bg-white/95 px-1.5 py-0.5 rounded shadow-sm text-[9px] cursor-text border ${isSelected ? 'border-primary/40 text-primary' : 'border-transparent text-zinc-700'}`}
                        onDoubleClick={(e) => { e.stopPropagation(); startRename(element); }}
                      >
                        {element.name}
                      </span>
                    )}
                  </div>

                  {/* Selected element controls */}
                  {isSelected && (
                    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 bg-white rounded-xl shadow-xl border border-zinc-200 px-3 py-2 print:hidden min-w-[200px]" onClick={e => e.stopPropagation()}>
                      {/* Action buttons row */}
                      <div className="flex items-center gap-1 w-full justify-between mb-0.5">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => scaleElement(element.id, -0.1)} className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors" title="Diminuir">
                            <Minus className="w-3 h-3 text-zinc-600" />
                          </button>
                          <span className="text-[10px] font-mono text-zinc-600 min-w-[30px] text-center">{Math.round(scale * 100)}%</span>
                          <button onClick={() => scaleElement(element.id, 0.1)} className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors" title="Aumentar">
                            <Plus className="w-3 h-3 text-zinc-600" />
                          </button>
                        </div>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => startRename(element)} className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Renomear">
                            <Pencil className="w-3 h-3 text-zinc-600" />
                          </button>
                          <button onClick={() => duplicateElement(element.id)} className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-blue-100 flex items-center justify-center transition-colors" title="Duplicar">
                            <Copy className="w-3 h-3 text-zinc-600" />
                          </button>
                          <button onClick={() => rotateElement(element.id, 0)} className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors" title="Resetar rotação">
                            <RotateCcw className="w-3 h-3 text-zinc-600" />
                          </button>
                          <button onClick={() => removeElement(element.id)} className="w-5 h-5 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors" title="Remover">
                            <Trash2 className="w-3 h-3 text-red-600" />
                          </button>
                        </div>
                      </div>
                      {/* Rotation slider */}
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="text-[9px] text-zinc-400 font-mono">0°</span>
                        <Slider value={[rotation]} onValueChange={(value) => rotateElement(element.id, value[0])} min={0} max={360} step={5} className="flex-1" />
                        <span className="text-[9px] text-zinc-400 font-mono min-w-[26px] text-right">{rotation}°</span>
                      </div>
                    </div>
                  )}

                  {/* Delete on hover (non-selected) */}
                  {!isSelected && (
                    <button
                      onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md print:hidden"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Audience bar */}
          <div className="h-9 bg-gradient-to-b from-amber-500 to-amber-600 border-t-2 border-amber-700 flex items-center justify-center">
            <span className="text-sm font-bold text-white tracking-[0.3em] uppercase">Plateia / Público</span>
          </div>
        </div>

        {/* Elements summary chips */}
        {elements.length > 0 && (
          <Card className="p-3 bg-muted/40 border-border print:hidden">
            <h4 className="text-xs font-semibold mb-2 text-muted-foreground">Elementos ({elements.length}):</h4>
            <div className="flex flex-wrap gap-1.5">
              {elements.map((element) => {
                const isSelected = selectedElement === element.id;
                return (
                  <span
                    key={element.id}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] cursor-pointer transition-all font-medium ${
                      isSelected 
                        ? 'bg-primary text-primary-foreground shadow-sm' 
                        : 'bg-background border border-border text-foreground hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedElement(isSelected ? null : element.id)}
                  >
                    {element.name}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                      className="ml-0.5 opacity-60 hover:opacity-100 hover:text-destructive transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

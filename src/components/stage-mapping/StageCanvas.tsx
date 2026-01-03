import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Minus, Monitor, Tablet } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { InputChannel } from '@/hooks/useStageMappings';
import { useIsMobile } from '@/hooks/use-mobile';
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

// Tamanhos padronizados: pessoas ~70x85, equipamentos pequenos ~45x45, equipamentos médios ~60x50
const ELEMENT_TYPES = [
  { type: 'vocal', label: 'Cantor', image: singerImg, width: 65, height: 85 },
  { type: 'backing', label: 'Backing', image: singerImg, width: 65, height: 85 },
  { type: 'guitar', label: 'Guitarrista', image: guitaristImg, width: 70, height: 85 },
  { type: 'acoustic', label: 'Violão', image: acousticImg, width: 70, height: 85 },
  { type: 'bass', label: 'Baixista', image: bassistImg, width: 70, height: 85 },
  { type: 'keyboard', label: 'Tecladista', image: keyboardistImg, width: 90, height: 85 },
  { type: 'drums', label: 'Baterista', image: drummerImg, width: 100, height: 85 },
  { type: 'accordion', label: 'Sanfoneiro', image: accordionistImg, width: 70, height: 85 },
  { type: 'brass', label: 'Sopro', image: brassImg, width: 65, height: 85 },
  { type: 'amp', label: 'Cubo', image: ampImg, width: 50, height: 40 },
  { type: 'sider', label: 'Sider', image: siderImg, width: 45, height: 70 },
  { type: 'monitor1', label: 'Retorno 1', image: monitor1Img, width: 70, height: 45 },
  { type: 'monitor2', label: 'Retorno 2', image: monitor2Img, width: 65, height: 55 },
  { type: 'rack', label: 'Rack', image: rackImg, width: 80, height: 55 },
  { type: 'stairs', label: 'Escadaria', image: stairsImg, width: 100, height: 80 },
  { type: 'riser', label: 'Elevado', image: riserImg, width: 100, height: 100 },
  { type: 'power110v', label: '110V', image: power110vImg, width: 40, height: 45 },
  { type: 'power220v', label: '220V', image: power220vImg, width: 40, height: 45 },
];

// Mapeamento de elementos para canais de input
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
  amp: [],
  sider: [],
  monitor1: [],
  monitor2: [],
  rack: [],
  stairs: [],
  riser: [],
  power110v: [],
  power220v: [],
};

export function StageCanvas({ elements, onChange, onElementAdded, artistName }: StageCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const addElement = (type: string) => {
    const elementType = ELEMENT_TYPES.find(e => e.type === type);
    if (!elementType) return;

    const existingOfType = elements.filter(e => e.type === type);
    const number = existingOfType.length + 1;

    // Posição inicial centralizada
    const stageWidth = stageRef.current?.offsetWidth || 800;
    const stageHeight = stageRef.current?.offsetHeight || 450;

    const newElement: StageElement = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${elementType.label} ${number}`,
      x: (stageWidth / 2) - (elementType.width / 2),
      y: (stageHeight / 2) - (elementType.height / 2),
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
  };

  const removeElement = (id: string) => {
    onChange(elements.filter(e => e.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const scaleElement = (id: string, delta: number) => {
    onChange(elements.map(el => {
      if (el.id === id) {
        const newScale = Math.max(0.5, Math.min(2, (el.scale || 1) + delta));
        return { ...el, scale: newScale };
      }
      return el;
    }));
  };

  const rotateElement = (id: string, newRotation: number) => {
    onChange(elements.map(el => {
      if (el.id === id) {
        return { ...el, rotation: newRotation };
      }
      return el;
    }));
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = elements.find(el => el.id === elementId);
    if (!element || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    setDragging(elementId);
    setSelectedElement(elementId);
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    const element = elements.find(el => el.id === dragging);
    const elementType = ELEMENT_TYPES.find(t => t.type === element?.type);

    if (!element || !elementType) return;

    const scale = element.scale || 1;
    const width = elementType.width * scale;
    const height = elementType.height * scale;

    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;

    // Limitar dentro do palco
    newX = Math.max(0, Math.min(newX, rect.width - width));
    newY = Math.max(0, Math.min(newY, rect.height - height));

    onChange(elements.map(el =>
      el.id === dragging ? { ...el, x: newX, y: newY } : el
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    const touch = e.touches[0];
    const element = elements.find(el => el.id === elementId);
    if (!element || !stageRef.current) return;

    const rect = stageRef.current.getBoundingClientRect();
    setDragging(elementId);
    setSelectedElement(elementId);
    setDragOffset({
      x: touch.clientX - rect.left - element.x,
      y: touch.clientY - rect.top - element.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !stageRef.current) return;

    const touch = e.touches[0];
    const rect = stageRef.current.getBoundingClientRect();
    const element = elements.find(el => el.id === dragging);
    const elementType = ELEMENT_TYPES.find(t => t.type === element?.type);

    if (!element || !elementType) return;

    const scale = element.scale || 1;
    const width = elementType.width * scale;
    const height = elementType.height * scale;

    let newX = touch.clientX - rect.left - dragOffset.x;
    let newY = touch.clientY - rect.top - dragOffset.y;

    // Limitar dentro do palco
    newX = Math.max(0, Math.min(newX, rect.width - width));
    newY = Math.max(0, Math.min(newY, rect.height - height));

    onChange(elements.map(el =>
      el.id === dragging ? { ...el, x: newX, y: newY } : el
    ));
  };

  const handleTouchEnd = () => {
    setDragging(null);
  };

  const handleStageClick = (e: React.MouseEvent) => {
    if (e.target === stageRef.current) {
      setSelectedElement(null);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedElement);
  const selectedElType = selectedEl ? ELEMENT_TYPES.find(t => t.type === selectedEl.type) : null;

  // Show warning message for mobile users
  if (isMobile) {
    return (
      <Card className="p-6 bg-amber-500/10 border-amber-500/30">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex gap-3">
            <Monitor className="w-12 h-12 text-amber-500" />
            <Tablet className="w-12 h-12 text-amber-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Mapeamento de Palco
            </h3>
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
    <div className="space-y-4">
      {/* Add Elements Panel */}
      <Card className="p-3 sm:p-4 bg-card border-border shadow-md">
        <p className="text-xs sm:text-sm font-semibold text-foreground mb-2 sm:mb-3">Adicionar elementos:</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-9 gap-2">
          {ELEMENT_TYPES.map((elementType) => (
            <Button
              key={elementType.type}
              variant="outline"
              size="sm"
              className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-1 hover:border-primary hover:scale-105 transition-all"
              onClick={() => addElement(elementType.type)}
            >
              <img 
                src={elementType.image} 
                alt={elementType.label} 
                className="w-9 h-9 object-contain"
              />
              <span className="text-[9px] font-medium text-foreground leading-tight text-center">{elementType.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Stage Visual - Proporção fixa e centralizado para impressão correta */}
      <div 
        className="relative bg-white rounded-lg border-2 border-zinc-400 overflow-hidden shadow-xl print:shadow-none flex flex-col mx-auto w-full max-w-[1200px]" 
        id="stage-canvas-print" 
        style={{ aspectRatio: '16/9', minHeight: '500px' }}
      >
        {/* Header */}
        <div className="bg-zinc-900 py-2 sm:py-3 px-3 sm:px-4">
          <h3 className="text-center font-bold text-base sm:text-xl tracking-wide text-white uppercase">
            MAPEAMENTO DE PALCO
          </h3>
          {artistName && (
            <p className="text-center text-xs sm:text-sm font-semibold text-zinc-300 mt-0.5 sm:mt-1">{artistName}</p>
          )}
        </div>

        {/* Dimensions */}
        <div className="flex justify-between px-3 sm:px-4 py-1 bg-zinc-100 text-[10px] sm:text-xs font-mono text-zinc-600 border-b border-zinc-300">
          <span>8M (MÍNIMO)</span>
          <span>6M (MÍNIMO)</span>
        </div>

        {/* Stage Floor - Área de arraste */}
        <div
          ref={stageRef}
          className="relative bg-gradient-to-b from-zinc-50 to-zinc-100 cursor-crosshair select-none flex-1"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleStageClick}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-300 pointer-events-none" style={{ transform: 'translateX(-50%)' }} />
          
          {/* Row indicators */}
          <div className="absolute left-2 top-4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none">Fundo</div>
          <div className="absolute left-2 top-1/2 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateY(-50%)' }}>Meio</div>
          <div className="absolute left-2 bottom-4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none">Frente</div>
          <div className="absolute top-2 left-1/4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Esq</div>
          <div className="absolute top-2 left-1/2 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Centro</div>
          <div className="absolute top-2 left-3/4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Dir</div>

          {/* Artist watermark */}
          {artistName && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="font-bold text-zinc-100 uppercase tracking-widest opacity-50 text-6xl">{artistName}</span>
            </div>
          )}

          {/* Elements */}
          {elements.map((element) => {
            const elementType = ELEMENT_TYPES.find(t => t.type === element.type);
            if (!elementType) return null;

            const scale = element.scale || 1;
            const rotation = element.rotation || 0;
            const width = elementType.width * scale;
            const height = elementType.height * scale;
            const isSelected = selectedElement === element.id;

            return (
              <div
                key={element.id}
                className={`absolute cursor-move group ${dragging === element.id ? 'z-50' : 'z-10'} ${isSelected ? 'ring-2 ring-primary ring-offset-1 rounded' : ''}`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: width,
                  height: height,
                  transition: dragging === element.id ? 'none' : 'all 0.15s ease',
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
                  <span className="font-bold text-zinc-700 bg-white/90 px-1 py-0.5 rounded shadow-sm text-[9px]">{element.name}</span>
                </div>

                {/* Controls - only show when selected */}
                {isSelected && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 bg-white rounded-lg shadow-lg border border-zinc-200 px-2 py-1.5 print:hidden min-w-[180px]">
                    {/* Scale controls */}
                    <div className="flex items-center gap-1 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scaleElement(element.id, -0.1);
                        }}
                        className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                        title="Diminuir"
                      >
                        <Minus className="w-3 h-3 text-zinc-600" />
                      </button>
                      <span className="text-[10px] font-medium text-zinc-600 min-w-[28px] text-center">
                        {Math.round(scale * 100)}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scaleElement(element.id, 0.1);
                        }}
                        className="w-5 h-5 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                        title="Aumentar"
                      >
                        <Plus className="w-3 h-3 text-zinc-600" />
                      </button>
                    </div>
                    {/* Rotation slider */}
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[9px] text-zinc-500">0°</span>
                      <Slider
                        value={[rotation]}
                        onValueChange={(value) => rotateElement(element.id, value[0])}
                        min={0}
                        max={360}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-[9px] text-zinc-500 min-w-[24px] text-right">{rotation}°</span>
                    </div>
                  </div>
                )}

                {/* Delete button - desktop only */}
                {!isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(element.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md print:hidden"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Front of stage */}
        <div className="h-8 sm:h-10 bg-gradient-to-b from-amber-500 to-amber-600 border-t-2 border-amber-700 flex items-center justify-center">
          <span className="text-xs sm:text-sm font-bold text-white tracking-widest uppercase">Plateia / Público</span>
        </div>
      </div>

      {/* Summary */}
      {elements.length > 0 && (
        <Card className="p-3 sm:p-4 bg-muted/50 border-border print:hidden">
          <h4 className="text-xs sm:text-sm font-medium mb-2">Elementos no palco ({elements.length}):</h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {elements.map((element) => (
              <span
                key={element.id}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] sm:text-xs cursor-pointer transition-colors ${
                  selectedElement === element.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
                onClick={() => setSelectedElement(selectedElement === element.id ? null : element.id)}
              >
                {element.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(element.id);
                  }}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Mobile hint */}
      {isMobile && elements.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Toque em um elemento acima para adicioná-lo ao palco
        </p>
      )}
    </div>
  );
}

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';
import { InputChannel } from '@/hooks/useStageMappings';

// Importar imagens
import drummerImg from '@/assets/stage/drummer.png';
import guitaristImg from '@/assets/stage/guitarist.png';
import keyboardistImg from '@/assets/stage/keyboardist.png';
import bassistImg from '@/assets/stage/bassist.png';
import singerImg from '@/assets/stage/singer.png';
import monitorImg from '@/assets/stage/monitor.png';
import pedalboardImg from '@/assets/stage/pedalboard.png';
import ampImg from '@/assets/stage/amp.png';
import accordionistImg from '@/assets/stage/accordionist.png';
import acousticImg from '@/assets/stage/acoustic.png';

export interface StageElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  scale?: number;
}

interface StageCanvasProps {
  elements: StageElement[];
  onChange: (elements: StageElement[]) => void;
  onElementAdded?: (channels: InputChannel[]) => void;
  artistName?: string;
}

const ELEMENT_TYPES = [
  { type: 'vocal', label: 'Cantor', image: singerImg, width: 60, height: 80 },
  { type: 'backing', label: 'Backing', image: singerImg, width: 50, height: 70 },
  { type: 'guitar', label: 'Guitarrista', image: guitaristImg, width: 70, height: 90 },
  { type: 'acoustic', label: 'Violão', image: acousticImg, width: 70, height: 90 },
  { type: 'bass', label: 'Baixista', image: bassistImg, width: 70, height: 90 },
  { type: 'keyboard', label: 'Tecladista', image: keyboardistImg, width: 100, height: 90 },
  { type: 'drums', label: 'Baterista', image: drummerImg, width: 120, height: 100 },
  { type: 'accordion', label: 'Sanfoneiro', image: accordionistImg, width: 70, height: 90 },
  { type: 'monitor', label: 'Retorno', image: monitorImg, width: 50, height: 40 },
  { type: 'pedalboard', label: 'Pedaleira', image: pedalboardImg, width: 60, height: 40 },
  { type: 'amp', label: 'Cubo/Amp', image: ampImg, width: 60, height: 70 },
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
  monitor: [],
  pedalboard: [],
  amp: [],
};

export function StageCanvas({ elements, onChange, onElementAdded, artistName }: StageCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const addElement = (type: string) => {
    const elementType = ELEMENT_TYPES.find(e => e.type === type);
    if (!elementType) return;

    const existingOfType = elements.filter(e => e.type === type);
    const number = existingOfType.length + 1;

    // Posição inicial centralizada
    const stageWidth = stageRef.current?.offsetWidth || 800;
    const stageHeight = 450;

    const newElement: StageElement = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${elementType.label} ${number}`,
      x: (stageWidth / 2) - (elementType.width / 2),
      y: (stageHeight / 2) - (elementType.height / 2),
      scale: 1,
    };

    onChange([...elements, newElement]);

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
    newY = Math.max(0, Math.min(newY, 450 - height));

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
    newY = Math.max(0, Math.min(newY, 450 - height));

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

  return (
    <div className="space-y-6">
      {/* Add Elements Panel */}
      <Card className="p-4 bg-card border-border shadow-md">
        <p className="text-sm font-semibold text-foreground mb-3">Adicionar elementos ao palco:</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
          {ELEMENT_TYPES.map((elementType) => (
            <Button
              key={elementType.type}
              variant="outline"
              size="sm"
              className="flex flex-col items-center justify-center gap-1 h-auto py-2 px-2 hover:border-primary hover:scale-105 transition-all"
              onClick={() => addElement(elementType.type)}
            >
              <img 
                src={elementType.image} 
                alt={elementType.label} 
                className="w-10 h-10 object-contain"
              />
              <span className="text-[10px] font-medium text-foreground">{elementType.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Stage Visual */}
      <div className="relative bg-white rounded-lg border-2 border-zinc-400 overflow-hidden shadow-xl print:shadow-none" id="stage-canvas-print">
        {/* Header */}
        <div className="bg-zinc-900 py-3 px-4">
          <h3 className="text-center font-bold text-xl tracking-wide text-white uppercase">
            MAPEAMENTO DE PALCO
          </h3>
          {artistName && (
            <p className="text-center text-sm font-semibold text-zinc-300 mt-1">{artistName}</p>
          )}
        </div>

        {/* Dimensions */}
        <div className="flex justify-between px-4 py-1 bg-zinc-100 text-xs font-mono text-zinc-600 border-b border-zinc-300">
          <span>8M (MÍNIMO)</span>
          <span>6M (MÍNIMO)</span>
        </div>

        {/* Stage Floor - Área de arraste */}
        <div
          ref={stageRef}
          className="relative bg-gradient-to-b from-zinc-50 to-zinc-100 cursor-crosshair select-none"
          style={{ height: '450px' }}
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

          {/* Column indicators */}
          <div className="absolute top-2 left-1/4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Esq</div>
          <div className="absolute top-2 left-1/2 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Centro</div>
          <div className="absolute top-2 left-3/4 text-[10px] text-zinc-400 font-medium uppercase pointer-events-none" style={{ transform: 'translateX(-50%)' }}>Dir</div>

          {/* Artist watermark */}
          {artistName && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-6xl font-bold text-zinc-100 uppercase tracking-widest opacity-50">{artistName}</span>
            </div>
          )}

          {/* Elements */}
          {elements.map((element) => {
            const elementType = ELEMENT_TYPES.find(t => t.type === element.type);
            if (!elementType) return null;

            const scale = element.scale || 1;
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
                  draggable={false}
                />
                
                {/* Label */}
                <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                  <span className="text-[9px] font-bold text-zinc-700 bg-white/90 px-1.5 py-0.5 rounded shadow-sm">{element.name}</span>
                </div>

                {/* Scale controls - only show when selected */}
                {isSelected && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-white rounded-full shadow-lg border border-zinc-200 px-1 py-0.5 print:hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scaleElement(element.id, -0.1);
                      }}
                      className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3 text-zinc-600" />
                    </button>
                    <span className="text-[10px] font-medium text-zinc-600 min-w-[32px] text-center">
                      {Math.round(scale * 100)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scaleElement(element.id, 0.1);
                      }}
                      className="w-6 h-6 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3 text-zinc-600" />
                    </button>
                  </div>
                )}

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeElement(element.id);
                  }}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md print:hidden"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Front of stage */}
        <div className="h-10 bg-gradient-to-b from-amber-500 to-amber-600 border-t-2 border-amber-700 flex items-center justify-center">
          <span className="text-sm font-bold text-white tracking-widest uppercase">Plateia / Público</span>
        </div>
      </div>

      {/* Summary */}
      {elements.length > 0 && (
        <Card className="p-4 bg-muted/50 border-border print:hidden">
          <h4 className="text-sm font-medium mb-2">Elementos no palco ({elements.length}):</h4>
          <div className="flex flex-wrap gap-2">
            {elements.map((element) => (
              <span
                key={element.id}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer transition-colors ${
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
    </div>
  );
}

// Exportar função para gerar SVG do palco para impressão
export function generateStageLayoutSVG(elements: StageElement[], artistName?: string): string {
  const getElementSVG = (type: string, name: string, x: number, y: number, scale: number = 1): string => {
    // Simplified representations for print
    switch (type) {
      case 'drums':
        return `<g transform="translate(${x},${y}) scale(${scale})"><ellipse cx="60" cy="50" rx="50" ry="40" fill="#1a1a1a" stroke="#333" stroke-width="2"/><text x="60" y="100" text-anchor="middle" fill="#333" font-size="10" font-weight="bold">${name}</text></g>`;
      case 'keyboard':
        return `<g transform="translate(${x},${y}) scale(${scale})"><rect width="100" height="45" fill="#333" rx="4"/><text x="50" y="60" text-anchor="middle" fill="#333" font-size="10" font-weight="bold">${name}</text></g>`;
      case 'guitar':
      case 'acoustic':
      case 'bass':
        return `<g transform="translate(${x},${y}) scale(${scale})"><ellipse cx="35" cy="45" rx="28" ry="38" fill="#333"/><text x="35" y="95" text-anchor="middle" fill="#333" font-size="10" font-weight="bold">${name}</text></g>`;
      case 'accordion':
        return `<g transform="translate(${x},${y}) scale(${scale})"><ellipse cx="35" cy="45" rx="28" ry="38" fill="#333"/><text x="35" y="95" text-anchor="middle" fill="#333" font-size="10" font-weight="bold">${name}</text></g>`;
      case 'vocal':
      case 'backing':
        return `<g transform="translate(${x},${y}) scale(${scale})"><ellipse cx="30" cy="40" rx="22" ry="32" fill="#333"/><line x1="30" y1="72" x2="30" y2="82" stroke="#333" stroke-width="3"/><text x="30" y="95" text-anchor="middle" fill="#333" font-size="10" font-weight="bold">${name}</text></g>`;
      case 'monitor':
        return `<g transform="translate(${x},${y}) scale(${scale})"><polygon points="5,35 45,35 40,5 10,5" fill="#333"/><text x="25" y="50" text-anchor="middle" fill="#333" font-size="8" font-weight="bold">${name}</text></g>`;
      case 'pedalboard':
        return `<g transform="translate(${x},${y}) scale(${scale})"><rect width="60" height="30" fill="#333" rx="3"/><text x="30" y="45" text-anchor="middle" fill="#333" font-size="8" font-weight="bold">${name}</text></g>`;
      case 'amp':
        return `<g transform="translate(${x},${y}) scale(${scale})"><rect width="50" height="60" fill="#333" rx="3"/><text x="25" y="75" text-anchor="middle" fill="#333" font-size="8" font-weight="bold">${name}</text></g>`;
      default:
        return '';
    }
  };

  let elementsContent = '';
  elements.forEach(el => {
    elementsContent += getElementSVG(el.type, el.name, el.x, el.y, el.scale || 1);
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
      <!-- Background -->
      <rect width="800" height="550" fill="white"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="800" height="50" fill="#1a1a1a"/>
      <text x="400" y="32" text-anchor="middle" fill="white" font-size="20" font-weight="bold">MAPEAMENTO DE PALCO</text>
      ${artistName ? `<text x="400" y="48" text-anchor="middle" fill="#999" font-size="12">${artistName}</text>` : ''}
      
      <!-- Stage area -->
      <rect x="0" y="50" width="800" height="450" fill="#f8f8f8" stroke="#ccc" stroke-width="1"/>
      
      <!-- Grid -->
      <line x1="400" y1="50" x2="400" y2="500" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>
      <line x1="0" y1="200" x2="800" y2="200" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>
      <line x1="0" y1="350" x2="800" y2="350" stroke="#ddd" stroke-width="1" stroke-dasharray="5,5"/>
      
      <!-- Elements -->
      ${elementsContent}
      
      <!-- Audience -->
      <rect x="0" y="500" width="800" height="50" fill="#d97706"/>
      <text x="400" y="530" text-anchor="middle" fill="white" font-size="14" font-weight="bold">PLATEIA / PÚBLICO</text>
    </svg>
  `;
}

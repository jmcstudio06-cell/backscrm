import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { InputChannel } from '@/hooks/useStageMappings';

export interface StageElement {
  id: string;
  type: string;
  name: string;
  position: 'left' | 'center' | 'right';
  row: 'front' | 'middle' | 'back';
}

interface StageCanvasProps {
  elements: StageElement[];
  onChange: (elements: StageElement[]) => void;
  onElementAdded?: (channels: InputChannel[]) => void;
}

const ELEMENT_TYPES = [
  { type: 'vocal', label: 'Voz', shortLabel: 'VOZ' },
  { type: 'backing', label: 'Backing Vocal', shortLabel: 'BV' },
  { type: 'guitar', label: 'Guitarra', shortLabel: 'GTR' },
  { type: 'bass', label: 'Baixo', shortLabel: 'BAIXO' },
  { type: 'keyboard', label: 'Teclado', shortLabel: 'TEC' },
  { type: 'drums', label: 'Bateria', shortLabel: 'BAT' },
  { type: 'dj', label: 'DJ / MPC', shortLabel: 'DJ' },
  { type: 'monitor', label: 'Retorno', shortLabel: 'RET' },
];

// Mapeamento de elementos para canais de input
const ELEMENT_INPUT_CHANNELS: Record<string, { instrument: string; micType: string; di: boolean }[]> = {
  vocal: [
    { instrument: 'Voz Principal', micType: 'SM58', di: false },
  ],
  backing: [
    { instrument: 'Backing Vocal', micType: 'SM58', di: false },
  ],
  guitar: [
    { instrument: 'Guitarra', micType: 'SM57', di: false },
  ],
  bass: [
    { instrument: 'Baixo', micType: '', di: true },
  ],
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
  dj: [
    { instrument: 'DJ L', micType: '', di: true },
    { instrument: 'DJ R', micType: '', di: true },
  ],
  monitor: [],
};

const POSITIONS = ['left', 'center', 'right'] as const;
const ROWS = ['back', 'middle', 'front'] as const;

const POSITION_LABELS = {
  left: 'Esquerda',
  center: 'Centro',
  right: 'Direita'
};

// Stage element visual components
const DrumKit = () => (
  <svg viewBox="0 0 120 80" className="w-full h-full">
    {/* Kick drum */}
    <ellipse cx="60" cy="55" rx="25" ry="20" fill="#2a2a2a" stroke="#444" strokeWidth="2"/>
    <ellipse cx="60" cy="55" rx="20" ry="16" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
    {/* Toms */}
    <ellipse cx="35" cy="30" rx="12" ry="8" fill="#2a2a2a" stroke="#444" strokeWidth="1.5"/>
    <ellipse cx="60" cy="25" rx="12" ry="8" fill="#2a2a2a" stroke="#444" strokeWidth="1.5"/>
    <ellipse cx="85" cy="30" rx="12" ry="8" fill="#2a2a2a" stroke="#444" strokeWidth="1.5"/>
    {/* Hi-hat */}
    <ellipse cx="15" cy="35" rx="10" ry="4" fill="#b8860b" stroke="#8b6914" strokeWidth="1"/>
    <line x1="15" y1="35" x2="15" y2="70" stroke="#666" strokeWidth="2"/>
    {/* Cymbals */}
    <ellipse cx="100" cy="20" rx="12" ry="5" fill="#b8860b" stroke="#8b6914" strokeWidth="1"/>
    <ellipse cx="20" cy="15" rx="10" ry="4" fill="#b8860b" stroke="#8b6914" strokeWidth="1"/>
    {/* Snare */}
    <ellipse cx="40" cy="50" rx="10" ry="6" fill="#333" stroke="#555" strokeWidth="1.5"/>
    {/* Floor tom */}
    <ellipse cx="90" cy="55" rx="14" ry="10" fill="#2a2a2a" stroke="#444" strokeWidth="1.5"/>
  </svg>
);

const Keyboard = () => (
  <svg viewBox="0 0 100 50" className="w-full h-full">
    {/* Keyboard body */}
    <rect x="5" y="10" width="90" height="35" rx="3" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
    {/* White keys */}
    {[...Array(14)].map((_, i) => (
      <rect key={i} x={8 + i * 6} y="15" width="5" height="25" fill="#f5f5f5" stroke="#ddd" strokeWidth="0.5" rx="1"/>
    ))}
    {/* Black keys */}
    {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12].map((i) => (
      <rect key={`b${i}`} x={11 + i * 6} y="15" width="4" height="15" fill="#1a1a1a" rx="1"/>
    ))}
    {/* Stand */}
    <rect x="20" y="45" width="8" height="5" fill="#444"/>
    <rect x="72" y="45" width="8" height="5" fill="#444"/>
  </svg>
);

const GuitarAmp = ({ label }: { label: string }) => (
  <svg viewBox="0 0 60 70" className="w-full h-full">
    {/* Amp body */}
    <rect x="5" y="5" width="50" height="60" rx="4" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
    {/* Speaker */}
    <circle cx="30" cy="40" r="18" fill="#2a2a2a" stroke="#444" strokeWidth="2"/>
    <circle cx="30" cy="40" r="14" fill="#1f1f1f"/>
    <circle cx="30" cy="40" r="3" fill="#333"/>
    {/* Control panel */}
    <rect x="10" y="10" width="40" height="12" fill="#333" rx="2"/>
    {/* Knobs */}
    {[18, 30, 42].map((x) => (
      <circle key={x} cx={x} cy="16" r="3" fill="#666" stroke="#888" strokeWidth="1"/>
    ))}
    {/* Label */}
    <text x="30" y="68" textAnchor="middle" fill="#666" fontSize="6" fontWeight="bold">{label}</text>
  </svg>
);

const Microphone = ({ label }: { label: string }) => (
  <svg viewBox="0 0 40 80" className="w-full h-full">
    {/* Stand base */}
    <ellipse cx="20" cy="75" rx="15" ry="4" fill="#333"/>
    {/* Stand pole */}
    <rect x="18" y="30" width="4" height="45" fill="#444"/>
    {/* Boom arm */}
    <rect x="10" y="25" width="20" height="3" fill="#444" rx="1"/>
    {/* Mic */}
    <ellipse cx="20" cy="15" rx="8" ry="12" fill="#333" stroke="#555" strokeWidth="1"/>
    <rect x="14" y="12" width="12" height="8" fill="#222" rx="2"/>
    {/* Label */}
    <text x="20" y="68" textAnchor="middle" fill="#888" fontSize="5" fontWeight="bold">{label}</text>
  </svg>
);

const Monitor = ({ label }: { label: string }) => (
  <svg viewBox="0 0 50 35" className="w-full h-full">
    {/* Wedge shape */}
    <polygon points="5,30 45,30 40,5 10,5" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
    {/* Speaker grille */}
    <rect x="12" y="10" width="26" height="15" fill="#2a2a2a" rx="2"/>
    {/* Grille lines */}
    {[12, 15, 18, 21].map((y) => (
      <line key={y} x1="14" y1={y} x2="36" y2={y} stroke="#444" strokeWidth="0.5"/>
    ))}
    {/* Label */}
    <text x="25" y="32" textAnchor="middle" fill="#666" fontSize="5">{label}</text>
  </svg>
);

const PA = () => (
  <svg viewBox="0 0 40 100" className="w-full h-full">
    {/* Main cabinet */}
    <rect x="2" y="5" width="36" height="55" rx="3" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
    {/* Speakers */}
    <circle cx="20" cy="22" r="12" fill="#2a2a2a" stroke="#444" strokeWidth="1.5"/>
    <circle cx="20" cy="22" r="8" fill="#1f1f1f"/>
    <circle cx="20" cy="22" r="2" fill="#333"/>
    <circle cx="20" cy="48" r="8" fill="#2a2a2a" stroke="#444" strokeWidth="1"/>
    <circle cx="20" cy="48" r="5" fill="#1f1f1f"/>
    {/* Sub */}
    <rect x="2" y="65" width="36" height="30" rx="3" fill="#0f0f0f" stroke="#333" strokeWidth="2"/>
    <circle cx="20" cy="80" r="10" fill="#1a1a1a" stroke="#333" strokeWidth="1.5"/>
    <circle cx="20" cy="80" r="6" fill="#0f0f0f"/>
  </svg>
);

const DJSetup = () => (
  <svg viewBox="0 0 100 60" className="w-full h-full">
    {/* Table */}
    <rect x="5" y="20" width="90" height="35" rx="3" fill="#1a1a1a" stroke="#333" strokeWidth="2"/>
    {/* CDJ/Turntable left */}
    <rect x="10" y="25" width="25" height="25" rx="2" fill="#222" stroke="#444" strokeWidth="1"/>
    <circle cx="22" cy="37" r="8" fill="#333" stroke="#555" strokeWidth="1"/>
    <circle cx="22" cy="37" r="2" fill="#111"/>
    {/* Mixer */}
    <rect x="38" y="25" width="24" height="25" rx="2" fill="#222" stroke="#444" strokeWidth="1"/>
    {/* Faders */}
    {[42, 50, 58].map((x) => (
      <rect key={x} x={x} y="30" width="2" height="15" fill="#666" rx="1"/>
    ))}
    {/* CDJ/Turntable right */}
    <rect x="65" y="25" width="25" height="25" rx="2" fill="#222" stroke="#444" strokeWidth="1"/>
    <circle cx="78" cy="37" r="8" fill="#333" stroke="#555" strokeWidth="1"/>
    <circle cx="78" cy="37" r="2" fill="#111"/>
    {/* Laptop */}
    <rect x="35" y="8" width="30" height="18" rx="2" fill="#333" stroke="#555" strokeWidth="1"/>
    <rect x="37" y="10" width="26" height="14" fill="#1a4a7a"/>
  </svg>
);

const getElementVisual = (type: string, name: string) => {
  switch (type) {
    case 'drums':
      return <DrumKit />;
    case 'keyboard':
      return <Keyboard />;
    case 'guitar':
    case 'bass':
      return <GuitarAmp label={name} />;
    case 'vocal':
    case 'backing':
      return <Microphone label={name} />;
    case 'monitor':
      return <Monitor label={name} />;
    case 'dj':
      return <DJSetup />;
    default:
      return <Monitor label={name} />;
  }
};

const getElementSize = (type: string) => {
  switch (type) {
    case 'drums':
      return 'w-24 h-16';
    case 'keyboard':
      return 'w-20 h-10';
    case 'dj':
      return 'w-24 h-14';
    case 'guitar':
    case 'bass':
      return 'w-12 h-14';
    case 'vocal':
    case 'backing':
      return 'w-8 h-16';
    case 'monitor':
      return 'w-10 h-7';
    default:
      return 'w-10 h-10';
  }
};

export function StageCanvas({ elements, onChange, onElementAdded }: StageCanvasProps) {
  const addElement = (type: string) => {
    const elementType = ELEMENT_TYPES.find(e => e.type === type);
    if (!elementType) return;

    const existingOfType = elements.filter(e => e.type === type);
    const number = existingOfType.length + 1;
    
    const newElement: StageElement = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${elementType.shortLabel} ${number}`,
      position: 'center',
      row: type === 'drums' || type === 'dj' ? 'back' : type === 'monitor' ? 'front' : 'middle'
    };

    onChange([...elements, newElement]);

    // Gerar canais de input automaticamente
    const inputChannels = ELEMENT_INPUT_CHANNELS[type] || [];
    if (inputChannels.length > 0 && onElementAdded) {
      const channels: InputChannel[] = inputChannels.map((channel, index) => ({
        id: crypto.randomUUID(),
        channel: 0, // Será calculado no componente pai
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
  };

  const moveElement = (id: string, direction: 'left' | 'right' | 'up' | 'down') => {
    const positionOrder = ['left', 'center', 'right'];
    const rowOrder = ['back', 'middle', 'front'];
    
    onChange(elements.map(e => {
      if (e.id !== id) return e;
      
      if (direction === 'left' || direction === 'right') {
        const currentIndex = positionOrder.indexOf(e.position);
        const newIndex = direction === 'left' 
          ? Math.max(0, currentIndex - 1)
          : Math.min(2, currentIndex + 1);
        return { ...e, position: positionOrder[newIndex] as 'left' | 'center' | 'right' };
      } else {
        const currentIndex = rowOrder.indexOf(e.row);
        const newIndex = direction === 'up' 
          ? Math.max(0, currentIndex - 1)
          : Math.min(2, currentIndex + 1);
        return { ...e, row: rowOrder[newIndex] as 'front' | 'middle' | 'back' };
      }
    }));
  };

  const getElementsInPosition = (position: 'left' | 'center' | 'right', row: 'front' | 'middle' | 'back') => {
    return elements.filter(e => e.position === position && e.row === row);
  };

  return (
    <div className="space-y-6">
      {/* Add Elements Panel */}
      <Card className="p-4 bg-white dark:bg-zinc-900 border-border">
        <p className="text-sm text-muted-foreground mb-3 font-medium">Adicionar elementos ao palco:</p>
        <div className="flex flex-wrap gap-2">
          {ELEMENT_TYPES.map((elementType) => (
            <Button
              key={elementType.type}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-primary/10 transition-colors"
              onClick={() => addElement(elementType.type)}
            >
              <span className="text-xs">{elementType.label}</span>
              <Plus className="w-3 h-3 opacity-50" />
            </Button>
          ))}
        </div>
      </Card>

      {/* Stage Visual - Professional Rider Style */}
      <div className="relative bg-white dark:bg-zinc-950 rounded-lg border-2 border-zinc-300 dark:border-zinc-700 overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-700 py-3 px-4">
          <h3 className="text-center font-bold text-lg tracking-wide text-zinc-800 dark:text-zinc-200">
            MAPEAMENTO DE PALCO
          </h3>
        </div>

        {/* Dimensions Labels */}
        <div className="relative">
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono text-zinc-500 whitespace-nowrap bg-white dark:bg-zinc-950 px-1">
            6M (MÍNIMO)
          </div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono text-zinc-500">
            8M (MÍNIMO)
          </div>
        </div>

        {/* Stage Area */}
        <div className="relative mx-8 my-6">
          {/* Top Truss Structure */}
          <div className="relative h-8 bg-gradient-to-b from-zinc-300 to-zinc-200 dark:from-zinc-700 dark:to-zinc-800 border border-zinc-400 dark:border-zinc-600 rounded-t-sm mb-1 flex items-center justify-around px-8">
            {/* Truss pattern */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1 h-full bg-zinc-400 dark:bg-zinc-600" />
              ))}
            </div>
            {/* Lights */}
            <div className="relative z-10 flex gap-12">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-6 h-4 bg-zinc-800 rounded-b-sm" />
                  <div className="w-3 h-3 rounded-full bg-gradient-to-b from-yellow-300 to-orange-400 shadow-lg shadow-yellow-400/50" />
                </div>
              ))}
            </div>
            {/* Dimensions on truss */}
            <div className="absolute top-0 left-4 text-[8px] text-zinc-600 dark:text-zinc-400 font-mono">90cm</div>
            <div className="absolute top-0 right-4 text-[8px] text-zinc-600 dark:text-zinc-400 font-mono">90cm</div>
          </div>

          {/* Stage Floor */}
          <div className="relative bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-300 dark:border-zinc-600 min-h-[350px] p-4">
            {/* Side curtains */}
            <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-zinc-900 to-zinc-800" />
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-gradient-to-l from-zinc-900 to-zinc-800" />

            {/* PA Speakers - Left */}
            <div className="absolute left-6 top-8">
              <div className="w-10">
                <PA />
              </div>
              <div className="text-[8px] text-center text-zinc-500 mt-1">120V</div>
            </div>

            {/* PA Speakers - Right */}
            <div className="absolute right-6 top-8">
              <div className="w-10">
                <PA />
              </div>
              <div className="text-[8px] text-center text-zinc-500 mt-1">120V</div>
            </div>

            {/* Stage Grid */}
            <div className="ml-16 mr-16 space-y-4 pt-4">
              {ROWS.map((row) => (
                <div key={row} className="grid grid-cols-3 gap-2 min-h-[100px]">
                  {POSITIONS.map((position) => {
                    const elementsHere = getElementsInPosition(position, row);
                    
                    return (
                      <div
                        key={position}
                        className="relative flex flex-wrap gap-2 justify-center items-center p-2 min-h-[90px] rounded border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-primary/50 transition-colors"
                      >
                        {elementsHere.length === 0 ? (
                          <span className="text-[10px] text-zinc-400">{POSITION_LABELS[position]}</span>
                        ) : (
                          elementsHere.map((element) => (
                            <div key={element.id} className="group relative">
                              <div className={`${getElementSize(element.type)} cursor-pointer hover:scale-105 transition-transform`}>
                                {getElementVisual(element.type, element.name)}
                              </div>
                              
                              {/* Controls overlay */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded flex items-center justify-center gap-1">
                                <button
                                  onClick={() => moveElement(element.id, 'left')}
                                  disabled={position === 'left'}
                                  className="w-5 h-5 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => moveElement(element.id, 'up')}
                                    disabled={row === 'back'}
                                    className="w-5 h-5 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => removeElement(element.id)}
                                    className="w-5 h-5 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => moveElement(element.id, 'down')}
                                    disabled={row === 'front'}
                                    className="w-5 h-5 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => moveElement(element.id, 'right')}
                                  disabled={position === 'right'}
                                  className="w-5 h-5 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Power requirements */}
            <div className="absolute bottom-2 left-4 text-[8px] text-zinc-500 font-mono">
              ⚡ 110V / 220V
            </div>
            <div className="absolute bottom-2 right-4 text-[8px] text-zinc-500 font-mono">
              ⚡ 110V / 220V
            </div>
          </div>

          {/* Front of stage indicator */}
          <div className="h-6 bg-gradient-to-b from-zinc-400 to-zinc-500 dark:from-zinc-600 dark:to-zinc-700 border border-zinc-400 dark:border-zinc-600 rounded-b-sm flex items-center justify-center">
            <span className="text-[10px] font-bold text-white tracking-widest">PLATEIA</span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-300 dark:border-zinc-700 p-3">
          <div className="flex flex-wrap gap-4 justify-center text-[10px] text-zinc-600 dark:text-zinc-400">
            <span>🎤 Microfones</span>
            <span>🥁 Bateria</span>
            <span>🎹 Teclado</span>
            <span>🎸 Guitarra/Baixo</span>
            <span>🔊 PA/Retornos</span>
            <span>🎧 DJ</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      {elements.length > 0 && (
        <Card className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-border">
          <h4 className="text-sm font-medium mb-2">Elementos no palco:</h4>
          <div className="flex flex-wrap gap-2">
            {elements.map((element) => (
              <span
                key={element.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs"
              >
                {element.name}
                <button
                  onClick={() => removeElement(element.id)}
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
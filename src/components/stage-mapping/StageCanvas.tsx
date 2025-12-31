import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Mic,
  MicVocal,
  Guitar,
  Music2,
  Piano,
  Drum,
  Headphones,
  Speaker,
  Plug,
  Music
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
  artistName?: string;
}

const ELEMENT_TYPES = [
  { type: 'vocal', label: 'Voz', shortLabel: 'VOZ', Icon: Mic, color: 'bg-purple-500' },
  { type: 'backing', label: 'Backing', shortLabel: 'BV', Icon: MicVocal, color: 'bg-purple-400' },
  { type: 'guitar', label: 'Guitarra', shortLabel: 'GTR', Icon: Guitar, color: 'bg-red-500' },
  { type: 'acoustic', label: 'Violão', shortLabel: 'VIO', Icon: Music2, color: 'bg-amber-600' },
  { type: 'bass', label: 'Baixo', shortLabel: 'BAIXO', Icon: Guitar, color: 'bg-blue-500' },
  { type: 'keyboard', label: 'Teclado', shortLabel: 'TEC', Icon: Piano, color: 'bg-green-500' },
  { type: 'drums', label: 'Bateria', shortLabel: 'BAT', Icon: Drum, color: 'bg-orange-500' },
  { type: 'accordion', label: 'Sanfona', shortLabel: 'SANF', Icon: Music, color: 'bg-rose-500' },
  { type: 'dj', label: 'DJ', shortLabel: 'DJ', Icon: Headphones, color: 'bg-cyan-500' },
  { type: 'monitor', label: 'Retorno', shortLabel: 'RET', Icon: Speaker, color: 'bg-zinc-600' },
  { type: 'power', label: 'Tomada AC', shortLabel: 'AC', Icon: Plug, color: 'bg-yellow-500' },
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
  accordion: [
    { instrument: 'Sanfona L', micType: '', di: true },
    { instrument: 'Sanfona R', micType: '', di: true },
  ],
  dj: [
    { instrument: 'DJ L', micType: '', di: true },
    { instrument: 'DJ R', micType: '', di: true },
  ],
  monitor: [],
  power: [],
};

const POSITIONS = ['left', 'center', 'right'] as const;
const ROWS = ['back', 'middle', 'front'] as const;

const POSITION_LABELS = { left: 'ESQ', center: 'CENTRO', right: 'DIR' };

// ========== SVG ELEMENTS - Estilo profissional com pessoas ==========

// Pessoa genérica (silhueta de cima)
const PersonSilhouette = ({ cx, cy, scale = 1 }: { cx: number; cy: number; scale?: number }) => (
  <g transform={`translate(${cx}, ${cy}) scale(${scale})`}>
    {/* Cabeça */}
    <circle cx="0" cy="-12" r="8" fill="#333" />
    {/* Corpo/ombros */}
    <ellipse cx="0" cy="5" rx="12" ry="15" fill="#444" />
    {/* Braços */}
    <ellipse cx="-14" cy="8" rx="5" ry="8" fill="#333" />
    <ellipse cx="14" cy="8" rx="5" ry="8" fill="#333" />
  </g>
);

// Bateria completa com baterista
const DrumKit = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full">
    {/* Baterista */}
    <PersonSilhouette cx={100} cy={130} scale={0.9} />
    
    {/* Bumbo */}
    <ellipse cx="100" cy="85" rx="32" ry="30" fill="none" stroke="#333" strokeWidth="3"/>
    <ellipse cx="100" cy="85" rx="26" ry="24" fill="none" stroke="#666" strokeWidth="1"/>
    <ellipse cx="100" cy="85" rx="12" ry="12" fill="#eee" stroke="#ccc" strokeWidth="1"/>
    
    {/* Tom 1 */}
    <ellipse cx="75" cy="50" rx="18" ry="14" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="75" cy="50" rx="14" ry="10" fill="none" stroke="#666" strokeWidth="1"/>
    
    {/* Tom 2 */}
    <ellipse cx="125" cy="50" rx="18" ry="14" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="125" cy="50" rx="14" ry="10" fill="none" stroke="#666" strokeWidth="1"/>
    
    {/* Caixa */}
    <ellipse cx="60" cy="105" rx="16" ry="12" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="60" cy="105" rx="12" ry="8" fill="none" stroke="#999" strokeWidth="1"/>
    <line x1="52" y1="100" x2="68" y2="110" stroke="#ccc" strokeWidth="0.5"/>
    <line x1="52" y1="110" x2="68" y2="100" stroke="#ccc" strokeWidth="0.5"/>
    
    {/* Surdo */}
    <ellipse cx="160" cy="100" rx="22" ry="18" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="160" cy="100" rx="17" ry="13" fill="none" stroke="#666" strokeWidth="1"/>
    
    {/* Hi-Hat */}
    <ellipse cx="30" cy="70" rx="16" ry="6" fill="none" stroke="#888" strokeWidth="2"/>
    <ellipse cx="30" cy="66" rx="15" ry="5" fill="none" stroke="#888" strokeWidth="1.5"/>
    <line x1="30" y1="72" x2="30" y2="110" stroke="#666" strokeWidth="1.5"/>
    
    {/* Crash */}
    <ellipse cx="45" cy="30" rx="18" ry="7" fill="none" stroke="#888" strokeWidth="2"/>
    <line x1="45" y1="33" x2="45" y2="60" stroke="#666" strokeWidth="1.5"/>
    
    {/* Ride */}
    <ellipse cx="170" cy="55" rx="20" ry="8" fill="none" stroke="#888" strokeWidth="2"/>
    <line x1="170" y1="60" x2="170" y2="85" stroke="#666" strokeWidth="1.5"/>
    
    {/* Pedal de bumbo */}
    <rect x="85" y="115" width="30" height="8" fill="none" stroke="#555" strokeWidth="1"/>
    
    <text x="180" y="155" fill="#dc2626" fontSize="10" fontWeight="bold">AC</text>
  </svg>
);

// Teclado com tecladista
const Keyboard = () => (
  <svg viewBox="0 0 180 100" className="w-full h-full">
    {/* Tecladista */}
    <PersonSilhouette cx={90} cy={75} scale={0.7} />
    
    {/* Suporte X */}
    <line x1="20" y1="80" x2="50" y2="50" stroke="#555" strokeWidth="2"/>
    <line x1="50" y1="80" x2="20" y2="50" stroke="#555" strokeWidth="2"/>
    <line x1="130" y1="80" x2="160" y2="50" stroke="#555" strokeWidth="2"/>
    <line x1="160" y1="80" x2="130" y2="50" stroke="#555" strokeWidth="2"/>
    
    {/* Teclado */}
    <rect x="10" y="35" width="160" height="22" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    
    {/* Teclas brancas */}
    {[...Array(28)].map((_, i) => (
      <rect key={i} x={14 + i * 5.5} y="38" width="4.5" height="16" fill="none" stroke="#666" strokeWidth="0.5"/>
    ))}
    
    {/* Teclas pretas */}
    {[0, 1, 3, 4, 5, 7, 8, 10, 11, 12, 14, 15, 17, 18, 19, 21, 22, 24, 25].map((i) => (
      <rect key={`b${i}`} x={17 + i * 5.5} y="38" width="3" height="9" fill="#333"/>
    ))}
    
    {/* Display/controles */}
    <rect x="70" y="28" width="40" height="6" fill="none" stroke="#666" strokeWidth="1"/>
    
    {/* DI Box */}
    <rect x="155" y="10" width="22" height="18" fill="none" stroke="#333" strokeWidth="1.5" rx="2"/>
    <text x="166" y="18" fill="#333" fontSize="5" textAnchor="middle">STEREO</text>
    <text x="166" y="25" fill="#333" fontSize="6" textAnchor="middle" fontWeight="bold">DI</text>
    
    <text x="10" y="15" fill="#dc2626" fontSize="10" fontWeight="bold">AC</text>
  </svg>
);

// Guitarrista
const ElectricGuitar = ({ label }: { label: string }) => (
  <svg viewBox="0 0 80 120" className="w-full h-full">
    {/* Pessoa */}
    <PersonSilhouette cx={40} cy={70} scale={0.8} />
    
    {/* Guitarra na frente */}
    <ellipse cx="55" cy="75" rx="12" ry="15" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="55" cy="70" rx="8" ry="10" fill="none" stroke="#666" strokeWidth="1"/>
    <rect x="52" y="35" width="4" height="35" fill="none" stroke="#333" strokeWidth="1.5"/>
    <rect x="50" y="28" width="8" height="10" rx="1" fill="none" stroke="#333" strokeWidth="1"/>
    
    {/* Amplificador */}
    <rect x="5" y="90" width="30" height="25" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="20" cy="100" rx="10" ry="10" fill="none" stroke="#666" strokeWidth="1"/>
    <ellipse cx="20" cy="100" rx="6" ry="6" fill="none" stroke="#888" strokeWidth="0.5"/>
    
    <text x="40" y="118" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">{label}</text>
  </svg>
);

// Baixista
const BassGuitar = ({ label }: { label: string }) => (
  <svg viewBox="0 0 80 120" className="w-full h-full">
    {/* Pessoa */}
    <PersonSilhouette cx={40} cy={70} scale={0.8} />
    
    {/* Baixo na frente */}
    <ellipse cx="55" cy="78" rx="10" ry="14" fill="none" stroke="#333" strokeWidth="2"/>
    <rect x="52" y="30" width="4" height="45" fill="none" stroke="#333" strokeWidth="1.5"/>
    <rect x="49" y="22" width="10" height="12" rx="1" fill="none" stroke="#333" strokeWidth="1"/>
    
    {/* Amplificador de baixo (maior) */}
    <rect x="3" y="85" width="32" height="30" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    <ellipse cx="19" cy="97" rx="11" ry="11" fill="none" stroke="#666" strokeWidth="1"/>
    <ellipse cx="19" cy="97" rx="7" ry="7" fill="none" stroke="#888" strokeWidth="0.5"/>
    
    <text x="40" y="118" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">{label}</text>
  </svg>
);

// Violonista
const AcousticGuitar = ({ label }: { label: string }) => (
  <svg viewBox="0 0 80 120" className="w-full h-full">
    {/* Pessoa */}
    <PersonSilhouette cx={40} cy={70} scale={0.8} />
    
    {/* Violão */}
    <ellipse cx="55" cy="80" rx="14" ry="18" fill="none" stroke="#8b4513" strokeWidth="2"/>
    <ellipse cx="55" cy="75" rx="10" ry="12" fill="none" stroke="#d2691e" strokeWidth="1"/>
    <circle cx="55" cy="72" r="5" fill="none" stroke="#333" strokeWidth="1.5"/>
    <rect x="52" y="35" width="4" height="38" fill="none" stroke="#8b4513" strokeWidth="1.5"/>
    <path d="M50 28 L58 28 L56 38 L52 38 Z" fill="none" stroke="#333" strokeWidth="1"/>
    
    {/* DI Box */}
    <rect x="5" y="95" width="20" height="14" fill="none" stroke="#333" strokeWidth="1.5" rx="2"/>
    <text x="15" y="104" fill="#333" fontSize="6" textAnchor="middle" fontWeight="bold">DI</text>
    
    <text x="40" y="118" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">{label}</text>
  </svg>
);

// Sanfoneiro
const Accordion = ({ label }: { label: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    {/* Pessoa */}
    <PersonSilhouette cx={50} cy={60} scale={0.8} />
    
    {/* Sanfona no colo */}
    <rect x="25" y="50" width="15" height="30" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    <rect x="40" y="52" width="20" height="26" fill="none" stroke="#8b0000" strokeWidth="1.5"/>
    {[...Array(5)].map((_, i) => (
      <line key={i} x1="40" y1={55 + i * 5} x2="60" y2={55 + i * 5} stroke="#333" strokeWidth="0.5"/>
    ))}
    <rect x="60" y="50" width="15" height="30" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    {[...Array(6)].map((_, i) => (
      <circle key={i} cx={67} cy={54 + i * 4.5} r="2" fill="none" stroke="#666" strokeWidth="0.5"/>
    ))}
    
    <text x="50" y="95" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">{label}</text>
  </svg>
);

// Cantor com microfone
const Microphone = ({ label }: { label: string }) => (
  <svg viewBox="0 0 60 90" className="w-full h-full">
    {/* Pessoa */}
    <PersonSilhouette cx={30} cy={55} scale={0.85} />
    
    {/* Pedestal do microfone */}
    <ellipse cx="30" cy="78" rx="12" ry="4" fill="none" stroke="#555" strokeWidth="1.5"/>
    <line x1="30" y1="25" x2="30" y2="75" stroke="#555" strokeWidth="2"/>
    
    {/* Microfone */}
    <ellipse cx="30" cy="20" rx="6" ry="10" fill="none" stroke="#333" strokeWidth="2"/>
    <rect x="26" y="16" width="8" height="8" rx="2" fill="none" stroke="#666" strokeWidth="1"/>
    
    <text x="30" y="88" textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">{label}</text>
  </svg>
);

// Monitor de palco
const Monitor = ({ label }: { label: string }) => (
  <svg viewBox="0 0 80 50" className="w-full h-full">
    {/* Corpo do monitor (trapézio) */}
    <polygon points="10,45 70,45 62,15 18,15" fill="none" stroke="#333" strokeWidth="2"/>
    
    {/* Grade do falante */}
    <rect x="22" y="20" width="36" height="20" fill="none" stroke="#666" strokeWidth="1"/>
    {[22, 26, 30, 34].map((y) => (
      <line key={y} x1="24" y1={y} x2="56" y2={y} stroke="#888" strokeWidth="0.5"/>
    ))}
    
    {/* Etiqueta */}
    <text x="40" y="12" textAnchor="middle" fill="#333" fontSize="6" fontWeight="bold">MONITOR</text>
    <text x="40" y="48" textAnchor="middle" fill="#666" fontSize="6">{label}</text>
  </svg>
);

// PA Lateral - Side
const PA = () => (
  <svg viewBox="0 0 50 100" className="w-full h-full">
    {/* Caixa superior */}
    <rect x="5" y="5" width="40" height="45" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    <circle cx="25" cy="22" r="14" fill="none" stroke="#666" strokeWidth="1.5"/>
    <circle cx="25" cy="22" r="9" fill="none" stroke="#888" strokeWidth="1"/>
    <circle cx="25" cy="22" r="3" fill="#333"/>
    <rect x="12" y="40" width="26" height="8" fill="none" stroke="#666" strokeWidth="1"/>
    
    {/* Sub */}
    <rect x="5" y="55" width="40" height="40" rx="2" fill="none" stroke="#333" strokeWidth="2"/>
    <circle cx="25" cy="75" r="16" fill="none" stroke="#666" strokeWidth="1.5"/>
    <circle cx="25" cy="75" r="10" fill="none" stroke="#888" strokeWidth="1"/>
    <circle cx="25" cy="75" r="4" fill="#333"/>
    
    <text x="25" y="99" textAnchor="middle" fill="#666" fontSize="6">SIDE</text>
  </svg>
);

// DJ Setup
const DJSetup = () => (
  <svg viewBox="0 0 180 110" className="w-full h-full">
    {/* DJ (pessoa) */}
    <PersonSilhouette cx={90} cy={85} scale={0.75} />
    
    {/* Mesa/Controlador */}
    <rect x="15" y="35" width="150" height="45" rx="3" fill="none" stroke="#333" strokeWidth="2"/>
    
    {/* Toca-discos esquerdo */}
    <rect x="20" y="40" width="50" height="35" fill="none" stroke="#666" strokeWidth="1"/>
    <circle cx="45" cy="57" r="14" fill="none" stroke="#888" strokeWidth="1.5"/>
    <circle cx="45" cy="57" r="9" fill="none" stroke="#aaa" strokeWidth="0.5"/>
    <circle cx="45" cy="57" r="3" fill="#333"/>
    
    {/* Mixer central */}
    <rect x="75" y="40" width="30" height="35" fill="none" stroke="#666" strokeWidth="1"/>
    {[82, 90, 98].map((x) => (
      <rect key={x} x={x} y="48" width="3" height="20" fill="none" stroke="#888" strokeWidth="0.5"/>
    ))}
    
    {/* Toca-discos direito */}
    <rect x="110" y="40" width="50" height="35" fill="none" stroke="#666" strokeWidth="1"/>
    <circle cx="135" cy="57" r="14" fill="none" stroke="#888" strokeWidth="1.5"/>
    <circle cx="135" cy="57" r="9" fill="none" stroke="#aaa" strokeWidth="0.5"/>
    <circle cx="135" cy="57" r="3" fill="#333"/>
    
    {/* Laptop/CDJ */}
    <rect x="65" y="15" width="50" height="20" rx="2" fill="none" stroke="#555" strokeWidth="1.5"/>
    <rect x="68" y="18" width="44" height="14" fill="none" stroke="#888" strokeWidth="0.5"/>
    
    <text x="20" y="15" fill="#dc2626" fontSize="10" fontWeight="bold">AC</text>
  </svg>
);

// Tomada / Power
const PowerOutlet = ({ label }: { label: string }) => (
  <svg viewBox="0 0 50 50" className="w-full h-full">
    {/* Caixa da tomada */}
    <rect x="8" y="8" width="34" height="34" rx="4" fill="none" stroke="#333" strokeWidth="2"/>
    
    {/* Pinos */}
    <rect x="15" y="18" width="6" height="4" rx="1" fill="#333"/>
    <rect x="29" y="18" width="6" height="4" rx="1" fill="#333"/>
    
    {/* Terra */}
    <circle cx="25" cy="32" r="4" fill="none" stroke="#333" strokeWidth="2"/>
    
    <text x="25" y="48" textAnchor="middle" fill="#dc2626" fontSize="8" fontWeight="bold">{label}</text>
  </svg>
);

const getElementVisual = (type: string, name: string) => {
  switch (type) {
    case 'drums': return <DrumKit />;
    case 'keyboard': return <Keyboard />;
    case 'guitar': return <ElectricGuitar label={name} />;
    case 'acoustic': return <AcousticGuitar label={name} />;
    case 'bass': return <BassGuitar label={name} />;
    case 'accordion': return <Accordion label={name} />;
    case 'vocal':
    case 'backing': return <Microphone label={name} />;
    case 'monitor': return <Monitor label={name} />;
    case 'dj': return <DJSetup />;
    case 'power': return <PowerOutlet label={name} />;
    default: return <Monitor label={name} />;
  }
};

const getElementSize = (type: string) => {
  switch (type) {
    case 'drums': return 'w-40 h-32';
    case 'keyboard': return 'w-36 h-20';
    case 'dj': return 'w-40 h-24';
    case 'accordion': return 'w-24 h-24';
    case 'guitar':
    case 'bass': return 'w-20 h-28';
    case 'acoustic': return 'w-20 h-28';
    case 'vocal':
    case 'backing': return 'w-16 h-24';
    case 'monitor': return 'w-20 h-12';
    case 'power': return 'w-12 h-12';
    default: return 'w-16 h-16';
  }
};

export function StageCanvas({ elements, onChange, onElementAdded, artistName }: StageCanvasProps) {
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
      row: type === 'drums' || type === 'dj' ? 'back' : type === 'monitor' || type === 'power' ? 'front' : 'middle'
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
  };

  const moveElement = (id: string, direction: 'left' | 'right' | 'up' | 'down') => {
    const positionOrder = ['left', 'center', 'right'];
    const rowOrder = ['back', 'middle', 'front'];
    
    onChange(elements.map(e => {
      if (e.id !== id) return e;
      
      if (direction === 'left' || direction === 'right') {
        const currentIndex = positionOrder.indexOf(e.position);
        const newIndex = direction === 'left' ? Math.max(0, currentIndex - 1) : Math.min(2, currentIndex + 1);
        return { ...e, position: positionOrder[newIndex] as 'left' | 'center' | 'right' };
      } else {
        const currentIndex = rowOrder.indexOf(e.row);
        const newIndex = direction === 'up' ? Math.max(0, currentIndex - 1) : Math.min(2, currentIndex + 1);
        return { ...e, row: rowOrder[newIndex] as 'front' | 'middle' | 'back' };
      }
    }));
  };

  const getElementsInPosition = (position: 'left' | 'center' | 'right', row: 'front' | 'middle' | 'back') => {
    return elements.filter(e => e.position === position && e.row === row);
  };

  return (
    <div className="space-y-6">
      {/* Add Elements Panel - MELHORADO */}
      <Card className="p-5 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg">
        <p className="text-base font-semibold text-foreground mb-4">Adicionar elementos ao palco:</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {ELEMENT_TYPES.map((elementType) => (
            <Button
              key={elementType.type}
              variant="outline"
              size="sm"
              className={`flex flex-col items-center justify-center gap-1 h-auto py-3 px-2 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-600 hover:border-primary hover:scale-105 transition-all shadow-sm`}
              onClick={() => addElement(elementType.type)}
            >
              <div className={`p-2 rounded-lg ${elementType.color}`}>
                <elementType.Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-foreground">{elementType.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Stage Visual */}
      <div className="relative bg-white rounded-lg border-2 border-zinc-300 overflow-hidden shadow-xl print:shadow-none" id="stage-canvas-print">
        {/* Header */}
        <div className="bg-white border-b-2 border-zinc-900 py-4 px-4">
          <h3 className="text-center font-bold text-2xl tracking-wide text-zinc-900 uppercase">
            MAPEAMENTO DE PALCO
          </h3>
          {artistName && (
            <p className="text-center text-lg font-semibold text-zinc-700 mt-1">{artistName}</p>
          )}
        </div>

        {/* Dimensions */}
        <div className="relative px-4 pt-2">
          <div className="flex justify-between text-xs font-mono text-zinc-600">
            <span className="font-bold">8M <span className="font-normal">(MÍNIMO)</span></span>
          </div>
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-mono text-zinc-600 whitespace-nowrap">
            <span className="font-bold">6M</span> <span className="font-normal">(MÍNIMO)</span>
          </div>
        </div>

        {/* Stage Area */}
        <div className="relative mx-6 my-4">
          {/* Truss Structure */}
          <div className="relative h-10 bg-gradient-to-b from-zinc-800 to-zinc-700 border-2 border-zinc-600 flex items-center justify-center mb-2">
            <div className="absolute inset-0 flex items-center justify-between px-2">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-0.5 h-full bg-zinc-500" />
              ))}
            </div>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {[...Array(10)].map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={i * 10 + '%'} y1="0" x2={(i * 10 + 5) + '%'} y2="100%" stroke="#666" strokeWidth="1"/>
                  <line x1={(i * 10 + 5) + '%'} y1="0" x2={i * 10 + '%'} y2="100%" stroke="#666" strokeWidth="1"/>
                </React.Fragment>
              ))}
            </svg>
            <div className="relative z-10 flex gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 shadow-lg shadow-yellow-400/30 border border-yellow-600" />
              ))}
            </div>
            <span className="absolute left-2 top-1 text-[8px] text-zinc-400 font-mono">90cm</span>
            <span className="absolute right-2 top-1 text-[8px] text-zinc-400 font-mono">90cm</span>
          </div>

          {/* Stage Floor */}
          <div className="relative bg-white border-2 border-zinc-400 min-h-[450px]">
            {/* Side PA - Left */}
            <div className="absolute left-0 top-4 w-12">
              <PA />
              <div className="text-center text-[8px] text-zinc-500 font-mono mt-1">120V</div>
            </div>

            {/* Side PA - Right */}
            <div className="absolute right-0 top-4 w-12">
              <PA />
              <div className="text-center text-[8px] text-zinc-500 font-mono mt-1">120V</div>
            </div>

            {/* Stage Grid */}
            <div className="ml-14 mr-14 py-4">
              {ROWS.map((row) => (
                <div key={row} className="grid grid-cols-3 gap-3 min-h-[130px] mb-2">
                  {POSITIONS.map((position) => {
                    const elementsHere = getElementsInPosition(position, row);
                    
                    return (
                      <div
                        key={position}
                        className="relative flex flex-wrap gap-2 justify-center items-center p-2 min-h-[120px] border border-dashed border-zinc-200 hover:border-zinc-400 transition-colors rounded"
                      >
                        {elementsHere.length === 0 ? (
                          <span className="text-[10px] text-zinc-300 uppercase font-medium">{POSITION_LABELS[position]}</span>
                        ) : (
                          elementsHere.map((element) => (
                            <div key={element.id} className="group relative">
                              <div className={`${getElementSize(element.type)} cursor-pointer hover:scale-105 transition-transform`}>
                                {getElementVisual(element.type, element.name)}
                              </div>
                              
                              {/* Controls overlay */}
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded flex items-center justify-center gap-1 print:hidden">
                                <button
                                  onClick={() => moveElement(element.id, 'left')}
                                  disabled={position === 'left'}
                                  className="w-6 h-6 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex flex-col gap-1">
                                  <button
                                    onClick={() => moveElement(element.id, 'up')}
                                    disabled={row === 'back'}
                                    className="w-6 h-6 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => removeElement(element.id)}
                                    className="w-6 h-6 rounded bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => moveElement(element.id, 'down')}
                                    disabled={row === 'front'}
                                    className="w-6 h-6 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>
                                <button
                                  onClick={() => moveElement(element.id, 'right')}
                                  disabled={position === 'right'}
                                  className="w-6 h-6 rounded bg-white/90 text-zinc-800 flex items-center justify-center hover:bg-white disabled:opacity-30"
                                >
                                  <ChevronRight className="w-4 h-4" />
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

            {/* Artist name watermark */}
            {artistName && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-zinc-100 uppercase tracking-widest">{artistName}</span>
              </div>
            )}

            {/* Power labels */}
            <div className="absolute bottom-2 left-16 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 110V / 220V
            </div>
            <div className="absolute bottom-2 right-16 text-[10px] text-zinc-500 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-400"></span> 110V / 220V
            </div>
          </div>

          {/* Front of stage */}
          <div className="h-8 bg-gradient-to-b from-amber-500 to-amber-600 border-2 border-amber-700 flex items-center justify-center mt-2 rounded-b">
            <span className="text-sm font-bold text-white tracking-widest uppercase">Plateia / Público</span>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-zinc-100 border-t-2 border-zinc-300 p-3">
          <div className="flex flex-wrap gap-6 justify-center text-xs text-zinc-600 font-medium">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>AC = Tomada necessária</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>Energia 110V/220V</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-zinc-800"></div>
              <span>SIDE = PA Lateral</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {elements.length > 0 && (
        <Card className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-border print:hidden">
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

// Exportar função para gerar SVG do palco para impressão
export function generateStageLayoutSVG(elements: StageElement[], artistName?: string): string {
  const getElementSVG = (type: string, name: string): string => {
    switch (type) {
      case 'drums':
        return `<g transform="translate(-90,-70)"><ellipse cx="90" cy="70" rx="28" ry="28" fill="#1a1a1a" stroke="#333" stroke-width="2"/><ellipse cx="90" cy="70" rx="22" ry="22" fill="#0f0f0f"/><ellipse cx="70" cy="35" rx="16" ry="14" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/><ellipse cx="110" cy="35" rx="16" ry="14" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/><ellipse cx="55" cy="85" rx="14" ry="12" fill="#ddd" stroke="#999" stroke-width="1.5"/><ellipse cx="145" cy="85" rx="20" ry="18" fill="#1a1a1a" stroke="#444" stroke-width="1.5"/><ellipse cx="25" cy="55" rx="14" ry="6" fill="#d4af37"/><ellipse cx="35" cy="20" rx="16" ry="7" fill="#d4af37"/><ellipse cx="155" cy="40" rx="18" ry="8" fill="#d4af37"/><circle cx="90" cy="120" r="12" fill="#333"/></g>`;
      case 'keyboard':
        return `<g transform="translate(-80,-40)"><rect x="5" y="35" width="150" height="40" rx="2" fill="#333"/><rect x="15" y="40" width="130" height="30" rx="2" fill="#1a1a1a"/><rect x="60" y="42" width="40" height="4" fill="#2d5a27" rx="1"/></g>`;
      case 'guitar':
        return `<g transform="translate(-25,-60)"><ellipse cx="25" cy="85" rx="20" ry="25" fill="#8B0000" stroke="#5a0000" stroke-width="2"/><rect x="22" y="15" width="6" height="55" fill="#4a3728"/><rect x="20" y="5" width="10" height="15" rx="2" fill="#1a1a1a"/><text x="25" y="118" text-anchor="middle" fill="#333" font-size="7" font-weight="bold">${name}</text></g>`;
      case 'bass':
        return `<g transform="translate(-25,-65)"><ellipse cx="25" cy="100" rx="18" ry="22" fill="#1a1a1a" stroke="#333" stroke-width="2"/><rect x="22" y="10" width="6" height="70" fill="#4a3728"/><rect x="19" y="2" width="12" height="12" rx="2" fill="#1a1a1a"/><text x="25" y="128" text-anchor="middle" fill="#333" font-size="7" font-weight="bold">${name}</text></g>`;
      case 'acoustic':
        return `<g transform="translate(-27,-60)"><ellipse cx="27" cy="85" rx="22" ry="28" fill="#d2691e" stroke="#8b4513" stroke-width="2"/><ellipse cx="27" cy="80" rx="18" ry="22" fill="#deb887"/><circle cx="27" cy="75" r="8" fill="#1a1a1a"/><rect x="24" y="15" width="6" height="50" fill="#3d2314"/><text x="27" y="118" text-anchor="middle" fill="#333" font-size="7" font-weight="bold">${name}</text></g>`;
      case 'accordion':
        return `<g transform="translate(-50,-40)"><rect x="60" y="10" width="35" height="60" rx="3" fill="#1a1a1a" stroke="#333" stroke-width="2"/><rect x="30" y="12" width="30" height="56" fill="#8B0000" stroke="#5a0000" stroke-width="1"/><rect x="5" y="10" width="25" height="60" rx="3" fill="#1a1a1a" stroke="#333" stroke-width="2"/><text x="50" y="78" text-anchor="middle" fill="#333" font-size="7" font-weight="bold">${name}</text></g>`;
      case 'vocal':
      case 'backing':
        return `<g transform="translate(-25,-35)"><ellipse cx="25" cy="55" rx="18" ry="10" fill="#333"/><rect x="23" y="25" width="4" height="30" fill="#444"/><ellipse cx="25" cy="18" rx="8" ry="12" fill="#333" stroke="#555" stroke-width="1.5"/><text x="25" y="68" text-anchor="middle" fill="#333" font-size="7" font-weight="bold">${name}</text></g>`;
      case 'monitor':
        return `<g transform="translate(-35,-22)"><polygon points="10,40 60,40 55,10 15,10" fill="#1a1a1a" stroke="#444" stroke-width="2"/><text x="35" y="8" text-anchor="middle" fill="#333" font-size="6" font-weight="bold">MONITOR</text></g>`;
      case 'power':
        return `<g transform="translate(-25,-25)"><rect x="5" y="5" width="40" height="40" rx="5" fill="#f5f5f5" stroke="#ccc" stroke-width="2"/><rect x="12" y="15" width="8" height="4" rx="1" fill="#333"/><rect x="30" y="15" width="8" height="4" rx="1" fill="#333"/><circle cx="25" cy="32" r="5" fill="#333"/><text x="25" y="48" text-anchor="middle" fill="#dc2626" font-size="8" font-weight="bold">${name}</text></g>`;
      default:
        return '';
    }
  };

  const positionX = { left: 150, center: 400, right: 650 };
  const rowY = { back: 100, middle: 250, front: 400 };

  let elementsContent = '';
  elements.forEach(el => {
    const x = positionX[el.position];
    const y = rowY[el.row];
    elementsContent += `<g transform="translate(${x},${y})">${getElementSVG(el.type, el.name)}</g>`;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 550" width="800" height="550">
      <!-- Background -->
      <rect width="800" height="550" fill="white"/>
      
      <!-- Header -->
      <rect x="0" y="0" width="800" height="50" fill="white" stroke="#000" stroke-width="2"/>
      <text x="400" y="30" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold">MAPEAMENTO DE PALCO</text>
      ${artistName ? `<text x="400" y="45" text-anchor="middle" font-family="Arial" font-size="14" fill="#555">${artistName}</text>` : ''}
      
      <!-- Truss -->
      <rect x="50" y="55" width="700" height="30" fill="#444" stroke="#333" stroke-width="2"/>
      ${[...Array(8)].map((_, i) => `<circle cx="${100 + i * 90}" cy="70" r="6" fill="#fcd34d"/>`).join('')}
      
      <!-- Stage area -->
      <rect x="50" y="90" width="700" height="400" fill="white" stroke="#666" stroke-width="2"/>
      
      <!-- Side PA -->
      <rect x="55" y="100" width="30" height="80" fill="#111" stroke="#333" stroke-width="1"/>
      <text x="70" y="190" text-anchor="middle" font-size="8" fill="#666">SIDE</text>
      <rect x="715" y="100" width="30" height="80" fill="#111" stroke="#333" stroke-width="1"/>
      <text x="730" y="190" text-anchor="middle" font-size="8" fill="#666">SIDE</text>
      
      <!-- Elements -->
      ${elementsContent}
      
      <!-- Plateia -->
      <rect x="50" y="495" width="700" height="35" fill="#f59e0b" stroke="#d97706" stroke-width="2"/>
      <text x="400" y="518" text-anchor="middle" font-family="Arial" font-size="14" font-weight="bold" fill="white">PLATEIA / PÚBLICO</text>
      
      <!-- Dimensions -->
      <text x="55" y="540" font-family="monospace" font-size="10" fill="#666">8M (MÍNIMO)</text>
      <text x="25" y="300" font-family="monospace" font-size="10" fill="#666" transform="rotate(-90 25 300)">6M (MÍNIMO)</text>
    </svg>
  `;
}
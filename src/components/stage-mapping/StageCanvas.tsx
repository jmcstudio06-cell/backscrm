import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  Guitar, 
  Piano, 
  Speaker,
  Volume2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Music2,
  Radio
} from 'lucide-react';

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
}

const ELEMENT_TYPES = [
  { type: 'vocal', label: 'Voz', icon: Mic, color: 'from-amber-500 to-orange-600' },
  { type: 'backing', label: 'Backing Vocal', icon: Mic, color: 'from-pink-500 to-rose-600' },
  { type: 'guitar', label: 'Guitarra', icon: Guitar, color: 'from-red-500 to-red-700' },
  { type: 'bass', label: 'Baixo', icon: Guitar, color: 'from-purple-500 to-purple-700' },
  { type: 'keyboard', label: 'Teclado', icon: Piano, color: 'from-blue-500 to-blue-700' },
  { type: 'drums', label: 'Bateria', icon: Music2, color: 'from-emerald-500 to-emerald-700' },
  { type: 'dj', label: 'DJ / MPC', icon: Radio, color: 'from-cyan-500 to-cyan-700' },
  { type: 'monitor', label: 'Retorno', icon: Volume2, color: 'from-slate-500 to-slate-700' },
  { type: 'pa', label: 'PA', icon: Speaker, color: 'from-zinc-600 to-zinc-800' },
];

const POSITIONS = ['left', 'center', 'right'] as const;
const ROWS = ['front', 'middle', 'back'] as const;

const ROW_LABELS = {
  front: 'Frente',
  middle: 'Meio',
  back: 'Fundo'
};

const POSITION_LABELS = {
  left: 'Esquerda',
  center: 'Centro',
  right: 'Direita'
};

export function StageCanvas({ elements, onChange }: StageCanvasProps) {
  const addElement = (type: string, position: 'left' | 'center' | 'right', row: 'front' | 'middle' | 'back') => {
    const elementType = ELEMENT_TYPES.find(e => e.type === type);
    if (!elementType) return;

    // Count existing elements of this type to auto-number
    const existingOfType = elements.filter(e => e.type === type);
    const number = existingOfType.length + 1;
    
    const newElement: StageElement = {
      id: `${type}-${Date.now()}`,
      type,
      name: `${elementType.label} ${number}`,
      position,
      row
    };

    onChange([...elements, newElement]);
  };

  const removeElement = (id: string) => {
    onChange(elements.filter(e => e.id !== id));
  };

  const moveElement = (id: string, direction: 'left' | 'right') => {
    const positionOrder = ['left', 'center', 'right'];
    onChange(elements.map(e => {
      if (e.id !== id) return e;
      const currentIndex = positionOrder.indexOf(e.position);
      const newIndex = direction === 'left' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(2, currentIndex + 1);
      return { ...e, position: positionOrder[newIndex] as 'left' | 'center' | 'right' };
    }));
  };

  const moveElementRow = (id: string, direction: 'up' | 'down') => {
    const rowOrder = ['front', 'middle', 'back'];
    onChange(elements.map(e => {
      if (e.id !== id) return e;
      const currentIndex = rowOrder.indexOf(e.row);
      const newIndex = direction === 'up' 
        ? Math.max(0, currentIndex - 1)
        : Math.min(2, currentIndex + 1);
      return { ...e, row: rowOrder[newIndex] as 'front' | 'middle' | 'back' };
    }));
  };

  const getElementsInPosition = (position: 'left' | 'center' | 'right', row: 'front' | 'middle' | 'back') => {
    return elements.filter(e => e.position === position && e.row === row);
  };

  const getElementConfig = (type: string) => {
    return ELEMENT_TYPES.find(e => e.type === type);
  };

  return (
    <div className="space-y-6">
      {/* Add Elements Panel */}
      <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
        <p className="text-sm text-muted-foreground mb-3 font-medium">Clique para adicionar ao palco:</p>
        <div className="flex flex-wrap gap-2">
          {ELEMENT_TYPES.map((elementType) => {
            const Icon = elementType.icon;
            return (
              <Button
                key={elementType.type}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => addElement(elementType.type, 'center', 'middle')}
              >
                <div className={`w-5 h-5 rounded bg-gradient-to-br ${elementType.color} flex items-center justify-center`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs">{elementType.label}</span>
                <Plus className="w-3 h-3 opacity-50" />
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Stage Visual */}
      <div className="relative">
        {/* Stage Frame */}
        <div className="relative bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-900 rounded-xl overflow-hidden border-4 border-zinc-700 shadow-2xl">
          {/* Top Truss/Lighting */}
          <div className="h-12 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 border-b-2 border-zinc-600 flex items-center justify-around px-4">
            <div className="flex gap-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg shadow-yellow-500/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
          </div>

          {/* Stage Dimensions */}
          <div className="absolute -left-14 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono rotate-[-90deg] whitespace-nowrap">
            6M (MÍNIMO)
          </div>
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground font-mono">
            8M (MÍNIMO)
          </div>

          {/* Stage Floor */}
          <div className="relative p-6 min-h-[420px]">
            {/* Grid Background */}
            <div className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                backgroundSize: '40px 40px'
              }} 
            />

            {/* Stage Rows */}
            {ROWS.map((row, rowIndex) => (
              <div key={row} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] bg-zinc-800 text-zinc-300 border-zinc-600">
                    {ROW_LABELS[row]}
                  </Badge>
                  <div className="flex-1 h-px bg-gradient-to-r from-zinc-600 via-transparent to-zinc-600" />
                </div>
                
                <div className="grid grid-cols-3 gap-3 min-h-[110px]">
                  {POSITIONS.map((position) => {
                    const elementsHere = getElementsInPosition(position, row);
                    
                    return (
                      <div
                        key={position}
                        className="relative rounded-lg border-2 border-dashed border-zinc-600/50 bg-zinc-800/30 p-2 min-h-[100px] flex flex-col gap-2 transition-all hover:border-primary/50 hover:bg-zinc-800/50"
                      >
                        {/* Position Label */}
                        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] text-zinc-500 bg-zinc-800 px-2 rounded">
                          {POSITION_LABELS[position]}
                        </span>

                        {/* Elements */}
                        {elementsHere.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center">
                            <span className="text-xs text-zinc-600">Vazio</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2 justify-center items-start pt-2">
                            {elementsHere.map((element) => {
                              const config = getElementConfig(element.type);
                              if (!config) return null;
                              const Icon = config.icon;
                              
                              return (
                                <div
                                  key={element.id}
                                  className="group relative"
                                >
                                  <div className={`flex flex-col items-center p-2 rounded-lg bg-gradient-to-br ${config.color} shadow-lg transition-transform hover:scale-105 cursor-pointer min-w-[65px]`}>
                                    <Icon className="w-5 h-5 text-white drop-shadow mb-1" />
                                    <span className="text-[9px] text-white font-medium text-center leading-tight drop-shadow">
                                      {element.name}
                                    </span>
                                  </div>
                                  
                                  {/* Delete Button */}
                                  <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => removeElement(element.id)}
                                      className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-md"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  {/* Move Controls - Horizontal */}
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                      onClick={() => moveElement(element.id, 'left')}
                                      disabled={position === 'left'}
                                      className="w-5 h-5 rounded-full bg-zinc-600 text-white flex items-center justify-center hover:bg-zinc-500 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => moveElement(element.id, 'right')}
                                      disabled={position === 'right'}
                                      className="w-5 h-5 rounded-full bg-zinc-600 text-white flex items-center justify-center hover:bg-zinc-500 shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* PA Speakers on sides */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <div className="w-6 h-14 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded border border-zinc-500 flex items-center justify-center">
                <Speaker className="w-3 h-3 text-zinc-400" />
              </div>
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-2">
              <div className="w-6 h-14 bg-gradient-to-b from-zinc-600 to-zinc-800 rounded border border-zinc-500 flex items-center justify-center">
                <Speaker className="w-3 h-3 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Stage Front Edge */}
          <div className="h-4 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 border-t border-zinc-500" />
        </div>

        {/* Audience indicator */}
        <div className="text-center mt-4">
          <Badge variant="secondary" className="text-xs">
            ⬇️ PÚBLICO / PLATEIA ⬇️
          </Badge>
        </div>
      </div>

      {/* Summary */}
      {elements.length > 0 && (
        <Card className="p-4 bg-card/50 backdrop-blur border-border/50">
          <p className="text-sm font-medium mb-2">Elementos no palco ({elements.length}):</p>
          <div className="flex flex-wrap gap-2">
            {elements.map((element) => {
              const config = getElementConfig(element.type);
              if (!config) return null;
              const Icon = config.icon;
              return (
                <Badge 
                  key={element.id} 
                  variant="outline" 
                  className="text-xs flex items-center gap-1.5 py-1"
                >
                  <div className={`w-4 h-4 rounded bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                    <Icon className="w-2.5 h-2.5 text-white" />
                  </div>
                  <span>{element.name}</span>
                  <span className="text-muted-foreground">
                    ({POSITION_LABELS[element.position]} - {ROW_LABELS[element.row]})
                  </span>
                </Badge>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

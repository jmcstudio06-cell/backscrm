import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Rect, Circle, FabricText, Group } from "fabric";
import { Button } from "@/components/ui/button";
import { 
  Mic2, 
  Guitar, 
  Music, 
  Drum, 
  Speaker, 
  Radio,
  Plus,
  Trash2,
  RotateCcw
} from "lucide-react";
import { StageElement } from "@/hooks/useStageMappings";
import { cn } from "@/lib/utils";

interface StageCanvasProps {
  elements: StageElement[];
  onChange: (elements: StageElement[]) => void;
}

const STAGE_ELEMENT_TYPES = [
  { type: "voz", label: "Voz", icon: Mic2, color: "#ef4444" },
  { type: "backing", label: "Backing Vocal", icon: Mic2, color: "#f97316" },
  { type: "guitarra", label: "Guitarra", icon: Guitar, color: "#22c55e" },
  { type: "baixo", label: "Baixo", icon: Guitar, color: "#3b82f6" },
  { type: "teclado", label: "Teclado", icon: Music, color: "#a855f7" },
  { type: "bateria", label: "Bateria", icon: Drum, color: "#eab308" },
  { type: "dj", label: "DJ / MPC", icon: Radio, color: "#ec4899" },
  { type: "retorno", label: "Retorno", icon: Speaker, color: "#6b7280" },
  { type: "pa", label: "PA", icon: Speaker, color: "#374151" },
];

export function StageCanvas({ elements, onChange }: StageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const elementsRef = useRef<StageElement[]>(elements);

  useEffect(() => {
    elementsRef.current = elements;
  }, [elements]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: "#1a1a2e",
      selection: true,
    });

    // Draw stage outline
    const stageOutline = new Rect({
      left: 50,
      top: 30,
      width: 500,
      height: 340,
      fill: "transparent",
      stroke: "#4a5568",
      strokeWidth: 2,
      selectable: false,
      evented: false,
    });
    canvas.add(stageOutline);

    // Add "PALCO" label
    const stageLabel = new FabricText("PALCO", {
      left: 275,
      top: 10,
      fontSize: 14,
      fill: "#718096",
      fontFamily: "sans-serif",
      selectable: false,
      evented: false,
      originX: "center",
    });
    canvas.add(stageLabel);

    // Add "PLATEIA" label
    const audienceLabel = new FabricText("PLATEIA", {
      left: 275,
      top: 380,
      fontSize: 14,
      fill: "#718096",
      fontFamily: "sans-serif",
      selectable: false,
      evented: false,
      originX: "center",
    });
    canvas.add(audienceLabel);

    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
    };
  }, []);

  // Load elements when canvas is ready
  useEffect(() => {
    if (!fabricCanvas) return;

    // Clear existing movable elements
    const objects = fabricCanvas.getObjects();
    objects.forEach(obj => {
      if (obj.selectable) {
        fabricCanvas.remove(obj);
      }
    });

    // Add elements from props
    elements.forEach(element => {
      addElementToCanvas(element);
    });
  }, [fabricCanvas, elements]);

  const addElementToCanvas = (element: StageElement) => {
    if (!fabricCanvas) return;

    const elementType = STAGE_ELEMENT_TYPES.find(t => t.type === element.type);
    const color = elementType?.color || "#6b7280";

    const circle = new Circle({
      radius: 25,
      fill: color,
      stroke: "#ffffff",
      strokeWidth: 2,
      originX: "center",
      originY: "center",
    });

    const text = new FabricText(element.label.substring(0, 8), {
      fontSize: 10,
      fill: "#ffffff",
      fontFamily: "sans-serif",
      originX: "center",
      originY: "center",
    });

    const group = new Group([circle, text], {
      left: element.x,
      top: element.y,
      selectable: true,
      hasControls: false,
      hasBorders: true,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
    });

    (group as any).elementId = element.id;

    group.on("moving", () => {
      const updatedElements = elementsRef.current.map(el => 
        el.id === element.id 
          ? { ...el, x: group.left || 0, y: group.top || 0 }
          : el
      );
      onChange(updatedElements);
    });

    fabricCanvas.add(group);
  };

  const handleAddElement = () => {
    if (!selectedType || !fabricCanvas) return;

    const elementType = STAGE_ELEMENT_TYPES.find(t => t.type === selectedType);
    if (!elementType) return;

    const newElement: StageElement = {
      id: crypto.randomUUID(),
      type: selectedType,
      label: elementType.label,
      x: 250,
      y: 150,
    };

    const newElements = [...elements, newElement];
    onChange(newElements);
    setSelectedType(null);
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (!activeObject) return;

    const elementId = (activeObject as any).elementId;
    if (elementId) {
      const newElements = elements.filter(el => el.id !== elementId);
      onChange(newElements);
      fabricCanvas.remove(activeObject);
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {STAGE_ELEMENT_TYPES.map(type => (
          <Button
            key={type.type}
            variant={selectedType === type.type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(selectedType === type.type ? null : type.type)}
            className={cn(
              "text-xs",
              selectedType === type.type && "ring-2 ring-primary"
            )}
            style={{ 
              backgroundColor: selectedType === type.type ? type.color : undefined,
              borderColor: type.color 
            }}
          >
            <type.icon className="w-3 h-3 mr-1" />
            {type.label}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={handleAddElement} 
          disabled={!selectedType}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={handleDeleteSelected}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Remover Selecionado
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleClear}
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Limpar Tudo
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-card">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>

      <p className="text-xs text-muted-foreground">
        Arraste os elementos para posicioná-los no palco. Clique em um elemento para selecioná-lo.
      </p>
    </div>
  );
}

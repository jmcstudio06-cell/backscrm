import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn, ZoomOut, RotateCw, Check, X } from "lucide-react";

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropModalProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspect?: number; // padrão 1 (quadrado)
}

/** Gera o canvas com a área recortada e devolve um Blob */
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob | null> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);
  ctx.drawImage(
    image,
    safeArea / 2 - image.width / 2,
    safeArea / 2 - image.height / 2
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width / 2 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height / 2 - pixelCrop.y)
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
}

export function ImageCropModal({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  aspect = 1,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [applying, setApplying] = useState(false);

  const onCropChange = useCallback((c: { x: number; y: number }) => {
    setCrop(c);
  }, []);

  const onZoomChange = useCallback((z: number) => {
    setZoom(z);
  }, []);

  const onCropAreaChange = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setApplying(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels, rotation);
      if (blob) {
        onCropComplete(blob);
        onClose();
      }
    } finally {
      setApplying(false);
    }
  };

  const handleClose = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b">
          <DialogTitle className="text-base">Ajustar foto de perfil</DialogTitle>
        </DialogHeader>

        {/* Área do cropper */}
        <div className="relative w-full bg-black" style={{ height: 320 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape="round"
            showGrid={false}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
            style={{
              containerStyle: { background: "#000" },
            }}
          />
        </div>

        {/* Controles */}
        <div className="px-4 py-4 space-y-4 bg-background">
          {/* Zoom */}
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              min={1}
              max={3}
              step={0.05}
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>

          {/* Rotação */}
          <div className="flex items-center gap-3">
            <RotateCw className="w-4 h-4 text-muted-foreground shrink-0" />
            <Slider
              min={-180}
              max={180}
              step={1}
              value={[rotation]}
              onValueChange={([v]) => setRotation(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10 text-right shrink-0">
              {rotation}°
            </span>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleClose}
              disabled={applying}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button
              variant="gradient"
              className="flex-1 gap-2"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Usar esta foto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

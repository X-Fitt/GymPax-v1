import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  Move,
  Maximize2,
  Sparkles,
  Info
} from 'lucide-react';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  athleteName?: string;
  onClose: () => void;
  onConfirmCrop: (croppedDataUrl: string) => void;
}

export const AvatarCropModal: React.FC<AvatarCropModalProps> = ({
  isOpen,
  imageSrc,
  athleteName = 'Athlete',
  onClose,
  onConfirmCrop
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const CIRCLE_SIZE = 240; // Diameter in pixels of circular reference viewport

  // Load image
  useEffect(() => {
    if (!isOpen || !imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
      // Auto-fit: calculate initial scale so smaller dimension fits circle
      const scaleToFit = Math.max(CIRCLE_SIZE / img.width, CIRCLE_SIZE / img.height);
      setZoom(Math.max(1, Math.min(2.5, scaleToFit * 1.1)));
      setPan({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [isOpen, imageSrc]);

  // Update live preview thumbnail whenever zoom, pan or image changes
  const generatePreview = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement('canvas');
    const OUTPUT_SIZE = 360; // 360x360 sharp square output
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    // Scale ratio between viewport circle and output
    const ratio = OUTPUT_SIZE / CIRCLE_SIZE;

    ctx.save();
    // Center of canvas
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    // Pan offset scaled
    ctx.translate(pan.x * ratio, pan.y * ratio);
    // Zoom scaled
    ctx.scale(zoom * ratio, zoom * ratio);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();

    setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.9));
  }, [pan, zoom]);

  useEffect(() => {
    if (imageLoaded) {
      generatePreview();
    }
  }, [imageLoaded, generatePreview]);

  if (!isOpen) return null;

  // Pointer drag events for smooth pan
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPan({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => Math.min(3.5, Math.max(0.5, prev + delta)));
  };

  const handleReset = () => {
    const img = imageRef.current;
    if (img) {
      const scaleToFit = Math.max(CIRCLE_SIZE / img.width, CIRCLE_SIZE / img.height);
      setZoom(Math.max(1, scaleToFit * 1.1));
    } else {
      setZoom(1);
    }
    setPan({ x: 0, y: 0 });
  };

  const handleConfirm = () => {
    const img = imageRef.current;
    if (!img) return;

    // Render crisp 400x400 circular crop output
    const canvas = document.createElement('canvas');
    const OUTPUT_SIZE = 400;
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    const ratio = OUTPUT_SIZE / CIRCLE_SIZE;

    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    ctx.translate(pan.x * ratio, pan.y * ratio);
    ctx.scale(zoom * ratio, zoom * ratio);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();

    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onConfirmCrop(croppedDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Move className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Resize & Fit Avatar</span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700">
                  Circle Reference
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Drag to center your face · Use slider or zoom buttons to fit the circular guide
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-850 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Viewport */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4">
          {/* Main Interactive Circle Cropper */}
          <div className="relative mx-auto w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center select-none shadow-inner">
            {/* Draggable/Pannable Image Container */}
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onWheel={handleWheel}
              className={`absolute inset-0 flex items-center justify-center cursor-grab ${
                isDragging ? 'cursor-grabbing' : ''
              }`}
              style={{ touchAction: 'none' }}
            >
              {imageSrc && (
                <img
                  src={imageSrc}
                  alt="Avatar being cropped"
                  draggable={false}
                  className="max-w-none pointer-events-none transition-transform duration-75 ease-out"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center'
                  }}
                />
              )}
            </div>

            {/* Circular Aperture Mask Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Darkened area outside the circle */}
              <div
                className="absolute inset-0 bg-black/65"
                style={{
                  maskImage: `radial-gradient(circle ${CIRCLE_SIZE / 2}px at center, transparent ${CIRCLE_SIZE / 2 - 1}px, black ${CIRCLE_SIZE / 2}px)`,
                  WebkitMaskImage: `radial-gradient(circle ${CIRCLE_SIZE / 2}px at center, transparent ${CIRCLE_SIZE / 2 - 1}px, black ${CIRCLE_SIZE / 2}px)`
                }}
              />

              {/* The Circle Reference Ring itself */}
              <div
                className="relative rounded-full border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] flex items-center justify-center"
                style={{ width: `${CIRCLE_SIZE}px`, height: `${CIRCLE_SIZE}px` }}
              >
                {/* Subtle alignment cross lines */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-amber-400/25 pointer-events-none" />
                <div className="absolute left-0 right-0 top-1/2 h-px bg-amber-400/25 pointer-events-none" />

                {/* Corner guide badges */}
                <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-zinc-950/90 text-amber-400 border border-amber-400/40 text-[9px] font-mono font-bold uppercase tracking-wider">
                  Circle Reference
                </span>
              </div>
            </div>

            {/* Drag helper tooltip */}
            <div className="absolute bottom-2.5 px-3 py-1 rounded-full bg-zinc-950/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono pointer-events-none border border-zinc-800">
              Drag image to center · Scroll or pinch to zoom
            </div>
          </div>

          {/* Controls: Zoom slider & +/- buttons & reset */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5 font-bold">
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Zoom Scale</span>
              </span>
              <span className="text-amber-400 font-bold tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.15))}
                className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800 shrink-0"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="0.5"
                max="3.5"
                step="0.05"
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />

              <button
                type="button"
                onClick={() => setZoom(prev => Math.min(3.5, prev + 0.15))}
                className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer border border-zinc-800 shrink-0"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-mono transition-colors cursor-pointer border border-zinc-800 shrink-0 flex items-center gap-1"
                title="Reset Position and Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Live Profile Appearance Preview */}
          <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-850 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {previewDataUrl ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 shadow-lg shrink-0">
                  <img
                    src={previewDataUrl}
                    alt="Live circular crop preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-zinc-800 animate-pulse shrink-0" />
              )}

              <div>
                <span className="text-[10px] font-mono uppercase text-zinc-500 block">
                  Live Thumbnail Preview
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-100">{athleteName}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    Next to your name
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-mono text-zinc-500 hidden sm:inline">
              Displayed on all screens
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold font-mono uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Apply Circular Crop & Save</span>
          </button>
        </div>
      </div>
    </div>
  );
};

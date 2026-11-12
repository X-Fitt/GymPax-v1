import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  RotateCcw,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Upload,
  Check
} from 'lucide-react';

interface CameraSelfieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
  onFallbackToFile: () => void;
}

export const CameraSelfieModal: React.FC<CameraSelfieModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onFallbackToFile
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [permissionStatus, setPermissionStatus] = useState<'requesting' | 'granted' | 'denied'>('requesting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize camera when opened
  useEffect(() => {
    if (!isOpen) return;

    let activeStream: MediaStream | null = null;
    let isCancelled = false;

    const startCamera = async () => {
      setPermissionStatus('requesting');
      setErrorMessage(null);

      // Check for mediaDevices support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setPermissionStatus('denied');
        setErrorMessage('Camera access is not supported in this browser environment. You can upload a selfie from your photo library instead.');
        return;
      }

      try {
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            facingMode,
            width: { ideal: 1080 },
            height: { ideal: 1080 }
          }
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);
        setPermissionStatus('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }
      } catch (err: unknown) {
        if (isCancelled) return;
        setPermissionStatus('denied');
        const error = err as { name?: string; message?: string };
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setErrorMessage('Camera permission was denied. Please allow camera access in your browser site permissions to snap a selfie, or select a photo from your device.');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setErrorMessage('No camera device detected on this system. You can choose a photo from your device library instead.');
        } else {
          setErrorMessage('Could not initialize camera. Please grant permission or choose a selfie from your photos.');
        }
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  if (!isOpen) return null;

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 720;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // If using user-facing camera, mirror the frame horizontally so it looks natural like a mirror
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Stop tracks
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    onCapture(dataUrl);
  };

  const toggleCameraFacing = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-850 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Take Profile Selfie</h3>
              <p className="text-[11px] text-zinc-400">Device camera permission requested</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder area */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {permissionStatus === 'requesting' && (
            <div className="text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-semibold text-zinc-200">Requesting Camera Permission...</p>
              <p className="text-[11px] text-zinc-400 max-w-xs">
                Please allow camera access in your browser prompt to snap your athlete selfie.
              </p>
            </div>
          )}

          {permissionStatus === 'denied' && (
            <div className="text-center p-6 space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-zinc-100">Camera Access Not Granted</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {errorMessage || 'Camera access was declined. You can enable it in your browser settings or select a selfie from your photo library.'}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onFallbackToFile();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase font-mono tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Choose Photo From Library</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'))}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Retry Camera Permission
                </button>
              </div>
            </div>
          )}

          {permissionStatus === 'granted' && (
            <>
              {/* Live Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Flash effect overlay */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white pointer-events-none animate-in fade-in duration-75" />
              )}

              {/* Circular Reference Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Dark Vignette outside circle */}
                <div className="absolute inset-0 bg-black/45" style={{
                  clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, calc(50% - 110px) 50%, calc(50% + 110px) 50%)',
                  maskImage: 'radial-gradient(circle at center, transparent 110px, black 111px)',
                  WebkitMaskImage: 'radial-gradient(circle at center, transparent 110px, black 111px)'
                }} />

                {/* Circle boundary ring */}
                <div className="relative w-56 h-56 rounded-full border-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] flex items-center justify-center animate-pulse">
                  {/* Subtle crosshairs */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-amber-400/20" />
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-amber-400/20" />
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="px-3 py-1 rounded-full bg-zinc-950/85 backdrop-blur-md text-[11px] font-mono font-medium text-amber-300 border border-amber-400/30">
                    Center face inside the circle reference
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Hidden offscreen canvas for snapshot */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Shutter controls */}
        {permissionStatus === 'granted' && (
          <div className="p-4 sm:p-5 border-t border-zinc-850 bg-zinc-900/60 flex items-center justify-between">
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="p-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              title="Flip camera"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Flip</span>
            </button>

            {/* Shutter button */}
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="group relative w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 p-1 flex items-center justify-center shadow-lg shadow-amber-400/20 transition-transform active:scale-95 cursor-pointer"
              title="Take Selfie"
            >
              <div className="w-13 h-13 rounded-full border-2 border-zinc-950 flex items-center justify-center bg-amber-400 group-hover:bg-amber-300 transition-colors">
                <Camera className="w-6 h-6 text-zinc-950 stroke-[2.5]" />
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                if (stream) stream.getTracks().forEach(t => t.stop());
                onClose();
                onFallbackToFile();
              }}
              className="p-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
              title="Upload file instead"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

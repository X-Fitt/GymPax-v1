import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Sparkles, AlertCircle, Upload, SwitchCamera } from 'lucide-react';

interface WorkoutSelfieCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureSelfie: (imageDataUrl: string) => void;
  onSwitchToDeviceUpload: () => void;
}

export const WorkoutSelfieCameraModal: React.FC<WorkoutSelfieCameraModalProps> = ({
  isOpen,
  onClose,
  onCaptureSelfie,
  onSwitchToDeviceUpload
}) => {
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check available camera devices
  useEffect(() => {
    if (!isOpen) return;
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {
        // ignore device enum error
      });
    }
  }, [isOpen]);

  // Start video stream when modal opens or camera direction flips
  useEffect(() => {
    if (!isOpen || capturedPhoto) return;

    let activeStream: MediaStream | null = null;
    let isCancelled = false;
    setCameraError(null);

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera is not supported on this device/browser.');
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: facingMode,
            width: { ideal: 1280 },
            height: { ideal: 960 }
          },
          audio: false
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        activeStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {
            // Autoplay may be restricted in some browsers
          });
        }
      } catch (err: any) {
        if (isCancelled) return;
        console.warn('[SelfieCamera] Camera error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraError('Camera permission was denied. Please allow camera access in your browser settings, or upload a photo from your device.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No camera found on this device. You can upload a photo from your device instead.');
        } else {
          setCameraError('Unable to start camera. You can upload a photo from your device instead.');
        }
      }
    }

    initCamera();

    return () => {
      isCancelled = true;
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isOpen, facingMode, capturedPhoto]);

  // Clean up stream on unmount or close
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  const handleStopStream = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
  };

  const handleClose = () => {
    handleStopStream();
    setCapturedPhoto(null);
    setCountdown(null);
    onClose();
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If using user (front) camera, mirror the snapshot horizontally for natural selfie orientation
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Visual camera shutter flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhoto(dataUrl);
    handleStopStream();
  };

  const handleStartCaptureWithCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            setCountdown(null);
            takeSnapshot();
          }, 300);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setCountdown(null);
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onCaptureSelfie(capturedPhoto);
      handleClose();
    }
  };

  const handleToggleCamera = () => {
    handleStopStream();
    setFacingMode(prev => (prev === 'user' ? 'environment' : 'user'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100 max-h-[92vh]">
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>Post-Workout Selfie</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold">
                  Live Camera
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Capture your pump immediately after the session</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative bg-black flex-1 flex items-center justify-center min-h-[340px] sm:min-h-[420px] overflow-hidden">
          {/* Shutter Flash Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white z-30 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {/* Camera Error State */}
          {cameraError ? (
            <div className="p-6 text-center space-y-4 max-w-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm font-bold text-zinc-200">Camera Unavailable</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{cameraError}</p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClose();
                    onSwitchToDeviceUpload();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload From Device Instead</span>
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : capturedPhoto ? (
            /* Review Captured Photo */
            <div className="relative w-full h-full flex items-center justify-center bg-zinc-950">
              <img
                src={capturedPhoto}
                alt="Captured selfie"
                className="max-h-[60vh] w-auto max-w-full object-contain rounded-xl"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-zinc-700/80 text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Selfie Captured</span>
              </div>
            </div>
          ) : (
            /* Live Camera Stream */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Athletic Viewfinder Grid & Framing Guide */}
              <div className="absolute inset-4 border border-white/20 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                <div className="flex justify-between text-[9px] font-mono text-white/50 uppercase tracking-widest">
                  <span>GYMPAX·CAM</span>
                  <span>{facingMode === 'user' ? 'FRONT SENSOR' : 'REAR SENSOR'}</span>
                </div>
                <div className="self-center text-center">
                  {countdown !== null ? (
                    <div className="w-20 h-20 rounded-full bg-amber-400 text-zinc-950 text-4xl font-black font-mono flex items-center justify-center shadow-2xl animate-ping duration-1000">
                      {countdown}
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-white/60 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                      Frame your pump & flex
                    </span>
                  )}
                </div>
                <div className="flex justify-between text-[9px] font-mono text-white/50">
                  <span>1080P HD</span>
                  <span>RAW PUMP</span>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Canvas used for capturing frame */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Bottom Control Bar */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 shrink-0">
          {capturedPhoto ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRetake}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Use This Selfie</span>
              </button>
            </div>
          ) : !cameraError ? (
            <div className="flex items-center justify-between gap-3">
              {/* Flip camera button */}
              <button
                type="button"
                onClick={handleToggleCamera}
                title="Switch front / rear camera"
                className="p-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              {/* Shutter Snap Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={takeSnapshot}
                  title="Take Instant Photo"
                  className="w-16 h-16 rounded-full border-4 border-amber-400/80 bg-zinc-900 hover:bg-amber-400 text-amber-400 hover:text-zinc-950 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90"
                >
                  <div className="w-11 h-11 rounded-full bg-amber-400" />
                </button>
              </div>

              {/* 3-Second Timer Shutter */}
              <button
                type="button"
                onClick={handleStartCaptureWithCountdown}
                disabled={countdown !== null}
                className="px-3.5 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-400 text-xs font-mono font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="3-Second Timer Shutter"
              >
                <span>3s Timer</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

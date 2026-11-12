import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  AlertTriangle,
  Smartphone,
  Laptop,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  Globe
} from 'lucide-react';
import { reverseGeocodeCoordinates } from '../../utils/geoDistance';

export interface DetectedLocationResult {
  cityOrTown: string;
  stateOrProvince: string;
  country: string;
  zipOrPostalCode: string;
  formatted: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

interface DeviceLocationGuideModalProps {
  onLocationDetected: (result: DetectedLocationResult) => void;
  onClose: () => void;
}

export const DeviceLocationGuideModal: React.FC<DeviceLocationGuideModalProps> = ({
  onLocationDetected,
  onClose
}) => {
  const [status, setStatus] = useState<'prompt' | 'requesting' | 'success' | 'denied'>('prompt');
  const [deviceGuideTab, setDeviceGuideTab] = useState<'ios' | 'android' | 'desktop'>('ios');
  const [detectedData, setDetectedData] = useState<DetectedLocationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRequestLocation = () => {
    setStatus('requesting');
    setErrorMessage(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('denied');
      setErrorMessage('Geolocation tracker is not supported by your browser or environment.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const accuracy = Math.round(position.coords.accuracy || 15);

        try {
          const rev = await reverseGeocodeCoordinates(lat, lon);
          const result: DetectedLocationResult = {
            cityOrTown: rev.cityOrTown,
            stateOrProvince: rev.stateOrProvince,
            country: rev.country,
            zipOrPostalCode: rev.zipOrPostalCode,
            formatted: rev.formatted,
            latitude: lat,
            longitude: lon,
            accuracyMeters: accuracy
          };
          setDetectedData(result);
          setStatus('success');
        } catch {
          // Fallback with raw coordinates
          const fallback: DetectedLocationResult = {
            cityOrTown: 'Local Area',
            stateOrProvince: '',
            country: 'Worldwide',
            zipOrPostalCode: '',
            formatted: `GPS Location (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`,
            latitude: lat,
            longitude: lon,
            accuracyMeters: accuracy
          };
          setDetectedData(fallback);
          setStatus('success');
        }
      },
      error => {
        setStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setErrorMessage('Location permission was denied or blocked in your device settings.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setErrorMessage('GPS/location satellite signal is currently unavailable on your device.');
        } else {
          setErrorMessage('Location request timed out. Please check your phone location tracker.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleConfirmDetected = () => {
    if (detectedData) {
      onLocationDetected(detectedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-zinc-100 relative my-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-100">
                Phone & Device Location Tracker
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Worldwide gym discovery and nearby athlete matching.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 1: Permission Prompt */}
        {status === 'prompt' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-850 space-y-3">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="font-bold text-xs text-zinc-200">
                    Why does GymPax ask for your location?
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    We use your device location to find training facilities near you, calculate accurate travel radius, and match you with gym buddies worldwide in the Community section.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-zinc-900">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-zinc-200">
                    Privacy Protected
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Your exact street address or coordinates are never published to other lifters. Only your town/city and approximate distance radius are shown to verified gym friends.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Enter Manually Instead
              </button>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-4 h-4 fill-current" />
                <span>Allow & Detect Location</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 2: Detecting / Requesting */}
        {status === 'requesting' && (
          <div className="py-8 text-center space-y-3">
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-30"></span>
              <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <Navigation className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <h3 className="font-bold text-sm text-zinc-100">
              Acquiring Device Location Tracker Fix...
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Please tap <strong>&ldquo;Allow&rdquo;</strong> if your browser asks for location permission.
            </p>
          </div>
        )}

        {/* Phase 3: Success Result */}
        {status === 'success' && detectedData && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-zinc-950 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Location Tracker Acquired Successfully!</span>
              </div>

              {/* Exact Sequence Display */}
              <div className="space-y-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 font-sans uppercase font-bold block">
                    Exact Address Sequence Formatted:
                  </span>
                  <p className="font-bold text-amber-300 text-sm">
                    {detectedData.formatted}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block">1. City or Town:</span>
                    <span className="text-zinc-200 font-bold">{detectedData.cityOrTown || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block">2. State / Province:</span>
                    <span className="text-zinc-200 font-bold">{detectedData.stateOrProvince || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block">3. Country:</span>
                    <span className="text-zinc-200 font-bold">{detectedData.country || 'N/A'}</span>
                  </div>
                  <div className="p-2 bg-zinc-900/60 rounded-lg border border-zinc-850">
                    <span className="text-zinc-500 block">4. Zip / Postal Code:</span>
                    <span className="text-zinc-200 font-bold">{detectedData.zipOrPostalCode || 'N/A'}</span>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 flex items-center justify-between px-1">
                  <span>GPS: {detectedData.latitude.toFixed(4)}°, {detectedData.longitude.toFixed(4)}°</span>
                  <span>Accuracy: ±{detectedData.accuracyMeters}m</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestLocation}
                className="py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmDetected}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply & Discover Nearby</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase 4: Denied or Off - Step-by-Step Device Guidance */}
        {status === 'denied' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Device Location Tracker is Switched Off or Blocked</strong>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  {errorMessage || 'To use automatic distance radius and gym matching, please enable location services in your phone or browser settings.'}
                </p>
              </div>
            </div>

            {/* Device-Specific Guide Tabs */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Step-by-Step Guide to Switch On Location Tracker:
              </span>

              <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-xl border border-zinc-850 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeviceGuideTab('ios')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    deviceGuideTab === 'ios' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone / iOS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceGuideTab('android')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    deviceGuideTab === 'android' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceGuideTab('desktop')}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    deviceGuideTab === 'desktop' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Desktop / Laptop</span>
                </button>
              </div>

              {/* Instructions per device */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                {deviceGuideTab === 'ios' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                    <li>Open your iPhone <strong>Settings</strong> app.</li>
                    <li>Tap <strong>Privacy & Security</strong> &gt; <strong>Location Services</strong>.</li>
                    <li>Ensure <strong>Location Services</strong> toggle is turned <strong>ON</strong>.</li>
                    <li>Scroll down and tap <strong>Safari</strong> (or <strong>Chrome</strong>).</li>
                    <li>Select <strong>&ldquo;While Using the App&rdquo;</strong> and toggle <strong>&ldquo;Precise Location&rdquo; ON</strong>.</li>
                    <li>Return here and tap <strong>&ldquo;Retry Location Tracker&rdquo;</strong> below.</li>
                  </ol>
                )}

                {deviceGuideTab === 'android' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                    <li>Open your Android phone <strong>Settings</strong>.</li>
                    <li>Tap <strong>Location</strong> and switch it <strong>ON</strong>.</li>
                    <li>Tap <strong>App permissions</strong> &gt; <strong>Chrome</strong> (or your browser).</li>
                    <li>Select <strong>&ldquo;Allow only while using the app&rdquo;</strong>.</li>
                    <li>Ensure <strong>&ldquo;Use precise location&rdquo;</strong> is enabled.</li>
                    <li>Return here and tap <strong>&ldquo;Retry Location Tracker&rdquo;</strong> below.</li>
                  </ol>
                )}

                {deviceGuideTab === 'desktop' && (
                  <ol className="list-decimal list-inside space-y-1.5 text-zinc-300">
                    <li>Look at the left side of your browser URL address bar.</li>
                    <li>Click the <strong>lock / site settings icon 🔒</strong>.</li>
                    <li>Find <strong>Location</strong> and change it from <em>Block</em> to <strong>Allow</strong>.</li>
                    <li>Refresh the page or tap <strong>&ldquo;Retry Location Tracker&rdquo;</strong> below.</li>
                  </ol>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
              >
                Enter Address Manually
              </button>
              <button
                type="button"
                onClick={handleRequestLocation}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold uppercase tracking-wider transition-all transform active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Location Tracker</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

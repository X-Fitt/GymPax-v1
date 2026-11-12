import React, { useState } from 'react';
import { X, Wifi, WifiOff, RefreshCw, CheckCircle2, Database, Shield } from 'lucide-react';
import { SyncStatus } from '../../types';
import { flushSyncQueue, getSyncQueue } from '../../utils/storage';

interface SyncStatusModalProps {
  syncStatus: SyncStatus;
  onClose: () => void;
  onSyncComplete: (timestamp: number) => void;
}

export const SyncStatusModal: React.FC<SyncStatusModalProps> = ({
  syncStatus,
  onClose,
  onSyncComplete
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const pendingItems = getSyncQueue();

  const handleSyncNow = async () => {
    if (!syncStatus.isOnline) {
      setSyncFeedback('Cannot sync while offline. Connect to WiFi or cellular data.');
      return;
    }

    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await flushSyncQueue();
      setIsSyncing(false);
      setSyncFeedback(`Successfully synchronized ${result.syncedCount} queued updates.`);
      onSyncComplete(result.timestamp);
    } catch {
      setIsSyncing(false);
      setSyncFeedback('Sync encountered a temporary network delay. Will retry automatically.');
    }
  };

  const minutesAgo = Math.max(0, Math.floor((Date.now() - syncStatus.lastSyncedAt) / 60000));
  const timeText = minutesAgo === 0 ? 'Just now' : `${minutesAgo} mins ago`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-zinc-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold tracking-tight">Offline Sync & Storage Engine</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Network & Sync State Banner */}
        <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncStatus.isOnline ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Wifi className="w-4 h-4" />
                  <span>Online & Ready</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <WifiOff className="w-4 h-4" />
                  <span>Offline Mode Active</span>
                </div>
              )}
            </div>

            <span className="text-xs text-zinc-500 font-mono">
              Last Synced: <strong className="text-zinc-300 font-normal">{timeText}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-850">
            <span className="text-zinc-400">Queued Offline Changes:</span>
            <span className="font-mono font-bold text-amber-400">
              {pendingItems.length} items
            </span>
          </div>
        </div>

        {/* Offline Architecture explanation */}
        <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60 text-xs text-zinc-400 space-y-2">
          <div className="flex items-center gap-1.5 text-zinc-200 font-semibold">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Zero-Loss Gym Logging Guarantee</span>
          </div>
          <p className="leading-relaxed">
            All sets, reps, body measurements, and PRs are saved instantly to local high-speed persistent storage. When you enter basements or low-reception gym floors, the app operates 100% offline and automatically syncs when signal returns.
          </p>
        </div>

        {/* Feedback Alert */}
        {syncFeedback && (
          <div className="p-3 rounded-xl bg-zinc-800/80 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing Data...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

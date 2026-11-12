import React from 'react';
import { X, Check, Image as ImageIcon, Trash2, Calendar, Sparkles, Plus } from 'lucide-react';
import { UserCommunityPhoto } from '../../types';

interface SavedAppPhotosPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPhotos: UserCommunityPhoto[];
  onSelectPhoto: (photo: UserCommunityPhoto) => void;
  onDeletePhoto?: (photoId: string) => void;
  onOpenSelfie?: () => void;
  onOpenDeviceUpload?: () => void;
}

export const SavedAppPhotosPickerModal: React.FC<SavedAppPhotosPickerModalProps> = ({
  isOpen,
  onClose,
  savedPhotos,
  onSelectPhoto,
  onDeletePhoto,
  onOpenSelfie,
  onOpenDeviceUpload
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-zinc-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                <span>Saved App Photos</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold">
                  {savedPhotos.length} Available
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Select an existing photo from your in-app physique vault to attach to this workout
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {savedPhotos.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-zinc-950 border border-dashed border-zinc-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/20">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-200">No Saved Photos in Vault</h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                  You haven&apos;t saved any workout or physique photos to the app yet. Take a selfie or upload from your device to save your first one!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                {onOpenSelfie && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenSelfie();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md inline-flex items-center gap-1.5"
                  >
                    <span>Take a Selfie</span>
                  </button>
                )}
                {onOpenDeviceUpload && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDeviceUpload();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>Upload from Device</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-zinc-400 font-mono">
                Tap any photo below to attach it to this workout session:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {savedPhotos.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onSelectPhoto(p);
                      onClose();
                    }}
                    className="group relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 hover:border-amber-400/80 p-2 flex flex-col justify-between cursor-pointer transition-all hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {/* Photo thumbnail */}
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800/80">
                      <img
                        src={p.url}
                        alt={p.caption || 'Saved physique photo'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                      {/* Tag pill */}
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[8.5px] font-mono font-black uppercase tracking-wider ${
                        p.tag === 'after'
                          ? 'bg-amber-400 text-zinc-950'
                          : p.tag === 'before'
                          ? 'bg-sky-400 text-zinc-950'
                          : 'bg-zinc-700 text-zinc-200'
                      }`}>
                        {p.tag}
                      </span>

                      {/* Select check overlay indicator on hover */}
                      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md transform translate-y-1 group-hover:translate-y-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="mt-2 space-y-1 text-left px-0.5">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span className="truncate">{p.dateLabel || 'Check-in'}</span>
                        {p.weightKg && <span>{p.weightKg} kg</span>}
                      </div>
                      {p.caption && (
                        <p className="text-[11px] text-zinc-300 line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {p.caption}
                        </p>
                      )}
                    </div>

                    {/* Optional delete button to manage vault */}
                    {onDeletePhoto && (
                      <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between">
                        <span className="text-[10px] text-amber-400 font-semibold group-hover:underline">
                          Select Photo
                        </span>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onDeletePhoto(p.id);
                          }}
                          className="p-1 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                          title="Delete from saved photos"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenSelfie && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSelfie();
                }}
                className="py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Take New Selfie
              </button>
            )}
            {onOpenDeviceUpload && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeviceUpload();
                }}
                className="py-2 px-3 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Upload from Device
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

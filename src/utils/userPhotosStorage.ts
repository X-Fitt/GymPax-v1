import { UserCommunityPhoto, PhotoTagType, PhotoVisibility } from '../types';
import { getSeedPhotosForUser } from '../data/userPhysiquePhotos';

export const STORAGE_KEY_COMMUNITY_PHOTOS = 'soma_user_community_photos_v3';
export const MAX_FREE_PHOTOS = 10;
export const MAX_PRO_PHOTOS = 50;
export const MAX_COMMUNITY_PHOTOS = 10; // default for non-subscribers

export function getUserPhotoLimit(isPro?: boolean): number {
  return isPro ? MAX_PRO_PHOTOS : MAX_FREE_PHOTOS;
}

// Curated initial realistic athlete photos so the community feature is immediately populated
const SEED_PHOTOS: UserCommunityPhoto[] = getSeedPhotosForUser();

export function getUserPhotos(isPro?: boolean): UserCommunityPhoto[] {
  if (typeof window === 'undefined') return SEED_PHOTOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMUNITY_PHOTOS);
    if (!raw) {
      // Seed initially and save
      localStorage.setItem(STORAGE_KEY_COMMUNITY_PHOTOS, JSON.stringify(SEED_PHOTOS));
      return SEED_PHOTOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const limit = getUserPhotoLimit(isPro);
      const seedMap = new Map(SEED_PHOTOS.map(s => [s.id, s]));
      return parsed.slice(0, limit).map((p: any) => {
        const seedMatch = seedMap.get(p.id);
        return {
          ...p,
          url: seedMatch ? seedMatch.url : p.url,
          visibility: p.visibility === 'private' ? 'private' : 'community'
        };
      });
    }
  } catch (err) {
    console.error('Error reading community photos:', err);
  }
  return SEED_PHOTOS;
}

export function saveUserPhotos(photos: UserCommunityPhoto[], isPro?: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    const limit = getUserPhotoLimit(isPro);
    const clamped = photos.slice(0, limit);
    localStorage.setItem(STORAGE_KEY_COMMUNITY_PHOTOS, JSON.stringify(clamped));
  } catch (err) {
    console.error('Error saving community photos:', err);
  }
}

export function addUserPhoto(data: {
  url: string;
  tag: PhotoTagType;
  caption?: string;
  weightKg?: number;
  dateLabel?: string;
  visibility?: PhotoVisibility;
  shareToFeed?: boolean;
  isPro?: boolean;
}): { success: boolean; error?: string; photo?: UserCommunityPhoto; photos: UserCommunityPhoto[] } {
  const limit = getUserPhotoLimit(data.isPro);
  const current = getUserPhotos(data.isPro);

  if (current.length >= limit) {
    return {
      success: false,
      error: data.isPro
        ? `Pro limit reached (${limit}/${limit} photos). Pro accounts are limited to ${limit} photos maximum. Please delete an older photo first.`
        : `Limit reached (${limit}/${limit} photos). Non-subscribers can upload only ${limit} photos. Upgrade to Pro for up to ${MAX_PRO_PHOTOS} photos, or delete an older photo.`,
      photos: current
    };
  }

  // If new photo is 'before' or 'after', update existing ones so there is a clear primary pair
  const updatedCurrent = current.map(p => {
    if (data.tag === 'before' && p.tag === 'before') {
      return { ...p, tag: 'physique' as PhotoTagType };
    }
    if (data.tag === 'after' && p.tag === 'after') {
      return { ...p, tag: 'physique' as PhotoTagType };
    }
    return p;
  });

  const newPhoto: UserCommunityPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    url: data.url,
    uploadedAt: Date.now(),
    tag: data.tag,
    caption: data.caption?.trim(),
    weightKg: data.weightKg,
    dateLabel: data.dateLabel?.trim() || (data.tag === 'before' ? 'Before' : data.tag === 'after' ? 'After' : 'Physique'),
    visibility: data.visibility || 'community',
    shareToFeed: data.shareToFeed || false
  };

  const nextList = [newPhoto, ...updatedCurrent].slice(0, limit);
  saveUserPhotos(nextList, data.isPro);

  return {
    success: true,
    photo: newPhoto,
    photos: nextList
  };
}

export function deleteUserPhoto(photoId: string, isPro?: boolean): UserCommunityPhoto[] {
  const current = getUserPhotos(isPro);
  const nextList = current.filter(p => p.id !== photoId);
  saveUserPhotos(nextList, isPro);
  return nextList;
}

export function updatePhotoTag(photoId: string, newTag: PhotoTagType, isPro?: boolean): UserCommunityPhoto[] {
  const current = getUserPhotos(isPro);
  const nextList = current.map(p => {
    if (p.id === photoId) {
      return { ...p, tag: newTag };
    }
    // If setting before/after, switch any other photo with same tag to 'physique'
    if (newTag === 'before' && p.tag === 'before') {
      return { ...p, tag: 'physique' as PhotoTagType };
    }
    if (newTag === 'after' && p.tag === 'after') {
      return { ...p, tag: 'physique' as PhotoTagType };
    }
    return p;
  });
  saveUserPhotos(nextList, isPro);
  return nextList;
}

export function updatePhotoVisibility(photoId: string, visibility: PhotoVisibility, isPro?: boolean): UserCommunityPhoto[] {
  const current = getUserPhotos(isPro);
  const nextList = current.map(p => {
    if (p.id === photoId) {
      return { ...p, visibility };
    }
    return p;
  });
  saveUserPhotos(nextList, isPro);
  return nextList;
}

export function togglePhotoVisibility(photoId: string, isPro?: boolean): UserCommunityPhoto[] {
  const current = getUserPhotos(isPro);
  const target = current.find(p => p.id === photoId);
  if (!target) return current;
  const nextVisibility: PhotoVisibility = target.visibility === 'private' ? 'community' : 'private';
  return updatePhotoVisibility(photoId, nextVisibility, isPro);
}

/**
 * Compresses an image file client-side to ensure it fits comfortably in localStorage
 */
export async function compressImageFile(file: File, maxDim = 960, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image element'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original data URL if context isn't available
          resolve(reader.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * AI Image Moderation & Safety Utility for GymPax
 * Inspects user uploaded images using Gemini multimodal AI to detect
 * inappropriate, sexually explicit, violent, hateful, or prohibited content.
 */

export type ModerationFlagCategory = 
  | 'none' 
  | 'nudity' 
  | 'violence' 
  | 'hate' 
  | 'illegal' 
  | 'harassment' 
  | 'spam' 
  | 'general';

export interface ImageModerationResult {
  isAllowed: boolean;
  flaggedAsNotAllowed: boolean;
  flagCategory: ModerationFlagCategory;
  reason: string;
  checkedByAi: boolean;
}

/**
 * Checks an image data URL or base64 string against the AI image moderation engine.
 * Returns whether the image is allowed or flagged as not allowed with reasons.
 */
export async function checkImageSafetyWithAi(
  imageDataUrlOrBase64: string,
  options?: { timeoutMs?: number; requireGymContext?: boolean }
): Promise<ImageModerationResult> {
  const timeoutMs = options?.timeoutMs || 18000;

  if (!imageDataUrlOrBase64) {
    return {
      isAllowed: false,
      flaggedAsNotAllowed: true,
      flagCategory: 'general',
      reason: 'No image data was provided.',
      checkedByAi: false
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('/api/moderate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: imageDataUrlOrBase64,
        requireGymContext: options?.requireGymContext ?? false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[AI Moderation] Server returned status ${response.status}`);
      return {
        isAllowed: true,
        flaggedAsNotAllowed: false,
        flagCategory: 'none',
        reason: '',
        checkedByAi: false
      };
    }

    const data = await response.json();
    const isAllowed = Boolean(data.isAllowed);
    const flagCategory = (data.flagCategory || (isAllowed ? 'none' : 'nudity')) as ModerationFlagCategory;
    const reason = data.reason || (isAllowed ? '' : 'Image contains inappropriate content and is not allowed.');

    return {
      isAllowed,
      flaggedAsNotAllowed: !isAllowed,
      flagCategory,
      reason,
      checkedByAi: Boolean(data.checkedByAi)
    };
  } catch (err: any) {
    console.warn('[AI Moderation] Error calling moderation service:', err);
    return {
      isAllowed: true,
      flaggedAsNotAllowed: false,
      flagCategory: 'none',
      reason: '',
      checkedByAi: false
    };
  }
}

export interface GenerateGymAiImageParams {
  prompt: string;
  exerciseName?: string;
  muscleGroup?: string;
  equipment?: string;
  trainingGoal?: string;
}

/**
 * Generates a gym & exercise-only AI image (either native Gemini image generation
 * or an AI-directed high-definition custom gym photograph composite).
 */
export async function generateGymExerciseAiImage(
  params: GenerateGymAiImageParams
): Promise<{ dataUrl: string; title: string }> {
  const response = await fetch('/api/generate-gym-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Only gym and exercise-related image prompts are allowed.');
  }

  if (data.imageUrl) {
    return {
      dataUrl: data.imageUrl,
      title: data.exerciseTitle || params.prompt
    };
  }

  const baseAssetUrl: string = data.baseAssetUrl || '/assets/garage_home_gym.jpg';
  const exerciseTitle: string = (data.exerciseTitle || params.exerciseName || params.prompt || 'Gym Exercise').slice(0, 38);
  const muscleCallout: string = (data.muscleCallout || `${params.muscleGroup || 'Gym'} · ${params.equipment || 'Training'}`).toUpperCase().slice(0, 42);
  const techniqueCue: string = (data.techniqueCue || 'Controlled Eccentric & Peak Tension').slice(0, 52);
  const accentColor: string = data.accentColor || '#fbbf24';

  const compositeDataUrl = await new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 960;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(baseAssetUrl);
          return;
        }

        // Draw base high-res gym exercise photograph
        ctx.drawImage(img, 0, 0, 960, 600);

        // Subtle dark vignette & bottom gradient for crisp athletic studio finish
        const grad = ctx.createLinearGradient(0, 0, 0, 600);
        grad.addColorStop(0, 'rgba(9, 9, 11, 0.35)');
        grad.addColorStop(0.55, 'rgba(9, 9, 11, 0.12)');
        grad.addColorStop(1, 'rgba(9, 9, 11, 0.88)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 960, 600);

        // Top-left AI GYM LAB badge
        ctx.fillStyle = 'rgba(9, 9, 11, 0.82)';
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(28, 26, 210, 36, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.font = 'bold 14px monospace';
        ctx.fillText('AI GYM EXERCISE VISUAL', 44, 49);

        // Bottom callout bar
        ctx.fillStyle = accentColor;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(muscleCallout, 32, 512);

        ctx.fillStyle = '#fafafa';
        ctx.font = '800 28px system-ui, -apple-system, sans-serif';
        ctx.fillText(exerciseTitle, 32, 548);

        ctx.fillStyle = '#d4d4d8';
        ctx.font = '500 15px system-ui, -apple-system, sans-serif';
        ctx.fillText(techniqueCue, 32, 574);

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch {
        resolve(baseAssetUrl);
      }
    };
    img.onerror = () => resolve(baseAssetUrl);
    img.src = baseAssetUrl;
  });

  return {
    dataUrl: compositeDataUrl,
    title: exerciseTitle
  };
}


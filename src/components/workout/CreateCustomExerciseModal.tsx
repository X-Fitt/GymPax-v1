import React, { useState, useRef } from 'react';
import {
  X,
  Dumbbell,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Share2,
  Sparkles,
  Info,
  CheckCircle2,
  Flame,
  Camera,
  Play,
  Lock
} from 'lucide-react';
import {
  ExerciseDefinition,
  MuscleGroup,
  Equipment,
  UserProfile,
  UserSubscription,
  EquipmentEnvironment
} from '../../types';
import { MUSCLE_GROUPS, EQUIPMENT_LIST, resolveCatalogExercise } from '../../data/exercises';
import {
  saveCustomExercise,
  shareCustomExerciseToCommunity,
  MAX_FREE_CUSTOM_EXERCISES,
  getCustomExercises
} from '../../utils/storage';
import {
  checkImageSafetyWithAi,
  ImageModerationResult,
  generateGymExerciseAiImage
} from '../../utils/imageModeration';
import { ImageModerationBanner } from '../common/ImageModerationBanner';

interface CreateCustomExerciseModalProps {
  onClose: () => void;
  onExerciseCreated?: (exercise: ExerciseDefinition) => void;
  onLaunchWorkoutWithExercise?: (exercise: ExerciseDefinition) => void;
  onOpenUpgradeModal?: () => void;
  initialMuscle?: MuscleGroup;
  userProfile?: UserProfile | null;
  subscription?: UserSubscription;
  isInActiveWorkout?: boolean;
  currentEnvironment?: EquipmentEnvironment;
}

const PRESET_TECHNIQUE_PHOTOS: { label: string; url: string; muscle: MuscleGroup }[] = [
  { label: 'Barbell Bench & Rack Press', url: '/assets/home_gym_setup_3.jpg', muscle: 'Chest' },
  { label: 'Heavy Dumbbell Press', url: '/assets/dumbbell_user_2.jpg', muscle: 'Chest' },
  { label: 'Wide-Grip Lat Pulldown', url: '/assets/back_muscle_1.jpg', muscle: 'Back' },
  { label: 'Weighted Pull-Up V-Taper', url: '/assets/back_muscle_2.jpg', muscle: 'Back' },
  { label: 'Barbell Bent-Over Row', url: '/assets/back_muscle_3.jpg', muscle: 'Back' },
  { label: 'Seated Cable Row', url: '/assets/back_muscle_4.jpg', muscle: 'Back' },
  { label: 'Seated Dumbbell Shoulder Press', url: '/assets/shoulder_muscle_1.jpg', muscle: 'Shoulders' },
  { label: 'Cable & DB Lateral Raise', url: '/assets/shoulder_muscle_2.jpg', muscle: 'Shoulders' },
  { label: 'Rear Delt & Face Pull', url: '/assets/shoulder_muscle_3.jpg', muscle: 'Shoulders' },
  { label: 'Standing Overhead Barbell Press', url: '/assets/shoulder_muscle_4.jpg', muscle: 'Shoulders' },
  { label: 'EZ-Bar Biceps Curl', url: '/assets/biceps_muscle_1.jpg', muscle: 'Biceps' },
  { label: 'Incline Dumbbell Curl', url: '/assets/biceps_muscle_2.jpg', muscle: 'Biceps' },
  { label: 'Rope Hammer Curl', url: '/assets/biceps_muscle_3.jpg', muscle: 'Biceps' },
  { label: 'Preacher Isolation Curl', url: '/assets/biceps_muscle_4.jpg', muscle: 'Biceps' },
  { label: 'Cable Rope Triceps Pushdown', url: '/assets/triceps_muscle_1.jpg', muscle: 'Triceps' },
  { label: 'Overhead Triceps Extension', url: '/assets/triceps_muscle_2.jpg', muscle: 'Triceps' },
  { label: 'EZ-Bar Skull Crusher', url: '/assets/triceps_muscle_3.jpg', muscle: 'Triceps' },
  { label: 'Weighted Parallel Bar Dip', url: '/assets/triceps_muscle_4.jpg', muscle: 'Triceps' },
  { label: 'Heavy Barbell Back Squat', url: '/assets/quads_muscle_1.jpg', muscle: 'Quads' },
  { label: '45° Sled Leg Press', url: '/assets/quads_muscle_2.jpg', muscle: 'Quads' },
  { label: 'Seated Leg Extension', url: '/assets/quads_muscle_3.jpg', muscle: 'Quads' },
  { label: 'Bulgarian Split Squat', url: '/assets/quads_muscle_4.jpg', muscle: 'Quads' },
  { label: 'Barbell Romanian Deadlift', url: '/assets/hamstrings_muscle_1.jpg', muscle: 'Hamstrings' },
  { label: 'Seated & Lying Leg Curl', url: '/assets/hamstrings_muscle_2.jpg', muscle: 'Hamstrings' },
  { label: 'Nordic Hamstring Curl', url: '/assets/hamstrings_muscle_3.jpg', muscle: 'Hamstrings' },
  { label: 'Single-Leg RDL', url: '/assets/hamstrings_muscle_4.jpg', muscle: 'Hamstrings' },
  { label: 'Barbell Hip Thrust', url: '/assets/glutes_muscle_1.jpg', muscle: 'Glutes' },
  { label: 'Deficit Reverse Lunge', url: '/assets/glutes_muscle_2.jpg', muscle: 'Glutes' },
  { label: 'Cable Glute Kickback', url: '/assets/glutes_muscle_3.jpg', muscle: 'Glutes' },
  { label: 'Sumo Deadlift', url: '/assets/glutes_muscle_4.jpg', muscle: 'Glutes' },
  { label: 'Hanging Leg Raise', url: '/assets/abs_muscle_1.jpg', muscle: 'Abs & Core' },
  { label: 'Kneeling Cable Crunch', url: '/assets/abs_muscle_2.jpg', muscle: 'Abs & Core' },
  { label: 'Rotational Cable Woodchopper', url: '/assets/abs_core_exercise_3.jpg', muscle: 'Abs & Core' },
  { label: 'Ab Wheel Rollout', url: '/assets/abs_muscle_4.jpg', muscle: 'Abs & Core' },
  { label: 'Standing Calf Raise', url: '/assets/calves_muscle_1.jpg', muscle: 'Calves' },
  { label: 'Seated Soleus Calf Raise', url: '/assets/calves_muscle_2.jpg', muscle: 'Calves' },
  { label: 'Toe Press & Calf Builder', url: '/assets/calves_muscle_3.jpg', muscle: 'Calves' },
  { label: 'Single-Leg DB Calf Raise', url: '/assets/calves_muscle_4.jpg', muscle: 'Calves' },
  { label: 'Barbell Reverse Wrist Curl', url: '/assets/forearms_muscle_1.jpg', muscle: 'Forearms' },
  { label: 'Seated Dumbbell Wrist Curl', url: '/assets/forearms_muscle_2.jpg', muscle: 'Forearms' },
  { label: 'Behind-Back Curl & Farmer Hold', url: '/assets/forearms_muscle_3.jpg', muscle: 'Forearms' },
  { label: 'Wrist Roller & Forearm Curl', url: '/assets/forearms_muscle_4.jpg', muscle: 'Forearms' }
];

function compressImageDataUrl(dataUrl: string, maxDim = 800, quality = 0.78): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
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
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export const CreateCustomExerciseModal: React.FC<CreateCustomExerciseModalProps> = ({
  onClose,
  onExerciseCreated,
  onLaunchWorkoutWithExercise,
  onOpenUpgradeModal,
  initialMuscle = 'Chest',
  userProfile,
  subscription,
  isInActiveWorkout = false
}) => {
  const isPro = !!subscription?.isPro;
  const currentCustomExercises = getCustomExercises();
  const currentCount = currentCustomExercises.length;
  const isAtLimit = !isPro && currentCount >= MAX_FREE_CUSTOM_EXERCISES;
  const remainingSlots = isPro ? Infinity : Math.max(0, MAX_FREE_CUSTOM_EXERCISES - currentCount);

  const [name, setName] = useState('');
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>(initialMuscle);
  const [secondaryMuscles, setSecondaryMuscles] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment>('Dumbbell');
  const [tier, setTier] = useState<'Compound' | 'Isolation'>('Compound');
  const [description, setDescription] = useState('');
  const [cues, setCues] = useState<string[]>([
    'Maintain a solid core brace and neutral spine throughout',
    'Control the eccentric lowering phase for 2-3 seconds'
  ]);
  const [newCueInput, setNewCueInput] = useState('');
  
  // Pictures state
  const [images, setImages] = useState<string[]>([]);
  const [showPresetPhotos, setShowPresetPhotos] = useState<boolean>(false);
  const [filterPresetByMuscle, setFilterPresetByMuscle] = useState<boolean>(false);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // AI Gym Image Generator state
  const [showAiGenerator, setShowAiGenerator] = useState<boolean>(false);
  const [aiPromptInput, setAiPromptInput] = useState<string>('');
  const [isGeneratingAiImage, setIsGeneratingAiImage] = useState<boolean>(false);

  // Community sharing state
  const [shareWithCommunity, setShareWithCommunity] = useState(true);
  const [communityNote, setCommunityNote] = useState('');

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [exercisePhotoModeration, setExercisePhotoModeration] = useState<ImageModerationResult | null>(null);
  const [isCheckingExercisePhotoAi, setIsCheckingExercisePhotoAi] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleSecondaryMuscle = (muscle: MuscleGroup) => {
    if (muscle === primaryMuscle) return;
    if (secondaryMuscles.includes(muscle)) {
      setSecondaryMuscles(secondaryMuscles.filter(m => m !== muscle));
    } else {
      if (secondaryMuscles.length < 3) {
        setSecondaryMuscles([...secondaryMuscles, muscle]);
      }
    }
  };

  const handleAddCue = () => {
    if (newCueInput.trim()) {
      setCues([...cues, newCueInput.trim()]);
      setNewCueInput('');
    }
  };

  const handleRemoveCue = (idx: number) => {
    setCues(cues.filter((_, i) => i !== idx));
  };

  // Picture handling with AI Safety & Gym-Context Scanner
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage('');
    setExercisePhotoModeration(null);
    setIsCheckingExercisePhotoAi(true);

    Array.from(files).forEach(file => {
      if (file.size > 6 * 1024 * 1024) {
        setErrorMessage('Image file is too large (max 6MB).');
        setIsCheckingExercisePhotoAi(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = async uploadEvent => {
        const rawResult = uploadEvent.target?.result as string;
        if (rawResult) {
          const result = await compressImageDataUrl(rawResult);
          try {
            const modResult = await checkImageSafetyWithAi(result, { requireGymContext: true });
            setExercisePhotoModeration(modResult);
            if (modResult.flaggedAsNotAllowed) {
              setErrorMessage(
                modResult.reason || 'Only gym and exercise-related images are allowed.'
              );
              return;
            }
            setImages(prev => (prev.includes(result) ? prev : [...prev, result]));
            setErrorMessage('');
          } catch {
            setImages(prev => (prev.includes(result) ? prev : [...prev, result]));
          } finally {
            setIsCheckingExercisePhotoAi(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCreateAiExerciseImage = async () => {
    const effectivePrompt =
      aiPromptInput.trim() ||
      `${name.trim() || primaryMuscle} exercise using ${equipment} in a modern gym targeting ${primaryMuscle}`;
    setErrorMessage('');
    setIsGeneratingAiImage(true);
    try {
      const { dataUrl } = await generateGymExerciseAiImage({
        prompt: effectivePrompt,
        exerciseName: name.trim() || `${primaryMuscle} ${equipment} Exercise`,
        muscleGroup: primaryMuscle,
        equipment
      });
      setImages(prev => [dataUrl, ...prev.filter(u => u !== dataUrl)]);
      setShowAiGenerator(false);
      setAiPromptInput('');
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Only gym, workout, and exercise-related image descriptions are allowed.'
      );
    } finally {
      setIsGeneratingAiImage(false);
    }
  };

  const handleAddUrlImage = () => {
    if (customImageUrl.trim()) {
      setImages(prev => [...prev, customImageUrl.trim()]);
      setCustomImageUrl('');
      setShowUrlInput(false);
    }
  };

  const handleSelectPresetPhoto = (url: string) => {
    if (!images.includes(url)) {
      setImages(prev => [...prev, url]);
    }
    setShowPresetPhotos(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = (andLaunchWorkout: boolean = false) => {
    if (!name.trim()) {
      setErrorMessage('Please enter an exercise name.');
      return;
    }

    if (isAtLimit) {
      setErrorMessage(`Free account limit reached (${MAX_FREE_CUSTOM_EXERCISES} of ${MAX_FREE_CUSTOM_EXERCISES} custom exercises used). Upgrade to GymPax Pro to add unlimited custom movements!`);
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    // Default SVG type mapped to muscle/equipment
    const svgType =
      primaryMuscle === 'Chest' ? 'bench' :
      primaryMuscle === 'Quads' || primaryMuscle === 'Glutes' ? 'squat' :
      primaryMuscle === 'Back' || primaryMuscle === 'Hamstrings' ? 'deadlift' :
      primaryMuscle === 'Shoulders' ? 'overhead' :
      primaryMuscle === 'Biceps' ? 'curl' :
      primaryMuscle === 'Triceps' ? 'dip' : 'cable';

    const catalogMatch = resolveCatalogExercise(name.trim(), primaryMuscle, equipment);
    const exerciseId = `custom_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const newExercise: ExerciseDefinition = {
      id: exerciseId,
      name: name.trim(),
      primaryMuscle,
      rawPrimaryMuscle: catalogMatch.rawPrimaryMuscle || primaryMuscle,
      primary_muscle: catalogMatch.primary_muscle || catalogMatch.rawPrimaryMuscle || primaryMuscle,
      secondaryMuscles,
      equipment,
      tier,
      description: description.trim() || `Custom movement designed for targeting ${primaryMuscle} with ${equipment}. Focus on full range of motion, stable joint tracking, and continuous mechanical tension.`,
      cues: cues.length > 0 ? cues : [
        'Brace abdominal wall and stabilize shoulders',
        'Controlled tempo with peak contraction hold'
      ],
      svgIconType: svgType,
      cdn_url: catalogMatch.cdn_url,
      cdnUrl: catalogMatch.cdnUrl || catalogMatch.cdn_url,
      imageUrl: images[0] || catalogMatch.cdn_url,
      isCustom: true,
      createdAt: Date.now(),
      createdBy: userProfile?.name || 'You',
      creatorBadge: subscription?.isPro ? 'PRO' : 'LIFTER'
    };

    // 1. Save to local storage with isPro flag
    const saveResult = saveCustomExercise(newExercise, isPro);
    if (!saveResult.success) {
      setErrorMessage(saveResult.error || 'Failed to save: custom exercises limit reached.');
      setIsSaving(false);
      return;
    }

    // 2. Share with Iron Community if toggle is active
    if (shareWithCommunity) {
      shareCustomExerciseToCommunity(
        newExercise,
        userProfile?.name,
        subscription?.isPro ? 'PRO' : 'LIFTER',
        userProfile?.experienceLevel || 'Athlete',
        communityNote.trim() || `Created a new unique ${newExercise.primaryMuscle} exercise: ${newExercise.name}. Give it a try in your next session!`
      );
    }

    setSaveSuccess(true);
    setIsSaving(false);

    if (onExerciseCreated) {
      onExerciseCreated(newExercise);
    }

    if (andLaunchWorkout && onLaunchWorkoutWithExercise) {
      onLaunchWorkoutWithExercise(newExercise);
    } else {
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-zinc-100 font-sans"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-900/90 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Add Unique Exercise</span>
                {isPro ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-current" />
                    <span>PRO UNLIMITED</span>
                  </span>
                ) : (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase font-bold flex items-center gap-1 ${
                    isAtLimit
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-zinc-800 text-amber-400 border border-zinc-700'
                  }`}>
                    {isAtLimit && <Lock className="w-3 h-3" />}
                    <span>{currentCount} / {MAX_FREE_CUSTOM_EXERCISES} FREE</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                Craft your custom movement, save by muscle, and share with the community.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Free Quota Notice or Pro Paywall Alert */}
          {isAtLimit ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-amber-950/20 border border-amber-500/40 text-zinc-100 space-y-3 animate-in fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-zinc-100">Free Unique Exercises Limit Reached ({MAX_FREE_CUSTOM_EXERCISES} of {MAX_FREE_CUSTOM_EXERCISES})</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30 uppercase">
                      Pro Member Required
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    You have already added {MAX_FREE_CUSTOM_EXERCISES} unique exercises. Non-subscribed members can add up to {MAX_FREE_CUSTOM_EXERCISES} unique exercises for free; upgrade to a paid member to unlock unlimited unique exercises, custom media, and technique cues!
                  </p>
                  {onOpenUpgradeModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenUpgradeModal();
                      }}
                      className="mt-3 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      <span>Upgrade to GymPax Pro</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : !isPro ? (
            <div className="px-3.5 py-2.5 rounded-xl bg-zinc-950/70 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Free Plan: <strong className="text-zinc-200">{currentCount} of {MAX_FREE_CUSTOM_EXERCISES}</strong> unique exercises added ({remainingSlots} remaining)
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                {MAX_FREE_CUSTOM_EXERCISES} Free Exercises
              </span>
            </div>
          ) : (
            <div className="px-3.5 py-2 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-between text-xs text-amber-300 font-mono">
              <span className="flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                GymPax Pro: Unlimited Unique Exercises Active
              </span>
              <span className="text-[11px] text-zinc-400 font-normal">{currentCount} saved</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/70 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>Exercise successfully saved and added to your muscle library!</span>
            </div>
          )}

          {/* 1. Exercise Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block font-mono">
              Exercise Name <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Incline Cable Hammer Curl, Belt Squat March, Landmine Press"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* 2. Primary Muscle Group (Save Under) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                Primary Muscle Group <span className="text-amber-400">*</span>
              </label>
              <span className="text-[10px] text-zinc-500">Saved under this category</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => {
                    setPrimaryMuscle(muscle);
                    // Remove from secondary if it was there
                    setSecondaryMuscles(secondaryMuscles.filter(m => m !== muscle));
                  }}
                  className={`px-3 py-2 rounded-xl text-left font-medium transition-all cursor-pointer flex items-center justify-between ${
                    primaryMuscle === muscle
                      ? 'bg-amber-400 text-zinc-950 font-bold shadow-sm'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100'
                  }`}
                >
                  <span className="truncate">{muscle}</span>
                  {primaryMuscle === muscle && <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Secondary Assisting Muscles (Optional) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                Secondary Assisting Muscles (Optional)
              </label>
              <span className="text-[10px] text-zinc-500">Select up to 3</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.filter(m => m !== primaryMuscle).map(muscle => {
                const isSelected = secondaryMuscles.includes(muscle);
                return (
                  <button
                    key={muscle}
                    type="button"
                    onClick={() => handleToggleSecondaryMuscle(muscle)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400/20 border border-amber-400/50 text-amber-300 font-semibold'
                        : 'bg-zinc-950 border border-zinc-850 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {muscle}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Equipment & Tier Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                Equipment Type
              </label>
              <select
                value={equipment}
                onChange={e => setEquipment(e.target.value as Equipment)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-zinc-100 text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {EQUIPMENT_LIST.map(eq => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                Movement Tier
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setTier('Compound')}
                  className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                    tier === 'Compound'
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Compound
                </button>
                <button
                  type="button"
                  onClick={() => setTier('Isolation')}
                  className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
                    tier === 'Isolation'
                      ? 'bg-amber-400 text-zinc-950'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Isolation
                </button>
              </div>
            </div>
          </div>

          {/* 5. Exercise Pictures / Media Section */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider block font-mono flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>Exercise Pictures & Form Photo (Gym & Exercise Only)</span>
                </label>
                <span className="text-[10px] text-zinc-400">
                  Upload gym photo, pick verified exercise photo, or create an AI gym exercise image
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {images.length} added
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* AI Safety Inspection Banner */}
            <ImageModerationBanner
              result={exercisePhotoModeration}
              isChecking={isCheckingExercisePhotoAi}
              onClear={() => {
                setExercisePhotoModeration(null);
                setErrorMessage('');
              }}
            />

            {/* Action Bar for Adding Photos */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold flex items-center gap-1.5 cursor-pointer border border-zinc-700/80 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Gym Photo</span>
              </button>

              <button
                type="button"
                onClick={() => setShowPresetPhotos(!showPresetPhotos)}
                className="px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 font-medium flex items-center gap-1.5 cursor-pointer border border-zinc-750 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Pick Exercise Preset</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowAiGenerator(!showAiGenerator);
                  if (!aiPromptInput.trim()) {
                    setAiPromptInput(
                      `${name.trim() || primaryMuscle + ' ' + equipment} exercise in a modern gym targeting ${primaryMuscle}`
                    );
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer border border-amber-400/40 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Create AI Image</span>
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 text-[11px] cursor-pointer"
              >
                Web URL
              </button>
            </div>

            {/* AI Gym & Exercise Image Creator Panel */}
            {showAiGenerator && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-amber-400/40 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Create AI Gym & Exercise Image</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAiGenerator(false)}
                    className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-[10px] text-zinc-400">
                  Describe the gym exercise, muscle contraction, or equipment setup (strictly gym & exercise prompts only):
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    placeholder={`e.g. Athlete performing ${name || primaryMuscle + ' ' + equipment} exercise in gym`}
                    value={aiPromptInput}
                    onChange={e => setAiPromptInput(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    disabled={isGeneratingAiImage}
                    onClick={handleCreateAiExerciseImage}
                    className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingAiImage ? 'Creating...' : 'Generate AI Image'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Web URL input field if opened */}
            {showUrlInput && (
              <div className="flex items-center gap-2 pt-1 animate-in fade-in">
                <input
                  type="url"
                  placeholder="https://example.com/gym-exercise-photo.jpg"
                  value={customImageUrl}
                  onChange={e => setCustomImageUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddUrlImage}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            {/* Curated Preset Technique Photos Picker (Strictly Gym & Exercise Photos Only + Create AI Image option) */}
            {showPresetPhotos && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-750 space-y-2.5 animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-300 font-bold">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>Gym & Exercise Technique Photos:</span>
                    <button
                      type="button"
                      onClick={() => setFilterPresetByMuscle(!filterPresetByMuscle)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono cursor-pointer border transition-colors ${
                        filterPresetByMuscle
                          ? 'bg-amber-400 text-zinc-950 border-amber-400 font-bold'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      {filterPresetByMuscle ? `${primaryMuscle} Only` : `Filter: ${primaryMuscle}`}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAiGenerator(true);
                        if (!aiPromptInput.trim()) {
                          setAiPromptInput(
                            `${name.trim() || primaryMuscle + ' ' + equipment} exercise in a modern gym targeting ${primaryMuscle}`
                          );
                        }
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/40 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                      <span>+ Create AI Image</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresetPhotos(false)}
                    className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto p-1">
                  {(filterPresetByMuscle
                    ? PRESET_TECHNIQUE_PHOTOS.filter(p => p.muscle === primaryMuscle)
                    : [
                        ...PRESET_TECHNIQUE_PHOTOS.filter(p => p.muscle === primaryMuscle),
                        ...PRESET_TECHNIQUE_PHOTOS.filter(p => p.muscle !== primaryMuscle)
                      ]
                  ).map(p => (
                    <div
                      key={`${p.muscle}_${p.label}`}
                      onClick={() => handleSelectPresetPhoto(p.url)}
                      className="group cursor-pointer rounded-lg overflow-hidden border border-zinc-750 hover:border-amber-400 transition-all bg-zinc-950 relative aspect-[16/10]"
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent group-hover:from-black/65 transition-colors" />
                      <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-zinc-950/85 text-[8px] font-mono font-bold text-amber-400">
                        {p.muscle}
                      </span>
                      <span className="absolute bottom-1 left-1 right-1 text-[8.5px] font-bold text-white truncate drop-shadow-md">
                        {p.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attached Images Grid / Preview */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 aspect-[16/10] group"
                  >
                    <img
                      src={img}
                      alt={`Exercise snapshot ${idx + 1}`}
                      className="w-full h-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    
                    {idx === 0 && (
                      <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-amber-400 text-zinc-950 font-bold text-[9px] uppercase font-mono">
                        Cover Photo
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove Picture"
                      className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/75 hover:bg-red-600 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500 text-[11px]">
                No photos attached yet. Pick from verified {primaryMuscle} gym exercise photos or click "Create AI Image" above.
              </div>
            )}
          </div>

          {/* 6. Description & Setup Notes */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block font-mono">
              Description & Setup Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Describe the biomechanics, bench angle, pin height, or movement focus (e.g. Set bench to 30 degrees, pause 1 second in loaded stretch, drive elbows back)."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* 7. Key Form Cues */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider block font-mono">
                Pro Technique Cues
              </label>
              <span className="text-[10px] text-zinc-500">Displayed in exercise checklist</span>
            </div>

            <div className="space-y-1.5">
              {cues.map((cue, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs truncate">{cue}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCue(idx)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Cue Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add a cue (e.g. Keep chest high, lock lats)..."
                value={newCueInput}
                onChange={e => setNewCueInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCue();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleAddCue}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* 8. Share with Iron Community Toggle */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-bold">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-100">
                    Share with Friends in Community
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Post to the local lifter feed so friends can try or import your exercise.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="share_toggle"
                checked={shareWithCommunity}
                onChange={e => setShareWithCommunity(e.target.checked)}
                className="w-4 h-4 accent-amber-400 cursor-pointer mt-1"
              />
            </div>

            {shareWithCommunity && (
              <div className="pt-1 animate-in fade-in">
                <input
                  type="text"
                  placeholder="Add a community note (e.g. Try this variation for massive peak pump!)..."
                  value={communityNote}
                  onChange={e => setCommunityNote(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-950 border border-amber-400/30 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-900/90 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
            {isAtLimit ? (
              <button
                type="button"
                onClick={() => {
                  if (onOpenUpgradeModal) {
                    onClose();
                    onOpenUpgradeModal();
                  } else {
                    setErrorMessage(`Free account limit reached (${MAX_FREE_CUSTOM_EXERCISES} of ${MAX_FREE_CUSTOM_EXERCISES} custom exercises used). Upgrade to GymPax Pro to add more custom exercises.`);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Lock className="w-4 h-4" />
                <span>Upgrade to Pro to Save ({MAX_FREE_CUSTOM_EXERCISES}/{MAX_FREE_CUSTOM_EXERCISES} Limit)</span>
              </button>
            ) : isInActiveWorkout ? (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Save & Add to Active Workout</span>
              </button>
            ) : (
              <>
                {onLaunchWorkoutWithExercise && (
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-400 border border-amber-400/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Save & Start Workout</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save to {primaryMuscle}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

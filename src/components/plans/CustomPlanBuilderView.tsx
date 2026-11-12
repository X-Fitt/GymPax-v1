import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Lock,
  Maximize2,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  RotateCcw
} from 'lucide-react';
import {
  FitnessGoal,
  ExperienceLevel,
  MuscleGroup,
  DailyWorkoutRoutine,
  ExerciseDefinition
} from '../../types';
import { resolveCatalogExercise } from '../../data/exercises';
import { MAX_FREE_PERSONALIZED_PLANS } from '../../utils/storage';
import { checkImageSafetyWithAi } from '../../utils/imageModeration';

export interface GoalGymPhotoOption {
  id: string;
  url: string;
  title: string;
  subtitle: string;
}

export const GOAL_GENERAL_GYM_PHOTOS: Record<FitnessGoal, GoalGymPhotoOption[]> = {
  'Hypertrophy (Pure Muscle Mass)': [
    {
      id: 'hyp_gym_1',
      url: '/assets/dumbbell_user_1.jpg',
      title: 'Free-Weight Hypertrophy Gym',
      subtitle: 'Dumbbell & barbell mass building floor'
    },
    {
      id: 'hyp_gym_2',
      url: '/assets/back_muscle_1.jpg',
      title: 'Commercial Hypertrophy Cable & Lat Rig',
      subtitle: 'Upper-body width & mechanical tension station'
    },
    {
      id: 'hyp_gym_3',
      url: '/assets/shoulder_muscle_1.jpg',
      title: 'Heavy Dumbbell Press & Mirror Zone',
      subtitle: 'Deltoid, chest & arm hypertrophy setup'
    },
    {
      id: 'hyp_gym_4',
      url: '/assets/quads_muscle_1.jpg',
      title: 'Squat Rack & Lower-Body Mass Floor',
      subtitle: 'High-volume leg hypertrophy training'
    }
  ],
  'Strength & Size (Powerbuilding)': [
    {
      id: 'str_gym_1',
      url: '/assets/garage_home_gym.jpg',
      title: 'Power Rack & Heavy Barbell Setup',
      subtitle: 'Compound strength & powerbuilding cage'
    },
    {
      id: 'str_gym_2',
      url: '/assets/home_gym_setup_4.jpg',
      title: 'Deadlift Platform & 5×5 Iron Station',
      subtitle: 'Heavy barbell plates & power rack floor'
    },
    {
      id: 'str_gym_3',
      url: '/assets/hamstrings_muscle_1.jpg',
      title: 'Heavy Barbell Pull & Posterior Chain',
      subtitle: 'Powerlifting & strength overload zone'
    },
    {
      id: 'str_gym_4',
      url: '/assets/dumbbell_user_2.jpg',
      title: 'Heavy Dumbbell Rack & Iron Bench',
      subtitle: 'Powerbuilding accessory overload'
    }
  ],
  'Fat Loss & Shred (Caloric Deficit Conditioning)': [
    {
      id: 'shred_gym_1',
      url: '/assets/kettlebell_gym_4.jpg',
      title: 'Athletic Kettlebell Conditioning Turf',
      subtitle: 'High-calorie burn & metabolic conditioning'
    },
    {
      id: 'shred_gym_2',
      url: '/assets/bodyweight_only_4.jpg',
      title: 'High-Intensity Conditioning Floor',
      subtitle: 'Explosive circuit & fat-loss shred zone'
    },
    {
      id: 'shred_gym_3',
      url: '/assets/abs_muscle_4.jpg',
      title: 'Core & Metabolic Finisher Station',
      subtitle: 'Caloric deficit & abdominal conditioning'
    },
    {
      id: 'shred_gym_4',
      url: '/assets/dumbbell_user_4.jpg',
      title: 'High-Density Dumbbell Shred Row',
      subtitle: 'Short-rest metabolic resistance training'
    }
  ],
  'Lean Cut & Muscle Definition': [
    {
      id: 'cut_gym_1',
      url: '/assets/abs_muscle_1.jpg',
      title: 'Core Definition & Hanging Bar Rig',
      subtitle: 'Midsection & striated athletic definition'
    },
    {
      id: 'cut_gym_2',
      url: '/assets/triceps_muscle_1.jpg',
      title: 'Cable Isolation & Sculpting Station',
      subtitle: 'High-rep muscle separation & definition'
    },
    {
      id: 'cut_gym_3',
      url: '/assets/biceps_muscle_3.jpg',
      title: 'Dual Cable Pulley & Arm Sculpt Floor',
      subtitle: 'Lean muscle detail & vascularity'
    },
    {
      id: 'cut_gym_4',
      url: '/assets/glutes_muscle_3.jpg',
      title: 'Athletic Lower-Body Sculpt & Cable Gym',
      subtitle: 'Toned muscular definition & conditioning'
    }
  ],
  'Aesthetic V-Taper': [
    {
      id: 'vtaper_gym_1',
      url: '/assets/back_muscle_2.jpg',
      title: 'Wide-Grip Pull-Up & Lat Flare Rig',
      subtitle: 'V-taper back width specialization'
    },
    {
      id: 'vtaper_gym_2',
      url: '/assets/shoulder_muscle_2.jpg',
      title: 'Lateral Deltoid Sweep Gym Floor',
      subtitle: 'Broad clavicle & round shoulder ratio'
    },
    {
      id: 'vtaper_gym_3',
      url: '/assets/abs_core_exercise_3.jpg',
      title: 'Rotational Core & Tight Waistline Cable',
      subtitle: 'Shoulder-to-waist aesthetic proportion'
    },
    {
      id: 'vtaper_gym_4',
      url: '/assets/bodyweight_only_1.jpg',
      title: 'Calisthenics & Aesthetic Physique Rig',
      subtitle: 'Symmetrical upper-body proportions'
    }
  ]
};

const MUSCLE_GROUPS_LIST: (MuscleGroup | 'All')[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Biceps',
  'Triceps',
  'Abs & Core',
  'Calves',
  'Forearms',
  'All'
];

export interface CustomPlanBuilderViewProps {
  draftPlanName: string;
  setDraftPlanName: (val: string) => void;
  draftPlanGoal: FitnessGoal;
  setDraftPlanGoal: (val: FitnessGoal) => void;
  draftDaysCount: number;
  handleChangeDraftDaysCount: (days: number) => void;
  draftPlanLevel: ExperienceLevel;
  setDraftPlanLevel: (val: ExperienceLevel) => void;
  draftPlanPhotoUrl?: string;
  setDraftPlanPhotoUrl?: (url: string) => void;
  draftRoutines: DailyWorkoutRoutine[];
  setDraftRoutines: React.Dispatch<React.SetStateAction<DailyWorkoutRoutine[]>>;
  activeDraftDayIdx: number;
  setActiveDraftDayIdx: (idx: number) => void;
  selectedMuscleGroup: MuscleGroup | 'All';
  setSelectedMuscleGroup: (group: MuscleGroup | 'All') => void;
  availableExercisesForMuscle: ExerciseDefinition[];
  selectedExerciseId: string;
  setSelectedExerciseId: (id: string) => void;
  customExerciseName: string;
  setCustomExerciseName: (name: string) => void;
  selectedSets: number;
  setSelectedSets: (sets: number) => void;
  selectedReps: string;
  setSelectedReps: (reps: string) => void;
  selectedRpe: number;
  setSelectedRpe: (rpe: number) => void;
  selectedRestSec: number;
  setSelectedRestSec: (sec: number) => void;
  onAddExercise: () => void;
  onUpdateExerciseField: (
    exerciseIdx: number,
    field: 'defaultSets' | 'targetReps' | 'targetRpe',
    value: string | number
  ) => void;
  onRemoveExercise: (exerciseIdx: number) => void;
  onSavePlan: (activateImmediately: boolean) => void;
  onClose: () => void;
  isAtPersonalizedPlanLimit: boolean;
  createdPersonalizedPlansCount: number;
  isUserPro: boolean;
  onOpenLimitModal: () => void;
  onInspectExercise: (exercise: ExerciseDefinition) => void;
}

export const CustomPlanBuilderView: React.FC<CustomPlanBuilderViewProps> = ({
  draftPlanName,
  setDraftPlanName,
  draftPlanGoal,
  setDraftPlanGoal,
  draftDaysCount,
  handleChangeDraftDaysCount,
  draftPlanLevel,
  setDraftPlanLevel,
  draftPlanPhotoUrl = '',
  setDraftPlanPhotoUrl,
  draftRoutines,
  setDraftRoutines,
  activeDraftDayIdx,
  setActiveDraftDayIdx,
  selectedMuscleGroup,
  setSelectedMuscleGroup,
  availableExercisesForMuscle,
  selectedExerciseId,
  setSelectedExerciseId,
  customExerciseName,
  setCustomExerciseName,
  selectedSets,
  setSelectedSets,
  selectedReps,
  setSelectedReps,
  selectedRpe,
  setSelectedRpe,
  selectedRestSec,
  setSelectedRestSec,
  onAddExercise,
  onUpdateExerciseField,
  onRemoveExercise,
  onSavePlan,
  onClose,
  isAtPersonalizedPlanLimit,
  createdPersonalizedPlansCount,
  isUserPro,
  onOpenLimitModal,
  onInspectExercise
}) => {
  const currentDraftRoutine = draftRoutines[activeDraftDayIdx];
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isModeratingUpload, setIsModeratingUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraCaptureInputRef = useRef<HTMLInputElement>(null);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const goalPhotos =
    GOAL_GENERAL_GYM_PHOTOS[draftPlanGoal] ||
    GOAL_GENERAL_GYM_PHOTOS['Hypertrophy (Pure Muscle Mass)'];

  const matchedGoalPhoto = Object.values(GOAL_GENERAL_GYM_PHOTOS)
    .flat()
    .find(p => p.url === draftPlanPhotoUrl);

  const processAndApplyPhoto = (dataUrl: string) => {
    const img = new Image();
    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas');
        const maxW = 960;
        const maxH = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const processedDataUrl = ctx
          ? (ctx.drawImage(img, 0, 0, width, height), canvas.toDataURL('image/jpeg', 0.85))
          : dataUrl;

        setIsModeratingUpload(true);
        const safety = await checkImageSafetyWithAi(processedDataUrl, { requireGymContext: true });
        setIsModeratingUpload(false);

        if (!safety.isAllowed) {
          setUploadError(
            safety.reason ||
              'Only gym and exercise-related images are allowed. Please snap or upload a valid workout photo.'
          );
          return;
        }

        setDraftPlanPhotoUrl?.(processedDataUrl);
        setShowPhotoModal(false);
      } catch {
        setIsModeratingUpload(false);
        setDraftPlanPhotoUrl?.(dataUrl);
        setShowPhotoModal(false);
      }
    };
    img.onerror = () => {
      setUploadError('Could not process the photo.');
    };
    img.src = dataUrl;
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      processAndApplyPhoto(dataUrl);
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraCaptureInputRef.current?.click();
      return;
    }
    try {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setCameraError('Camera access was denied. You can allow camera access in browser permissions or use native camera / upload.');
      } else {
        cameraCaptureInputRef.current?.click();
      }
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const handleCaptureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const width = video.videoWidth || 960;
    const height = video.videoHeight || 600;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    if (cameraFacingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    stopCamera();
    processAndApplyPhoto(dataUrl);
  };

  // Turn off camera if modal is closed
  useEffect(() => {
    if (!showPhotoModal && isCameraActive) {
      stopCamera();
    }
  }, [showPhotoModal]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer text-xs font-medium shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
          <span>Back to Workout Plans</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 font-medium text-xs border border-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {!isAtPersonalizedPlanLimit ? (
            <>
              <button
                type="button"
                onClick={() => onSavePlan(false)}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
              >
                Save Plan
              </button>
              <button
                type="button"
                onClick={() => onSavePlan(true)}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save & Activate</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onOpenLimitModal}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Upgrade to Pro</span>
            </button>
          )}
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                Create Custom Workout Plan
              </h1>
              {!isUserPro ? (
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold ${
                    isAtPersonalizedPlanLimit
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                  }`}
                >
                  {createdPersonalizedPlansCount}/{MAX_FREE_PERSONALIZED_PLANS} Free Plans
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                  PRO · UNLIMITED
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
              Build your customized training split, select target muscle groups, exercises, sets, reps, and rest intervals.
            </p>
          </div>
        </div>
      </div>

      {/* Free Limit Warning Banner */}
      {isAtPersonalizedPlanLimit && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <p className="font-bold text-amber-400 text-sm">
              Free Account Limit Reached ({MAX_FREE_PERSONALIZED_PLANS}/{MAX_FREE_PERSONALIZED_PLANS} Personalized Plans)
            </p>
            <p className="text-zinc-300 mt-1 leading-relaxed">
              In the free user account, a user can only create 5 free personalized plans. In the Pro account, the number is unlimited.
            </p>
            <button
              type="button"
              onClick={onOpenLimitModal}
              className="mt-3 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs"
            >
              Upgrade to Pro (Unlimited)
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Plan Configuration - Minimalist & Compact Layout */}
      <div className="rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-2.5 sm:p-3 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/60">
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-full bg-amber-400/20 text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <h2 className="text-[11px] sm:text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Plan Configuration
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 font-medium">
            {draftDaysCount}D Split · {draftPlanLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {/* Plan Name */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <label className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">
              Plan Name
            </label>
            <input
              type="text"
              value={draftPlanName}
              onChange={e => setDraftPlanName(e.target.value)}
              placeholder="e.g. My Custom Hypertrophy Plan"
              className="w-full h-7 sm:h-8 px-2.5 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800 text-[11px] sm:text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Training Goal */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <label className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">
              Training Goal
            </label>
            <select
              value={draftPlanGoal}
              onChange={e => setDraftPlanGoal(e.target.value as FitnessGoal)}
              className="w-full h-7 sm:h-8 px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800 text-[11px] sm:text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              <option value="Hypertrophy (Pure Muscle Mass)">Hypertrophy (Pure Muscle Mass)</option>
              <option value="Strength & Size (Powerbuilding)">Strength & Size (Powerbuilding)</option>
              <option value="Fat Loss & Shred (Caloric Deficit Conditioning)">Fat Loss & Shred</option>
              <option value="Lean Cut & Muscle Definition">Lean Cut & Muscle Definition</option>
              <option value="Aesthetic V-Taper">Aesthetic V-Taper</option>
            </select>
          </div>

          {/* Days Per Week (Side-by-side on mobile) */}
          <div className="col-span-1">
            <label className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">
              Split Days
            </label>
            <select
              value={draftDaysCount}
              onChange={e => handleChangeDraftDaysCount(Number(e.target.value))}
              className="w-full h-7 sm:h-8 px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800 text-[11px] sm:text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <option key={d} value={d}>
                  {d} {d === 1 ? 'Day' : 'Days'} / Wk
                </option>
              ))}
            </select>
          </div>

          {/* Experience Level (Side-by-side on mobile) */}
          <div className="col-span-1">
            <label className="block text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-0.5">
              Level
            </label>
            <select
              value={draftPlanLevel}
              onChange={e => setDraftPlanLevel(e.target.value as ExperienceLevel)}
              className="w-full h-7 sm:h-8 px-2 py-1 rounded-lg bg-zinc-950/90 border border-zinc-800 text-[11px] sm:text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer transition-colors"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced Pro">Advanced Pro</option>
            </select>
          </div>
        </div>

        {/* Bottom of Card: Add Photo Bar & Trigger */}
        <div className="pt-2 border-t border-zinc-800/70 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {draftPlanPhotoUrl ? (
              <>
                <div className="w-11 h-7 rounded-md overflow-hidden border border-amber-400/50 bg-zinc-950 shrink-0">
                  <img
                    src={draftPlanPhotoUrl}
                    alt="Selected plan cover"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-zinc-200 truncate">
                    {matchedGoalPhoto ? matchedGoalPhoto.title : 'Custom Uploaded Photo'}
                  </p>
                  <p className="text-[10px] text-amber-400/90 font-mono truncate">
                    Plan Cover Photo Active
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDraftPlanPhotoUrl?.('')}
                  className="text-[10px] font-mono text-zinc-400 hover:text-red-400 px-1.5 py-0.5 rounded bg-zinc-950 border border-zinc-800 hover:border-red-500/40 transition-colors cursor-pointer shrink-0"
                  title="Remove selected photo"
                >
                  Clear
                </button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                <span className="truncate">
                  Select a cover photo for your plan ({draftPlanGoal.split('(')[0].trim()})
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setShowPhotoModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/35 font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Add Photo</span>
          </button>
        </div>
      </div>

      {/* Add Photo Popup Modal */}
      {showPhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setShowPhotoModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Camera className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-100 truncate">
                    Add Plan Photo
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Goal: <span className="text-amber-400 font-semibold">{draftPlanGoal}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer"
                aria-label="Close photo modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* 1. Take Photo or Upload Gym Photo Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Option 1 · Take Photo or Upload
                  </label>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Gym &amp; Exercise Only
                  </span>
                </div>

                {/* Hidden Inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUploadFileChange}
                  className="hidden"
                />
                <input
                  ref={cameraCaptureInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleUploadFileChange}
                  className="hidden"
                />

                {isCameraActive ? (
                  /* Live Camera Viewfinder */
                  <div className="relative rounded-2xl overflow-hidden border border-amber-400/60 bg-black aspect-video flex flex-col justify-between p-3 shadow-lg">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`absolute inset-0 w-full h-full object-cover ${
                        cameraFacingMode === 'user' ? '-scale-x-100' : ''
                      }`}
                    />
                    {isFlashing && (
                      <div className="absolute inset-0 bg-white opacity-80 z-20 pointer-events-none transition-opacity duration-150" />
                    )}

                    {/* Camera Top Controls */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 border border-zinc-700/80 text-[10px] font-mono text-amber-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Live Camera
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={toggleCameraFacing}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors cursor-pointer"
                          title="Flip camera (rear / front)"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-zinc-300 hover:text-white border border-zinc-700/80 transition-colors cursor-pointer"
                          title="Close camera"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Camera Center Viewfinder Guidelines */}
                    <div className="relative z-10 pointer-events-none self-center w-3/4 h-2/3 border border-white/25 rounded-xl flex items-center justify-center">
                      <span className="text-[10px] font-mono text-white/50 bg-black/40 px-2 py-0.5 rounded">
                        Position workout or gym equipment
                      </span>
                    </div>

                    {/* Camera Bottom Shutter Controls */}
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleCaptureFromCamera}
                        className="px-5 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 stroke-[2.5]" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 rounded-xl bg-black/70 hover:bg-black text-zinc-300 text-xs font-semibold border border-zinc-700/80 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Two Action Buttons: Take Photo & Upload Photo */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isModeratingUpload}
                      onClick={() => startCamera('environment')}
                      className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 disabled:opacity-60 border border-amber-400/40 hover:border-amber-400 flex items-center justify-center gap-2 text-xs font-bold text-amber-300 transition-all cursor-pointer group shadow-xs"
                    >
                      <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Take a Photo</span>
                    </button>

                    <button
                      type="button"
                      disabled={isModeratingUpload}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-3 rounded-xl bg-zinc-950 hover:bg-zinc-900 disabled:opacity-60 border border-dashed border-zinc-750 hover:border-amber-400/80 flex items-center justify-center gap-2 text-xs font-bold text-zinc-300 hover:text-amber-300 transition-all cursor-pointer group shadow-xs"
                    >
                      <Upload className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>
                        {isModeratingUpload
                          ? 'Verifying Photo...'
                          : 'Upload from Device'}
                      </span>
                    </button>
                  </div>
                )}

                {cameraError && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-400">
                    <span>{cameraError}</span>
                    <button
                      type="button"
                      onClick={() => cameraCaptureInputRef.current?.click()}
                      className="px-2 py-1 rounded bg-amber-400 text-zinc-950 font-bold text-[10px] uppercase shrink-0"
                    >
                      Use Native Camera
                    </button>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-xs text-red-400 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* 2. Choose from 4 General Gym Photos for the Selected Training Goal */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                    Option 2 · Choose from 4 Gym Photos for Your Goal
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                    {draftPlanGoal.split('(')[0].trim()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {goalPhotos.map((photo, index) => {
                    const isSelected = draftPlanPhotoUrl === photo.url;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => {
                          setDraftPlanPhotoUrl?.(photo.url);
                          setShowPhotoModal(false);
                        }}
                        className={`group relative rounded-xl overflow-hidden border text-left transition-all cursor-pointer flex flex-col bg-zinc-950 ${
                          isSelected
                            ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                            : 'border-zinc-800 hover:border-amber-400/60'
                        }`}
                      >
                        <div className="relative h-28 w-full bg-zinc-950 overflow-hidden">
                          <img
                            src={photo.url}
                            alt={photo.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/85 via-zinc-950/20 to-transparent" />
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-zinc-950/85 border border-zinc-700/80 text-[10px] font-mono font-bold text-amber-400">
                            Gym #{index + 1}
                          </span>
                          {isSelected && (
                            <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs font-bold text-zinc-100 truncate">
                            {photo.title}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                            {photo.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-zinc-800 bg-zinc-950/60">
              <span className="text-[11px] text-zinc-400 truncate">
                {draftPlanPhotoUrl ? 'Photo selected for this plan' : 'Click any photo above to apply'}
              </span>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Split Days & Day Focus */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Select Training Day
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            Click a day tab to switch and configure its routine
          </span>
        </div>

        {/* Day selection buttons - compact and smaller buttons */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {draftRoutines.map((routine, idx) => {
            const isActiveDay = idx === activeDraftDayIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveDraftDayIdx(idx)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 shadow-xs active:scale-95 shrink-0 ${
                  isActiveDay
                    ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-sm font-black'
                    : 'bg-zinc-950 text-zinc-300 hover:text-white border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <span>Day {idx + 1}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold leading-none ${
                    isActiveDay
                      ? 'bg-zinc-950/20 text-zinc-950'
                      : 'bg-zinc-900 text-amber-400/90 border border-zinc-800'
                  }`}
                >
                  {routine.exercises.length}
                </span>
              </button>
            );
          })}
        </div>

        {currentDraftRoutine && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2.5 border-t border-zinc-800/80">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 sm:text-zinc-400 shrink-0 font-semibold">
              Day {activeDraftDayIdx + 1} Title / Focus:
            </span>
            <input
              type="text"
              value={currentDraftRoutine.dayName}
              onChange={e => {
                const val = e.target.value;
                setDraftRoutines(prev =>
                  prev.map((r, i) => (i === activeDraftDayIdx ? { ...r, dayName: val } : r))
                );
              }}
              placeholder="e.g. Day 1: Chest & Triceps Hypertrophy"
              className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>
        )}
      </div>

      {/* Step 3: Current Day Exercises Routine */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-400 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <span className="font-bold text-zinc-200">
              Day {activeDraftDayIdx + 1} Exercises ({currentDraftRoutine?.exercises.length || 0})
            </span>
          </div>
          <span>Sets × Target Reps · Actions</span>
        </div>

        {currentDraftRoutine && currentDraftRoutine.exercises.length === 0 ? (
          <div className="py-8 px-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-center text-xs text-zinc-500">
            No exercises added to Day {activeDraftDayIdx + 1} yet. Use the Add Exercise section below to build your workout.
          </div>
        ) : (
          <div className="space-y-2">
            {currentDraftRoutine?.exercises.map((item: DailyWorkoutRoutine['exercises'][number], exIdx: number) => {
              const exDef = resolveCatalogExercise(item.exerciseId || item.id || item.name || '');
              const videoSrc = item.cdn_url || exDef.cdn_url || exDef.cdnUrl;
              return (
                <div
                  key={`${item.exerciseId}-${exIdx}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs hover:border-zinc-700 transition-colors"
                >
                  {videoSrc && (
                    <div
                      onClick={() => onInspectExercise(exDef)}
                      className="relative w-14 h-11 sm:w-16 sm:h-12 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-750/90 shrink-0 shadow-xs flex items-center justify-center group/vid cursor-pointer"
                      title="Click to inspect full screen video & technique cues"
                    >
                      <video
                        src={videoSrc}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover object-center filter brightness-[0.90] contrast-[1.08] transition-transform duration-300 group-hover/vid:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20 pointer-events-none" />
                      <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onInspectExercise(exDef);
                        }}
                        title="Expand video to full screen"
                        aria-label="Expand video to full screen"
                        className="absolute bottom-1 right-1 p-0.5 rounded bg-black/85 hover:bg-black text-amber-400 hover:text-amber-300 border border-zinc-700/80 hover:border-amber-400/80 shadow-xs cursor-pointer z-10 transition-all active:scale-95 flex items-center gap-0.5"
                      >
                        <Maximize2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-zinc-100 truncate text-xs sm:text-sm">
                      {exIdx + 1}. {item.name || exDef.name}
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-amber-400 font-medium">
                        {item.primary_muscle || exDef.primary_muscle || exDef.primaryMuscle}
                      </span>
                      <span>·</span>
                      <span>{exDef.equipment}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-500 hidden sm:inline">Sets:</span>
                      <select
                        value={item.defaultSets}
                        onChange={e =>
                          onUpdateExerciseField(exIdx, 'defaultSets', Number(e.target.value))
                        }
                        aria-label="Sets"
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 cursor-pointer"
                      >
                        {[1, 2, 3, 4, 5, 6].map(s => (
                          <option key={s} value={s}>
                            {s}s
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-500 hidden sm:inline">Reps:</span>
                      <select
                        value={item.targetReps}
                        onChange={e => onUpdateExerciseField(exIdx, 'targetReps', e.target.value)}
                        aria-label="Target Reps"
                        className="px-2 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-mono text-amber-300 cursor-pointer"
                      >
                        {['5', '6-8', '8-10', '10-12', '12-15', '15-20', 'AMRAP'].map(r => (
                          <option key={r} value={r}>
                            {r}r
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveExercise(exIdx)}
                      className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-colors cursor-pointer"
                      title="Remove exercise"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Step 4: Add Exercise to Selected Day */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <h2 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
              Add Exercise to Day {activeDraftDayIdx + 1}
            </h2>
          </div>
          <span className="text-xs text-zinc-400">
            {availableExercisesForMuscle.length} movements available in selected group
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              1. Muscle Group Filter
            </label>
            <select
              value={selectedMuscleGroup}
              onChange={e => setSelectedMuscleGroup(e.target.value as MuscleGroup | 'All')}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {MUSCLE_GROUPS_LIST.map(mg => (
                <option key={mg} value={mg}>
                  {mg === 'All' ? 'All Muscle Groups' : mg}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              2. Select Exercise
            </label>
            <select
              value={selectedExerciseId}
              onChange={e => setSelectedExerciseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {availableExercisesForMuscle.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.equipment})
                </option>
              ))}
              <option value="__custom__">+ Enter Custom Exercise Name...</option>
            </select>
          </div>
        </div>

        {selectedExerciseId === '__custom__' && (
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Custom Exercise Name
            </label>
            <input
              type="text"
              value={customExerciseName}
              onChange={e => setCustomExerciseName(e.target.value)}
              placeholder="Type custom exercise name (e.g. Viking Press, Ring Dips)"
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-amber-400/50 text-xs text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              3. Sets
            </label>
            <select
              value={selectedSets}
              onChange={e => setSelectedSets(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6].map(s => (
                <option key={s} value={s}>
                  {s} {s === 1 ? 'Set' : 'Sets'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              4. Reps
            </label>
            <select
              value={selectedReps}
              onChange={e => setSelectedReps(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="5">5 Reps</option>
              <option value="6-8">6-8 Reps</option>
              <option value="8-10">8-10 Reps</option>
              <option value="10-12">10-12 Reps</option>
              <option value="12-15">12-15 Reps</option>
              <option value="15-20">15-20 Reps</option>
              <option value="AMRAP">AMRAP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              5. Effort (RPE)
            </label>
            <select
              value={selectedRpe}
              onChange={e => setSelectedRpe(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={7}>RPE 7 (Moderate)</option>
              <option value={8}>RPE 8 (Hard - 2 in tank)</option>
              <option value={8.5}>RPE 8.5 (1-2 in tank)</option>
              <option value={9}>RPE 9 (1 in tank)</option>
              <option value={9.5}>RPE 9.5 (Maybe 1 more)</option>
              <option value={10}>RPE 10 (Max Effort)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              6. Rest
            </label>
            <select
              value={selectedRestSec}
              onChange={e => setSelectedRestSec(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value={60}>60s</option>
              <option value={90}>90s</option>
              <option value={120}>120s</option>
              <option value={180}>180s</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddExercise}
          className="w-full py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exercise to Day {activeDraftDayIdx + 1}</span>
        </button>
      </div>

      {/* Bottom Actions Bar */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-medium text-xs border border-zinc-700 transition-colors cursor-pointer"
        >
          Cancel & Return to Plans
        </button>

        <div className="flex items-center gap-2.5">
          {isAtPersonalizedPlanLimit ? (
            <button
              type="button"
              onClick={onOpenLimitModal}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Lock className="w-4 h-4" />
              <span>
                Upgrade to Pro to Save ({MAX_FREE_PERSONALIZED_PLANS}/{MAX_FREE_PERSONALIZED_PLANS}{' '}
                Limit)
              </span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onSavePlan(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs border border-zinc-700 transition-colors cursor-pointer"
              >
                Save Plan
              </button>
              <button
                type="button"
                onClick={() => onSavePlan(true)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save & Activate</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

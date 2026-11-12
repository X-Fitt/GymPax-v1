import React from 'react';
import { getGymAvatarById, resolvePersonAvatarUrl } from '../../data/gymAvatars';

interface GymAvatarProps {
  avatarId?: string;
  avatarUrl?: string;
  avatarType?: 'upload' | 'animated';
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallbackInitials?: string;
  showBadge?: boolean;
  animate?: boolean;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-28 h-28 text-3xl'
};

export const GymAvatar: React.FC<GymAvatarProps> = ({
  avatarId,
  avatarUrl,
  avatarType,
  name,
  size = 'md',
  className = '',
  fallbackInitials = 'AT',
  showBadge = false,
  animate = true
}) => {
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const character = getGymAvatarById(avatarId);
  const resolvedSrc = resolvePersonAvatarUrl({
    avatarUrl,
    avatarId,
    name,
    fallbackInitials
  });

  const displayInitials = (
    fallbackInitials ||
    (name ? name.replace(/\s*\(You\)\s*/i, '').trim().substring(0, 2) : 'AT')
  ).toUpperCase();

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 border border-zinc-700/80 bg-zinc-800 shadow-md flex items-center justify-center ${sizeClasses} ${className}`}
    >
      {resolvedSrc ? (
        <img
          src={resolvedSrc}
          alt={name || character?.name || 'Athlete Avatar'}
          className="w-full h-full object-cover object-[center_20%]"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : avatarType === 'animated' && character ? (
        <AnimatedCharacterSvg characterId={character.id} animate={animate} />
      ) : (
        <span className="text-amber-400 font-bold uppercase select-none tracking-tight">
          {displayInitials}
        </span>
      )}
      {showBadge && (
        <div
          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-zinc-950"
          style={{ backgroundColor: character?.accentColor || '#34d399' }}
          title={character?.badge || 'Active'}
        />
      )}
    </div>
  );
};

interface AnimatedSvgProps {
  characterId: string;
  animate: boolean;
}

export const AnimatedCharacterSvg: React.FC<AnimatedSvgProps> = ({ characterId, animate }) => {
  switch (characterId) {
    // ==================== MEN CHARACTERS ====================
    // 1. Marcus Titan - Heavyweight Powerlifter (Full beard, iron aura, broad traps, barbell behind)
    case 'gym_m1':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_m1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#92400e" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_m1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbd38d" />
              <stop offset="100%" stopColor="#d69e2e" />
            </linearGradient>
            <radialGradient id="aura_m1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F6721D" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#F6721D" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background circle */}
          <circle cx="50" cy="50" r="50" fill="url(#bg_m1)" />

          {/* Animated Power Barbell Aura */}
          {animate && (
            <circle cx="50" cy="50" r="44" fill="url(#aura_m1)">
              <animate attributeName="r" values="41;46;41" dur="2.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.6s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Heavy Steel Barbell resting behind traps */}
          <rect x="6" y="46" width="88" height="3" rx="1.5" fill="#a1a1aa" opacity="0.85" />
          <rect x="10" y="38" width="6" height="19" rx="2" fill="#d97706" />
          <rect x="84" y="38" width="6" height="19" rx="2" fill="#d97706" />

          {/* Breathing / Muscular Body Group */}
          <g>
            {animate && (
              <animateTransform
                attributeName="transform"
                type="translate"
                values="0,0; 0,-1.2; 0,0"
                dur="2.6s"
                repeatCount="indefinite"
              />
            )}
            {/* Traps & Broad Shoulders */}
            <path d="M16 100 Q32 64 50 64 Q68 64 84 100 Z" fill="#18181b" />
            {/* Powerlifting Singlet with Red Piping */}
            <path d="M30 68 L36 100 L64 100 L70 68 Q50 74 30 68 Z" fill="#b91c1c" />
            <path d="M36 68 L42 100 L58 100 L64 68 Z" fill="#18181b" />

            {/* Thick Muscular Neck */}
            <path d="M38 52 L38 68 L62 68 L62 52 Z" fill="url(#skin_m1)" />
            {/* Sternocleidomastoid shadow */}
            <path d="M43 56 L47 67" stroke="#b7791f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
            <path d="M57 56 L53 67" stroke="#b7791f" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

            {/* Jaw & Head */}
            <path d="M35 38 C35 25 65 25 65 38 C65 52 58 60 50 60 C42 60 35 52 35 38 Z" fill="url(#skin_m1)" />

            {/* Ears */}
            <circle cx="34" cy="42" r="3.5" fill="#d69e2e" />
            <circle cx="66" cy="42" r="3.5" fill="#d69e2e" />

            {/* Buzz Cut / Skin Fade Hair */}
            <path d="M34 37 C34 22 66 22 66 37 C66 32 60 26 50 26 C40 26 34 32 34 37 Z" fill="#292524" />

            {/* Clean Boxed Powerlifter Beard & Mustache */}
            <path
              d="M35 43 C35 55 42 61 50 61 C58 61 65 55 65 43 C64 47 61 52 50 53 C39 52 36 47 35 43 Z"
              fill="#292524"
            />
            {/* Mustache */}
            <path d="M42 50 Q50 48 58 50 Q50 54 42 50 Z" fill="#1c1917" />

            {/* Eyes & Intense Brow */}
            <path d="M39 36 L47 38" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M61 36 L53 38" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
            {/* Eye whites */}
            <ellipse cx="43" cy="41" rx="3" ry="2" fill="#ffffff" />
            <ellipse cx="57" cy="41" rx="3" ry="2" fill="#ffffff" />
            {/* Iris & Pupil */}
            <circle cx="43.5" cy="41" r="1.5" fill="#78350f" />
            <circle cx="56.5" cy="41" r="1.5" fill="#78350f" />
            <circle cx="43.2" cy="40.6" r="0.6" fill="#ffffff" />
            <circle cx="56.2" cy="40.6" r="0.6" fill="#ffffff" />

            {/* Nose shadow */}
            <path d="M49 42 L51 46 L48 47" stroke="#b7791f" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        </svg>
      );

    // 2. Jax Beast - Chiseled Bodybuilder (Backward cap, wireless gym headphones, chiseled jaw)
    case 'gym_m2':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_m2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="60%" stopColor="#172554" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_m2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_m2)" />

          {/* Audio Beats Glow */}
          {animate && (
            <circle cx="50" cy="45" r="41" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 6" fill="none" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" values="0 50 45; 360 50 45" dur="14s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Muscular Shoulders & Royal Blue Stringer */}
          <path d="M16 100 Q32 64 50 64 Q68 64 84 100 Z" fill="#09090b" />
          <path d="M30 68 L36 100 L64 100 L70 68 Q50 75 30 68 Z" fill="#2563eb" />
          {/* Subtle Gold Gym Chain */}
          <path d="M42 66 Q50 76 58 66" stroke="#facc15" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Neck with Muscle Tone */}
          <path d="M40 52 L40 68 L60 68 L60 52 Z" fill="url(#skin_m2)" />

          {/* Chiseled Head Silhouette */}
          <path d="M36 38 C36 26 64 26 64 38 C64 51 58 59 50 59 C42 59 36 51 36 38 Z" fill="url(#skin_m2)" />

          {/* Subtle 5 o'clock shadow along jawline */}
          <path d="M38 46 C38 54 44 58 50 58 C56 58 62 54 62 46 C60 51 56 54 50 54 C44 54 40 51 38 46 Z" fill="#78350f" opacity="0.35" />

          {/* Focused Eyes & Confident Brows */}
          <path d="M40 37 L47 38" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M60 37 L53 38" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="43.5" cy="41" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="41" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="44" cy="41" r="1.4" fill="#0284c7" />
          <circle cx="56" cy="41" r="1.4" fill="#0284c7" />
          <circle cx="43.6" cy="40.7" r="0.5" fill="#ffffff" />
          <circle cx="55.6" cy="40.7" r="0.5" fill="#ffffff" />

          {/* Nose & Confident Smile */}
          <path d="M49 43 L51 47 L48 48" stroke="#c2410c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M45 52 Q50 55 55 52" stroke="#1c1917" strokeWidth="1.6" fill="none" strokeLinecap="round" />

          {/* Backward Snapback Baseball Cap (Navy with amber button) */}
          <path d="M33 36 C33 24 67 24 67 36 L68 40 L32 40 Z" fill="#1e40af" />
          <ellipse cx="50" cy="40" rx="18" ry="3" fill="#172554" />
          <rect x="47" y="24" width="6" height="4" rx="2" fill="#F6721D" />

          {/* Premium Over-Ear Gym Studio Headphones */}
          <path d="M28 41 Q50 18 72 41" stroke="#334155" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          {/* Left Cushion */}
          <rect x="25" y="36" width="6" height="15" rx="3" fill="#0284c7" />
          <rect x="26.5" y="39" width="3" height="9" rx="1.5" fill="#38bdf8" />
          {/* Right Cushion */}
          <rect x="69" y="36" width="6" height="15" rx="3" fill="#0284c7" />
          <rect x="70.5" y="39" width="3" height="9" rx="1.5" fill="#38bdf8" />
        </svg>
      );

    // 3. Leo Striker - CrossFit & Functional Athlete (Athletic sweatband, textured hair, intense focus)
    case 'gym_m3':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_m3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="50%" stopColor="#450a0a" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_m3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_m3)" />

          {/* Energetic Workout Sparks */}
          {animate && (
            <g fill="#fef08a">
              <circle cx="20" cy="28" r="1.5">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="30" r="1.5">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Athletic Torso & Crimson Performance Tee */}
          <path d="M16 100 Q32 64 50 64 Q68 64 84 100 Z" fill="#18181b" />
          <path d="M28 70 L34 100 L66 100 L72 70 Q50 76 28 70 Z" fill="#dc2626" />
          {/* Black ergonomic shoulder panelling */}
          <path d="M16 100 L28 70 L34 84 L24 100 Z" fill="#09090b" />
          <path d="M84 100 L72 70 L66 84 L76 100 Z" fill="#09090b" />

          {/* Strong Neck */}
          <path d="M40 52 L40 68 L60 68 L60 52 Z" fill="url(#skin_m3)" />

          {/* Face */}
          <path d="M36 38 C36 26 64 26 64 38 C64 51 58 59 50 59 C42 59 36 51 36 38 Z" fill="url(#skin_m3)" />

          {/* Athletic Red Sweatband across forehead */}
          <rect x="33" y="32" width="34" height="6.5" rx="2.5" fill="#ef4444" />
          <line x1="33" y1="35.2" x2="67" y2="35.2" stroke="#ffffff" strokeWidth="1.2" />

          {/* Stylish Textured Athletic Hair flowing over the sweatband */}
          <path
            d="M33 33 C33 20 44 20 48 24 C52 18 60 21 64 26 C67 22 68 28 67 33 C64 30 58 31 54 31 C46 31 38 31 33 33 Z"
            fill="#27272a"
          />

          {/* Fierce Determined Eyes */}
          <path d="M40 37 L46 39" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M60 37 L54 39" stroke="#1c1917" strokeWidth="2.4" strokeLinecap="round" />
          <ellipse cx="43.5" cy="42" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="42" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="42" r="1.4" fill="#18181b" />
          <circle cx="56.2" cy="42" r="1.4" fill="#18181b" />
          <circle cx="43.4" cy="41.7" r="0.5" fill="#ffffff" />
          <circle cx="55.8" cy="41.7" r="0.5" fill="#ffffff" />

          {/* Nose & Clean Mouth */}
          <path d="M49 44 L51 48 L48 49" stroke="#ea580c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M46 53 L54 53" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    // 4. Kai Shadow - Calisthenics Master (Athletic cowl hoodie, modern high fade, clear handsome face)
    case 'gym_m4':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_m4" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#065f46" />
              <stop offset="60%" stopColor="#042f2e" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_m4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_m4)" />

          {/* Hanging Gymnastics Ring Silhouette */}
          {animate && (
            <g opacity="0.45">
              <line x1="22" y1="0" x2="22" y2="28" stroke="#34d399" strokeWidth="1.2" />
              <circle cx="22" cy="34" r="6" stroke="#34d399" strokeWidth="1.8" fill="none">
                <animateTransform attributeName="transform" type="rotate" values="-4 22 0; 4 22 0; -4 22 0" dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Muscular Torso & Sleeveless Emerald Hoodie */}
          <path d="M16 100 Q32 64 50 64 Q68 64 84 100 Z" fill="#09090b" />
          <path d="M30 68 L36 100 L64 100 L70 68 Q50 75 30 68 Z" fill="#047857" />

          {/* Athletic Cowl / Hoodie Neck (Draped cleanly around neck, face 100% visible) */}
          <path d="M28 66 Q50 82 72 66 Q62 58 50 60 Q38 58 28 66 Z" fill="#18181b" stroke="#059669" strokeWidth="1" />

          {/* Neck */}
          <path d="M40 50 L40 64 L60 64 L60 50 Z" fill="url(#skin_m4)" />

          {/* Handsome Chiseled Face */}
          <path d="M36 36 C36 24 64 24 64 36 C64 50 58 58 50 58 C42 58 36 50 36 36 Z" fill="url(#skin_m4)" />

          {/* Modern Textured Crop with High Skin Fade */}
          <path d="M35 34 C35 20 65 20 65 34 C65 28 59 23 50 23 C41 23 35 28 35 34 Z" fill="#18181b" />
          <path d="M38 27 L44 32 L48 27 L54 32 L58 27 L63 33" stroke="#27272a" strokeWidth="1.5" strokeLinecap="round" />

          {/* Sharp Aesthetic Eyes with Emerald Glow */}
          <path d="M40 35 L47 36" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M60 35 L53 36" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="43.5" cy="39.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="39.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="39.5" r="1.4" fill="#059669" />
          <circle cx="56.2" cy="39.5" r="1.4" fill="#059669" />
          <circle cx="43.5" cy="39.2" r="0.5" fill="#ffffff" />
          <circle cx="55.9" cy="39.2" r="0.5" fill="#ffffff" />

          {/* Defined Jawline, Nose, and Athletic Mouth */}
          <path d="M49 42 L51 46 L48 47" stroke="#b45309" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M45 51 Q50 53 55 51" stroke="#1c1917" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    // 5. Dorian Classic - Golden-Era Bodybuilder (Vintage gold stringer, styled 70s wavy hair, neat classic mustache)
    case 'gym_m5':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_m5" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#854d0e" />
              <stop offset="50%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_m5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_m5)" />

          {/* Golden Retro Sparkle */}
          {animate && (
            <path d="M78 22 L80 26 L84 28 L80 30 L78 34 L76 30 L72 28 L76 26 Z" fill="#facc15">
              <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
            </path>
          )}

          {/* Massive Traps & Golden-Era Stringer Tank */}
          <path d="M16 100 Q32 64 50 64 Q68 64 84 100 Z" fill="#18181b" />
          <path d="M34 68 L38 100 L62 100 L66 68 Q50 74 34 68 Z" fill="#eab308" />
          <path d="M40 70 L40 100" stroke="#ca8a04" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* Muscular Neck */}
          <path d="M40 52 L40 68 L60 68 L60 52 Z" fill="url(#skin_m5)" />

          {/* Defined Classic Face */}
          <path d="M36 38 C36 26 64 26 64 38 C64 51 58 59 50 59 C42 59 36 51 36 38 Z" fill="url(#skin_m5)" />

          {/* Classic Wavy 70s Feathered Hair */}
          <path
            d="M32 36 C32 20 46 18 50 21 C54 18 68 20 68 36 C72 40 68 45 66 38 C64 31 58 26 50 26 C42 26 36 31 34 38 C32 45 28 40 32 36 Z"
            fill="#78350f"
          />

          {/* Warm, Charismatic Eyes */}
          <path d="M40 36 L47 37" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M60 36 L53 37" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="43.5" cy="40.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="40.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="44" cy="40.5" r="1.4" fill="#451a03" />
          <circle cx="56" cy="40.5" r="1.4" fill="#451a03" />
          <circle cx="43.6" cy="40.2" r="0.5" fill="#ffffff" />
          <circle cx="55.6" cy="40.2" r="0.5" fill="#ffffff" />

          {/* Nose & Groomed Golden-Era Mustache */}
          <path d="M49 42 L51 46 L48 47" stroke="#c2410c" strokeWidth="1" fill="none" strokeLinecap="round" />
          {/* Well-sculpted classic mustache */}
          <path
            d="M42 49 C45 47 48 48 50 49 C52 48 55 47 58 49 C60 52 57 53 50 52 C43 53 40 52 42 49 Z"
            fill="#451a03"
          />
          {/* Confident Champion Smile */}
          <path d="M45 54 Q50 56.5 55 54" stroke="#ffffff" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </svg>
      );

    // ==================== WOMEN CHARACTERS ====================
    // 6. Freya Valkyrie - Power Valkyrie (Warrior ponytail with neat braid, athletic singlet, fierce eyes)
    case 'gym_w1':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_w1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9d174d" />
              <stop offset="60%" stopColor="#4c0519" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_w1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#fba372" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_w1)" />

          {/* Warrior Rune Glow */}
          {animate && (
            <circle cx="50" cy="50" r="43" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.45">
              <animateTransform attributeName="transform" type="rotate" values="0 50 50; 360 50 50" dur="18s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Athletic Shoulders & Dark Crimson Singlet */}
          <path d="M18 100 Q34 66 50 66 Q66 66 82 100 Z" fill="#18181b" />
          <path d="M30 70 L36 100 L64 100 L70 70 Q50 76 30 70 Z" fill="#be123c" />
          {/* Silver Singlet Straps */}
          <path d="M30 70 L34 100" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M70 70 L66 100" stroke="#e2e8f0" strokeWidth="1.5" />

          {/* Graceful Muscular Neck */}
          <path d="M42 52 L42 66 L58 66 L58 52 Z" fill="url(#skin_w1)" />

          {/* Warrior Hair - Flowing Braid behind right shoulder */}
          <path
            d="M58 28 C68 34 74 46 72 65 C70 78 66 88 64 96"
            stroke="#92400e"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Silver hair wrap bands */}
          <circle cx="68" cy="46" r="2.5" fill="#e2e8f0" />
          <circle cx="70" cy="64" r="2.5" fill="#e2e8f0" />

          {/* Athletic Feminine Jawline & Head */}
          <path d="M37 36 C37 24 63 24 63 36 C63 49 57 58 50 58 C43 58 37 49 37 36 Z" fill="url(#skin_w1)" />

          {/* Cheek Contour & Soft Blush */}
          <ellipse cx="41" cy="45" rx="3" ry="1.5" fill="#fb7185" opacity="0.3" />
          <ellipse cx="59" cy="45" rx="3" ry="1.5" fill="#fb7185" opacity="0.3" />

          {/* High Warrior Ponytail on Crown with framing bangs */}
          <path d="M35 34 C35 22 65 22 65 34 C63 26 58 23 50 23 C42 23 37 26 35 34 Z" fill="#92400e" />
          <circle cx="56" cy="24" r="4" fill="#b45309" />

          {/* Fierce Arched Brows & Almond Eyes */}
          <path d="M39 34 Q44 32 47 35" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M61 34 Q56 32 53 35" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="43.5" cy="38.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="38.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="38.5" r="1.4" fill="#0284c7" />
          <circle cx="56.2" cy="38.5" r="1.4" fill="#0284c7" />
          <circle cx="43.4" cy="38.2" r="0.5" fill="#ffffff" />
          <circle cx="55.8" cy="38.2" r="0.5" fill="#ffffff" />

          {/* Nose & Confident Lip */}
          <path d="M49 41 L51 45 L48 46" stroke="#ea580c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M46 51 Q50 53 54 51" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // 7. Zara Sculpt - Hypertrophy & Aesthetic Queen (Studio gym headphones, sleek high ponytail, violet theme)
    case 'gym_w2':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_w2" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6b21a8" />
              <stop offset="60%" stopColor="#3b0764" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_w2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_w2)" />

          {/* Shimmering Aesthetic Sparkles */}
          {animate && (
            <g fill="#c084fc">
              <circle cx="20" cy="26" r="1.5">
                <animate attributeName="opacity" values="0.2;1;0.2" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="32" r="1.8">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Sleek High Ponytail draped behind left shoulder */}
          <path d="M46 24 C34 28 26 42 24 60 C23 72 24 82 25 90" stroke="#18181b" strokeWidth="5.5" strokeLinecap="round" fill="none" />

          {/* Toned Delts & Purple Performance Crop */}
          <path d="M18 100 Q34 66 50 66 Q66 66 82 100 Z" fill="#09090b" />
          <path d="M30 70 L36 100 L64 100 L70 70 Q50 76 30 70 Z" fill="#7c3aed" />

          {/* Neck */}
          <path d="M42 52 L42 66 L58 66 L58 52 Z" fill="url(#skin_w2)" />

          {/* Sculpted Face */}
          <path d="M37 36 C37 24 63 24 63 36 C63 49 57 58 50 58 C43 58 37 49 37 36 Z" fill="url(#skin_w2)" />
          <ellipse cx="42" cy="46" rx="3" ry="1.5" fill="#c084fc" opacity="0.3" />
          <ellipse cx="58" cy="46" rx="3" ry="1.5" fill="#c084fc" opacity="0.3" />

          {/* Sleek Side-Swept Bangs */}
          <path d="M35 34 C35 22 65 22 65 34 C58 26 48 24 35 34 Z" fill="#18181b" />

          {/* Elegant Aesthetic Eyes */}
          <path d="M39 34 Q44 32 47 35" stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M61 34 Q56 32 53 35" stroke="#18181b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="43.5" cy="38.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="38.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="38.5" r="1.4" fill="#a855f7" />
          <circle cx="56.2" cy="38.5" r="1.4" fill="#a855f7" />
          <circle cx="43.4" cy="38.2" r="0.5" fill="#ffffff" />
          <circle cx="55.8" cy="38.2" r="0.5" fill="#ffffff" />

          {/* Nose & Glossy Lips */}
          <path d="M49 41 L51 45 L48 46" stroke="#c2410c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M46 51 Q50 54 54 51" stroke="#9333ea" strokeWidth="1.8" strokeLinecap="round" />

          {/* Modern Violet Studio Gym Headphones */}
          <path d="M30 38 Q50 18 70 38" stroke="#a855f7" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="27" y="34" width="5.5" height="13" rx="2.5" fill="#c084fc" />
          <rect x="67.5" y="34" width="5.5" height="13" rx="2.5" fill="#c084fc" />
        </svg>
      );

    // 8. Maya Flash - HIIT & Sprint Dynamo (Athletic headband above brows, neon cyan racerback)
    case 'gym_w3':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_w3" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0e7490" />
              <stop offset="60%" stopColor="#155e75" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_w3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fed7aa" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_w3)" />

          {/* Speed Energy Trails */}
          {animate && (
            <g stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round" opacity="0.6">
              <line x1="12" y1="36" x2="24" y2="36">
                <animate attributeName="x1" values="8;16;8" dur="1.1s" repeatCount="indefinite" />
              </line>
              <line x1="76" y1="26" x2="88" y2="26">
                <animate attributeName="x2" values="84;92;84" dur="1.1s" repeatCount="indefinite" />
              </line>
            </g>
          )}

          {/* Muscular Sprint Torso & Cyan Racerback */}
          <path d="M18 100 Q34 66 50 66 Q66 66 82 100 Z" fill="#09090b" />
          <path d="M30 70 L36 100 L64 100 L70 70 Q50 76 30 70 Z" fill="#0891b2" />
          <path d="M42 72 L58 72" stroke="#67e8f9" strokeWidth="2" strokeLinecap="round" />

          {/* Neck */}
          <path d="M42 52 L42 66 L58 66 L58 52 Z" fill="url(#skin_w3)" />

          {/* High Sprint Ponytail trailing backward */}
          <path d="M54 26 C66 18 76 26 80 40 C82 48 83 58 84 66" stroke="#451a03" strokeWidth="5.5" strokeLinecap="round" fill="none" />

          {/* Face */}
          <path d="M37 36 C37 24 63 24 63 36 C63 49 57 58 50 58 C43 58 37 49 37 36 Z" fill="url(#skin_w3)" />

          {/* Athletic Neon Cyan Headband (Positioned PROPERLY on forehead ABOVE brows!) */}
          <rect x="34" y="28" width="32" height="5.5" rx="2" fill="#06b6d4" />
          <line x1="34" y1="30.8" x2="66" y2="30.8" stroke="#ffffff" strokeWidth="1" />

          {/* Dark Hair Framing Forehead & Crown */}
          <path d="M34 29 C34 18 66 18 66 29 Z" fill="#451a03" />

          {/* Energetic, Laser-Focused Sprint Eyes */}
          <path d="M40 35 L46 36.5" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          <path d="M60 35 L54 36.5" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="43.5" cy="39" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="39" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="39" r="1.4" fill="#0891b2" />
          <circle cx="56.2" cy="39" r="1.4" fill="#0891b2" />
          <circle cx="43.4" cy="38.7" r="0.5" fill="#ffffff" />
          <circle cx="55.8" cy="38.7" r="0.5" fill="#ffffff" />

          {/* Nose & Smile */}
          <path d="M49 42 L51 46 L48 47" stroke="#ea580c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M46 51 Q50 54 54 51" stroke="#0e7490" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    // 9. Elena Snatch - Olympic Weightlifter (High messy gym bun, chalk mist, competition singlet)
    case 'gym_w4':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_w4" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9a3412" />
              <stop offset="50%" stopColor="#431407" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_w4" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_w4)" />

          {/* Chalk dust atmosphere */}
          {animate && (
            <g fill="#ffffff" opacity="0.6">
              <circle cx="24" cy="32" r="1.2">
                <animate attributeName="cy" values="36;26;36" dur="2.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="76" cy="36" r="1.4">
                <animate attributeName="cy" values="42;32;42" dur="2.6s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Olympic Barbell Behind Neck */}
          <rect x="6" y="47" width="88" height="2.5" rx="1.2" fill="#a1a1aa" opacity="0.8" />
          <rect x="10" y="39" width="5.5" height="18" rx="1.5" fill="#ea580c" />
          <rect x="84.5" y="39" width="5.5" height="18" rx="1.5" fill="#ea580c" />

          {/* Olympic Weightlifting Singlet */}
          <path d="M18 100 Q34 66 50 66 Q66 66 82 100 Z" fill="#18181b" />
          <path d="M30 70 L36 100 L64 100 L70 70 Q50 76 30 70 Z" fill="#ea580c" />

          {/* Muscular Neck */}
          <path d="M42 52 L42 66 L58 66 L58 52 Z" fill="url(#skin_w4)" />

          {/* Face */}
          <path d="M37 36 C37 24 63 24 63 36 C63 49 57 58 50 58 C43 58 37 49 37 36 Z" fill="url(#skin_w4)" />

          {/* Stylish High Messy Gym Bun (Sitting naturally on crown!) */}
          <circle cx="50" cy="20" r="7.5" fill="#292524" />
          <circle cx="46" cy="18" r="3.5" fill="#3f3f46" opacity="0.6" />
          {/* Red Scrunchie wrapping the bun */}
          <ellipse cx="50" cy="26" rx="6.5" ry="2.5" fill="#ef4444" />

          {/* Hair Front with soft side wisps */}
          <path d="M35 34 C35 22 65 22 65 34 C60 27 50 25 35 34 Z" fill="#292524" />

          {/* Laser-Focused Competition Eyes */}
          <path d="M39 34 L46 36" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M61 34 L54 36" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" />
          <ellipse cx="43.5" cy="39" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="39" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="39" r="1.4" fill="#18181b" />
          <circle cx="56.2" cy="39" r="1.4" fill="#18181b" />
          <circle cx="43.4" cy="38.7" r="0.5" fill="#ffffff" />
          <circle cx="55.8" cy="38.7" r="0.5" fill="#ffffff" />

          {/* Nose & Determined Mouth */}
          <path d="M49 42 L51 46 L48 47" stroke="#ea580c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M45 52 L55 52" stroke="#1c1917" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );

    // 10. Nadia Iron - Kettlebell Warrior (Bandana, wavy hair, teal tank, warm warrior confidence)
    case 'gym_w5':
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="bg_w5" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#134e4a" />
              <stop offset="60%" stopColor="#042f2e" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <linearGradient id="skin_w5" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="50" fill="url(#bg_w5)" />

          {/* Orbiting Kettlebell Animation */}
          {animate && (
            <g opacity="0.6">
              <circle cx="76" cy="32" r="4.5" fill="#14b8a6">
                <animateTransform attributeName="transform" type="rotate" values="0 50 50; 360 50 50" dur="10s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Athletic Torso & Deep Teal Tank */}
          <path d="M18 100 Q34 66 50 66 Q66 66 82 100 Z" fill="#09090b" />
          <path d="M30 70 L36 100 L64 100 L70 70 Q50 76 30 70 Z" fill="#0d9488" />

          {/* Neck */}
          <path d="M42 52 L42 66 L58 66 L58 52 Z" fill="url(#skin_w5)" />

          {/* Face */}
          <path d="M37 36 C37 24 63 24 63 36 C63 49 57 58 50 58 C43 58 37 49 37 36 Z" fill="url(#skin_w5)" />

          {/* Dark Wavy Hair framing the sides */}
          <path d="M33 36 C30 46 32 58 35 66" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M67 36 C70 46 68 58 65 66" stroke="#1c1917" strokeWidth="4.5" strokeLinecap="round" fill="none" />

          {/* Crimson Warrior Bandana tied naturally across forehead */}
          <path d="M33 30 Q50 24 67 30 L68 36 Q50 31 32 36 Z" fill="#dc2626" />
          <circle cx="67" cy="35" r="2.5" fill="#b91c1c" />

          {/* Warm, Confident Eyes */}
          <path d="M39 34 Q44 32 47 35" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M61 34 Q56 32 53 35" stroke="#1c1917" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="43.5" cy="38.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <ellipse cx="56.5" cy="38.5" rx="2.8" ry="1.8" fill="#ffffff" />
          <circle cx="43.8" cy="38.5" r="1.4" fill="#0d9488" />
          <circle cx="56.2" cy="38.5" r="1.4" fill="#0d9488" />
          <circle cx="43.4" cy="38.2" r="0.5" fill="#ffffff" />
          <circle cx="55.8" cy="38.2" r="0.5" fill="#ffffff" />

          {/* Nose & Warm Confident Smile */}
          <path d="M49 41 L51 45 L48 46" stroke="#ea580c" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M45 51 Q50 54.5 55 51" stroke="#be123c" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );

    default:
      return null;
  }
};

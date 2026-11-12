import React from 'react';
import { getUniquePlanThumbnailUrl, getUniqueRoutineThumbnailUrl } from './planThumbnails';

export interface FitnessPicture {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  svgMarkup: string;
}

// Map exercises to fitness model artwork
export function getExerciseModelPicture(exerciseId: string, primaryMuscle?: string): string {
  const id = exerciseId.toLowerCase();

  // Bench Press
  if (id.includes('incline') && id.includes('dumbbell')) {
    return MODEL_PICTURES.incline_dumbbell;
  }
  if (id.includes('bench') || id.includes('chest_press')) {
    return MODEL_PICTURES.bench_press;
  }
  if (id.includes('flye') || id.includes('crossover')) {
    return MODEL_PICTURES.cable_flye;
  }
  if (id.includes('dip')) {
    return MODEL_PICTURES.chest_dips;
  }

  // Squats & Legs
  if (id.includes('squat')) {
    return MODEL_PICTURES.squat;
  }
  if (id.includes('leg_press') || id.includes('hack')) {
    return MODEL_PICTURES.leg_press;
  }
  if (id.includes('rdl') || id.includes('romanian')) {
    return MODEL_PICTURES.romanian_deadlift;
  }
  if (id.includes('deadlift')) {
    return MODEL_PICTURES.deadlift;
  }
  if (id.includes('calf')) {
    return MODEL_PICTURES.calf_raises;
  }
  if (id.includes('leg_curl') || id.includes('hamstring')) {
    return MODEL_PICTURES.romanian_deadlift;
  }
  if (id.includes('leg_extension') || id.includes('quad')) {
    return MODEL_PICTURES.squat;
  }

  // Back & Pull
  if (id.includes('lat_pulldown') || id.includes('pulldown')) {
    return MODEL_PICTURES.lat_pulldown;
  }
  if (id.includes('pull_up') || id.includes('chin_up') || id.includes('pullup')) {
    return MODEL_PICTURES.pullups;
  }
  if (id.includes('row')) {
    return MODEL_PICTURES.barbell_row;
  }

  // Shoulders
  if (id.includes('overhead') || id.includes('military') || id.includes('shoulder_press')) {
    return MODEL_PICTURES.overhead_press;
  }
  if (id.includes('lateral') || id.includes('rear_delt')) {
    return MODEL_PICTURES.lateral_raises;
  }

  // Arms
  if (id.includes('curl') || id.includes('bicep')) {
    return MODEL_PICTURES.bicep_curl;
  }
  if (id.includes('tricep') || id.includes('skull_crusher') || id.includes('pushdown')) {
    return MODEL_PICTURES.tricep_pushdown;
  }

  // Abs & Core
  if (id.includes('ab') || id.includes('leg_raise') || id.includes('crunch') || id.includes('plank')) {
    return MODEL_PICTURES.hanging_leg_raise;
  }

  // Fallback by muscle group
  if (primaryMuscle === 'Chest') return MODEL_PICTURES.bench_press;
  if (primaryMuscle === 'Back') return MODEL_PICTURES.lat_pulldown;
  if (primaryMuscle === 'Quads' || primaryMuscle === 'Glutes') return MODEL_PICTURES.squat;
  if (primaryMuscle === 'Hamstrings') return MODEL_PICTURES.romanian_deadlift;
  if (primaryMuscle === 'Shoulders') return MODEL_PICTURES.overhead_press;
  if (primaryMuscle === 'Biceps') return MODEL_PICTURES.bicep_curl;
  if (primaryMuscle === 'Triceps') return MODEL_PICTURES.tricep_pushdown;
  if (primaryMuscle === 'Calves') return MODEL_PICTURES.calf_raises;

  return MODEL_PICTURES.bench_press;
}

export const MODEL_PICTURES = {
  // BARBELL BENCH PRESS (Male fitness model with muscular chest, arched on bench pressing Olympic bar)
  bench_press: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a0c10"/>
          <stop offset="100%" stop-color="#141822"/>
        </linearGradient>
        <linearGradient id="skin-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f87171"/>
          <stop offset="40%" stop-color="#dc2626"/>
          <stop offset="100%" stop-color="#991b1b"/>
        </linearGradient>
        <linearGradient id="body-physique" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fdba74"/>
          <stop offset="50%" stop-color="#ea580c"/>
          <stop offset="100%" stop-color="#9a3412"/>
        </linearGradient>
        <radialGradient id="gym-spot" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stop-color="#F6721D" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="320" height="220" fill="url(#bp-bg)"/>
      <circle cx="160" cy="40" r="120" fill="url(#gym-spot)"/>
      
      <!-- Gym Bench Structure -->
      <rect x="50" y="145" width="220" height="14" rx="4" fill="#18181b" stroke="#3f3f46" stroke-width="1.5"/>
      <rect x="90" y="159" width="12" height="45" fill="#27272a"/>
      <rect x="220" y="159" width="12" height="45" fill="#27272a"/>
      <!-- Bench Upright Supports -->
      <line x1="80" y1="80" x2="80" y2="160" stroke="#52525b" stroke-width="4"/>
      <line x1="240" y1="80" x2="240" y2="160" stroke="#52525b" stroke-width="4"/>

      <!-- Fitness Model Silhouette on Bench -->
      <!-- Head on bench pad -->
      <circle cx="95" cy="135" r="14" fill="#fb923c"/>
      <path d="M 85 130 Q 95 120 105 130" fill="#27272a"/>
      
      <!-- Torso with arched back & pumped chest -->
      <path d="M 105 142 Q 135 125 165 138 Q 200 144 220 146" stroke="#fb923c" stroke-width="22" stroke-linecap="round" fill="none"/>
      <!-- Pectoral Muscle Striation Highlight -->
      <path d="M 125 128 Q 150 115 175 130" stroke="#F6721D" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Left Arm & Right Arm pressing upwards -->
      <path d="M 135 130 L 150 82 L 152 50" stroke="#fdba74" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 165 130 L 175 82 L 170 50" stroke="#ea580c" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Legs Planted on Gym Floor -->
      <path d="M 215 146 L 240 170 L 245 205" stroke="#3b82f6" stroke-width="14" stroke-linecap="round" fill="none"/>
      <!-- Shoe planted -->
      <rect x="235" y="202" width="28" height="10" rx="3" fill="#ffffff"/>

      <!-- Olympic Barbell Loaded with Steel Plates -->
      <g transform="translate(0, -10)">
        <rect x="30" y="55" width="260" height="8" rx="2" fill="#e2e8f0" stroke="#64748b" stroke-width="1"/>
        <!-- Weight Plates Left -->
        <rect x="45" y="25" width="10" height="68" rx="3" fill="#1e293b" stroke="#F6721D" stroke-width="1.5"/>
        <rect x="56" y="30" width="8" height="58" rx="2" fill="#334155"/>
        <!-- Weight Plates Right -->
        <rect x="265" y="25" width="10" height="68" rx="3" fill="#1e293b" stroke="#F6721D" stroke-width="1.5"/>
        <rect x="256" y="30" width="8" height="58" rx="2" fill="#334155"/>
        <!-- Chalk Dust & Energy Arc -->
        <circle cx="152" cy="50" r="4" fill="#fef08a" opacity="0.9"/>
        <circle cx="170" cy="50" r="4" fill="#fef08a" opacity="0.9"/>
      </g>

      <!-- Badge Label -->
      <rect x="10" y="10" width="84" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#F6721D" stroke-width="1"/>
      <text x="52" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fde68a" text-anchor="middle">CHEST PRESS</text>
    </svg>
  `,

  // INCLINE DUMBBELL PRESS (Model on 30° incline bench)
  incline_dumbbell: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="inc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0c0a14"/>
          <stop offset="100%" stop-color="#191326"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#inc-bg)"/>
      <circle cx="160" cy="50" r="100" fill="#a855f7" fill-opacity="0.18"/>

      <!-- Incline Bench 30 degrees -->
      <line x1="80" y1="180" x2="180" y2="85" stroke="#27272a" stroke-width="18" stroke-linecap="round"/>
      <rect x="70" y="175" width="55" height="14" rx="4" fill="#3f3f46"/>

      <!-- Model Head & Torso resting on incline pad -->
      <circle cx="185" cy="80" r="13" fill="#fdba74"/>
      <path d="M 175 92 Q 145 125 115 170" stroke="#f97316" stroke-width="20" stroke-linecap="round" fill="none"/>
      <!-- Upper Chest clavicular fiber glow -->
      <path d="M 160 105 L 175 95" stroke="#fde047" stroke-width="4" stroke-linecap="round"/>

      <!-- Arms pressing 2 Heavy Hex Dumbbells up -->
      <!-- Left Arm -->
      <path d="M 155 110 L 130 65 L 125 35" stroke="#ea580c" stroke-width="10" stroke-linecap="round" fill="none"/>
      <!-- Left Dumbbell -->
      <rect x="110" y="28" width="30" height="7" rx="2" fill="#cbd5e1"/>
      <polygon points="104,18 114,18 118,45 104,45" fill="#334155" stroke="#a855f7" stroke-width="1"/>
      <polygon points="136,18 146,18 146,45 132,45" fill="#334155" stroke="#a855f7" stroke-width="1"/>

      <!-- Right Arm -->
      <path d="M 170 105 L 195 65 L 190 35" stroke="#fdba74" stroke-width="10" stroke-linecap="round" fill="none"/>
      <!-- Right Dumbbell -->
      <rect x="175" y="28" width="30" height="7" rx="2" fill="#cbd5e1"/>
      <polygon points="169,18 179,18 183,45 169,45" fill="#334155" stroke="#a855f7" stroke-width="1"/>
      <polygon points="201,18 211,18 211,45 197,45" fill="#334155" stroke="#a855f7" stroke-width="1"/>

      <!-- Legs planted -->
      <path d="M 110 170 L 130 195 L 140 215" stroke="#3b82f6" stroke-width="12" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="94" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#c084fc" stroke-width="1"/>
      <text x="57" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#f5d0fe" text-anchor="middle">INCLINE CHEST</text>
    </svg>
  `,

  // BARBELL BACK SQUAT (Model in squat rack, deep parallel squat, quad flare)
  squat: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sq-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a100d"/>
          <stop offset="100%" stop-color="#142119"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#sq-bg)"/>
      <circle cx="160" cy="90" r="110" fill="#10b981" fill-opacity="0.18"/>

      <!-- Power Rack Posts Left & Right -->
      <line x1="60" y1="20" x2="60" y2="210" stroke="#3f3f46" stroke-width="6"/>
      <line x1="260" y1="20" x2="260" y2="210" stroke="#3f3f46" stroke-width="6"/>
      <line x1="60" y1="160" x2="260" y2="160" stroke="#27272a" stroke-width="3" stroke-dasharray="6,6"/>

      <!-- Lifter Model in Deep Squat (Hips below parallel, knees out, chest proud) -->
      <!-- Head with determination -->
      <circle cx="160" cy="70" r="13" fill="#fdba74"/>

      <!-- Powerful Traps & Upper Back holding bar -->
      <path d="M 140 85 Q 160 80 180 85" stroke="#f97316" stroke-width="14" stroke-linecap="round" fill="none"/>
      <!-- Torso upright braced core -->
      <path d="M 160 85 L 160 125" stroke="#ea580c" stroke-width="22" stroke-linecap="round" fill="none"/>

      <!-- Hands gripping barbell outside shoulders -->
      <path d="M 140 85 L 125 75 L 115 75" stroke="#fdba74" stroke-width="6" stroke-linecap="round" fill="none"/>
      <path d="M 180 85 L 195 75 L 205 75" stroke="#fdba74" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Massive Quads / Thighs in Deep Squat position -->
      <path d="M 152 125 L 115 138 L 120 185" stroke="#10b981" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 168 125 L 205 138 L 200 185" stroke="#10b981" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Planted Lifting Shoes with flat heel -->
      <rect x="105" y="182" width="28" height="10" rx="3" fill="#f8fafc"/>
      <rect x="187" y="182" width="28" height="10" rx="3" fill="#f8fafc"/>

      <!-- Heavy Olympic Barbell with Red Calibrated Plates -->
      <g transform="translate(0, 0)">
        <rect x="25" y="72" width="270" height="8" rx="2" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
        <!-- Left 25kg Plates Stack -->
        <rect x="40" y="32" width="12" height="88" rx="3" fill="#dc2626" stroke="#f87171" stroke-width="1.5"/>
        <rect x="53" y="32" width="10" height="88" rx="3" fill="#dc2626"/>
        <!-- Right 25kg Plates Stack -->
        <rect x="268" y="32" width="12" height="88" rx="3" fill="#dc2626" stroke="#f87171" stroke-width="1.5"/>
        <rect x="257" y="32" width="10" height="88" rx="3" fill="#dc2626"/>
      </g>

      <rect x="10" y="10" width="86" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#10b981" stroke-width="1"/>
      <text x="53" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#a7f3d0" text-anchor="middle">SQUAT DEPTH</text>
    </svg>
  `,

  // DEADLIFT (Model pulling from floor, chalk on hands, spine lock, traps flexed)
  deadlift: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#140a0a"/>
          <stop offset="100%" stop-color="#241010"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#dl-bg)"/>
      <circle cx="160" cy="110" r="110" fill="#ef4444" fill-opacity="0.18"/>

      <!-- Lifting Platform Timber Board -->
      <rect x="20" y="195" width="280" height="15" rx="3" fill="#78350f" stroke="#451a03" stroke-width="1.5"/>

      <!-- Lifter Silhouette in Lockout / Drive -->
      <!-- Head focused forward -->
      <circle cx="160" cy="55" r="13" fill="#fdba74"/>
      <!-- Traps, Upper Back & Spine -->
      <path d="M 145 68 Q 160 62 175 68" stroke="#f97316" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M 160 68 L 160 120" stroke="#ea580c" stroke-width="20" stroke-linecap="round" fill="none"/>

      <!-- Arms Hanging Straight down with mixed grip / chalk -->
      <path d="M 148 72 L 138 135" stroke="#fdba74" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M 172 72 L 182 135" stroke="#fdba74" stroke-width="9" stroke-linecap="round" fill="none"/>

      <!-- Powerful Hamstrings, Glutes & Calves Driving into floor -->
      <path d="M 154 120 L 140 155 L 142 195" stroke="#ef4444" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 166 120 L 180 155 L 178 195" stroke="#ef4444" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Barbell at mid-shin / knee height -->
      <rect x="25" y="132" width="270" height="8" rx="2" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
      <!-- Huge Deadlift Bumper Plates on Floor -->
      <rect x="42" y="85" width="16" height="110" rx="4" fill="#18181b" stroke="#ef4444" stroke-width="2"/>
      <rect x="59" y="85" width="14" height="110" rx="4" fill="#1e293b"/>
      <rect x="262" y="85" width="16" height="110" rx="4" fill="#18181b" stroke="#ef4444" stroke-width="2"/>
      <rect x="247" y="85" width="14" height="110" rx="4" fill="#1e293b"/>

      <!-- Chalk Dust Cloud on Barbell -->
      <circle cx="138" cy="135" r="7" fill="#ffffff" opacity="0.6"/>
      <circle cx="182" cy="135" r="7" fill="#ffffff" opacity="0.6"/>

      <rect x="10" y="10" width="80" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#ef4444" stroke-width="1"/>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fca5a5" text-anchor="middle">DEADLIFT</text>
    </svg>
  `,

  // LAT PULLDOWN (Model viewed from behind, massive V-taper lat flare)
  lat_pulldown: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lat-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#041624"/>
          <stop offset="100%" stop-color="#082840"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#lat-bg)"/>
      <circle cx="160" cy="80" r="100" fill="#0284c7" fill-opacity="0.2"/>

      <!-- Machine Overhead Cable Tower & Pulley -->
      <line x1="160" y1="10" x2="160" y2="45" stroke="#38bdf8" stroke-width="3"/>
      <circle cx="160" cy="20" r="10" fill="#082f49" stroke="#38bdf8" stroke-width="1.5"/>

      <!-- Wide Lat Bar being pulled down -->
      <path d="M 50 65 Q 160 52 270 65" stroke="#e2e8f0" stroke-width="7" stroke-linecap="round" fill="none"/>
      <!-- Hanging cable in center -->
      <line x1="160" y1="20" x2="160" y2="55" stroke="#94a3b8" stroke-width="2.5"/>

      <!-- Lifter Back Anatomy: Wide V-Taper Lats flared out -->
      <circle cx="160" cy="72" r="13" fill="#fdba74"/>
      <!-- Rear Traps & Rhomboids -->
      <path d="M 140 85 L 160 80 L 180 85" stroke="#f97316" stroke-width="10" stroke-linecap="round" fill="none"/>

      <!-- V-Taper Latissimus Dorsi (Wide Wings) -->
      <polygon points="110,105 160,82 210,105 185,155 135,155" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <!-- Spinal erector & waist taper -->
      <path d="M 160 90 L 160 155" stroke="#bae6fd" stroke-width="3" stroke-dasharray="3,3"/>

      <!-- Arms pulling the bar down (biceps flexed, elbows driving down) -->
      <path d="M 135 95 L 90 75 L 75 66" stroke="#fdba74" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 185 95 L 230 75 L 245 66" stroke="#fdba74" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Pulldown Thigh Pad & Seat -->
      <rect x="130" y="160" width="60" height="15" rx="4" fill="#1e293b"/>
      <rect x="110" y="178" width="100" height="12" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1"/>

      <rect x="10" y="10" width="86" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#38bdf8" stroke-width="1"/>
      <text x="53" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#bae6fd" text-anchor="middle">LAT V-TAPER</text>
    </svg>
  `,

  // BICEP CURL (Model standing with peaked bicep peak contraction)
  bicep_curl: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#140f04"/>
          <stop offset="100%" stop-color="#241a08"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#bc-bg)"/>
      <circle cx="160" cy="90" r="100" fill="#F6721D" fill-opacity="0.2"/>

      <!-- Lifter Front/Side Profile -->
      <circle cx="160" cy="50" r="14" fill="#fdba74"/>
      <!-- Athletic Torso & Shoulders -->
      <path d="M 135 68 Q 160 62 185 68" stroke="#f97316" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M 160 68 L 160 145" stroke="#ea580c" stroke-width="22" stroke-linecap="round" fill="none"/>

      <!-- Left Arm in Peak Contraction: High Mountain Peak Bicep -->
      <path d="M 140 70 L 132 105 L 140 78" stroke="#fdba74" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <!-- Glowing Bicep Peak -->
      <circle cx="134" cy="90" r="10" fill="#F6721D" stroke="#fef08a" stroke-width="1.5"/>

      <!-- Right Arm in Peak Contraction -->
      <path d="M 180 70 L 188 105 L 180 78" stroke="#fdba74" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <!-- Glowing Bicep Peak -->
      <circle cx="186" cy="90" r="10" fill="#F6721D" stroke="#fef08a" stroke-width="1.5"/>

      <!-- Heavy EZ-Curl Barbell with Plates -->
      <path d="M 110 75 Q 160 68 210 75" stroke="#e2e8f0" stroke-width="7" stroke-linecap="round" fill="none"/>
      <rect x="95" y="55" width="12" height="42" rx="3" fill="#1e293b" stroke="#F6721D" stroke-width="1.5"/>
      <rect x="213" y="55" width="12" height="42" rx="3" fill="#1e293b" stroke="#F6721D" stroke-width="1.5"/>

      <!-- Legs in solid athletic stance -->
      <path d="M 152 145 L 145 205" stroke="#3b82f6" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M 168 145 L 175 205" stroke="#3b82f6" stroke-width="14" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="82" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#F6721D" stroke-width="1"/>
      <text x="51" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fde68a" text-anchor="middle">BICEP PEAK</text>
    </svg>
  `,

  // OVERHEAD PRESS (Model standing, locked out overhead, boulder delts)
  overhead_press: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="oh-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#140e1a"/>
          <stop offset="100%" stop-color="#241530"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#oh-bg)"/>
      <circle cx="160" cy="50" r="100" fill="#c084fc" fill-opacity="0.2"/>

      <!-- Barbell Locked Out Overhead -->
      <rect x="35" y="32" width="250" height="7" rx="2" fill="#e2e8f0" stroke="#475569" stroke-width="1"/>
      <!-- Plates -->
      <rect x="50" y="8" width="12" height="56" rx="3" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"/>
      <rect x="258" y="8" width="12" height="56" rx="3" fill="#3b82f6" stroke="#93c5fd" stroke-width="1.5"/>

      <!-- Straight Locked Out Arms into Shoulders -->
      <path d="M 115 35 L 140 75" stroke="#fdba74" stroke-width="11" stroke-linecap="round" fill="none"/>
      <path d="M 205 35 L 180 75" stroke="#fdba74" stroke-width="11" stroke-linecap="round" fill="none"/>

      <!-- Boulder Shoulders (Deltoids capped) -->
      <circle cx="138" cy="78" r="11" fill="#c084fc" stroke="#f3e8ff" stroke-width="1.5"/>
      <circle cx="182" cy="78" r="11" fill="#c084fc" stroke="#f3e8ff" stroke-width="1.5"/>

      <!-- Head tucked through window -->
      <circle cx="160" cy="75" r="12" fill="#fdba74"/>
      <!-- Torso braced core -->
      <path d="M 160 85 L 160 150" stroke="#ea580c" stroke-width="22" stroke-linecap="round" fill="none"/>

      <!-- Athletic Legs -->
      <path d="M 152 150 L 142 205" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M 168 150 L 178 205" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="88" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#c084fc" stroke-width="1"/>
      <text x="54" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#f5d0fe" text-anchor="middle">MILITARY OHP</text>
    </svg>
  `,

  // TRICEP PUSHDOWN (Model at cable stack with rope, horseshoe triceps flexed)
  tricep_pushdown: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#08141e"/>
          <stop offset="100%" stop-color="#102538"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#tp-bg)"/>
      <circle cx="160" cy="100" r="100" fill="#06b6d4" fill-opacity="0.2"/>

      <!-- Cable Pulley overhead -->
      <circle cx="160" cy="20" r="10" fill="#0e7490" stroke="#22d3ee" stroke-width="1.5"/>
      <line x1="160" y1="20" x2="160" y2="80" stroke="#38bdf8" stroke-width="2.5"/>

      <!-- Model Profile standing upright with slight hinge -->
      <circle cx="140" cy="65" r="13" fill="#fdba74"/>
      <path d="M 140 78 L 138 145" stroke="#ea580c" stroke-width="20" stroke-linecap="round" fill="none"/>

      <!-- Upper Arm pinned to ribcage, Forearm pushing rope down -->
      <path d="M 142 82 L 140 115" stroke="#fdba74" stroke-width="11" stroke-linecap="round" fill="none"/>
      <!-- Horseshoe Tricep Definition -->
      <ellipse cx="140" cy="98" rx="8" ry="12" fill="#06b6d4" stroke="#cffafe" stroke-width="1.5"/>

      <!-- Forearms extending down with rope split -->
      <path d="M 140 115 L 155 145" stroke="#fdba74" stroke-width="9" stroke-linecap="round" fill="none"/>
      <!-- Rope attachment flare -->
      <line x1="160" y1="80" x2="152" y2="148" stroke="#f1f5f9" stroke-width="4"/>
      <circle cx="152" cy="150" r="5" fill="#0f172a"/>

      <rect x="10" y="10" width="92" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#06b6d4" stroke-width="1"/>
      <text x="56" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#a5f3fc" text-anchor="middle">TRICEPS ROPE</text>
    </svg>
  `,

  // PULLUPS / CHINUPS (Model gripping pullup bar, back striations)
  pullups: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pu-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0c121e"/>
          <stop offset="100%" stop-color="#162035"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#pu-bg)"/>
      <circle cx="160" cy="70" r="100" fill="#3b82f6" fill-opacity="0.2"/>

      <!-- Pullup Bar Rig -->
      <line x1="40" y1="40" x2="280" y2="40" stroke="#e2e8f0" stroke-width="7" stroke-linecap="round"/>
      <line x1="70" y1="10" x2="70" y2="40" stroke="#64748b" stroke-width="5"/>
      <line x1="250" y1="10" x2="250" y2="40" stroke="#64748b" stroke-width="5"/>

      <!-- Hands Gripping Wide Bar -->
      <circle cx="110" cy="40" r="7" fill="#fdba74"/>
      <circle cx="210" cy="40" r="7" fill="#fdba74"/>

      <!-- Arms pulling body up to chin over bar -->
      <path d="M 110 40 L 125 75 L 142 85" stroke="#fdba74" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <path d="M 210 40 L 195 75 L 178 85" stroke="#fdba74" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Head peaking over bar -->
      <circle cx="160" cy="42" r="12" fill="#fdba74"/>
      <!-- V-Taper back with flared lats -->
      <polygon points="125,95 160,82 195,95 178,145 142,145" fill="#1d4ed8" stroke="#60a5fa" stroke-width="2"/>

      <!-- Legs crossed behind -->
      <path d="M 152 145 L 155 190" stroke="#1e293b" stroke-width="12" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="82" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#60a5fa" stroke-width="1"/>
      <text x="51" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#dbeafe" text-anchor="middle">WIDE PULLUP</text>
    </svg>
  `,

  // BARBELL BENT-OVER ROW
  barbell_row: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="row-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#120e06"/>
          <stop offset="100%" stop-color="#241c0a"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#row-bg)"/>
      <circle cx="160" cy="110" r="100" fill="#F6721D" fill-opacity="0.2"/>

      <!-- Model Bent over 45 degrees rowing bar into navel -->
      <circle cx="115" cy="75" r="13" fill="#fdba74"/>
      <!-- Back flat and parallel to floor -->
      <path d="M 125 85 L 195 105" stroke="#F6721D" stroke-width="18" stroke-linecap="round" fill="none"/>

      <!-- Elbows flared pulling bar upwards -->
      <path d="M 155 95 L 165 70 L 165 110" stroke="#fdba74" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Bent Knees & Hips Hinged -->
      <path d="M 195 105 L 205 145 L 195 195" stroke="#334155" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Barbell with loaded plates -->
      <rect x="70" y="108" width="180" height="7" rx="2" fill="#e2e8f0"/>
      <rect x="85" y="85" width="10" height="55" rx="3" fill="#1e293b" stroke="#F6721D" stroke-width="1.5"/>
      <rect x="225" y="85" width="10" height="55" rx="3" fill="#1e293b" stroke="#F6721D" stroke-width="1.5"/>

      <rect x="10" y="10" width="86" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#F6721D" stroke-width="1"/>
      <text x="53" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fef3c7" text-anchor="middle">BARBELL ROW</text>
    </svg>
  `,

  // LATERAL RAISES (Model with boulder side deltoids)
  lateral_raises: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#140618"/>
          <stop offset="100%" stop-color="#280c30"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#lr-bg)"/>
      <circle cx="160" cy="90" r="100" fill="#ec4899" fill-opacity="0.2"/>

      <circle cx="160" cy="55" r="13" fill="#fdba74"/>
      <path d="M 160 68 L 160 145" stroke="#ea580c" stroke-width="20" stroke-linecap="round" fill="none"/>

      <!-- Boulder Lateral Deltoids capped -->
      <circle cx="140" cy="72" r="10" fill="#ec4899" stroke="#fbcfe8" stroke-width="1.5"/>
      <circle cx="180" cy="72" r="10" fill="#ec4899" stroke="#fbcfe8" stroke-width="1.5"/>

      <!-- Arms raised outward in T-pose holding dumbbells -->
      <path d="M 140 72 L 80 75" stroke="#fdba74" stroke-width="10" stroke-linecap="round" fill="none"/>
      <path d="M 180 72 L 240 75" stroke="#fdba74" stroke-width="10" stroke-linecap="round" fill="none"/>

      <!-- Left Dumbbell -->
      <rect x="68" y="72" width="18" height="6" fill="#cbd5e1"/>
      <polygon points="62,60 70,60 70,88 62,88" fill="#334155" stroke="#ec4899" stroke-width="1"/>
      <!-- Right Dumbbell -->
      <rect x="234" y="72" width="18" height="6" fill="#cbd5e1"/>
      <polygon points="250,60 258,60 258,88 250,88" fill="#334155" stroke="#ec4899" stroke-width="1"/>

      <path d="M 152 145 L 145 205" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>
      <path d="M 168 145 L 175 205" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="86" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#ec4899" stroke-width="1"/>
      <text x="53" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fce7f3" text-anchor="middle">LATERAL DELT</text>
    </svg>
  `,

  // CABLE PEC FLYE
  cable_flye: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cf-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0c0e18"/>
          <stop offset="100%" stop-color="#181e30"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#cf-bg)"/>
      <circle cx="160" cy="90" r="100" fill="#3b82f6" fill-opacity="0.2"/>

      <!-- Cable Pulleys Left & Right -->
      <line x1="30" y1="30" x2="135" y2="100" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3"/>
      <line x1="290" y1="30" x2="185" y2="100" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3"/>

      <!-- Model bringing hands together with chest squeeze -->
      <circle cx="160" cy="55" r="13" fill="#fdba74"/>
      <path d="M 160 68 L 160 145" stroke="#ea580c" stroke-width="20" stroke-linecap="round" fill="none"/>

      <!-- Pectoral squeeze lines in center -->
      <path d="M 152 85 Q 160 78 168 85" stroke="#F6721D" stroke-width="6" stroke-linecap="round" fill="none"/>

      <!-- Arced arms hugging a barrel -->
      <path d="M 140 75 Q 110 90 145 108" stroke="#fdba74" stroke-width="9" stroke-linecap="round" fill="none"/>
      <path d="M 180 75 Q 210 90 175 108" stroke="#fdba74" stroke-width="9" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="86" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#3b82f6" stroke-width="1"/>
      <text x="53" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#dbeafe" text-anchor="middle">CABLE FLYE</text>
    </svg>
  `,

  // CHEST DIPS
  chest_dips: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="dp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#140a04"/>
          <stop offset="100%" stop-color="#241408"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#dp-bg)"/>
      <circle cx="160" cy="90" r="100" fill="#f97316" fill-opacity="0.2"/>

      <!-- Parallel Dip Bars -->
      <rect x="80" y="115" width="160" height="8" rx="3" fill="#e2e8f0"/>

      <!-- Model dipped forward 30 degrees -->
      <circle cx="160" cy="60" r="13" fill="#fdba74"/>
      <path d="M 160 72 L 150 135" stroke="#ea580c" stroke-width="20" stroke-linecap="round" fill="none"/>

      <!-- Deep stretch at bottom of dip -->
      <path d="M 140 75 L 115 115" stroke="#fdba74" stroke-width="11" stroke-linecap="round" fill="none"/>
      <path d="M 180 75 L 205 115" stroke="#fdba74" stroke-width="11" stroke-linecap="round" fill="none"/>

      <!-- Dipping weight belt hanging between legs -->
      <path d="M 150 135 L 140 185" stroke="#1e293b" stroke-width="12" stroke-linecap="round" fill="none"/>
      <circle cx="148" cy="165" r="10" fill="#334155" stroke="#f97316" stroke-width="1.5"/>

      <rect x="10" y="10" width="80" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#f97316" stroke-width="1"/>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#ffedd5" text-anchor="middle">CHEST DIPS</text>
    </svg>
  `,

  // LEG PRESS (45 degree sled press)
  leg_press: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lp-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0a1210"/>
          <stop offset="100%" stop-color="#142620"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#lp-bg)"/>
      <circle cx="160" cy="110" r="100" fill="#10b981" fill-opacity="0.2"/>

      <!-- 45-degree Guide Rails -->
      <line x1="60" y1="180" x2="240" y2="50" stroke="#334155" stroke-width="6"/>

      <!-- Reclined Seat -->
      <rect x="80" y="140" width="45" height="15" rx="3" fill="#1e293b" transform="rotate(-30 80 140)"/>

      <!-- Model in seat pushing heavy sled with plates -->
      <circle cx="75" cy="120" r="13" fill="#fdba74"/>
      <!-- Quads flexed driving sled upward -->
      <path d="M 95 135 L 140 100 L 190 75" stroke="#10b981" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

      <!-- Sled Platform loaded with Olympic plates -->
      <rect x="180" y="45" width="40" height="60" rx="4" fill="#0f172a" stroke="#10b981" stroke-width="2" transform="rotate(45 180 45)"/>
      <circle cx="215" cy="65" r="18" fill="#dc2626" stroke="#f87171" stroke-width="1.5"/>

      <rect x="10" y="10" width="80" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#10b981" stroke-width="1"/>
      <text x="50" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#a7f3d0" text-anchor="middle">LEG PRESS</text>
    </svg>
  `,

  // ROMANIAN DEADLIFT (RDL)
  romanian_deadlift: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rdl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#140810"/>
          <stop offset="100%" stop-color="#24101e"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#rdl-bg)"/>
      <circle cx="160" cy="100" r="100" fill="#f43f5e" fill-opacity="0.2"/>

      <circle cx="120" cy="70" r="13" fill="#fdba74"/>
      <!-- Torso hinging forward with flat back -->
      <path d="M 130 80 L 190 105" stroke="#f43f5e" stroke-width="18" stroke-linecap="round" fill="none"/>

      <!-- Deep Hamstring & Glute Stretch -->
      <path d="M 190 105 L 180 150 L 175 195" stroke="#fb7185" stroke-width="16" stroke-linecap="round" fill="none"/>

      <!-- Barbell sliding down thighs to below knee -->
      <line x1="140" y1="80" x2="135" y2="135" stroke="#fdba74" stroke-width="10" stroke-linecap="round"/>
      <rect x="70" y="132" width="140" height="7" rx="2" fill="#e2e8f0"/>
      <rect x="80" y="105" width="12" height="60" rx="3" fill="#1e293b" stroke="#f43f5e" stroke-width="1.5"/>

      <rect x="10" y="10" width="84" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#f43f5e" stroke-width="1"/>
      <text x="52" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fecdd3" text-anchor="middle">HAMSTRING RDL</text>
    </svg>
  `,

  // CALF RAISES
  calf_raises: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0e141a"/>
          <stop offset="100%" stop-color="#182430"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#cr-bg)"/>
      <circle cx="160" cy="110" r="100" fill="#38bdf8" fill-opacity="0.2"/>

      <!-- Calf Block Step -->
      <rect x="100" y="175" width="120" height="25" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>

      <!-- Diamond-Shaped Muscular Calves on Balls of Feet -->
      <ellipse cx="145" cy="140" rx="10" ry="16" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.5"/>
      <ellipse cx="175" cy="140" rx="10" ry="16" fill="#38bdf8" stroke="#bae6fd" stroke-width="1.5"/>

      <!-- Achilles tendon extension onto balls of feet -->
      <path d="M 145 155 L 140 176" stroke="#fdba74" stroke-width="8" stroke-linecap="round"/>
      <path d="M 175 155 L 180 176" stroke="#fdba74" stroke-width="8" stroke-linecap="round"/>

      <circle cx="160" cy="40" r="12" fill="#fdba74"/>
      <path d="M 160 52 L 160 115" stroke="#ea580c" stroke-width="18" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="82" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#38bdf8" stroke-width="1"/>
      <text x="51" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#bae6fd" text-anchor="middle">CALF PEAK</text>
    </svg>
  `,

  // HANGING LEG RAISE (Abs & Core)
  hanging_leg_raise: `
    <svg viewBox="0 0 320 220" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ab-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#141004"/>
          <stop offset="100%" stop-color="#241a08"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#ab-bg)"/>
      <circle cx="160" cy="100" r="100" fill="#eab308" fill-opacity="0.2"/>

      <line x1="80" y1="30" x2="240" y2="30" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
      <!-- Hands hanging -->
      <circle cx="140" cy="30" r="6" fill="#fdba74"/>
      <circle cx="180" cy="30" r="6" fill="#fdba74"/>

      <!-- Model hanging with arms extended -->
      <path d="M 140 30 L 145 65" stroke="#fdba74" stroke-width="9" stroke-linecap="round"/>
      <path d="M 180 30 L 175 65" stroke="#fdba74" stroke-width="9" stroke-linecap="round"/>

      <circle cx="160" cy="55" r="11" fill="#fdba74"/>
      <!-- Defined 6-pack washboard abs -->
      <path d="M 160 65 L 160 120" stroke="#ca8a04" stroke-width="18" stroke-linecap="round" fill="none"/>
      <!-- Abdominal segments -->
      <rect x="154" y="78" width="12" height="6" rx="2" fill="#fef08a"/>
      <rect x="154" y="88" width="12" height="6" rx="2" fill="#fef08a"/>
      <rect x="154" y="98" width="12" height="6" rx="2" fill="#fef08a"/>

      <!-- Legs raised to 90 degrees -->
      <path d="M 160 120 L 220 120" stroke="#3b82f6" stroke-width="14" stroke-linecap="round" fill="none"/>

      <rect x="10" y="10" width="82" height="20" rx="6" fill="#000000" fill-opacity="0.75" stroke="#eab308" stroke-width="1"/>
      <text x="51" y="24" font-family="system-ui, sans-serif" font-size="10" font-weight="900" fill="#fef08a" text-anchor="middle">CORE & ABS</text>
    </svg>
  `
};

// SECTION HEADINGS & MENU BANNERS (Fitness models & gym workouts in high-impact wide banners)
export const SECTION_HEADING_PICTURES = {
  workout_hub: `
    <svg viewBox="0 0 1200 340" preserveAspectRatio="xMidYMid slice" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hub-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080a0f"/>
          <stop offset="40%" stop-color="#141824"/>
          <stop offset="80%" stop-color="#1f1810"/>
          <stop offset="100%" stop-color="#0a0a0d"/>
        </linearGradient>
        <radialGradient id="hub-light" cx="65%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#F6721D" stop-opacity="0.45"/>
          <stop offset="50%" stop-color="#d97706" stop-opacity="0.15"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1200" height="340" fill="url(#hub-grad)"/>
      <rect width="1200" height="340" fill="url(#hub-light)"/>

      <!-- Gym Floor Perspective -->
      <line x1="0" y1="260" x2="1200" y2="260" stroke="#3f3f46" stroke-width="1.5" opacity="0.4"/>

      <!-- Dumbbell Rack in Background -->
      <g opacity="0.3" stroke="#52525b" stroke-width="2">
        <line x1="50" y1="200" x2="350" y2="200"/>
        <line x1="50" y1="235" x2="350" y2="235"/>
        <circle cx="90" cy="195" r="14" fill="#18181b"/>
        <circle cx="140" cy="195" r="16" fill="#18181b"/>
        <circle cx="195" cy="195" r="18" fill="#18181b"/>
        <circle cx="255" cy="195" r="20" fill="#18181b"/>
      </g>

      <!-- Central Athletic Fitness Model Silhouetted with Chalked Barbells -->
      <g transform="translate(850, 160)">
        <ellipse cx="0" cy="100" rx="140" ry="12" fill="#000000" opacity="0.7"/>
        <!-- Model Torso & Head -->
        <circle cx="0" cy="-65" r="22" fill="#fdba74"/>
        <path d="M -30 -40 Q 0 -50 30 -40" stroke="#F6721D" stroke-width="26" stroke-linecap="round" fill="none"/>
        <path d="M 0 -40 L 0 50" stroke="#ea580c" stroke-width="38" stroke-linecap="round" fill="none"/>
        <!-- Chest striation -->
        <path d="M -20 -15 Q 0 -22 20 -15" stroke="#fde047" stroke-width="8" stroke-linecap="round" fill="none"/>
        <!-- Biceps and Arms gripping heavy dumbbells -->
        <path d="M -28 -35 L -65 15 L -65 60" stroke="#fdba74" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <path d="M 28 -35 L 65 15 L 65 60" stroke="#fdba74" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <!-- Heavy Dumbbells in hands -->
        <rect x="-85" y="55" width="40" height="14" rx="3" fill="#cbd5e1"/>
        <polygon points="-90,40 -76,40 -76,82 -90,82" fill="#334155" stroke="#F6721D" stroke-width="1.5"/>
        <polygon points="-54,40 -40,40 -40,82 -54,82" fill="#334155" stroke="#F6721D" stroke-width="1.5"/>

        <rect x="45" y="55" width="40" height="14" rx="3" fill="#cbd5e1"/>
        <polygon points="40,40 54,40 54,82 40,82" fill="#334155" stroke="#F6721D" stroke-width="1.5"/>
        <polygon points="76,40 90,40 90,82 76,82" fill="#334155" stroke="#F6721D" stroke-width="1.5"/>

        <!-- Legs in athletic power stance -->
        <path d="M -15 50 L -30 100" stroke="#1e293b" stroke-width="22" stroke-linecap="round" fill="none"/>
        <path d="M 15 50 L 30 100" stroke="#1e293b" stroke-width="22" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Floating Chalk Powder Dust Atmosphere -->
      <g opacity="0.8">
        <circle cx="720" cy="120" r="3" fill="#fef08a"/>
        <circle cx="780" cy="180" r="2.5" fill="#F6721D"/>
        <circle cx="810" cy="110" r="3.5" fill="#ffffff"/>
        <circle cx="920" cy="140" r="2.8" fill="#fde68a"/>
        <circle cx="980" cy="200" r="3.2" fill="#fef08a"/>
      </g>
    </svg>
  `,

  plans: `
    <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="plans-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a1210"/>
          <stop offset="60%" stop-color="#12241e"/>
          <stop offset="100%" stop-color="#040d0a"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="260" fill="url(#plans-grad)"/>
      <circle cx="850" cy="110" r="160" fill="#10b981" fill-opacity="0.25"/>

      <!-- Barbell rack & Fitness Model preparing for heavy split -->
      <g transform="translate(900, 130)">
        <ellipse cx="0" cy="80" rx="120" ry="12" fill="#000000" opacity="0.6"/>
        <!-- Model silhouette chalking hands -->
        <circle cx="0" cy="-55" r="20" fill="#fdba74"/>
        <path d="M -25 -30 Q 0 -40 25 -30" stroke="#10b981" stroke-width="24" stroke-linecap="round" fill="none"/>
        <path d="M 0 -30 L 0 45" stroke="#059669" stroke-width="32" stroke-linecap="round" fill="none"/>
        <!-- Hands clapping chalk cloud -->
        <circle cx="0" cy="5" r="14" fill="#ffffff" opacity="0.8"/>
        <!-- Legs in squat stance -->
        <path d="M -12 45 L -25 80" stroke="#1e293b" stroke-width="20" stroke-linecap="round" fill="none"/>
        <path d="M 12 45 L 25 80" stroke="#1e293b" stroke-width="20" stroke-linecap="round" fill="none"/>
      </g>
    </svg>
  `,

  progress: `
    <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a0e1c"/>
          <stop offset="60%" stop-color="#141c33"/>
          <stop offset="100%" stop-color="#080a14"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="260" fill="url(#prog-grad)"/>
      <circle cx="880" cy="110" r="160" fill="#3b82f6" fill-opacity="0.25"/>

      <!-- Fitness Model in Classic Physique Front Double Bicep Pose -->
      <g transform="translate(900, 130)">
        <ellipse cx="0" cy="80" rx="100" ry="10" fill="#000000" opacity="0.6"/>
        <circle cx="0" cy="-60" r="18" fill="#fdba74"/>
        <!-- Capped Shoulders & Arms flexing double bicep -->
        <path d="M -25 -40 L -65 -45 L -60 -75" stroke="#3b82f6" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="-60" cy="-60" r="10" fill="#60a5fa"/>

        <path d="M 25 -40 L 65 -45 L 60 -75" stroke="#3b82f6" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        <circle cx="60" cy="-60" r="10" fill="#60a5fa"/>

        <!-- Tapered Waist & Flared Lats -->
        <polygon points="-30,-40 0,-50 30,-40 18,35 -18,35" fill="#1d4ed8" stroke="#93c5fd" stroke-width="2"/>
        <!-- Legs flexed -->
        <path d="M -12 35 L -20 80" stroke="#0f172a" stroke-width="18" stroke-linecap="round" fill="none"/>
        <path d="M 12 35 L 20 80" stroke="#0f172a" stroke-width="18" stroke-linecap="round" fill="none"/>
      </g>
    </svg>
  `,

  community: `
    <svg viewBox="0 0 1200 260" preserveAspectRatio="xMidYMid slice" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="comm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#140c06"/>
          <stop offset="60%" stop-color="#2a160a"/>
          <stop offset="100%" stop-color="#0a0604"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="260" fill="url(#comm-grad)"/>
      <circle cx="860" cy="110" r="170" fill="#f97316" fill-opacity="0.25"/>

      <!-- Group of 3 Fitness Athletes Training Together in the Gym -->
      <!-- Center Lifter -->
      <g transform="translate(860, 130)">
        <circle cx="0" cy="-55" r="18" fill="#fdba74"/>
        <path d="M -20 -35 L 20 -35 L 15 45 L -15 45 Z" fill="#ea580c"/>
        <path d="M -10 45 L -15 80" stroke="#1e293b" stroke-width="16" stroke-linecap="round" fill="none"/>
        <path d="M 10 45 L 15 80" stroke="#1e293b" stroke-width="16" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Left Spotter / Training Partner High-Fiving -->
      <g transform="translate(780, 140)">
        <circle cx="0" cy="-50" r="16" fill="#fca5a5"/>
        <path d="M -18 -30 L 18 -30 L 12 40 L -12 40 Z" fill="#b91c1c"/>
        <path d="M 15 -25 L 45 -45" stroke="#fca5a5" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M -8 40 L -12 75" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M 8 40 L 12 75" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>
      </g>

      <!-- Right Training Partner -->
      <g transform="translate(940, 140)">
        <circle cx="0" cy="-50" r="16" fill="#fde047"/>
        <path d="M -18 -30 L 18 -30 L 12 40 L -12 40 Z" fill="#a16207"/>
        <path d="M -15 -25 L -45 -45" stroke="#fde047" stroke-width="10" stroke-linecap="round" fill="none"/>
        <path d="M -8 40 L -12 75" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M 8 40 L 12 75" stroke="#1e293b" stroke-width="14" stroke-linecap="round" fill="none"/>
      </g>

      <!-- High-five spark -->
      <circle cx="860" cy="95" r="8" fill="#fef08a" opacity="0.9"/>
    </svg>
  `
};

export type MuscleDivision = 'upper_push' | 'upper_pull' | 'lower_body' | 'core_conditioning' | 'custom';

export interface MuscleMonsterCategory {
  id: string;
  muscle: string;
  title: string;
  subtitle?: string;
  division: MuscleDivision;
  divisionLabel: string;
  tagline: string;
  exerciseIds: string[];
  pictureKey: keyof typeof MODEL_PICTURES;
  photoUrl: string;
  accentColor: string;
  badge: string;
  countHint: number;
}

export const MUSCLE_MONSTER_CATEGORIES: MuscleMonsterCategory[] = [
  // 1. UPPER BODY — PUSH
  {
    id: 'category_chest',
    muscle: 'Chest',
    title: 'Chest / Pectorals',
    subtitle: 'Pectoralis Major & Minor',
    division: 'upper_push',
    divisionLabel: 'Upper Body — Push',
    tagline: 'Heavy Flat/Incline Barbell & Dumbbell Presses, Cable Flyes & Dips',
    exerciseIds: ['barbell_bench_press', 'dumbbell_incline_bench_press', 'cable_standing_fly', 'chest_dip'],
    pictureKey: 'bench_press',
    photoUrl: getUniqueRoutineThumbnailUrl('category_chest', 'muscle_monster', 0),
    accentColor: '#F6721D',
    badge: 'PECS & UPPER CHEST',
    countHint: 168
  },
  {
    id: 'category_shoulders',
    muscle: 'Shoulders',
    title: 'Shoulders / Deltoids',
    subtitle: 'Anterior, Lateral & Rear Delts',
    division: 'upper_push',
    divisionLabel: 'Upper Body — Push',
    tagline: 'Overhead Military Press, Capped Lateral Raises & Arnold Presses',
    exerciseIds: ['barbell_seated_overhead_press', 'dumbbell_lateral_raise', 'dumbbell_seated_shoulder_press', 'dumbbell_rear_delt_raise'],
    pictureKey: 'overhead_press',
    photoUrl: getUniqueRoutineThumbnailUrl('category_shoulders', 'muscle_monster', 1),
    accentColor: '#c084fc',
    badge: '3D BOULDER DELTS',
    countHint: 216
  },
  {
    id: 'category_triceps',
    muscle: 'Triceps',
    title: 'Triceps / Horseshoe',
    subtitle: 'Lateral, Long & Medial Heads',
    division: 'upper_push',
    divisionLabel: 'Upper Body — Push',
    tagline: 'Rope Pushdowns, Skull Crushers & Overhead Cable Extensions',
    exerciseIds: ['cable_pushdown_(with_rope_attachment)', 'barbell_lying_triceps_extension_skull_crusher', 'cable_high_pulley_overhead_tricep_extension', 'bench_dip_on_floor'],
    pictureKey: 'tricep_pushdown',
    photoUrl: getUniqueRoutineThumbnailUrl('category_triceps', 'muscle_monster', 2),
    accentColor: '#ec4899',
    badge: 'HORSESHOE TRICEPS',
    countHint: 102
  },

  // 2. UPPER BODY — PULL
  {
    id: 'category_back',
    muscle: 'Back',
    title: 'Back / Lats & V-Taper',
    subtitle: 'Lats, Rhomboids, Traps & Spinal Erectors',
    division: 'upper_pull',
    divisionLabel: 'Upper Body — Pull',
    tagline: 'Conventional Deadlifts, Lat Pulldowns, Heavy Rows & Pull-Ups',
    exerciseIds: ['barbell_deadlift', 'cable_wide_grip_lat_pulldown_(female)', 'barbell_bent_over_row', 'cable_seated_row_with_v_bar'],
    pictureKey: 'lat_pulldown',
    photoUrl: getUniqueRoutineThumbnailUrl('category_back', 'muscle_monster', 3),
    accentColor: '#38bdf8',
    badge: 'V-TAPER & DENSITY',
    countHint: 278
  },
  {
    id: 'category_biceps',
    muscle: 'Biceps',
    title: 'Biceps / Arm Flexors',
    subtitle: 'Short Head, Long Head & Brachialis',
    division: 'upper_pull',
    divisionLabel: 'Upper Body — Pull',
    tagline: 'Barbell Curls, Incline Dumbbell Curls & Cable Preacher Curls',
    exerciseIds: ['barbell_curl', 'dumbbell_incline_biceps_curl', 'dumbbell_hammer_curl', 'cable_hammer_curl_(with_rope)_(male)'],
    pictureKey: 'bicep_curl',
    photoUrl: getUniqueRoutineThumbnailUrl('category_biceps', 'muscle_monster', 4),
    accentColor: '#fb923c',
    badge: 'PEAK & SLEEVE SIZE',
    countHint: 85
  },
  {
    id: 'category_forearms',
    muscle: 'Forearms',
    title: 'Forearms / Grip & Wrists',
    subtitle: 'Brachioradialis, Wrist Flexors & Extensors',
    division: 'upper_pull',
    divisionLabel: 'Upper Body — Pull',
    tagline: 'Barbell Wrist Curls, Reverse Curls & Farmers Holds',
    exerciseIds: ['barbell_wrist_curl', 'dumbbell_wrist_curl', 'reverse_barbell_curl'],
    pictureKey: 'bicep_curl',
    photoUrl: getUniqueRoutineThumbnailUrl('category_forearms', 'muscle_monster', 5),
    accentColor: '#14b8a6',
    badge: 'CRUSHING GRIP',
    countHint: 22
  },

  // 3. LOWER BODY
  {
    id: 'category_quads',
    muscle: 'Quads',
    title: 'Quads / Thigh Sweep',
    subtitle: 'Rectus Femoris, Vastus Lateralis & Medialis',
    division: 'lower_body',
    divisionLabel: 'Lower Body',
    tagline: 'Olympic Back Squats, Hack Squats, Front Squats & Leg Extensions',
    exerciseIds: ['barbell_full_squat_(back_pov)', 'sled_hack_squat', 'lever_leg_extension', 'sled_45_degrees_leg_press_(side_pov)'],
    pictureKey: 'squat',
    photoUrl: getUniqueRoutineThumbnailUrl('category_quads', 'muscle_monster', 6),
    accentColor: '#10b981',
    badge: 'QUAD SWEEP & WHEELS',
    countHint: 182
  },
  {
    id: 'category_hamstrings',
    muscle: 'Hamstrings',
    title: 'Hamstrings / Posterior Thigh',
    subtitle: 'Biceps Femoris, Semitendinosus & Semimembranosus',
    division: 'lower_body',
    divisionLabel: 'Lower Body',
    tagline: 'Romanian Deadlifts, Lying Leg Curls & Seated Hamstring Curls',
    exerciseIds: ['barbell_romanian_deadlift', 'lever_lying_leg_curl', 'single_leg_deadlift_with_knee_lift'],
    pictureKey: 'romanian_deadlift',
    photoUrl: getUniqueRoutineThumbnailUrl('category_hamstrings', 'muscle_monster', 7),
    accentColor: '#06b6d4',
    badge: 'POSTERIOR TIE-IN',
    countHint: 40
  },
  {
    id: 'category_glutes',
    muscle: 'Glutes',
    title: 'Glutes / Hip Thrust & Power',
    subtitle: 'Gluteus Maximus, Medius & Minimus',
    division: 'lower_body',
    divisionLabel: 'Lower Body',
    tagline: 'Barbell Hip Thrusts, Cable Kickbacks & Bulgarian Split Squats',
    exerciseIds: ['barbell_hip_thrust', 'cable_kickback', 'single_leg_glute_bridge_with_knee_to_chest'],
    pictureKey: 'squat',
    photoUrl: getUniqueRoutineThumbnailUrl('category_glutes', 'muscle_monster', 8),
    accentColor: '#8b5cf6',
    badge: 'HIP EXTENSION POWER',
    countHint: 144
  },
  {
    id: 'category_calves',
    muscle: 'Calves',
    title: 'Calves / Lower Leg',
    subtitle: 'Gastrocnemius & Soleus',
    division: 'lower_body',
    divisionLabel: 'Lower Body',
    tagline: 'Standing Barbell Calf Raises, Seated Machine Calf Raises',
    exerciseIds: ['barbell_standing_calf_raise', 'dumbbell_standing_single_leg_calf_raise'],
    pictureKey: 'calf_raises',
    photoUrl: getUniqueRoutineThumbnailUrl('category_calves', 'muscle_monster', 9),
    accentColor: '#84cc16',
    badge: 'DIAMOND CALVES',
    countHint: 62
  },

  // 4. CORE, FULL BODY & CONDITIONING
  {
    id: 'category_core',
    muscle: 'Abs & Core',
    title: 'Abs & Core / Midsection',
    subtitle: 'Rectus Abdominis, Transverse Abdominis & Obliques',
    division: 'core_conditioning',
    divisionLabel: 'Core & Conditioning',
    tagline: 'Hanging Leg Raises, Cable Crunches, Planks & Rotary Twists',
    exerciseIds: ['hanging_straight_leg_raise', 'cable_standing_crunch_(with_rope_attachment)_(female)', 'cable_twist_(down_up)', 'front_plank_toe_tap_(male)'],
    pictureKey: 'hanging_leg_raise',
    photoUrl: getUniqueRoutineThumbnailUrl('category_core', 'muscle_monster', 10),
    accentColor: '#f43f5e',
    badge: 'SIX-PACK SHRED',
    countHint: 250
  },
  {
    id: 'category_full_body',
    muscle: 'Full Body',
    title: 'Full Body / Multi-Joint',
    subtitle: 'Compound, Kinetic Chain & Olympic Movements',
    division: 'core_conditioning',
    divisionLabel: 'Core & Conditioning',
    tagline: 'Clean & Jerk, Snatch, Thrusters & Burpee Power Complexes',
    exerciseIds: ['barbell_clean_and_jerk', 'barbell_snatch', 'dumbbell_burpee'],
    pictureKey: 'deadlift',
    photoUrl: getUniqueRoutineThumbnailUrl('category_full_body', 'muscle_monster', 11),
    accentColor: '#6366f1',
    badge: 'TOTAL BODY POWER',
    countHint: 63
  },
  {
    id: 'category_cardio',
    muscle: 'Cardio',
    title: 'Cardio / Aerobic Engine',
    subtitle: 'Cardiovascular Endurance, VO2 Max & HIIT',
    division: 'core_conditioning',
    divisionLabel: 'Core & Conditioning',
    tagline: 'Treadmills, Stationary Ergometer, High Intensity Sprints',
    exerciseIds: ['elliptical_trainer', 'stationary_bike_run'],
    pictureKey: 'squat',
    photoUrl: getUniqueRoutineThumbnailUrl('category_cardio', 'muscle_monster', 12),
    accentColor: '#0284c7',
    badge: 'AEROBIC ENGINE',
    countHint: 30
  },

  // 5. CUSTOM MOVEMENTS
  {
    id: 'category_custom',
    muscle: 'Custom',
    title: 'Custom Exercises',
    subtitle: 'Personal & Created Movements',
    division: 'custom',
    divisionLabel: 'Personal Protocols',
    tagline: 'Your Handcrafted & Saved Custom Exercises & Variations',
    exerciseIds: [],
    pictureKey: 'bicep_curl',
    photoUrl: getUniqueRoutineThumbnailUrl('category_custom', 'muscle_monster', 13),
    accentColor: '#eab308',
    badge: 'MY CUSTOM',
    countHint: 0
  }
];

export function getPlanModelCover(planId: string): string {
  if (planId.includes('fat_loss') || planId.includes('shred')) {
    return MODEL_PICTURES.cable_flye;
  }
  if (planId.includes('ppl') || planId.includes('hypertrophy')) {
    return MODEL_PICTURES.bench_press;
  }
  if (planId.includes('arnold')) {
    return MODEL_PICTURES.bicep_curl;
  }
  if (planId.includes('upper_lower') || planId.includes('power')) {
    return MODEL_PICTURES.deadlift;
  }
  if (planId.includes('beginner') || planId.includes('foundation')) {
    return MODEL_PICTURES.squat;
  }
  return MODEL_PICTURES.bench_press;
}

export function getWorkoutRoutinePhoto(
  routineOrName: { dayName?: string; focus?: string; title?: string; name?: string } | string,
  planId?: string,
  index?: number
): string {
  return getUniqueRoutineThumbnailUrl(routineOrName, planId, index);
}

export function getPlanModelPhoto(planId: string): string {
  return getUniquePlanThumbnailUrl(planId);
}

export function getExerciseModelPhoto(exerciseId: string, primaryMuscle?: string): string {
  return getUniqueRoutineThumbnailUrl(exerciseId, primaryMuscle || 'exercise', 0);
}


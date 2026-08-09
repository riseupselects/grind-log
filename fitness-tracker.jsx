import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronLeft, ChevronRight, Settings, X, Plus, Trash2, Activity, ChevronDown, ChevronUp, PlayCircle, Copy, SkipForward, ImagePlus, Sunrise, GripVertical, Calendar as CalendarIcon } from 'lucide-react';

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');`;

// All storage access goes through here. If the underlying storage layer is slow,
// missing, or hangs, calls resolve to a safe fallback instead of freezing the UI.
const STORAGE_TIMEOUT_MS = 2500;

function withTimeout(promise, fallback, ms = STORAGE_TIMEOUT_MS) {
  return Promise.race([
    Promise.resolve(promise).catch(() => fallback),
    new Promise((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

const safeStorage = {
  get(key, shared = false) {
    try {
      if (!window.storage || !window.storage.get) return Promise.resolve(null);
      return withTimeout(window.storage.get(key, shared), null);
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  set(key, value, shared = false) {
    try {
      if (!window.storage || !window.storage.set) return Promise.resolve(null);
      return withTimeout(window.storage.set(key, value, shared), null);
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  delete(key, shared = false) {
    try {
      if (!window.storage || !window.storage.delete) return Promise.resolve(null);
      return withTimeout(window.storage.delete(key, shared), null);
    } catch (e) {
      return Promise.resolve(null);
    }
  },
  list(prefix, shared = false) {
    try {
      if (!window.storage || !window.storage.list) return Promise.resolve({ keys: [] });
      return withTimeout(window.storage.list(prefix, shared), { keys: [] });
    } catch (e) {
      return Promise.resolve({ keys: [] });
    }
  },
};

const COLORS = {
  bg: '#15171A',
  surface: '#1D2024',
  surface2: '#242830',
  line: '#33383F',
  accent: '#C8443C',
  accentGold: '#E8B84B',
  text: '#ECEAE4',
  textMuted: '#8B909A',
  success: '#6FA47C',
};

const DEFAULT_BLOCKS = [
  {
    id: 'block_w1_3',
    name: 'Weeks 1-3',
    startDay: 1,
    endDay: 21,
    routines: [
      {
        id: 'push1',
        name: 'Upper Push 1',
        exercises: [
          { id: 'bench_press', name: 'Bench Press', targetSets: 3, targetReps: '6-8' },
          { id: 'plate_dip', name: 'Plate Weighted Dip', targetSets: 3, targetReps: '6-8' },
          { id: 'db_shoulder_press', name: 'DB Seated Shoulder Press', targetSets: 3, targetReps: '8-10' },
          { id: 'iso_lateral_raise', name: 'Alt. Iso Lateral Raise', targetSets: 3, targetReps: '10 ea side' },
          { id: 'close_grip_bench', name: 'Close Grip Bench Press', targetSets: 3, targetReps: '8-10' },
          { id: 'db_skull_crush', name: 'DB Skull Crush', targetSets: 2, targetReps: '10-12' },
        ],
      },
      {
        id: 'pull1',
        name: 'Upper Pull 1 + Legs',
        exercises: [
          { id: 'bent_over_row', name: 'Barbell Bent Over Row', targetSets: 4, targetReps: '6-8' },
          { id: 'incline_bench_row', name: 'DB Incline Bench Row', targetSets: 3, targetReps: '8' },
          { id: 'lat_single_arm_row', name: 'Lat Machine Single Arm Row', targetSets: 3, targetReps: '10-12' },
          { id: 'barbell_shrug', name: 'Barbell Shrug', targetSets: 3, targetReps: '10-12' },
          { id: 'db_preacher_curl', name: 'DB Single Arm Preacher Curl', targetSets: 3, targetReps: '12,10,8' },
          { id: 'leg_curl', name: 'Machine Lying Leg Curl', targetSets: 4, targetReps: '8-10' },
          { id: 'seated_calf_raise', name: 'Machine Seated Calf Raise', targetSets: 3, targetReps: '10-12' },
        ],
      },
      {
        id: 'push2',
        name: 'Upper Push 2',
        exercises: [
          { id: 'military_press', name: 'Military Press', targetSets: 3, targetReps: '6-8' },
          { id: 'incline_bench_press', name: 'DB Incline Bench Press', targetSets: 3, targetReps: '15-20' },
          { id: 'pec_deck', name: 'Pec Deck', targetSets: 3, targetReps: '10-12' },
          { id: 'reverse_fly', name: 'Machine Seated Reverse Fly', targetSets: 4, targetReps: '20-25' },
          { id: 'tricep_pushdown', name: 'Cable Tricep Pushdown', targetSets: 3, targetReps: '12-15' },
          { id: 'overhead_tricep_ext', name: 'DB Overhead Tricep Ext', targetSets: 3, targetReps: '12-15' },
        ],
      },
      {
        id: 'pull2',
        name: 'Upper Pull 2 + Abs',
        exercises: [
          { id: 'chin_up', name: 'Chin Up', targetSets: 4, targetReps: '5-7' },
          { id: 'wide_grip_row', name: 'Cable Seated Wide Grip Row', targetSets: 3, targetReps: '10-12' },
          { id: 'db_pullover', name: 'DB Pullover', targetSets: 2, targetReps: '12-15' },
          { id: 'tbar_row', name: 'Lying T-Bar Row', targetSets: 2, targetReps: '15-20' },
          { id: 'cable_reverse_curl', name: 'Cable Reverse Curl', targetSets: 4, targetReps: '10-15' },
          { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', targetSets: 3, targetReps: '8-12' },
          { id: 'kneeling_crunch', name: 'Cable Kneeling Crunch', targetSets: 3, targetReps: '10-12' },
          { id: 'side_bend', name: 'DB Side Bend', targetSets: 3, targetReps: '12-15 ea side' },
        ],
      },
    ],
  },
  {
    id: 'block_w4_6',
    name: 'Weeks 4-6',
    startDay: 22,
    endDay: 42,
    routines: [
      {
        id: 'shoulders_arms',
        name: 'Shoulders / Arms',
        exercises: [
          { id: 'smith_shoulder_press', name: 'Smith Machine Seated Shoulder Press', targetSets: 4, targetReps: '8' },
          { id: 'db_single_arm_shoulder_press', name: 'DB Single Arm Shoulder Press', targetSets: 3, targetReps: '8-10 ea side' },
          { id: 'machine_lateral_raise', name: 'Machine Lateral Raise', targetSets: 3, targetReps: '10-12' },
          { id: 'plate_front_raise', name: 'Plate Front Raise', targetSets: 2, targetReps: '15-20' },
          { id: 'barbell_bicep_curl', name: 'Barbell Bicep Curl', targetSets: 3, targetReps: '6' },
          { id: 'db_incline_bicep_curl', name: 'DB Incline Bicep Curl', targetSets: 3, targetReps: '8-12' },
          { id: 'cable_rope_tricep_ext', name: 'Cable Rope Tricep Extension', targetSets: 3, targetReps: '10-12' },
          { id: 'single_arm_overhead_tricep', name: 'Single Arm Cable Overhead Tricep Ext', targetSets: 3, targetReps: '10-12' },
        ],
      },
      {
        id: 'chest',
        name: 'Chest',
        exercises: [
          { id: 'incline_bench_5rm', name: 'Barbell Incline Bench Press', targetSets: 5, targetReps: '5 (work to 5RM)' },
          { id: 'db_bench_press', name: 'DB Bench Press', targetSets: 4, targetReps: '10-12' },
          { id: 'banded_push_up', name: 'Banded Push Up', targetSets: 3, targetReps: '15-20' },
          { id: 'db_flat_fly', name: 'DB Flat Bench Chest Fly', targetSets: 3, targetReps: '12-15' },
          { id: 'dip_chest', name: 'Dip', targetSets: 2, targetReps: 'max reps' },
        ],
      },
      {
        id: 'legs',
        name: 'Legs',
        exercises: [
          { id: 'single_leg_curl', name: 'Machine Lying Single Leg Curl', targetSets: 3, targetReps: '10-12 ea leg' },
          { id: 'rdl', name: 'Barbell Straight Leg RDL', targetSets: 5, targetReps: '8 (work to top set)' },
          { id: 'leg_press', name: 'Machine Leg Press', targetSets: 3, targetReps: '25' },
          { id: 'single_leg_calf_raise', name: 'DB Single Leg Calf Raise', targetSets: 3, targetReps: '10-12 ea leg' },
          { id: 'side_plank_rotation', name: 'Side Plank With Rotation', targetSets: 3, targetReps: '10 ea side' },
          { id: 'lying_straight_leg_raise', name: 'Lying Straight Leg Raise', targetSets: 3, targetReps: '8 ea side' },
          { id: 'exercise_bike', name: 'Exercise Bike', targetSets: 1, targetReps: '20 min moderate' },
        ],
      },
      {
        id: 'back',
        name: 'Back',
        exercises: [
          { id: 'wide_grip_pulldown', name: 'Lat Machine Wide Grip Pulldown', targetSets: 4, targetReps: '12,10,8,6' },
          { id: 'close_grip_pulldown', name: 'Close-Grip Pulldown', targetSets: 3, targetReps: '8-12' },
          { id: 'db_bent_over_row', name: 'DB Bent Over Row', targetSets: 3, targetReps: '10-12' },
          { id: 'single_arm_neutral_row', name: 'Machine Seated Single Arm Neutral Row', targetSets: 3, targetReps: '12-15' },
          { id: 'banded_face_pull', name: 'Banded Face Pull', targetSets: 3, targetReps: '15-20' },
          { id: 'upright_row', name: 'Upright Row', targetSets: 3, targetReps: '10-12' },
          { id: 'db_rear_lateral', name: 'DB Lying Rear Lateral Raise', targetSets: 3, targetReps: '15-20' },
        ],
      },
      {
        id: 'abs_optional',
        name: 'Optional Ab Workout',
        exercises: [
          { id: 'arm_farmer_carry', name: '1 Arm Farmer Carry', targetSets: 5, targetReps: '25yd ea arm' },
          { id: 'hanging_knee_raise', name: 'Hanging Knee Raise', targetSets: 5, targetReps: '12-15' },
          { id: 'kneeling_crunch_abs', name: 'Cable Kneeling Crunch', targetSets: 4, targetReps: '20' },
          { id: 'pallof_press', name: '1/2 Kneeling Pallof Press', targetSets: 4, targetReps: '15 ea way' },
          { id: 'ab_crunch', name: 'Ab Crunch', targetSets: 1, targetReps: '20' },
          { id: 'russian_twist', name: 'Russian Twist', targetSets: 1, targetReps: '50' },
          { id: 'cross_crunch', name: 'Cross Crunch', targetSets: 1, targetReps: '30' },
          { id: 'sprinter_situp', name: 'Sprinter Sit Up', targetSets: 1, targetReps: '30' },
          { id: 'front_plank', name: 'Front Plank', targetSets: 1, targetReps: 'max time' },
        ],
      },
    ],
  },
  {
    id: 'block_w7_9',
    name: 'Weeks 7-9',
    startDay: 43,
    endDay: 63,
    routines: [
      {
        id: 'bsp1_chest_tri',
        name: 'Chest & Triceps (BSP1)',
        exercises: [
          { id: 'bsp1_bench_press', name: 'Barbell Bench Press', targetSets: 5, targetReps: '5' },
          { id: 'bsp1_db_incline_press', name: 'DB Incline Bench Press', targetSets: 5, targetReps: '8' },
          { id: 'bsp1_chest_fly', name: 'Machine Seated Chest Fly', targetSets: 4, targetReps: '15' },
          { id: 'bsp1_dip', name: 'Dip', targetSets: 1, targetReps: 'max reps' },
          { id: 'bsp1_oh_tricep_ext', name: 'Cable Standing Overhead Tricep Ext', targetSets: 4, targetReps: '15' },
        ],
      },
      {
        id: 'bsp1_legs',
        name: 'Legs (BSP1)',
        exercises: [
          { id: 'bsp1_leg_curl', name: 'Machine Lying Leg Curl', targetSets: 4, targetReps: '15' },
          { id: 'bsp1_back_squat', name: 'Back Squat', targetSets: 5, targetReps: '8' },
          { id: 'bsp1_leg_press', name: 'Angled Machine Leg Press', targetSets: 4, targetReps: '15' },
          { id: 'bsp1_pull_through', name: 'Cable Pull Through', targetSets: 4, targetReps: '15' },
          { id: 'bsp1_calf_raise', name: 'Machine Standing Calf Raise', targetSets: 4, targetReps: '15' },
        ],
      },
      {
        id: 'bsp1_shoulders',
        name: 'Shoulders (BSP1, Optional)',
        exercises: [
          { id: 'bsp1_ohp', name: 'Barbell Overhead Press', targetSets: 3, targetReps: '8' },
          { id: 'bsp1_reverse_fly', name: 'Machine Seated Reverse Fly', targetSets: 4, targetReps: '15' },
          { id: 'bsp1_lateral_raise', name: 'Machine Lateral Raise', targetSets: 4, targetReps: '15' },
          { id: 'bsp1_db_shoulder_press', name: 'DB Seated Shoulder Press', targetSets: 4, targetReps: '8' },
          { id: 'bsp1_cable_shrug', name: 'Cable Shrug', targetSets: 4, targetReps: '15' },
        ],
      },
      {
        id: 'bsp1_back_bi',
        name: 'Back & Bicep (BSP1)',
        exercises: [
          { id: 'bsp1_wide_pullup', name: 'Wide Grip Pull Up', targetSets: 5, targetReps: '8' },
          { id: 'bsp1_close_pulldown', name: 'Close-Grip Pulldown', targetSets: 5, targetReps: '8' },
          { id: 'bsp1_wide_pulldown', name: 'Lat Machine Wide Grip Pulldown', targetSets: 5, targetReps: '10' },
          { id: 'bsp1_close_row', name: 'Cable Seated Close Grip Row', targetSets: 5, targetReps: '10' },
          { id: 'bsp1_bicep_curl', name: 'Barbell Bicep Curl', targetSets: 4, targetReps: '15' },
        ],
      },
      {
        id: 'bsp2_chest',
        name: 'Chest (BSP2)',
        exercises: [
          { id: 'bsp2_incline_press', name: 'Barbell Incline Bench Press', targetSets: 4, targetReps: '8' },
          { id: 'bsp2_db_incline_press', name: 'DB Incline Bench Press', targetSets: 3, targetReps: '10' },
          { id: 'bsp2_db_bench_press', name: 'DB Bench Press', targetSets: 3, targetReps: '10' },
          { id: 'bsp2_dip', name: 'Dip', targetSets: 1, targetReps: 'max reps' },
          { id: 'bsp2_pushup', name: 'Push Up', targetSets: 1, targetReps: 'max reps' },
        ],
      },
      {
        id: 'bsp2_opt_chest_shoulders',
        name: 'Optional Chest & Shoulders (BSP2)',
        exercises: [
          { id: 'bsp2_opt_bench', name: 'Barbell Bench Press', targetSets: 2, targetReps: '12' },
          { id: 'bsp2_opt_chest_fly', name: 'Machine Seated Chest Fly', targetSets: 2, targetReps: '20' },
          { id: 'bsp2_opt_shoulder_press', name: 'Machine Seated Shoulder Press', targetSets: 2, targetReps: '20' },
          { id: 'bsp2_opt_rear_lateral', name: 'DB Lying Reverse Lateral Raise', targetSets: 1, targetReps: '15' },
          { id: 'bsp2_opt_band_pull_apart', name: 'Band Pull Apart', targetSets: 1, targetReps: '30' },
        ],
      },
      {
        id: 'bsp2_shoulders_arms',
        name: 'Shoulders & Arms (BSP2)',
        exercises: [
          { id: 'bsp2_seated_ohp', name: 'Barbell Seated Shoulder Press', targetSets: 4, targetReps: '8' },
          { id: 'bsp2_lateral_raise', name: 'Machine Lateral Raise', targetSets: 3, targetReps: '15' },
          { id: 'bsp2_reverse_fly', name: 'Machine Seated Reverse Fly', targetSets: 3, targetReps: '15' },
          { id: 'bsp2_cable_bicep_curl', name: 'Cable Bicep Curl', targetSets: 3, targetReps: '15' },
          { id: 'bsp2_tricep_pushdown', name: 'Cable Straight Bar Tricep Pushdown', targetSets: 3, targetReps: '15' },
        ],
      },
      {
        id: 'bsp2_legs',
        name: 'Legs (BSP2)',
        exercises: [
          { id: 'bsp2_seated_leg_curl', name: 'Machine Seated Leg Curl', targetSets: 4, targetReps: '10' },
          { id: 'bsp2_leg_press', name: 'Machine Leg Press', targetSets: 4, targetReps: '10' },
          { id: 'bsp2_split_squat', name: 'DB Rear Foot Elevated Split Squat', targetSets: 3, targetReps: '15 ea leg' },
          { id: 'bsp2_straight_leg_dl', name: 'DB Straight Leg Deadlift', targetSets: 3, targetReps: '15' },
          { id: 'bsp2_calf_raise', name: 'Machine Seated Calf Raise', targetSets: 3, targetReps: '15' },
        ],
      },
      {
        id: 'bsp2_back',
        name: 'Back (BSP2)',
        exercises: [
          { id: 'bsp2_rack_pull', name: 'Rack Pull Dead Lift', targetSets: 4, targetReps: '8' },
          { id: 'bsp2_wide_pulldown', name: 'Lat Machine Wide Grip Pulldown', targetSets: 4, targetReps: '10' },
          { id: 'bsp2_neutral_row', name: 'Machine Seated Neutral Grip Row', targetSets: 4, targetReps: '10' },
          { id: 'bsp2_band_pullup', name: 'Band Assisted Wide Grip Pull Up', targetSets: 2, targetReps: '8' },
          { id: 'bsp2_straight_arm', name: 'Lat Machine Standing Straight Arm', targetSets: 2, targetReps: '15' },
        ],
      },
      {
        id: 'bsp3_chest',
        name: 'Chest (BSP3)',
        exercises: [
          { id: 'bsp3_bench_press', name: 'Barbell Bench Press', targetSets: 4, targetReps: '8' },
          { id: 'bsp3_db_incline_press', name: 'DB Incline Bench Press', targetSets: 3, targetReps: '10' },
          { id: 'bsp3_dip', name: 'Dip', targetSets: 2, targetReps: '15' },
          { id: 'bsp3_chest_press', name: 'Machine Seated Chest Press', targetSets: 2, targetReps: '15' },
          { id: 'bsp3_chest_fly', name: 'Cable Seated Chest Fly', targetSets: 2, targetReps: '15' },
        ],
      },
      {
        id: 'bsp3_back',
        name: 'Back (BSP3)',
        exercises: [
          { id: 'bsp3_single_arm_row', name: 'DB Single Arm Bent Over Row', targetSets: 5, targetReps: '10 ea arm' },
          { id: 'bsp3_wide_pullup', name: 'Wide Grip Pull Up', targetSets: 4, targetReps: '8' },
          { id: 'bsp3_incline_row', name: 'DB Incline Bench Row', targetSets: 5, targetReps: '10' },
          { id: 'bsp3_close_pulldown', name: 'Close-Grip Pulldown', targetSets: 5, targetReps: '10' },
          { id: 'bsp3_pullover', name: 'Cable Pullover', targetSets: 3, targetReps: '20' },
        ],
      },
      {
        id: 'bsp3_shoulders_arms',
        name: 'Shoulders & Arms (BSP3)',
        exercises: [
          { id: 'bsp3_lateral_raise', name: 'Machine Lateral Raise', targetSets: 4, targetReps: '20' },
          { id: 'bsp3_reverse_fly', name: 'Machine Seated Reverse Fly', targetSets: 4, targetReps: '20' },
          { id: 'bsp3_db_shoulder_press', name: 'DB Seated Shoulder Press', targetSets: 5, targetReps: '10' },
          { id: 'bsp3_incline_bicep_curl', name: 'DB Incline Bicep Curl', targetSets: 3, targetReps: '20' },
          { id: 'bsp3_tricep_pushdown', name: 'Cable Straight Bar Tricep Pushdown', targetSets: 3, targetReps: '20' },
        ],
      },
      {
        id: 'bsp4_chest',
        name: 'Chest (BSP4)',
        exercises: [
          { id: 'bsp4_bench_press', name: 'Barbell Bench Press', targetSets: 1, targetReps: 'work to 6RM' },
          { id: 'bsp4_db_incline_press', name: 'DB Incline Bench Press', targetSets: 1, targetReps: 'work to 10RM' },
          { id: 'bsp4_db_bench_press', name: 'DB Bench Press', targetSets: 1, targetReps: 'work to 10RM' },
          { id: 'bsp4_dip', name: 'Dip', targetSets: 1, targetReps: 'work to 10RM' },
          { id: 'bsp4_chest_fly', name: 'Machine Seated Chest Fly', targetSets: 4, targetReps: '15' },
        ],
      },
      {
        id: 'bsp4_back',
        name: 'Back (BSP4)',
        exercises: [
          { id: 'bsp4_rack_pull', name: 'Rack Pull Dead Lift', targetSets: 1, targetReps: 'work to 6RM' },
          { id: 'bsp4_close_pulldown', name: 'Close-Grip Pulldown', targetSets: 4, targetReps: 'work to 8RM' },
          { id: 'bsp4_wide_row', name: 'Cable Seated Wide Grip Row', targetSets: 4, targetReps: '15' },
          { id: 'bsp4_wide_bar_close_pulldown', name: 'Lat Machine Wide Bar Close Grip Pulldown', targetSets: 4, targetReps: '15' },
          { id: 'bsp4_straight_arm', name: 'Lat Machine Standing Straight Arm', targetSets: 3, targetReps: '20' },
        ],
      },
      {
        id: 'bsp4_shoulders_arms',
        name: 'Shoulders & Arms (BSP4)',
        exercises: [
          { id: 'bsp4_ohp', name: 'Barbell Overhead Press', targetSets: 1, targetReps: 'work to 10RM' },
          { id: 'bsp4_lateral_raise', name: 'Dumbbell Lateral Raise', targetSets: 4, targetReps: '20' },
          { id: 'bsp4_band_pull_apart', name: 'Band Pull Apart', targetSets: 4, targetReps: '30' },
          { id: 'bsp4_tricep_ext', name: 'Cable Rope Tricep Extension', targetSets: 4, targetReps: '20' },
          { id: 'bsp4_bicep_curl', name: 'Dumbbell Bicep Curl', targetSets: 4, targetReps: '20' },
        ],
      },
    ],
  },
];

function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function addDays(dateStr, n) {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + n);
  return formatDate(d);
}
function getWeekDates(anchorDateStr) {
  const d = parseDate(anchorDateStr);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(monday);
    dd.setDate(monday.getDate() + i);
    return formatDate(dd);
  });
}
function niceLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return 'TODAY';
  const d = parseDate(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase();
}
function defaultRepsFromRange(rangeStr) {
  const match = String(rangeStr).match(/\d+/);
  return match ? Number(match[0]) : 10;
}
function inferEquipment(name) {
  const n = String(name).toLowerCase();
  if (n.includes('smith machine')) return 'Smith Machine';
  if (n.includes('barbell') || n.includes('rack pull') || n.includes('back squat')) return 'Barbell';
  if (n.includes('dumbbell') || /\bdb\b/.test(n)) return 'Dumbbell';
  if (n.includes('band')) return 'Band';
  if (n.includes('cable')) return 'Cable';
  if (n.includes('machine')) return 'Machine';
  if (
    n.includes('dip') ||
    n.includes('push up') ||
    n.includes('pull up') ||
    n.includes('pullup') ||
    n.includes('chin up') ||
    n.includes('plank') ||
    n.includes('sit up') ||
    n.includes('crunch') ||
    n.includes('leg raise') ||
    n.includes('farmer') ||
    n.includes('twist') ||
    n.includes('exercise bike')
  )
    return 'Bodyweight';
  return 'Other';
}
const EQUIPMENT_COLORS = {
  Barbell: '#C8443C',
  Dumbbell: '#5B8DBE',
  Machine: '#8B909A',
  Cable: '#6FA47C',
  'Smith Machine': '#B07AC7',
  Band: '#E8B84B',
  Bodyweight: '#D97757',
  Other: '#8B909A',
};
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.2, ctx.currentTime);
    o.start();
    o.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}
function dayNumberFor(dateStr, programStart) {
  return Math.floor((parseDate(dateStr) - parseDate(programStart)) / 86400000) + 1;
}
function blockForDay(dayNumber, blocks) {
  if (!blocks.length) return null;
  const found = blocks.find((b) => dayNumber >= b.startDay && dayNumber <= b.endDay);
  if (found) return found;
  // beyond all defined ranges: fall back to the last block
  return blocks[blocks.length - 1];
}
function suggestedRoutine(dayNumber, blocks) {
  const block = blockForDay(dayNumber, blocks);
  if (!block || !block.routines.length) return { block, routine: null };
  const idx = ((dayNumber - block.startDay) % block.routines.length + block.routines.length) % block.routines.length;
  return { block, routine: block.routines[idx] };
}
function findRoutineById(blocks, routineId) {
  for (const b of blocks) {
    const r = b.routines.find((rt) => rt.id === routineId);
    if (r) return { block: b, routine: r };
  }
  return null;
}

function buildDefaultDay(routine) {
  return {
    routineId: routine.id,
    cardio: { type: 'treadmill', amount: '', done: false },
    lifts: Object.fromEntries(
      routine.exercises.map((ex) => [
        ex.id,
        {
          name: ex.name,
          sets: Array.from({ length: ex.targetSets }, () => ({ weight: '', reps: '', done: false, skipped: false })),
        },
      ])
    ),
  };
}

function FitnessModule() {
  const todayStr = formatDate(new Date());
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [view, setView] = useState('today');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [weekAnchor, setWeekAnchor] = useState(todayStr);
  const [dayCache, setDayCache] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [draftBlocks, setDraftBlocks] = useState([]);
  const [draftStart, setDraftStart] = useState(todayStr);
  const [activeSettingsBlock, setActiveSettingsBlock] = useState(0);
  const [activeSettingsRoutine, setActiveSettingsRoutine] = useState(0);
  const [syncError, setSyncError] = useState(false);

  useEffect(() => {
    (async () => {
      let m = null;
      try {
        const res = await safeStorage.get('meta', false);
        if (res && res.value) m = JSON.parse(res.value);
      } catch (e) {
        m = null;
      }
      if (!m) {
        m = { programStart: todayStr, blocks: DEFAULT_BLOCKS };
        try {
          await safeStorage.set('meta', JSON.stringify(m), false);
        } catch (e) {}
      }
      setMeta(m);
      setLoading(false);
    })();
  }, []);

  const ensureDay = useCallback(
    async (date) => {
      if (!meta) return null;
      if (dayCache[date]) return dayCache[date];
      let d = null;
      try {
        const res = await safeStorage.get(`day:${date}`, false);
        if (res && res.value) d = JSON.parse(res.value);
      } catch (e) {
        d = null;
      }
      if (!d) {
        const dn = dayNumberFor(date, meta.programStart);
        const { routine } = suggestedRoutine(dn, meta.blocks);
        d = buildDefaultDay(routine || meta.blocks[0].routines[0]);
      }
      setDayCache((prev) => ({ ...prev, [date]: d }));
      return d;
    },
    [meta, dayCache]
  );

  useEffect(() => {
    if (meta) ensureDay(selectedDate);
  }, [meta, selectedDate]);

  useEffect(() => {
    if (meta && view === 'week') {
      getWeekDates(weekAnchor).forEach((d) => ensureDay(d));
    }
  }, [meta, view, weekAnchor]);

  async function saveDay(date, newData) {
    setDayCache((prev) => ({ ...prev, [date]: newData }));
    try {
      const res = await safeStorage.set(`day:${date}`, JSON.stringify(newData), false);
      setSyncError(!res);
    } catch (e) {
      setSyncError(true);
    }
  }

  function switchRoutine(date, routineId) {
    const found = findRoutineById(meta.blocks, routineId);
    if (!found) return;
    const fresh = buildDefaultDay(found.routine);
    const cur = dayCache[date];
    if (cur) fresh.cardio = cur.cardio;
    saveDay(date, fresh);
    setShowBrowse(false);
  }

  function updateCardio(date, patch) {
    const cur = dayCache[date];
    if (!cur) return;
    const next = { ...cur, cardio: { ...cur.cardio, ...patch } };
    saveDay(date, next);
  }

  async function saveExerciseHistory(date, exId, sets) {
    const hasWeight = sets.some((s) => s.weight !== '' && s.weight != null);
    if (!hasWeight) return;
    try {
      let existing = null;
      const res = await safeStorage.get(`exhist:${exId}`, false);
      if (res && res.value) existing = JSON.parse(res.value);
      if (!existing || existing.date <= date) {
        await safeStorage.set(
          `exhist:${exId}`,
          JSON.stringify({ date, sets: sets.map((s) => ({ weight: s.weight, reps: s.reps })) }),
          false
        );
      }
    } catch (e) {}
  }

  function updateSet(date, exId, setIdx, patch) {
    const cur = dayCache[date];
    if (!cur) return;
    const ex = cur.lifts[exId];
    const sets = ex.sets.map((s, i) => (i === setIdx ? { ...s, ...patch } : s));
    const next = { ...cur, lifts: { ...cur.lifts, [exId]: { ...ex, sets } } };
    saveDay(date, next);
    saveExerciseHistory(date, exId, sets);
  }

  function addSet(date, exId) {
    const cur = dayCache[date];
    if (!cur) return;
    const ex = cur.lifts[exId];
    const lastReps = ex.sets.length ? ex.sets[ex.sets.length - 1].reps : 10;
    const sets = [...ex.sets, { weight: '', reps: lastReps, done: false, skipped: false }];
    const next = { ...cur, lifts: { ...cur.lifts, [exId]: { ...ex, sets } } };
    saveDay(date, next);
  }

  function removeSet(date, exId, setIdx) {
    const cur = dayCache[date];
    if (!cur) return;
    const ex = cur.lifts[exId];
    const sets = ex.sets.filter((_, i) => i !== setIdx);
    const next = { ...cur, lifts: { ...cur.lifts, [exId]: { ...ex, sets } } };
    saveDay(date, next);
  }

  function clearAllReps(date) {
    const cur = dayCache[date];
    if (!cur) return;
    const lifts = {};
    Object.entries(cur.lifts).forEach(([exId, ex]) => {
      lifts[exId] = { ...ex, sets: ex.sets.map((s) => ({ ...s, reps: '' })) };
    });
    saveDay(date, { ...cur, lifts });
  }

  function openSettings() {
    setDraftBlocks(
      meta.blocks.map((b) => ({
        ...b,
        routines: b.routines.map((r) => ({ ...r, exercises: r.exercises.map((e) => ({ ...e })) })),
      }))
    );
    setDraftStart(meta.programStart);
    setActiveSettingsBlock(0);
    setActiveSettingsRoutine(0);
    setShowSettings(true);
  }

  async function saveSettings() {
    const cleaned = draftBlocks.map((b) => ({
      id: b.id,
      name: b.name.trim() || 'Untitled Block',
      startDay: Math.max(1, Number(b.startDay) || 1),
      endDay: Math.max(Number(b.startDay) || 1, Number(b.endDay) || 1),
      routines: b.routines.map((r) => ({
        id: r.id,
        name: r.name.trim() || 'Untitled',
        exercises: r.exercises
          .filter((e) => e.name.trim())
          .map((e) => ({
            id: e.id,
            name: e.name.trim(),
            targetSets: Math.max(1, Number(e.targetSets) || 1),
            targetReps: String(e.targetReps || '10'),
            videoUrl: (e.videoUrl || '').trim(),
          })),
      })),
    }));
    const nextMeta = { programStart: draftStart, blocks: cleaned };
    setMeta(nextMeta);
    try {
      await safeStorage.set('meta', JSON.stringify(nextMeta), false);
    } catch (e) {}
    setShowSettings(false);
  }

  if (loading || !meta) {
    return (
      <div style={{ background: COLORS.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONTS}</style>
        <div style={{ color: COLORS.textMuted, fontFamily: 'Inter, sans-serif' }}>Loading log…</div>
      </div>
    );
  }

  const dayNumber = dayNumberFor(selectedDate, meta.programStart);
  const phase = dayNumber <= 0 ? 'NOT STARTED' : dayNumber <= 45 ? 'PHASE 1 · FOUNDATION' : dayNumber <= 90 ? 'PHASE 2 · OVERLOAD' : 'PROGRAM COMPLETE';
  const progressPct = Math.min(100, Math.max(0, (Math.max(0, dayNumber) / 45) * 100));
  const displayDayNum = Math.max(0, Math.min(dayNumber, 90));

  const current = dayCache[selectedDate];
  const { block: suggestedBlock, routine: suggestedR } = suggestedRoutine(dayNumber, meta.blocks);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: COLORS.text, paddingBottom: 40 }}>
      <style>{FONTS}</style>

      <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${COLORS.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 3, color: COLORS.textMuted }}>SUCCESS</div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 32, fontWeight: 700, lineHeight: 1.1, marginTop: 2 }}>
              DAY {displayDayNum}<span style={{ color: COLORS.textMuted, fontSize: 20 }}>/45</span>
            </div>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 2, color: COLORS.accentGold, marginTop: 2 }}>{phase}</div>
            {suggestedBlock && (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                {suggestedBlock.name} · Day {dayNumber - suggestedBlock.startDay + 1} of {suggestedBlock.endDay - suggestedBlock.startDay + 1}
              </div>
            )}
          </div>
          <button onClick={openSettings} style={{ background: 'none', border: 'none', color: COLORS.textMuted, padding: 8, cursor: 'pointer' }} aria-label="Settings">
            <Settings size={22} />
          </button>
        </div>

        <div style={{ marginTop: 14, height: 10, background: COLORS.surface2, borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLORS.line}` }}>
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              backgroundImage: `repeating-linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accent} 6px, ${COLORS.accentGold} 6px, ${COLORS.accentGold} 12px)`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div style={{ display: 'flex', marginTop: 16, background: COLORS.surface, borderRadius: 8, padding: 3, border: `1px solid ${COLORS.line}` }}>
          {['today', 'week'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1,
                padding: '8px 0',
                background: view === v ? COLORS.accent : 'transparent',
                color: view === v ? '#fff' : COLORS.textMuted,
                border: 'none',
                borderRadius: 6,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 13,
                letterSpacing: 2,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {view === 'today' ? (
        <TodayView
          date={selectedDate}
          setDate={setSelectedDate}
          todayStr={todayStr}
          data={current}
          meta={meta}
          suggestedRoutineId={suggestedR ? suggestedR.id : null}
          showBrowse={showBrowse}
          setShowBrowse={setShowBrowse}
          onSwitchRoutine={(routineId) => switchRoutine(selectedDate, routineId)}
          onUpdateCardio={(patch) => updateCardio(selectedDate, patch)}
          onUpdateSet={(exId, idx, patch) => updateSet(selectedDate, exId, idx, patch)}
          onAddSet={(exId) => addSet(selectedDate, exId)}
          onRemoveSet={(exId, idx) => removeSet(selectedDate, exId, idx)}
          onClearReps={() => clearAllReps(selectedDate)}
        />
      ) : (
        <WeekView
          weekAnchor={weekAnchor}
          setWeekAnchor={setWeekAnchor}
          todayStr={todayStr}
          dayCache={dayCache}
          meta={meta}
          onSelectDay={(d) => {
            setSelectedDate(d);
            setView('today');
          }}
        />
      )}

      {syncError && (
        <div style={{ position: 'fixed', bottom: 12, left: 12, right: 12, background: COLORS.surface2, border: `1px solid ${COLORS.accent}`, borderRadius: 8, padding: '8px 12px', fontSize: 12, color: COLORS.textMuted }}>
          Couldn't sync your last change. Keep going — it'll retry.
        </div>
      )}

      {showSettings && (
        <SettingsModal
          draftBlocks={draftBlocks}
          setDraftBlocks={setDraftBlocks}
          draftStart={draftStart}
          setDraftStart={setDraftStart}
          activeBlock={activeSettingsBlock}
          setActiveBlock={setActiveSettingsBlock}
          activeRoutine={activeSettingsRoutine}
          setActiveRoutine={setActiveSettingsRoutine}
          onClose={() => setShowSettings(false)}
          onSave={saveSettings}
        />
      )}
    </div>
  );
}

function TodayView({ date, setDate, todayStr, data, meta, suggestedRoutineId, showBrowse, setShowBrowse, onSwitchRoutine, onUpdateCardio, onUpdateSet, onAddSet, onRemoveSet, onClearReps }) {
  const [restEndTime, setRestEndTime] = useState(null);
  const [restTotal, setRestTotal] = useState(90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restFinished, setRestFinished] = useState(false);

  useEffect(() => {
    if (!restEndTime) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((restEndTime - Date.now()) / 1000));
      setRestRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setRestEndTime(null);
        setRestFinished(true);
        try {
          navigator.vibrate && navigator.vibrate([200, 100, 200]);
        } catch (e) {}
        playBeep();
      }
    }, 250);
    return () => clearInterval(interval);
  }, [restEndTime]);

  function startRest(seconds) {
    setRestTotal(seconds);
    setRestRemaining(seconds);
    setRestEndTime(Date.now() + seconds * 1000);
    setRestFinished(false);
  }
  function stopRest() {
    setRestEndTime(null);
    setRestRemaining(0);
    setRestFinished(false);
  }

  const [historyMap, setHistoryMap] = useState({});
  useEffect(() => {
    if (!data || !meta) return;
    let cancelled = false;
    const found = findRoutineById(meta.blocks, data.routineId);
    const routineForHistory = found ? found.routine : meta.blocks[0].routines[0];
    (async () => {
      const entries = {};
      for (const ex of routineForHistory.exercises) {
        try {
          const res = await safeStorage.get(`exhist:${ex.id}`, false);
          if (res && res.value) entries[ex.id] = JSON.parse(res.value);
        } catch (e) {}
      }
      if (!cancelled) setHistoryMap(entries);
    })();
    return () => {
      cancelled = true;
    };
  }, [data && data.routineId, meta]);

  if (!data) {
    return <div style={{ padding: 16, color: COLORS.textMuted }}>Loading day…</div>;
  }
  const found = findRoutineById(meta.blocks, data.routineId);
  const routine = found ? found.routine : meta.blocks[0].routines[0];
  const totalSets = Object.values(data.lifts).reduce((acc, ex) => acc + ex.sets.filter((s) => !s.skipped).length, 0);
  const doneSets = Object.values(data.lifts).reduce((acc, ex) => acc + ex.sets.filter((s) => s.done && !s.skipped).length, 0);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setDate(addDays(date, -1))} style={navBtnStyle}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, letterSpacing: 2, color: COLORS.text }}>{niceLabel(date, todayStr)}</div>
        <button onClick={() => setDate(addDays(date, 1))} style={navBtnStyle}>
          <ChevronRight size={20} />
        </button>
      </div>

      <button
        onClick={() => setShowBrowse(!showBrowse)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: COLORS.surface,
          border: `1px solid ${COLORS.line}`,
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: showBrowse ? 8 : 14,
          cursor: 'pointer',
          color: COLORS.text,
        }}
      >
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 1 }}>
          {routine.name.toUpperCase()}
          {data.routineId === suggestedRoutineId && (
            <span style={{ color: COLORS.accentGold, fontSize: 10, marginLeft: 8 }}>SUGGESTED</span>
          )}
        </span>
        {showBrowse ? <ChevronUp size={16} color={COLORS.textMuted} /> : <ChevronDown size={16} color={COLORS.textMuted} />}
      </button>

      {showBrowse && (
        <div style={{ marginBottom: 14 }}>
          {meta.blocks.map((b) => (
            <div key={b.id} style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 1.5, color: COLORS.textMuted, marginBottom: 6 }}>
                {b.name.toUpperCase()}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {b.routines.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onSwitchRoutine(r.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: `1px solid ${data.routineId === r.id ? COLORS.accent : r.id === suggestedRoutineId ? COLORS.accentGold : COLORS.line}`,
                      background: data.routineId === r.id ? 'rgba(200,68,60,0.15)' : 'transparent',
                      color: data.routineId === r.id ? COLORS.text : COLORS.textMuted,
                      fontSize: 11,
                      fontFamily: 'Oswald, sans-serif',
                      letterSpacing: 0.5,
                      cursor: 'pointer',
                    }}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={18} color={COLORS.accentGold} />
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1 }}>CARDIO</span>
          </div>
          <CheckCircle done={data.cardio.done} onToggle={() => onUpdateCardio({ done: !data.cardio.done })} />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          {['treadmill', 'basketball'].map((t) => (
            <button
              key={t}
              onClick={() => onUpdateCardio({ type: t })}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: `1px solid ${data.cardio.type === t ? COLORS.accentGold : COLORS.line}`,
                background: data.cardio.type === t ? 'rgba(232,184,75,0.1)' : 'transparent',
                color: data.cardio.type === t ? COLORS.accentGold : COLORS.textMuted,
                fontSize: 12,
                fontFamily: 'Inter, sans-serif',
                cursor: 'pointer',
              }}
            >
              {t === 'treadmill' ? 'Treadmill' : 'Basketball'}
            </button>
          ))}
          <input
            type="text"
            inputMode="decimal"
            placeholder={data.cardio.type === 'treadmill' ? 'miles' : 'shots/steps'}
            value={data.cardio.amount}
            onChange={(e) => onUpdateCardio({ amount: e.target.value })}
            style={{ ...inputStyle, flex: 1, minWidth: 0 }}
          />
        </div>
      </div>

      <div style={{ ...cardStyle, textAlign: 'center' }}>
        {restEndTime || restFinished ? (
          <>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 36,
                fontWeight: 600,
                color: restFinished ? COLORS.accentGold : COLORS.text,
                letterSpacing: 1,
              }}
            >
              {restFinished ? "TIME'S UP" : `0:${String(restRemaining).padStart(2, '0')}`}
            </div>
            {!restFinished && (
              <div style={{ height: 6, background: COLORS.surface2, borderRadius: 3, overflow: 'hidden', margin: '10px 0', border: `1px solid ${COLORS.line}` }}>
                <div
                  style={{
                    width: `${(restRemaining / restTotal) * 100}%`,
                    height: '100%',
                    background: COLORS.accentGold,
                    transition: 'width 0.25s linear',
                  }}
                />
              </div>
            )}
            <button
              onClick={stopRest}
              style={{
                marginTop: 8,
                padding: '6px 16px',
                background: 'none',
                border: `1px solid ${COLORS.line}`,
                borderRadius: 6,
                color: COLORS.textMuted,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 11,
                letterSpacing: 1,
                cursor: 'pointer',
              }}
            >
              {restFinished ? 'DISMISS' : 'STOP'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1.5, color: COLORS.textMuted, marginBottom: 10 }}>REST TIMER</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {[60, 90, 120].map((s) => (
                <button
                  key={s}
                  onClick={() => startRest(s)}
                  style={{
                    flex: 1,
                    maxWidth: 90,
                    padding: '10px 0',
                    background: COLORS.surface2,
                    border: `1px solid ${COLORS.line}`,
                    borderRadius: 8,
                    color: COLORS.text,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  {s}s
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 0 10px' }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1 }}>STRENGTH</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={onClearReps}
            style={{ background: 'none', border: 'none', color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 0.5, cursor: 'pointer', padding: 0 }}
          >
            CLEAR REPS
          </button>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: COLORS.textMuted }}>
            {doneSets}/{totalSets} SETS
          </span>
        </div>
      </div>

      {routine.exercises.map((ex) => {
        const exData = data.lifts[ex.id];
        if (!exData) return null;
        return (
          <div key={ex.id} style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>{exData.name}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.textMuted }}>
                target {ex.targetSets}×{ex.targetReps}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  fontSize: 9,
                  fontFamily: 'Oswald, sans-serif',
                  letterSpacing: 0.5,
                  padding: '2px 7px',
                  borderRadius: 4,
                  color: EQUIPMENT_COLORS[inferEquipment(exData.name)] || COLORS.textMuted,
                  border: `1px solid ${EQUIPMENT_COLORS[inferEquipment(exData.name)] || COLORS.line}`,
                }}
              >
                {inferEquipment(exData.name).toUpperCase()}
              </span>
              {ex.videoUrl && (
                <a
                  href={ex.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 4, color: COLORS.accentGold, fontSize: 10, fontFamily: 'Oswald, sans-serif', letterSpacing: 0.5, textDecoration: 'none' }}
                >
                  <PlayCircle size={12} /> WATCH
                </a>
              )}
              {exData.sets.length > 1 && (
                <button
                  onClick={() => {
                    const first = exData.sets[0];
                    exData.sets.forEach((_, i) => {
                      if (i === 0) return;
                      onUpdateSet(ex.id, i, { weight: first.weight, reps: first.reps });
                    });
                  }}
                  disabled={!exData.sets[0].weight}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    background: 'none',
                    border: 'none',
                    color: exData.sets[0].weight ? COLORS.textMuted : COLORS.line,
                    fontSize: 10,
                    fontFamily: 'Oswald, sans-serif',
                    letterSpacing: 0.5,
                    cursor: exData.sets[0].weight ? 'pointer' : 'default',
                    padding: 0,
                    marginLeft: 'auto',
                  }}
                >
                  <Copy size={11} /> FILL ALL
                </button>
              )}
            </div>
            {historyMap[ex.id] && historyMap[ex.id].date !== date && (
              <div
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: COLORS.accentGold,
                  marginBottom: 10,
                  padding: '5px 8px',
                  background: COLORS.surface2,
                  borderRadius: 5,
                }}
              >
                LAST TIME ({niceLabel(historyMap[ex.id].date, todayStr)}): {(historyMap[ex.id].sets || []).map((s) => `${s.weight || '–'}×${s.reps}`).join(', ')}
              </div>
            )}
            {exData.sets.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, opacity: s.skipped ? 0.45 : 1 }}>
                <span style={{ width: 18, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: COLORS.textMuted }}>{idx + 1}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="lbs"
                  value={s.weight}
                  disabled={s.skipped}
                  onChange={(e) => onUpdateSet(ex.id, idx, { weight: e.target.value })}
                  style={{ ...inputStyle, width: 64 }}
                />
                <span style={{ color: COLORS.textMuted, fontSize: 12 }}>×</span>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="reps"
                  value={s.reps}
                  disabled={s.skipped}
                  onChange={(e) => onUpdateSet(ex.id, idx, { reps: e.target.value })}
                  style={{ ...inputStyle, width: 52 }}
                />
                <div style={{ flex: 1 }} />
                {s.skipped ? (
                  <span style={{ fontSize: 9, fontFamily: 'Oswald, sans-serif', letterSpacing: 0.5, color: COLORS.textMuted }}>SKIPPED</span>
                ) : (
                  <CheckCircle small done={s.done} onToggle={() => onUpdateSet(ex.id, idx, { done: !s.done })} />
                )}
                <button
                  onClick={() => onUpdateSet(ex.id, idx, { skipped: !s.skipped, done: false })}
                  title={s.skipped ? 'Unskip set' : 'Skip set'}
                  style={{ background: 'none', border: 'none', color: s.skipped ? COLORS.accentGold : COLORS.textMuted, cursor: 'pointer', padding: 2, display: 'flex' }}
                >
                  <SkipForward size={14} />
                </button>
                <button onClick={() => onRemoveSet(ex.id, idx)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: 2 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => onAddSet(ex.id)} style={addSetBtnStyle}>
              <Plus size={13} /> ADD SET
            </button>
          </div>
        );
      })}
    </div>
  );
}

function WeekView({ weekAnchor, setWeekAnchor, todayStr, dayCache, meta, onSelectDay }) {
  const dates = getWeekDates(weekAnchor);
  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setWeekAnchor(addDays(weekAnchor, -7))} style={navBtnStyle}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 2, color: COLORS.textMuted }}>
          {dates[0]} — {dates[6]}
        </div>
        <button onClick={() => setWeekAnchor(addDays(weekAnchor, 7))} style={navBtnStyle}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
        {dates.map((date) => {
          const d = dayCache[date];
          const totalSets = d ? Object.values(d.lifts).reduce((a, ex) => a + ex.sets.filter((s) => !s.skipped).length, 0) : 0;
          const doneSets = d ? Object.values(d.lifts).reduce((a, ex) => a + ex.sets.filter((s) => s.done && !s.skipped).length, 0) : 0;
          const cardioDone = d ? d.cardio.done : false;
          const found = d ? findRoutineById(meta.blocks, d.routineId) : null;
          const routineName = found ? found.routine.name : '';
          const isToday = date === todayStr;
          const dayLetter = parseDate(date).toLocaleDateString('en-US', { weekday: 'short' })[0];
          return (
            <button
              key={date}
              onClick={() => onSelectDay(date)}
              style={{
                background: isToday ? 'rgba(200,68,60,0.12)' : COLORS.surface,
                border: `1px solid ${isToday ? COLORS.accent : COLORS.line}`,
                borderRadius: 8,
                padding: '10px 4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
                color: COLORS.text,
              }}
            >
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, color: COLORS.textMuted }}>{dayLetter}</span>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14 }}>{parseDate(date).getDate()}</span>
              <div style={{ display: 'flex', gap: 3, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: cardioDone ? COLORS.accentGold : COLORS.line }} />
                <span style={{ width: 6, height: 6, borderRadius: 3, background: totalSets > 0 && doneSets === totalSets ? COLORS.success : COLORS.line }} />
              </div>
              {totalSets > 0 && (
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: COLORS.textMuted }}>
                  {doneSets}/{totalSets}
                </span>
              )}
              {routineName && (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, color: COLORS.textMuted, textAlign: 'center', lineHeight: 1.2 }}>
                  {routineName.replace('Upper ', '')}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ marginTop: 16, fontSize: 12, color: COLORS.textMuted, display: 'flex', gap: 16 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: COLORS.accentGold, display: 'inline-block' }} /> cardio done
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: COLORS.success, display: 'inline-block' }} /> all sets done
        </span>
      </div>
    </div>
  );
}

function CheckCircle({ done, onToggle, small }) {
  const size = small ? 22 : 26;
  return (
    <button
      onClick={onToggle}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${done ? COLORS.success : COLORS.line}`,
        background: done ? COLORS.success : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
    >
      {done && <Check size={small ? 13 : 15} color="#fff" />}
    </button>
  );
}

function SettingsModal({ draftBlocks, setDraftBlocks, draftStart, setDraftStart, activeBlock, setActiveBlock, activeRoutine, setActiveRoutine, onClose, onSave }) {
  const block = draftBlocks[activeBlock];
  const routine = block ? block.routines[activeRoutine] : null;

  function updateBlock(patch) {
    setDraftBlocks((prev) => prev.map((b, i) => (i === activeBlock ? { ...b, ...patch } : b)));
  }
  function updateRoutineName(name) {
    setDraftBlocks((prev) =>
      prev.map((b, i) => (i === activeBlock ? { ...b, routines: b.routines.map((r, j) => (j === activeRoutine ? { ...r, name } : r)) } : b))
    );
  }
  function updateEx(idx, patch) {
    setDraftBlocks((prev) =>
      prev.map((b, i) =>
        i === activeBlock
          ? {
              ...b,
              routines: b.routines.map((r, j) =>
                j === activeRoutine ? { ...r, exercises: r.exercises.map((e, k) => (k === idx ? { ...e, ...patch } : e)) } : r
              ),
            }
          : b
      )
    );
  }
  function removeEx(idx) {
    setDraftBlocks((prev) =>
      prev.map((b, i) =>
        i === activeBlock
          ? { ...b, routines: b.routines.map((r, j) => (j === activeRoutine ? { ...r, exercises: r.exercises.filter((_, k) => k !== idx) } : r)) }
          : b
      )
    );
  }
  function addEx() {
    setDraftBlocks((prev) =>
      prev.map((b, i) =>
        i === activeBlock
          ? {
              ...b,
              routines: b.routines.map((r, j) =>
                j === activeRoutine
                  ? { ...r, exercises: [...r.exercises, { id: `ex_${Date.now()}`, name: '', targetSets: 3, targetReps: '10', videoUrl: '' }] }
                  : r
              ),
            }
          : b
      )
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
      <div style={{ background: COLORS.bg, width: '100%', maxWidth: 560, margin: '0 auto', maxHeight: '85vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', border: `1px solid ${COLORS.line}`, borderBottom: 'none', padding: 20, color: COLORS.text }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, letterSpacing: 1 }}>SETTINGS</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6, letterSpacing: 1 }}>PROGRAM START DATE</div>
          <input type="date" value={draftStart} onChange={(e) => setDraftStart(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
        </div>

        <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1 }}>BLOCKS (BY WEEK RANGE)</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {draftBlocks.map((b, i) => (
            <button
              key={b.id}
              onClick={() => {
                setActiveBlock(i);
                setActiveRoutine(0);
              }}
              style={{
                padding: '6px 10px',
                borderRadius: 6,
                border: `1px solid ${activeBlock === i ? COLORS.accent : COLORS.line}`,
                background: activeBlock === i ? 'rgba(200,68,60,0.15)' : 'transparent',
                color: COLORS.text,
                fontSize: 11,
                fontFamily: 'Oswald, sans-serif',
                cursor: 'pointer',
              }}
            >
              {b.name || 'Untitled'}
            </button>
          ))}
        </div>

        {block && (
          <>
            <input
              type="text"
              value={block.name}
              onChange={(e) => updateBlock({ name: e.target.value })}
              placeholder="Block name"
              style={{ ...inputStyle, width: '100%', marginBottom: 8, fontFamily: 'Oswald, sans-serif', fontSize: 14 }}
            />
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>START DAY #</div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={block.startDay}
                  onChange={(e) => updateBlock({ startDay: e.target.value })}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 4 }}>END DAY #</div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={block.endDay}
                  onChange={(e) => updateBlock({ endDay: e.target.value })}
                  style={{ ...inputStyle, width: '100%' }}
                />
              </div>
            </div>

            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, letterSpacing: 1 }}>ROUTINES IN THIS BLOCK</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {block.routines.map((r, i) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoutine(i)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: `1px solid ${activeRoutine === i ? COLORS.accentGold : COLORS.line}`,
                    background: activeRoutine === i ? 'rgba(232,184,75,0.12)' : 'transparent',
                    color: COLORS.text,
                    fontSize: 11,
                    fontFamily: 'Oswald, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  {r.name || 'Untitled'}
                </button>
              ))}
            </div>

            {routine && (
              <>
                <input
                  type="text"
                  value={routine.name}
                  onChange={(e) => updateRoutineName(e.target.value)}
                  placeholder="Routine name"
                  style={{ ...inputStyle, width: '100%', marginBottom: 12 }}
                />
                {routine.exercises.map((ex, idx) => (
                  <div key={ex.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${COLORS.line}` }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Exercise name"
                        value={ex.name}
                        onChange={(e) => updateEx(idx, { name: e.target.value })}
                        style={{ ...inputStyle, flex: 1 }}
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="sets"
                        value={ex.targetSets}
                        onChange={(e) => updateEx(idx, { targetSets: e.target.value })}
                        style={{ ...inputStyle, width: 46 }}
                      />
                      <input
                        type="text"
                        placeholder="reps"
                        value={ex.targetReps}
                        onChange={(e) => updateEx(idx, { targetReps: e.target.value })}
                        style={{ ...inputStyle, width: 70 }}
                      />
                      <button onClick={() => removeEx(idx)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: 'Oswald, sans-serif',
                          letterSpacing: 0.5,
                          padding: '3px 7px',
                          borderRadius: 4,
                          color: EQUIPMENT_COLORS[inferEquipment(ex.name)] || COLORS.textMuted,
                          border: `1px solid ${EQUIPMENT_COLORS[inferEquipment(ex.name)] || COLORS.line}`,
                          flexShrink: 0,
                        }}
                      >
                        {inferEquipment(ex.name).toUpperCase()}
                      </span>
                      <input
                        type="text"
                        placeholder="Video link (optional)"
                        value={ex.videoUrl || ''}
                        onChange={(e) => updateEx(idx, { videoUrl: e.target.value })}
                        style={{ ...inputStyle, flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 12 }}
                      />
                    </div>
                  </div>
                ))}
                <button onClick={addEx} style={{ ...addSetBtnStyle, marginBottom: 20 }}>
                  <Plus size={13} /> ADD EXERCISE
                </button>
              </>
            )}
          </>
        )}

        <button
          onClick={onSave}
          style={{
            width: '100%',
            padding: '12px 0',
            background: COLORS.accent,
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'Oswald, sans-serif',
            letterSpacing: 2,
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          SAVE
        </button>
      </div>
    </div>
  );
}

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}
function minutesToLabel(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ---------------------------------------------------------------------------
// Google Calendar (read-only)
// Uses Google Identity Services token flow entirely client-side. No backend.
// The OAuth client ID is supplied by the page via window.__GOOGLE_CLIENT_ID__.
// ---------------------------------------------------------------------------
const GCAL_SCOPE = 'https://www.googleapis.com/auth/calendar.readonly';

let gsiScriptPromise = null;
let gcalTokenClient = null;
let gcalToken = null;
let gcalTokenExpiresAt = 0;

function getGoogleClientId() {
  return (typeof window !== 'undefined' && window.__GOOGLE_CLIENT_ID__) || '';
}

function loadGsiScript() {
  if (gsiScriptPromise) return gsiScriptPromise;
  gsiScriptPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return reject(new Error('no document'));
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return resolve();
    const existing = document.querySelector('script[data-gsi="1"]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Could not load Google sign-in')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.defer = true;
    s.dataset.gsi = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Could not load Google sign-in'));
    document.head.appendChild(s);
  });
  return gsiScriptPromise;
}

// Requests an access token. `silent` avoids showing the consent popup, which
// works once the user has already granted access in this browser.
function requestGcalToken({ silent }) {
  return new Promise(async (resolve, reject) => {
    const clientId = getGoogleClientId();
    if (!clientId) return reject(new Error('NO_CLIENT_ID'));
    try {
      await loadGsiScript();
    } catch (e) {
      return reject(e);
    }
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      return reject(new Error('Google sign-in unavailable'));
    }
    try {
      gcalTokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: GCAL_SCOPE,
        callback: (resp) => {
          if (resp && resp.access_token) {
            gcalToken = resp.access_token;
            gcalTokenExpiresAt = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
            resolve(gcalToken);
          } else {
            reject(new Error('No access token returned'));
          }
        },
        error_callback: (err) => reject(new Error((err && err.type) || 'Authorization failed')),
      });
      gcalTokenClient.requestAccessToken({ prompt: silent ? '' : 'consent' });
    } catch (e) {
      reject(e);
    }
  });
}

async function ensureGcalToken({ silent }) {
  if (gcalToken && Date.now() < gcalTokenExpiresAt) return gcalToken;
  return requestGcalToken({ silent });
}

async function fetchGcalEvents(startDateStr, endDateStr, { silent = true } = {}) {
  const token = await ensureGcalToken({ silent });
  const timeMin = new Date(`${startDateStr}T00:00:00`).toISOString();
  const endD = parseDate(endDateStr);
  endD.setDate(endD.getDate() + 1);
  const timeMax = endD.toISOString();
  const url =
    'https://www.googleapis.com/calendar/v3/calendars/primary/events' +
    `?timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}` +
    '&singleEvents=true&orderBy=startTime&maxResults=250';
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    gcalToken = null;
    throw new Error('AUTH_EXPIRED');
  }
  if (!res.ok) throw new Error(`Calendar error ${res.status}`);
  const data = await res.json();
  return (data.items || [])
    .filter((ev) => ev.status !== 'cancelled')
    .map((ev) => {
      const allDay = !!(ev.start && ev.start.date);
      const startRaw = (ev.start && (ev.start.dateTime || ev.start.date)) || null;
      const endRaw = (ev.end && (ev.end.dateTime || ev.end.date)) || null;
      const startD = startRaw ? new Date(allDay ? `${ev.start.date}T00:00:00` : startRaw) : null;
      const endDt = endRaw ? new Date(allDay ? `${ev.end.date}T00:00:00` : endRaw) : null;
      return {
        id: ev.id,
        title: ev.summary || '(no title)',
        allDay,
        dateStr: startD ? formatDate(startD) : null,
        startMinutes: startD && !allDay ? startD.getHours() * 60 + startD.getMinutes() : 0,
        endMinutes: endDt && !allDay ? endDt.getHours() * 60 + endDt.getMinutes() : 0,
        location: ev.location || '',
      };
    })
    .filter((ev) => ev.dateStr);
}

const DEFAULT_SCHEDULE_TEMPLATE = [
  { id: 'wake', label: 'Wake / Get moving', start: '04:00', end: '05:30', daysOfWeek: null },
  { id: 'workout', label: 'Workout (lift + cardio)', start: '05:30', end: '07:30', daysOfWeek: null },
  { id: 'family_am', label: 'Family / breakfast', start: '07:30', end: '08:30', daysOfWeek: null },
  { id: 'deep_work', label: 'Deep work block', start: '09:00', end: '12:00', daysOfWeek: null },
  { id: 'lunch', label: 'Lunch', start: '12:00', end: '13:00', daysOfWeek: null },
  { id: 'business', label: 'Business / calls', start: '13:00', end: '17:00', daysOfWeek: null },
  { id: 'family_pm', label: 'Family time', start: '17:00', end: '19:30', daysOfWeek: null },
  { id: 'wind_down', label: 'Wind down / plan tomorrow', start: '21:00', end: '22:00', daysOfWeek: null },
  { id: 'reta', label: 'Reta', start: '20:00', end: '20:05', daysOfWeek: ['WE'] },
  { id: 'tesa', label: 'Tesa', start: '21:30', end: '21:35', daysOfWeek: ['MO', 'TU', 'WE', 'TH', 'FR'] },
];

function weekdayCode(dateStr) {
  const codes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return codes[parseDate(dateStr).getDay()];
}

function buildDefaultScheduleDay(template, dateStr) {
  const wd = weekdayCode(dateStr);
  const applicable = template.filter((b) => !b.daysOfWeek || b.daysOfWeek.length === 0 || b.daysOfWeek.includes(wd));
  return {
    blocks: applicable.map((b) => ({ id: b.id, label: b.label, start: b.start, end: b.end, done: false, source: 'template' })),
  };
}

function ScheduleModule() {
  const todayStr = formatDate(new Date());
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState(null);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dayCache, setDayCache] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [draftTemplate, setDraftTemplate] = useState([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEventLabel, setNewEventLabel] = useState('');
  const [newEventStart, setNewEventStart] = useState('12:00');
  const [newEventEnd, setNewEventEnd] = useState('13:00');
  const [view, setView] = useState('day');
  const [gcalEvents, setGcalEvents] = useState([]);
  const [gcalStatus, setGcalStatus] = useState('idle'); // idle | connecting | connected | error | unavailable
  const [gcalError, setGcalError] = useState('');

  const weekDates = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(todayStr, i));
  }, [todayStr]);

  async function loadCalendar({ silent }) {
    if (!getGoogleClientId()) {
      setGcalStatus('unavailable');
      return;
    }
    setGcalStatus('connecting');
    setGcalError('');
    try {
      const evs = await fetchGcalEvents(weekDates[0], weekDates[6], { silent });
      setGcalEvents(evs);
      setGcalStatus('connected');
      try {
        await safeStorage.set('gcal-connected', '1', false);
      } catch (e) {}
    } catch (e) {
      const msg = e && e.message;
      if (msg === 'NO_CLIENT_ID') setGcalStatus('unavailable');
      else {
        setGcalStatus(silent ? 'idle' : 'error');
        if (!silent) setGcalError(msg === 'AUTH_EXPIRED' ? 'Session expired — reconnect.' : msg || 'Could not reach Google Calendar.');
      }
    }
  }

  useEffect(() => {
    (async () => {
      if (!getGoogleClientId()) {
        setGcalStatus('unavailable');
        return;
      }
      let wasConnected = false;
      try {
        const res = await safeStorage.get('gcal-connected', false);
        wasConnected = !!(res && res.value);
      } catch (e) {}
      if (wasConnected) loadCalendar({ silent: true });
    })();
  }, []);

  function eventsForDate(dateStr) {
    return gcalEvents
      .filter((ev) => ev.dateStr === dateStr)
      .sort((a, b) => (a.allDay === b.allDay ? a.startMinutes - b.startMinutes : a.allDay ? -1 : 1));
  }

  useEffect(() => {
    (async () => {
      let t = null;
      try {
        const res = await safeStorage.get('schedule-meta', false);
        if (res && res.value) t = JSON.parse(res.value).template;
      } catch (e) {
        t = null;
      }
      if (!t) {
        t = DEFAULT_SCHEDULE_TEMPLATE;
        try {
          await safeStorage.set('schedule-meta', JSON.stringify({ template: t }), false);
        } catch (e) {}
      } else {
        const existingIds = new Set(t.map((b) => b.id));
        const missing = DEFAULT_SCHEDULE_TEMPLATE.filter((b) => !existingIds.has(b.id));
        if (missing.length) {
          t = [...t, ...missing];
          try {
            await safeStorage.set('schedule-meta', JSON.stringify({ template: t }), false);
          } catch (e) {}
        }
      }
      setTemplate(t);
      setLoading(false);
    })();
  }, []);

  const ensureDay = useCallback(
    async (date) => {
      if (!template) return null;
      if (dayCache[date]) return dayCache[date];
      let d = null;
      try {
        const res = await safeStorage.get(`schedule:${date}`, false);
        if (res && res.value) d = JSON.parse(res.value);
      } catch (e) {
        d = null;
      }
      if (!d) d = buildDefaultScheduleDay(template, date);
      setDayCache((prev) => ({ ...prev, [date]: d }));
      return d;
    },
    [template, dayCache]
  );

  useEffect(() => {
    if (template) ensureDay(selectedDate);
  }, [template, selectedDate]);

  async function saveDay(date, newData) {
    setDayCache((prev) => ({ ...prev, [date]: newData }));
    try {
      await safeStorage.set(`schedule:${date}`, JSON.stringify(newData), false);
    } catch (e) {}
  }

  function toggleBlock(blockId) {
    const cur = dayCache[selectedDate];
    if (!cur) return;
    const blocks = cur.blocks.map((b) => (b.id === blockId ? { ...b, done: !b.done } : b));
    saveDay(selectedDate, { ...cur, blocks });
  }

  function removeBlock(blockId) {
    const cur = dayCache[selectedDate];
    if (!cur) return;
    const blocks = cur.blocks.filter((b) => b.id !== blockId);
    saveDay(selectedDate, { ...cur, blocks });
  }

  function addOneOffEvent() {
    if (!newEventLabel.trim()) return;
    const cur = dayCache[selectedDate];
    if (!cur) return;
    const blocks = [
      ...cur.blocks,
      { id: `custom_${Date.now()}`, label: newEventLabel.trim(), start: newEventStart, end: newEventEnd, done: false, source: 'custom' },
    ];
    saveDay(selectedDate, { ...cur, blocks });
    setNewEventLabel('');
    setShowAddEvent(false);
  }

  function openSettings() {
    setDraftTemplate(template.map((b) => ({ ...b })));
    setShowSettings(true);
  }

  function updateDraftBlock(idx, patch) {
    setDraftTemplate((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }
  function removeDraftBlock(idx) {
    setDraftTemplate((prev) => prev.filter((_, i) => i !== idx));
  }
  function addDraftBlock() {
    setDraftTemplate((prev) => [...prev, { id: `block_${Date.now()}`, label: '', start: '09:00', end: '10:00' }]);
  }
  async function saveTemplate() {
    const cleaned = draftTemplate.filter((b) => b.label.trim()).map((b) => ({ ...b, label: b.label.trim() }));
    setTemplate(cleaned);
    try {
      await safeStorage.set('schedule-meta', JSON.stringify({ template: cleaned }), false);
    } catch (e) {}
    setShowSettings(false);
  }

  if (loading || !template) {
    return <div style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>Loading schedule…</div>;
  }

  const current = dayCache[selectedDate];
  const sortedBlocks = current ? [...current.blocks].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)) : [];
  const todaysEvents = eventsForDate(selectedDate);

  const calendarBanner =
    gcalStatus === 'unavailable' ? null : gcalStatus === 'connected' ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 1, color: COLORS.success }}>
          CALENDAR CONNECTED
        </span>
        <button
          onClick={() => loadCalendar({ silent: true })}
          style={{ background: 'none', border: 'none', color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer', padding: 0 }}
        >
          REFRESH
        </button>
      </div>
    ) : (
      <div style={{ ...cardStyle, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarIcon size={15} color={COLORS.accentGold} />
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: COLORS.text }}>Google Calendar</span>
          </div>
          <button
            onClick={() => loadCalendar({ silent: false })}
            disabled={gcalStatus === 'connecting'}
            style={{
              padding: '6px 12px',
              background: COLORS.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 10,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            {gcalStatus === 'connecting' ? 'CONNECTING…' : 'CONNECT'}
          </button>
        </div>
        {gcalError && <div style={{ color: COLORS.accent, fontSize: 11, marginTop: 8, lineHeight: 1.4 }}>{gcalError}</div>}
      </div>
    );

  function EventRow({ ev, compact }) {
    return (
      <div
        style={{
          ...cardStyle,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: compact ? '8px 12px' : '12px 14px',
          borderLeft: `3px solid ${COLORS.accentGold}`,
          marginBottom: 8,
        }}
      >
        <div style={{ width: 78, flexShrink: 0 }}>
          {ev.allDay ? (
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: COLORS.accentGold }}>ALL DAY</div>
          ) : (
            <>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.accentGold }}>{minutesToLabel(ev.startMinutes)}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: COLORS.textMuted }}>{minutesToLabel(ev.endMinutes)}</div>
            </>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: COLORS.text }}>{ev.title}</div>
          {ev.location && (
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10.5, color: COLORS.textMuted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ev.location}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'week') {
    return (
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', background: COLORS.surface, borderRadius: 8, padding: 3, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
          {['day', 'week'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                flex: 1,
                padding: '8px 0',
                background: view === v ? COLORS.accent : 'transparent',
                color: view === v ? '#fff' : COLORS.textMuted,
                border: 'none',
                borderRadius: 6,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 12,
                letterSpacing: 2,
                cursor: 'pointer',
              }}
            >
              {v.toUpperCase()}
            </button>
          ))}
        </div>

        {calendarBanner}

        {weekDates.map((d) => {
          const evs = eventsForDate(d);
          return (
            <div key={d} style={{ marginBottom: 18 }}>
              <div
                style={{
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 12,
                  letterSpacing: 1.5,
                  color: d === todayStr ? COLORS.accent : COLORS.textMuted,
                  marginBottom: 8,
                  paddingBottom: 6,
                  borderBottom: `1px solid ${COLORS.line}`,
                }}
              >
                {niceLabel(d, todayStr)}
              </div>
              {evs.length === 0 ? (
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: COLORS.textMuted, fontStyle: 'italic' }}>
                  {gcalStatus === 'connected' ? 'No meetings' : '—'}
                </div>
              ) : (
                evs.map((ev) => <EventRow key={ev.id} ev={ev} compact />)
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', background: COLORS.surface, borderRadius: 8, padding: 3, border: `1px solid ${COLORS.line}`, marginBottom: 14 }}>
        {['day', 'week'].map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: view === v ? COLORS.accent : 'transparent',
              color: view === v ? '#fff' : COLORS.textMuted,
              border: 'none',
              borderRadius: 6,
              fontFamily: 'Oswald, sans-serif',
              fontSize: 12,
              letterSpacing: 2,
              cursor: 'pointer',
            }}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {calendarBanner}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} style={navBtnStyle}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, letterSpacing: 2, color: COLORS.text }}>{niceLabel(selectedDate, todayStr)}</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} style={navBtnStyle}>
            <ChevronRight size={20} />
          </button>
          <button onClick={openSettings} style={navBtnStyle}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {todaysEvents.length > 0 && (
        <>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1.5, color: COLORS.accentGold, marginBottom: 8 }}>
            MEETINGS
          </div>
          {todaysEvents.map((ev) => (
            <EventRow key={ev.id} ev={ev} />
          ))}
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1.5, color: COLORS.textMuted, margin: '18px 0 8px' }}>
            ROUTINE
          </div>
        </>
      )}

      {sortedBlocks.map((b) => (
        <div key={b.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}>
          <div style={{ width: 78, flexShrink: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.accentGold }}>{minutesToLabel(timeToMinutes(b.start))}</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: COLORS.textMuted }}>{minutesToLabel(timeToMinutes(b.end))}</div>
          </div>
          <div style={{ flex: 1, fontFamily: 'Inter, sans-serif', fontSize: 13, color: COLORS.text, textDecoration: b.done ? 'line-through' : 'none', opacity: b.done ? 0.5 : 1 }}>
            {b.label}
            {b.source === 'custom' && <span style={{ marginLeft: 6, fontSize: 9, color: COLORS.accentGold, fontFamily: 'Oswald, sans-serif' }}>ONE-OFF</span>}
          </div>
          <CheckCircle done={b.done} onToggle={() => toggleBlock(b.id)} small />
          {b.source === 'custom' && (
            <button onClick={() => removeBlock(b.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ))}

      {showAddEvent ? (
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="Event name"
            value={newEventLabel}
            onChange={(e) => setNewEventLabel(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input type="time" value={newEventStart} onChange={(e) => setNewEventStart(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <input type="time" value={newEventEnd} onChange={(e) => setNewEventEnd(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={addOneOffEvent}
              style={{ flex: 1, padding: '8px 0', background: COLORS.accent, border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}
            >
              ADD
            </button>
            <button
              onClick={() => setShowAddEvent(false)}
              style={{ flex: 1, padding: '8px 0', background: 'none', border: `1px solid ${COLORS.line}`, borderRadius: 6, color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}
            >
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddEvent(true)} style={addSetBtnStyle}>
          <Plus size={13} /> ADD ONE-OFF EVENT
        </button>
      )}

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: COLORS.bg, width: '100%', maxWidth: 560, margin: '0 auto', maxHeight: '85vh', overflowY: 'auto', borderRadius: '16px 16px 0 0', border: `1px solid ${COLORS.line}`, borderBottom: 'none', padding: 20, color: COLORS.text }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 18, letterSpacing: 1 }}>DAILY ROUTINE</span>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>
            {draftTemplate.map((b, idx) => (
              <div key={b.id} style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Block name"
                  value={b.label}
                  onChange={(e) => updateDraftBlock(idx, { label: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input type="time" value={b.start} onChange={(e) => updateDraftBlock(idx, { start: e.target.value })} style={{ ...inputStyle, width: 90 }} />
                <input type="time" value={b.end} onChange={(e) => updateDraftBlock(idx, { end: e.target.value })} style={{ ...inputStyle, width: 90 }} />
                <button onClick={() => removeDraftBlock(idx)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addDraftBlock} style={{ ...addSetBtnStyle, marginBottom: 20 }}>
              <Plus size={13} /> ADD ROUTINE BLOCK
            </button>
            <button
              onClick={saveTemplate}
              style={{ width: '100%', padding: '12px 0', background: COLORS.accent, border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: 2, fontSize: 14, cursor: 'pointer' }}
            >
              SAVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function daysUntil(dateStr) {
  const diff = Math.round((parseDate(dateStr) - parseDate(formatDate(new Date()))) / 86400000);
  return diff;
}

// Compress + resize an uploaded image so it fits within storage limits.
// Vision-board quality, not archival quality — max 900px on the long edge.
function compressImage(file, maxDim = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read that file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function loadVisionBoard() {
  let index = [];
  try {
    const res = await safeStorage.get('vision-index', false);
    if (res && res.value) index = JSON.parse(res.value);
  } catch (e) {
    index = [];
  }
  const items = [];
  for (const id of index) {
    try {
      const res = await safeStorage.get(`vision:${id}`, false);
      if (res && res.value) items.push({ id, dataUrl: res.value });
    } catch (e) {}
  }
  return items;
}

async function saveVisionImage(id, dataUrl, currentIds) {
  await safeStorage.set(`vision:${id}`, dataUrl, false);
  await safeStorage.set('vision-index', JSON.stringify([...currentIds, id]), false);
}

async function deleteVisionImage(id, currentIds) {
  try {
    await safeStorage.delete(`vision:${id}`, false);
  } catch (e) {}
  await safeStorage.set('vision-index', JSON.stringify(currentIds.filter((x) => x !== id)), false);
}

const STARTER_HABITS = [
  { id: 'no_snacking', name: 'No snacking' },
  { id: 'sobriety', name: 'Sobriety' },
  { id: 'family_friends', name: 'Family & Friends' },
  { id: 'ace_dog', name: 'Time with Ace' },
  { id: 'sleep_schedule', name: 'Sleep 6-7 hrs' },
  { id: 'read_manifesto', name: 'Read manifesto' },
  { id: 'read_general', name: 'Read' },
  { id: 'meditate', name: 'Meditate' },
  { id: 'gym', name: 'Gym' },
  { id: 'eat_clean', name: 'Eat Healthy & Clean' },
  { id: 'maximize_time', name: 'Maximize Time' },
];

const DEFAULT_MANIFESTO = `If you're going to read this, follow it. Job isn't done just by checking it off the list. Don't let up, your back is still against the wall.

Stop scrolling, limit the TV, spend more time doing, reading, getting stronger.

Remain of the mindset you aren't taking any shit from anyone or anything, the fight in you is never ending and remember none of the pressures actually mean anything, no matter the outcome today, you will wake up tomorrow to continue on whatever path is meant for you.

Discipline reveals the commitment you have to your dreams.

The only person coming to save you is the version of yourself that's tired of your current situation.

Everything begins with being sober, alcohol for your brain has been setting you back for the last 20 years. You owe it to yourself, your family and your team to give it a break and see what you can do with a clear and functioning brain.

Time to take control of every aspect of your life, no more relying on others when talking about vision.

Stop feeling sorry or being deflated, handle your shit head on and always stay true to the below.

Pain plus reflection equals progress.

Success is your only option, failure's not.

The good thing about being at 90% is you know you're about halfway there to being great, to truly being one of the best.

You have to be uncompromised in your level of commitment to whatever you are doing, or it can disappear as fast as it appeared.

TAKE IT TO THE NEXT LEVEL / LOCK IN & WIN THE DAY. Work on all of the below like someone is working 24 hrs a day to take it all away from you.

Set a goal and never miss it! If you do miss it, it's only because you went past it.

Create highly profitable businesses that can provide opportunity and growth for its employees. Something that can provide for Cami and Jayden, and something to make them proud to share your last name. When you're done for the day, put in one more hour so that when needed you can leave early to be with Cami and Jayden.

Save to invest money. Save it and use it. Travel for growth and experience. Don't let money or success change you. Generate enough wealth to provide for Cami and family when gone.

Health, it's all we have and without it everything else becomes more challenging or not possible. Start early in the morning. Eat as healthy as possible knowing you won't always be able or want to.

Continue to cleanse relationships and bad habits, find clarity in knowing what and who is good for you.

Have discipline in all areas of your life.

Don't ever forget where you came from and do everything you can to never go back.

Invest into the people who've invested in you, you'd be nowhere without them.

If you don't have an assistant you are one. Build a system of leverage. Build the teams around you.

Keep your word to your Dad.

Reach beyond your grasp, have immortal finish lines and turn your red light green, because a roof is a man made thing.

Pressure is a privilege.

You never get to witness your own eulogy but you get to write it every day.`;

function GoalsModule() {
  const todayStr = formatDate(new Date());
  const [loading, setLoading] = useState(true);
  const [habits, setHabits] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestoneName, setNewMilestoneName] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState(todayStr);
  const [manifesto, setManifesto] = useState(DEFAULT_MANIFESTO);
  const [showManifesto, setShowManifesto] = useState(true);
  const [editingManifesto, setEditingManifesto] = useState(false);
  const [draftManifesto, setDraftManifesto] = useState('');
  const [reflection, setReflection] = useState({ wins: '', fellShort: '', shiftTomorrow: '' });
  const [yesterdayReflection, setYesterdayReflection] = useState(null);
  const [showReflection, setShowReflection] = useState(false);
  const [vision, setVision] = useState([]);
  const [showVision, setShowVision] = useState(false);

  useEffect(() => {
    (async () => {
      let g = null;
      try {
        const res = await safeStorage.get('goals-meta', false);
        if (res && res.value) g = JSON.parse(res.value);
      } catch (e) {
        g = null;
      }
      let needsSave = false;
      if (!g) {
        g = {
          habits: STARTER_HABITS.map((h) => ({ ...h, streak: 0, lastDone: null })),
          milestones: [],
        };
        needsSave = true;
      } else {
        const existingIds = new Set((g.habits || []).map((h) => h.id));
        const missing = STARTER_HABITS.filter((h) => !existingIds.has(h.id)).map((h) => ({ ...h, streak: 0, lastDone: null }));
        if (missing.length) {
          g = { ...g, habits: [...(g.habits || []), ...missing] };
          needsSave = true;
        }
      }
      if (needsSave) {
        try {
          await safeStorage.set('goals-meta', JSON.stringify(g), false);
        } catch (e) {}
      }
      setHabits(g.habits || []);
      setMilestones(g.milestones || []);

      let m = null;
      try {
        const res = await safeStorage.get('manifesto', false);
        if (res && res.value) m = res.value;
      } catch (e) {
        m = null;
      }
      if (!m) {
        m = DEFAULT_MANIFESTO;
        try {
          await safeStorage.set('manifesto', m, false);
        } catch (e) {}
      }
      setManifesto(m);

      try {
        const res = await safeStorage.get(`reflection:${todayStr}`, false);
        if (res && res.value) setReflection(JSON.parse(res.value));
      } catch (e) {}

      try {
        const res = await safeStorage.get(`reflection:${addDays(todayStr, -1)}`, false);
        if (res && res.value) setYesterdayReflection(JSON.parse(res.value));
      } catch (e) {}

      try {
        setVision(await loadVisionBoard());
      } catch (e) {}

      setLoading(false);
    })();
  }, []);

  async function saveManifesto() {
    const text = draftManifesto.trim() || DEFAULT_MANIFESTO;
    setManifesto(text);
    try {
      await safeStorage.set('manifesto', text, false);
    } catch (e) {}
    setEditingManifesto(false);
  }

  function updateReflection(field, value) {
    const next = { ...reflection, [field]: value };
    setReflection(next);
    safeStorage.set(`reflection:${todayStr}`, JSON.stringify(next), false).catch(() => {});
  }

  async function persist(nextHabits, nextMilestones) {
    setHabits(nextHabits);
    setMilestones(nextMilestones);
    try {
      await safeStorage.set('goals-meta', JSON.stringify({ habits: nextHabits, milestones: nextMilestones }), false);
    } catch (e) {}
  }

  function toggleHabitToday(habitId) {
    const yesterday = addDays(todayStr, -1);
    const next = habits.map((h) => {
      if (h.id !== habitId) return h;
      const doneToday = h.lastDone === todayStr;
      if (doneToday) {
        // undo today's check-in
        const newStreak = Math.max(0, h.streak - 1);
        return { ...h, streak: newStreak, lastDone: newStreak > 0 ? yesterday : null };
      } else {
        const newStreak = h.lastDone === yesterday ? h.streak + 1 : 1;
        return { ...h, streak: newStreak, lastDone: todayStr };
      }
    });
    persist(next, milestones);
  }

  function addHabit() {
    if (!newHabitName.trim()) return;
    const next = [...habits, { id: `habit_${Date.now()}`, name: newHabitName.trim(), streak: 0, lastDone: null }];
    persist(next, milestones);
    setNewHabitName('');
    setShowAddHabit(false);
  }

  function removeHabit(habitId) {
    persist(habits.filter((h) => h.id !== habitId), milestones);
  }

  function toggleMilestoneDone(id) {
    const next = milestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
    persist(habits, next);
  }

  function addMilestone() {
    if (!newMilestoneName.trim()) return;
    const next = [...milestones, { id: `ms_${Date.now()}`, name: newMilestoneName.trim(), targetDate: newMilestoneDate, done: false }];
    persist(habits, next);
    setNewMilestoneName('');
    setShowAddMilestone(false);
  }

  function removeMilestone(id) {
    persist(habits, milestones.filter((m) => m.id !== id));
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>Loading goals…</div>;
  }

  const sortedMilestones = [...milestones].sort((a, b) => timeToMinutesSafe(a.targetDate) - timeToMinutesSafe(b.targetDate));

  return (
    <div style={{ padding: 16 }}>
      <div style={{ ...cardStyle, borderColor: COLORS.accentGold }}>
        <button
          onClick={() => setShowManifesto(!showManifesto)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 2, color: COLORS.accentGold }}>MORNING · YOUR WHY</span>
          {showManifesto ? <ChevronUp size={16} color={COLORS.textMuted} /> : <ChevronDown size={16} color={COLORS.textMuted} />}
        </button>
        {showManifesto && (
          <>
            {editingManifesto ? (
              <>
                <textarea
                  value={draftManifesto}
                  onChange={(e) => setDraftManifesto(e.target.value)}
                  style={{ ...inputStyle, width: '100%', minHeight: 240, marginTop: 12, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, resize: 'vertical' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button onClick={saveManifesto} style={{ flex: 1, padding: '8px 0', background: COLORS.accent, border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
                    SAVE
                  </button>
                  <button onClick={() => setEditingManifesto(false)} style={{ flex: 1, padding: '8px 0', background: 'none', border: `1px solid ${COLORS.line}`, borderRadius: 6, color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
                    CANCEL
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 12.5, color: COLORS.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {manifesto}
                </div>
                <button
                  onClick={() => {
                    setDraftManifesto(manifesto);
                    setEditingManifesto(true);
                  }}
                  style={{ marginTop: 10, background: 'none', border: 'none', color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1, cursor: 'pointer', padding: 0 }}
                >
                  EDIT
                </button>
              </>
            )}
          </>
        )}
      </div>

      <div style={{ ...cardStyle, marginTop: 12 }}>
        <button
          onClick={() => setShowVision(!showVision)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 2, color: COLORS.accentGold }}>VISION BOARD</span>
          {showVision ? <ChevronUp size={16} color={COLORS.textMuted} /> : <ChevronDown size={16} color={COLORS.textMuted} />}
        </button>
        {showVision && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11.5, color: COLORS.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
              These show up in your morning flow every day.
            </div>
            <VisionBoard items={vision} setItems={setVision} editable={true} />
          </div>
        )}
      </div>

      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1, margin: '20px 0 10px' }}>DAILY HABITS</div>
      {habits.map((h) => {
        const doneToday = h.lastDone === todayStr;
        return (
          <div key={h.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: COLORS.text }}>{h.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.accentGold, marginTop: 2 }}>
                {h.streak > 0 ? `${h.streak} day streak` : 'no streak yet'}
              </div>
            </div>
            <CheckCircle done={doneToday} onToggle={() => toggleHabitToday(h.id)} />
            <button onClick={() => removeHabit(h.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      {showAddHabit ? (
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="Habit name"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: 10 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addHabit} style={{ flex: 1, padding: '8px 0', background: COLORS.accent, border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
              ADD
            </button>
            <button onClick={() => setShowAddHabit(false)} style={{ flex: 1, padding: '8px 0', background: 'none', border: `1px solid ${COLORS.line}`, borderRadius: 6, color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddHabit(true)} style={{ ...addSetBtnStyle, marginBottom: 24 }}>
          <Plus size={13} /> ADD HABIT
        </button>
      )}

      <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1, marginBottom: 10 }}>MILESTONES</div>
      {sortedMilestones.map((m) => {
        const d = daysUntil(m.targetDate);
        const dueLabel = m.done ? 'DONE' : d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'DUE TODAY' : `${d}d left`;
        return (
          <div key={m.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: COLORS.text, textDecoration: m.done ? 'line-through' : 'none', opacity: m.done ? 0.5 : 1 }}>{m.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: !m.done && d < 0 ? COLORS.accent : COLORS.textMuted, marginTop: 2 }}>{dueLabel}</div>
            </div>
            <CheckCircle done={m.done} onToggle={() => toggleMilestoneDone(m.id)} />
            <button onClick={() => removeMilestone(m.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
          </div>
        );
      })}
      {showAddMilestone ? (
        <div style={cardStyle}>
          <input
            type="text"
            placeholder="Milestone name"
            value={newMilestoneName}
            onChange={(e) => setNewMilestoneName(e.target.value)}
            style={{ ...inputStyle, width: '100%', marginBottom: 8 }}
          />
          <input type="date" value={newMilestoneDate} onChange={(e) => setNewMilestoneDate(e.target.value)} style={{ ...inputStyle, width: '100%', marginBottom: 10 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={addMilestone} style={{ flex: 1, padding: '8px 0', background: COLORS.accent, border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
              ADD
            </button>
            <button onClick={() => setShowAddMilestone(false)} style={{ flex: 1, padding: '8px 0', background: 'none', border: `1px solid ${COLORS.line}`, borderRadius: 6, color: COLORS.textMuted, fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>
              CANCEL
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddMilestone(true)} style={addSetBtnStyle}>
          <Plus size={13} /> ADD MILESTONE
        </button>
      )}

      <div style={{ ...cardStyle, marginTop: 20, borderColor: COLORS.accentGold }}>
        <button
          onClick={() => setShowReflection(!showReflection)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 2, color: COLORS.accentGold }}>EVENING REFLECTION</span>
          {showReflection ? <ChevronUp size={16} color={COLORS.textMuted} /> : <ChevronDown size={16} color={COLORS.textMuted} />}
        </button>
        {showReflection && (
          <div style={{ marginTop: 14 }}>
            {yesterdayReflection && (yesterdayReflection.shiftTomorrow || yesterdayReflection.fellShort || yesterdayReflection.wins) && (
              <div style={{ marginBottom: 16, padding: 10, background: COLORS.surface2, borderRadius: 6 }}>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 1, color: COLORS.textMuted, marginBottom: 6 }}>YESTERDAY, YOU SAID YOU'D SHIFT:</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: COLORS.text, lineHeight: 1.5 }}>
                  {yesterdayReflection.shiftTomorrow || '(nothing noted)'}
                </div>
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1, color: COLORS.textMuted, marginBottom: 6 }}>WHAT GOT DONE THAT ACTUALLY MATTERED</div>
              <textarea
                value={reflection.wins}
                onChange={(e) => updateReflection('wins', e.target.value)}
                style={{ ...inputStyle, width: '100%', minHeight: 60, fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1, color: COLORS.textMuted, marginBottom: 6 }}>WHERE DID I FALL SHORT OF THE STANDARD</div>
              <textarea
                value={reflection.fellShort}
                onChange={(e) => updateReflection('fellShort', e.target.value)}
                style={{ ...inputStyle, width: '100%', minHeight: 60, fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
              />
            </div>
            <div>
              <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1, color: COLORS.textMuted, marginBottom: 6 }}>WHAT SHIFTS TOMORROW</div>
              <textarea
                value={reflection.shiftTomorrow}
                onChange={(e) => updateReflection('shiftTomorrow', e.target.value)}
                style={{ ...inputStyle, width: '100%', minHeight: 60, fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function timeToMinutesSafe(dateStr) {
  try {
    return parseDate(dateStr).getTime();
  } catch (e) {
    return 0;
  }
}

const PRIORITY_COLORS = {
  1: '#C8443C',
  2: '#D9824C',
  3: '#E8B84B',
  4: '#5B8DBE',
  5: '#8B909A',
};

const FOCUS_COUNT = 5;

function TaskRow({
  task,
  index,
  dimmed,
  isDragging,
  onPointerDownGrip,
  onToggle,
  onRemove,
  onMove,
  buckets,
  currentBucket,
  showMoveControls,
  rank,
}) {
  return (
    <div
      data-task-row="1"
      style={{
        ...cardStyle,
        marginBottom: 8,
        opacity: isDragging ? 0.4 : dimmed ? 0.55 : 1,
        borderColor: isDragging ? COLORS.accentGold : task.done ? COLORS.line : COLORS.line,
        transition: isDragging ? 'none' : 'opacity 0.15s',
        touchAction: 'pan-y',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          onPointerDown={onPointerDownGrip}
          style={{
            cursor: 'grab',
            color: COLORS.textMuted,
            display: 'flex',
            alignItems: 'center',
            padding: '4px 2px',
            touchAction: 'none',
            flexShrink: 0,
          }}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>

        {rank != null && (
          <span
            style={{
              width: 20,
              fontFamily: 'Oswald, sans-serif',
              fontSize: 15,
              color: rank === 1 ? COLORS.accent : COLORS.textMuted,
              flexShrink: 0,
            }}
          >
            {rank}
          </span>
        )}

        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: PRIORITY_COLORS[task.priority] || COLORS.textMuted,
            flexShrink: 0,
          }}
          title={`Priority ${task.priority}`}
        />

        <span
          style={{
            flex: 1,
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            color: COLORS.text,
            textDecoration: task.done ? 'line-through' : 'none',
            opacity: task.done ? 0.5 : 1,
            lineHeight: 1.4,
          }}
        >
          {task.text}
        </span>

        <CheckCircle done={task.done} onToggle={onToggle} small />
        <button
          onClick={onRemove}
          style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: 0, flexShrink: 0 }}
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {showMoveControls && !task.done && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, paddingLeft: 26 }}>
          {buckets
            .filter((b) => b.id !== currentBucket)
            .map((b) => (
              <button
                key={b.id}
                onClick={() => onMove(b.id)}
                style={{
                  padding: '3px 9px',
                  borderRadius: 5,
                  border: `1px solid ${COLORS.line}`,
                  background: 'none',
                  color: COLORS.textMuted,
                  fontFamily: 'Oswald, sans-serif',
                  fontSize: 9,
                  letterSpacing: 0.5,
                  cursor: 'pointer',
                }}
              >
                → {b.label}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

function TasksModule() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState('');
  const [newPriority, setNewPriority] = useState(3);
  const [showWaiting, setShowWaiting] = useState(false);
  const [dragId, setDragId] = useState(null);

  const dragState = React.useRef(null);
  const listRef = React.useRef(null);

  useEffect(() => {
    (async () => {
      let t = [];
      try {
        const res = await safeStorage.get('tasks-meta', false);
        if (res && res.value) t = JSON.parse(res.value).tasks || [];
      } catch (e) {
        t = [];
      }
      setTasks(t);
      setLoading(false);
    })();
  }, []);

  async function persist(next) {
    setTasks(next);
    try {
      await safeStorage.set('tasks-meta', JSON.stringify({ tasks: next }), false);
    } catch (e) {}
  }

  function addTask() {
    if (!newText.trim()) return;
    // New tasks land at the bottom of Today so they never displace the current focus.
    const next = [
      ...tasks,
      { id: `task_${Date.now()}`, text: newText.trim(), priority: newPriority, bucket: 'today', done: false, createdAt: Date.now() },
    ];
    persist(next);
    setNewText('');
    setNewPriority(3);
  }

  function toggleDone(id) {
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function moveToBucket(id, bucket) {
    persist(tasks.map((t) => (t.id === id ? { ...t, bucket } : t)));
  }

  function removeTask(id) {
    persist(tasks.filter((t) => t.id !== id));
  }

  // Reorder within the Today bucket by moving `id` to position `toIdx`
  // among today's tasks, preserving the rest of the array.
  function reorderToday(id, toIdx) {
    const todayIds = tasks.filter((t) => t.bucket === 'today').map((t) => t.id);
    const from = todayIds.indexOf(id);
    if (from === -1) return;
    const clamped = Math.max(0, Math.min(todayIds.length - 1, toIdx));
    if (from === clamped) return;
    const nextIds = [...todayIds];
    nextIds.splice(from, 1);
    nextIds.splice(clamped, 0, id);

    const byId = Object.fromEntries(tasks.map((t) => [t.id, t]));
    const reorderedToday = nextIds.map((tid) => byId[tid]);
    let cursor = 0;
    const next = tasks.map((t) => (t.bucket === 'today' ? reorderedToday[cursor++] : t));
    persist(next);
  }

  function handleGripDown(e, taskId) {
    e.preventDefault();
    const rows = listRef.current ? Array.from(listRef.current.querySelectorAll('[data-task-row="1"]')) : [];
    const rects = rows.map((r) => r.getBoundingClientRect());
    dragState.current = { id: taskId, startY: e.clientY, rects };
    setDragId(taskId);
    try {
      e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
    } catch (err) {}
  }

  function handlePointerMove(e) {
    const st = dragState.current;
    if (!st) return;
    const y = e.clientY;
    let target = 0;
    for (let i = 0; i < st.rects.length; i++) {
      const mid = st.rects[i].top + st.rects[i].height / 2;
      if (y > mid) target = i + 1;
    }
    st.pendingIndex = Math.min(target, st.rects.length - 1);
  }

  function handlePointerUp() {
    const st = dragState.current;
    if (st && st.pendingIndex != null) {
      reorderToday(st.id, st.pendingIndex);
    }
    dragState.current = null;
    setDragId(null);
  }

  function nudge(id, dir) {
    const todayIds = tasks.filter((t) => t.bucket === 'today').map((t) => t.id);
    const from = todayIds.indexOf(id);
    if (from === -1) return;
    reorderToday(id, from + dir);
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: COLORS.textMuted }}>Loading tasks…</div>;
  }

  const buckets = [
    { id: 'today', label: 'TODAY' },
    { id: 'tomorrow', label: 'TOMORROW' },
    { id: 'week', label: 'THIS WEEK' },
  ];

  const todayAll = tasks.filter((t) => t.bucket === 'today');
  const todayOpen = todayAll.filter((t) => !t.done);
  const todayDone = todayAll.filter((t) => t.done);
  const focus = todayOpen.slice(0, FOCUS_COUNT);
  const waiting = todayOpen.slice(FOCUS_COUNT);

  return (
    <div style={{ padding: 16 }} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Type a task, hit enter…"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask();
          }}
          style={{ ...inputStyle, width: '100%', fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 10, letterSpacing: 1, color: COLORS.textMuted, marginRight: 2 }}>PRIORITY</span>
          {[1, 2, 3, 4, 5].map((p) => (
            <button
              key={p}
              onClick={() => setNewPriority(p)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `2px solid ${PRIORITY_COLORS[p]}`,
                background: newPriority === p ? PRIORITY_COLORS[p] : 'transparent',
                color: newPriority === p ? '#fff' : PRIORITY_COLORS[p],
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={addTask}
            style={{
              marginLeft: 'auto',
              padding: '7px 16px',
              background: COLORS.accent,
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 12,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            ADD
          </button>
        </div>
      </div>

      {/* ---- FOCUS FIVE ---- */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: 15, letterSpacing: 1.5, color: COLORS.accentGold }}>THE FIVE</span>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: COLORS.textMuted }}>
          {todayDone.length} done today
        </span>
      </div>

      {focus.length === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '24px 14px' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 14, color: COLORS.success, letterSpacing: 1 }}>
            {todayDone.length > 0 ? 'ALL CLEAR' : 'NOTHING QUEUED'}
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>
            {todayDone.length > 0 ? 'Everything on today’s list is done.' : 'Add a task above to get started.'}
          </div>
        </div>
      )}

      <div ref={listRef}>
        {focus.map((t, i) => (
          <div key={t.id} style={{ position: 'relative' }}>
            <TaskRow
              task={t}
              index={i}
              rank={i + 1}
              isDragging={dragId === t.id}
              onPointerDownGrip={(e) => handleGripDown(e, t.id)}
              onToggle={() => toggleDone(t.id)}
              onRemove={() => removeTask(t.id)}
              onMove={(b) => moveToBucket(t.id, b)}
              buckets={buckets}
              currentBucket="today"
              showMoveControls={true}
            />
            <div style={{ position: 'absolute', right: 8, bottom: 12, display: 'flex', gap: 2 }}>
              <button
                onClick={() => nudge(t.id, -1)}
                style={nudgeBtn}
                aria-label="Move up"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={() => nudge(t.id, 1)}
                style={nudgeBtn}
                aria-label="Move down"
              >
                <ChevronDown size={12} />
              </button>
            </div>
          </div>
        ))}

        {/* waiting list, collapsed by default */}
        {waiting.length > 0 && (
          <>
            <button
              onClick={() => setShowWaiting(!showWaiting)}
              style={{
                width: '100%',
                background: 'none',
                border: `1px dashed ${COLORS.line}`,
                borderRadius: 8,
                color: COLORS.textMuted,
                padding: '10px 0',
                fontFamily: 'Oswald, sans-serif',
                fontSize: 11,
                letterSpacing: 1,
                cursor: 'pointer',
                marginTop: 4,
                marginBottom: 10,
              }}
            >
              {showWaiting ? 'HIDE' : `${waiting.length} MORE WAITING`}
            </button>
            {showWaiting &&
              waiting.map((t, i) => (
                <TaskRow
                  key={t.id}
                  task={t}
                  index={FOCUS_COUNT + i}
                  rank={FOCUS_COUNT + i + 1}
                  dimmed
                  isDragging={dragId === t.id}
                  onPointerDownGrip={(e) => handleGripDown(e, t.id)}
                  onToggle={() => toggleDone(t.id)}
                  onRemove={() => removeTask(t.id)}
                  onMove={(b) => moveToBucket(t.id, b)}
                  buckets={buckets}
                  currentBucket="today"
                  showMoveControls={true}
                />
              ))}
          </>
        )}
      </div>

      {todayDone.length > 0 && (
        <details style={{ marginTop: 8, marginBottom: 20 }}>
          <summary style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 1, color: COLORS.textMuted, cursor: 'pointer' }}>
            COMPLETED TODAY ({todayDone.length})
          </summary>
          <div style={{ marginTop: 8 }}>
            {todayDone.map((t) => (
              <div key={t.id} style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 6 }}>
                <span style={{ flex: 1, fontSize: 12.5, color: COLORS.textMuted, textDecoration: 'line-through' }}>{t.text}</span>
                <CheckCircle done={true} onToggle={() => toggleDone(t.id)} small />
                <button onClick={() => removeTask(t.id)} style={{ background: 'none', border: 'none', color: COLORS.textMuted, cursor: 'pointer', padding: 0 }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </details>
      )}

      {/* ---- STAGING BUCKETS ---- */}
      {buckets.slice(1).map((b) => {
        const items = tasks.filter((t) => t.bucket === b.id).sort((x, y) => (x.done === y.done ? x.priority - y.priority : x.done ? 1 : -1));
        return (
          <div key={b.id} style={{ marginTop: 24 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 1.5, color: COLORS.textMuted, marginBottom: 10 }}>
              {b.label} {items.length > 0 && <span style={{ fontSize: 11 }}>({items.filter((t) => !t.done).length})</span>}
            </div>
            {items.length === 0 && (
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' }}>Nothing here</div>
            )}
            {items.map((t) => (
              <TaskRow
                key={t.id}
                task={t}
                index={0}
                rank={null}
                isDragging={false}
                onPointerDownGrip={(e) => e.preventDefault()}
                onToggle={() => toggleDone(t.id)}
                onRemove={() => removeTask(t.id)}
                onMove={(nb) => moveToBucket(t.id, nb)}
                buckets={buckets}
                currentBucket={b.id}
                showMoveControls={true}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

const nudgeBtn = {
  width: 22,
  height: 18,
  background: COLORS.surface2,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 4,
  color: COLORS.textMuted,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 0,
};

function VisionBoard({ items, setItems, editable }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = React.useRef(null);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setError('');
    let ids = items.map((i) => i.id);
    const added = [];
    for (const file of files) {
      try {
        const dataUrl = await compressImage(file);
        const id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await saveVisionImage(id, dataUrl, ids);
        ids = [...ids, id];
        added.push({ id, dataUrl });
      } catch (err) {
        setError(err.message || 'One image could not be added');
      }
    }
    setItems([...items, ...added]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleDelete(id) {
    const ids = items.map((i) => i.id);
    await deleteVisionImage(id, ids);
    setItems(items.filter((i) => i.id !== id));
  }

  return (
    <div>
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: editable ? 12 : 0 }}>
          {items.map((it) => (
            <div key={it.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: `1px solid ${COLORS.line}` }}>
              <img src={it.dataUrl} alt="" style={{ width: '100%', display: 'block', aspectRatio: '1 / 1', objectFit: 'cover' }} />
              {editable && (
                <button
                  onClick={() => handleDelete(it.id)}
                  style={{
                    position: 'absolute',
                    top: 6,
                    right: 6,
                    background: 'rgba(0,0,0,0.65)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {editable && (
        <>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleFiles} style={{ display: 'none' }} />
          <button onClick={() => inputRef.current && inputRef.current.click()} disabled={busy} style={addSetBtnStyle}>
            <ImagePlus size={13} /> {busy ? 'ADDING…' : 'ADD PHOTO'}
          </button>
          {error && <div style={{ color: COLORS.accent, fontSize: 11, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>{error}</div>}
        </>
      )}
    </div>
  );
}

function MorningFlow({ onComplete }) {
  const todayStr = formatDate(new Date());
  const [step, setStep] = useState(0);
  const [manifesto, setManifesto] = useState('');
  const [habits, setHabits] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [allMilestones, setAllMilestones] = useState([]);
  const [vision, setVision] = useState([]);
  const [loading, setLoading] = useState(true);

  async function persistGoals(nextHabits, nextMilestones) {
    setHabits(nextHabits);
    setAllMilestones(nextMilestones);
    setMilestones(nextMilestones.filter((m) => !m.done));
    try {
      await safeStorage.set('goals-meta', JSON.stringify({ habits: nextHabits, milestones: nextMilestones }), false);
    } catch (e) {}
  }

  function toggleHabit(habitId) {
    const yesterday = addDays(todayStr, -1);
    const next = habits.map((h) => {
      if (h.id !== habitId) return h;
      const doneToday = h.lastDone === todayStr;
      if (doneToday) {
        const newStreak = Math.max(0, h.streak - 1);
        return { ...h, streak: newStreak, lastDone: newStreak > 0 ? yesterday : null };
      }
      const newStreak = h.lastDone === yesterday ? h.streak + 1 : 1;
      return { ...h, streak: newStreak, lastDone: todayStr };
    });
    persistGoals(next, allMilestones);
  }

  function toggleMilestone(id) {
    const next = allMilestones.map((m) => (m.id === id ? { ...m, done: !m.done } : m));
    persistGoals(habits, next);
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await safeStorage.get('manifesto', false);
        setManifesto(res && res.value ? res.value : DEFAULT_MANIFESTO);
      } catch (e) {
        setManifesto(DEFAULT_MANIFESTO);
      }
      try {
        const res = await safeStorage.get('goals-meta', false);
        if (res && res.value) {
          const g = JSON.parse(res.value);
          setHabits(g.habits || []);
          setAllMilestones(g.milestones || []);
          setMilestones((g.milestones || []).filter((m) => !m.done));
        }
      } catch (e) {}
      try {
        setVision(await loadVisionBoard());
      } catch (e) {}
      setLoading(false);
    })();
  }, []);

  const steps = ['YOUR WHY', 'WHAT YOU\u2019RE BUILDING', 'LOCK IN'];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: COLORS.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONTS}</style>
        <div style={{ color: COLORS.textMuted, fontFamily: 'Inter, sans-serif' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0B0C0E', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{FONTS}</style>
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          minHeight: '100vh',
          background: COLORS.bg,
          borderLeft: `1px solid ${COLORS.line}`,
          borderRight: `1px solid ${COLORS.line}`,
          color: COLORS.text,
          padding: 'calc(28px + env(safe-area-inset-top, 0px)) 20px calc(40px + env(safe-area-inset-bottom, 0px))',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 11, letterSpacing: 3, color: COLORS.textMuted }}>
          MORNING · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
        </div>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 26, fontWeight: 700, color: COLORS.text, marginTop: 4, marginBottom: 16 }}>
          {steps[step]}
        </div>

        <div style={{ display: 'flex', gap: 5, marginBottom: 22 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 3,
                borderRadius: 2,
                background: i <= step ? COLORS.accent : COLORS.surface2,
              }}
            />
          ))}
        </div>

        {step === 0 && (
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13.5, color: COLORS.text, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {manifesto}
          </div>
        )}

        {step === 1 && (
          <div>
            {vision.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <VisionBoard items={vision} setItems={setVision} editable={false} />
              </div>
            )}
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1.5, color: COLORS.accentGold, marginBottom: 10 }}>
              TODAY&rsquo;S NON-NEGOTIABLES
            </div>
            {habits.length === 0 && (
              <div style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' }}>No habits set yet.</div>
            )}
            {habits.map((h) => {
              const doneToday = h.lastDone === todayStr;
              return (
                <div
                  key={h.id}
                  style={{
                    ...cardStyle,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    borderColor: doneToday ? COLORS.success : COLORS.line,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: COLORS.text,
                      textDecoration: doneToday ? 'line-through' : 'none',
                      opacity: doneToday ? 0.55 : 1,
                      flex: 1,
                    }}
                  >
                    {h.name}
                  </span>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: h.streak > 0 ? COLORS.accentGold : COLORS.textMuted,
                      marginRight: 12,
                    }}
                  >
                    {h.streak > 0 ? `${h.streak}d` : '—'}
                  </span>
                  <CheckCircle small done={doneToday} onToggle={() => toggleHabit(h.id)} />
                </div>
              );
            })}
            {milestones.length > 0 && (
              <>
                <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 12, letterSpacing: 1.5, color: COLORS.accentGold, margin: '20px 0 10px' }}>
                  MILESTONES IN PLAY
                </div>
                {milestones.map((m) => {
                  const d = daysUntil(m.targetDate);
                  return (
                    <div key={m.id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' }}>
                      <span style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>{m.name}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: d < 0 ? COLORS.accent : COLORS.textMuted, marginRight: 12 }}>
                        {d < 0 ? `${Math.abs(d)}d over` : d === 0 ? 'today' : `${d}d`}
                      </span>
                      <CheckCircle small done={false} onToggle={() => toggleMilestone(m.id)} />
                    </div>
                  );
                })}
              </>
            )}
            {vision.length === 0 && (
              <div style={{ marginTop: 20, padding: 12, background: COLORS.surface2, borderRadius: 8, fontSize: 11.5, color: COLORS.textMuted, lineHeight: 1.5 }}>
                Add photos to your vision board in the Goals tab &mdash; they&rsquo;ll show here every morning.
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', paddingTop: 30 }}>
            <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 20, color: COLORS.text, lineHeight: 1.45, marginBottom: 10 }}>
              PRESSURE IS A PRIVILEGE
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 34px' }}>
              You never get to witness your own eulogy, but you get to write it every day. Go win this one.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                padding: '13px 20px',
                background: 'none',
                border: `1px solid ${COLORS.line}`,
                borderRadius: 8,
                color: COLORS.textMuted,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 12,
                letterSpacing: 1,
                cursor: 'pointer',
              }}
            >
              BACK
            </button>
          )}
          <button
            onClick={() => (step < steps.length - 1 ? setStep(step + 1) : onComplete())}
            style={{
              flex: 1,
              padding: '13px 0',
              background: COLORS.accent,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 13,
              letterSpacing: 2,
              cursor: 'pointer',
            }}
          >
            {step === 0 ? 'READ IT \u2014 CONTINUE' : step === 1 ? 'CONTINUE' : "LOCK IN & START THE DAY"}
          </button>
        </div>
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('Grind Log tab error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, background: COLORS.bg, minHeight: '50vh' }}>
          <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 16, color: COLORS.accent, marginBottom: 8 }}>This tab hit a snag</div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>
            Your data is safe — this is just a display error in this one view.
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              color: COLORS.textMuted,
              marginBottom: 16,
              padding: 10,
              background: COLORS.surface2,
              borderRadius: 6,
              wordBreak: 'break-word',
            }}
          >
            {String(this.state.error && this.state.error.message)}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '10px 20px',
              background: COLORS.accent,
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontFamily: 'Oswald, sans-serif',
              fontSize: 13,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            TRY AGAIN
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [activeModule, setActiveModule] = useState('fitness');
  const [morningState, setMorningState] = useState('checking'); // checking | show | done
  const todayKey = formatDate(new Date());

  useEffect(() => {
    (async () => {
      try {
        const res = await safeStorage.get(`morning-ack:${todayKey}`, false);
        setMorningState(res && res.value ? 'done' : 'show');
      } catch (e) {
        setMorningState('show');
      }
    })();
  }, [todayKey]);

  async function completeMorning() {
    try {
      await safeStorage.set(`morning-ack:${todayKey}`, '1', false);
    } catch (e) {}
    setMorningState('done');
  }

  if (morningState === 'checking') {
    return (
      <div style={{ minHeight: '100vh', background: '#0B0C0E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{FONTS}</style>
        <div style={{ fontFamily: 'Oswald, sans-serif', fontSize: 13, letterSpacing: 3, color: '#8B909A' }}>SUCCESS</div>
      </div>
    );
  }
  if (morningState === 'show') {
    return <MorningFlow onComplete={completeMorning} />;
  }

  return (
    <div style={{ background: '#0B0C0E', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{FONTS}</style>
      <div
        style={{
          maxWidth: 560,
          margin: '0 auto',
          minHeight: '100vh',
          background: COLORS.bg,
          borderLeft: `1px solid ${COLORS.line}`,
          borderRight: `1px solid ${COLORS.line}`,
          boxShadow: '0 0 60px rgba(0,0,0,0.5)',
          color: COLORS.text,
        }}
      >
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${COLORS.line}`,
            position: 'sticky',
            top: 0,
            background: COLORS.bg,
            zIndex: 10,
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}
        >
          {[
            { id: 'fitness', label: 'FITNESS' },
            { id: 'schedule', label: 'SCHEDULE' },
            { id: 'goals', label: 'GOALS' },
            { id: 'tasks', label: 'TASKS' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveModule(m.id)}
              style={{
                flex: 1,
                padding: '14px 0',
                background: 'none',
                border: 'none',
                borderBottom: `2px solid ${activeModule === m.id ? COLORS.accent : 'transparent'}`,
                color: activeModule === m.id ? COLORS.text : COLORS.textMuted,
                fontFamily: 'Oswald, sans-serif',
                fontSize: 13,
                letterSpacing: 2,
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
          <button
            onClick={() => setMorningState('show')}
            title="Re-read morning flow"
            style={{
              padding: '14px 12px',
              background: 'none',
              border: 'none',
              borderBottom: '2px solid transparent',
              color: COLORS.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Sunrise size={16} />
          </button>
        </div>
        {activeModule === 'fitness' && (
          <ErrorBoundary>
            <FitnessModule />
          </ErrorBoundary>
        )}
        {activeModule === 'schedule' && (
          <ErrorBoundary>
            <ScheduleModule />
          </ErrorBoundary>
        )}
        {activeModule === 'goals' && (
          <ErrorBoundary>
            <GoalsModule />
          </ErrorBoundary>
        )}
        {activeModule === 'tasks' && (
          <ErrorBoundary>
            <TasksModule />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

const cardStyle = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 10,
  padding: 14,
  marginBottom: 10,
};

const navBtnStyle = {
  background: COLORS.surface,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 8,
  color: COLORS.text,
  padding: 6,
  cursor: 'pointer',
  display: 'flex',
};

const inputStyle = {
  background: COLORS.surface2,
  border: `1px solid ${COLORS.line}`,
  borderRadius: 6,
  color: COLORS.text,
  padding: '6px 8px',
  fontSize: 13,
  fontFamily: 'JetBrains Mono, monospace',
  outline: 'none',
};

const addSetBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'none',
  border: `1px dashed ${COLORS.line}`,
  borderRadius: 6,
  color: COLORS.textMuted,
  padding: '6px 10px',
  fontSize: 11,
  letterSpacing: 1,
  fontFamily: 'Oswald, sans-serif',
  cursor: 'pointer',
  width: '100%',
  justifyContent: 'center',
};

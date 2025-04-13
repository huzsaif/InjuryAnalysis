export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface InjuryDetails {
  bodyPart: string;
  cause: string;
  date: Date;
  sport: string;
  symptoms: string[];
}

export interface Injury {
  id: string;
  userId: string;
  bodyPart: string;
  cause: string;
  date: Date;
  sport: string;
  symptoms: string[];
  possibleInjuries: string[];
  status: 'active' | 'recovered' | 'needsAttention';
  createdAt: Date;
  updatedAt: Date;
}

export interface RecoveryPlan {
  id: string;
  injuryId: string;
  exercises: Exercise[];
  timeline: string;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
  lastAdjusted?: Date;
  adjustmentHistory?: ExerciseAdjustment[];
}

export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
  frequency: string;
  notes?: string;
  intensity?: number; // 1-5 scale
  difficulty?: number; // User-reported difficulty 1-10
  contraindications?: string[];
  equipment?: string[];
  targetArea?: string;
  adjustmentReason?: string;
}

export interface ExerciseAdjustment {
  date: Date;
  exerciseName: string;
  adjustmentType: 'increase' | 'decrease' | 'maintain';
  reason: string;
  previousSets: number;
  previousReps: number;
  newSets: number;
  newReps: number;
}

export interface Milestone {
  description: string;
  targetDate: Date;
  achieved: boolean;
  achievedDate?: Date;
}

export interface ProgressEntry {
  id: string;
  userId: string;
  injuryId: string;
  date: any; // Firebase Timestamp
  painLevel: number;
  mobility: number;
  swelling: number;
  notes: string;
  exercises: CompletedExercise[];
}

export interface CompletedExercise {
  exerciseId: string;
  completed: boolean;
  difficulty: number;
  notes?: string;
  painDuring?: number;
  painAfter?: number;
  modifications?: string;
}

export interface Alert {
  id: string;
  injuryId: string;
  type: 'warning' | 'milestone' | 'recommendation' | 'adjustment';
  message: string;
  createdAt: Date;
  read: boolean;
  action?: string;
}

export type BodyPart = 
  | 'head' 
  | 'neck'
  | 'chest'  
  | 'stomach'
  | 'left_shoulder' 
  | 'left_upper_arm' 
  | 'left_elbow' 
  | 'left_forearm' 
  | 'left_wrist' 
  | 'left_hand' 
  | 'right_shoulder' 
  | 'right_upper_arm' 
  | 'right_elbow' 
  | 'right_forearm' 
  | 'right_wrist' 
  | 'right_hand' 
  | 'left_hip' 
  | 'left_thigh' 
  | 'left_knee' 
  | 'left_calf' 
  | 'left_ankle' 
  | 'left_foot' 
  | 'right_hip' 
  | 'right_thigh' 
  | 'right_knee' 
  | 'right_calf' 
  | 'right_ankle' 
  | 'right_foot';

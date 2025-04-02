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
}

export interface Exercise {
  name: string;
  description: string;
  sets: number;
  reps: number;
  frequency: string;
  notes?: string;
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
}

export interface Alert {
  id: string;
  injuryId: string;
  type: 'warning' | 'milestone' | 'recommendation';
  message: string;
  createdAt: Date;
  read: boolean;
  action?: string;
}

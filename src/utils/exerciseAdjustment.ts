import { Exercise, ProgressEntry } from '../types';

/**
 * Calculates the intensity level (1-5) for an exercise
 * Higher values represent more challenging exercises
 */
export const calculateExerciseIntensity = (exercise: Exercise): number => {
  // Base intensity on exercise properties
  let intensity = 3; // Default medium intensity
  
  // Adjust based on reps and sets (higher counts = higher intensity)
  if (exercise.sets >= 4 || exercise.reps >= 15) {
    intensity++;
  }
  if (exercise.sets <= 2 && exercise.reps <= 8) {
    intensity--;
  }
  
  // Ensure intensity is between 1-5
  return Math.max(1, Math.min(5, intensity));
};

/**
 * Determines if an exercise should be adjusted based on user progress data
 * Returns the recommended adjustment type
 */
export const determineExerciseAdjustment = (
  exercise: Exercise,
  progressEntries: ProgressEntry[],
  exerciseIntensity: number
): 'increase' | 'decrease' | 'maintain' => {
  if (progressEntries.length < 2) {
    return 'maintain'; // Not enough data to make adjustments
  }

  // Get the two most recent entries
  const sortedEntries = [...progressEntries].sort((a, b) => {
    const dateA = a.date instanceof Date ? a.date : a.date.toDate();
    const dateB = b.date instanceof Date ? b.date : b.date.toDate();
    return dateB.getTime() - dateA.getTime();
  });
  
  const latestEntry = sortedEntries[0];
  const previousEntry = sortedEntries[1];
  
  // Check for completion and difficulty in exercise logs if available
  const latestExerciseLog = latestEntry.exercises?.find(e => e.exerciseId === exercise.name);
  
  // Analyze pain and mobility trends
  const painIncreased = latestEntry.painLevel > previousEntry.painLevel;
  const mobilityImproved = latestEntry.mobility > previousEntry.mobility;
  
  // Decision logic for exercise adjustment
  if (painIncreased && latestEntry.painLevel >= 7) {
    return 'decrease'; // High pain, reduce intensity
  }
  
  if (mobilityImproved && latestEntry.painLevel < 5 && exerciseIntensity < 5) {
    return 'increase'; // Good mobility and low pain, increase intensity
  }
  
  if (latestExerciseLog && latestExerciseLog.difficulty <= 3 && latestEntry.painLevel < 6) {
    return 'increase'; // Exercise reported as easy and pain is manageable
  }
  
  if (latestExerciseLog && latestExerciseLog.difficulty >= 8) {
    return 'decrease'; // Exercise reported as very difficult
  }
  
  return 'maintain'; // Default to maintaining current intensity
};

/**
 * Adjusts an exercise based on the determined adjustment type
 * Returns a new exercise object with modified parameters
 */
export const adjustExercise = (
  exercise: Exercise, 
  adjustmentType: 'increase' | 'decrease' | 'maintain'
): Exercise => {
  if (adjustmentType === 'maintain') {
    return { ...exercise };
  }
  
  const newExercise = { ...exercise };
  
  if (adjustmentType === 'increase') {
    // Increase intensity by adjusting reps, sets, or adding variation
    newExercise.reps = Math.min(20, Math.floor(exercise.reps * 1.2));
    
    if (exercise.reps >= 15) {
      newExercise.sets = Math.min(5, exercise.sets + 1);
      newExercise.reps = Math.max(8, Math.floor(exercise.reps * 0.8));
    }
    
    // Add a note about the progression
    newExercise.notes = `${exercise.notes || ''} Increased intensity due to good progress.`.trim();
  }
  
  if (adjustmentType === 'decrease') {
    // Decrease intensity by reducing reps, sets, or simplifying
    newExercise.reps = Math.max(5, Math.floor(exercise.reps * 0.8));
    
    if (exercise.sets > 1) {
      newExercise.sets = Math.max(1, exercise.sets - 1);
    }
    
    // Add a note about the regression
    newExercise.notes = `${exercise.notes || ''} Decreased intensity to manage pain/difficulty.`.trim();
  }
  
  return newExercise;
};

/**
 * Generates a complete adjusted exercise program based on user progress
 */
export const generateSmartExerciseProgram = (
  currentExercises: Exercise[],
  progressEntries: ProgressEntry[]
): { exercises: Exercise[], adjustmentSummary: string } => {
  const adjustedExercises: Exercise[] = [];
  const adjustmentNotes: string[] = [];
  
  for (const exercise of currentExercises) {
    const intensity = calculateExerciseIntensity(exercise);
    const adjustmentType = determineExerciseAdjustment(exercise, progressEntries, intensity);
    const adjustedExercise = adjustExercise(exercise, adjustmentType);
    
    adjustedExercises.push(adjustedExercise);
    
    if (adjustmentType !== 'maintain') {
      adjustmentNotes.push(
        `• ${exercise.name}: ${adjustmentType === 'increase' ? 'Increased' : 'Decreased'} intensity` +
        ` (${exercise.sets}x${exercise.reps} → ${adjustedExercise.sets}x${adjustedExercise.reps})`
      );
    }
  }
  
  // Create a summary of adjustments
  let adjustmentSummary = '';
  if (adjustmentNotes.length > 0) {
    adjustmentSummary = `Your exercise plan has been adjusted based on your recent progress:\n${adjustmentNotes.join('\n')}`;
  } else {
    adjustmentSummary = 'Your exercise plan remains the same as your progress is on track.';
  }
  
  return { exercises: adjustedExercises, adjustmentSummary };
}; 
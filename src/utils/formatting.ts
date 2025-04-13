import { BodyPart } from '../types';

/**
 * Format body part ID to a display name (e.g., 'left_elbow' -> 'Left Elbow')
 * @param bodyPart - The body part to format
 * @returns Formatted display name
 */
export const formatBodyPartName = (bodyPart: BodyPart): string => {
  return bodyPart
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Mapping between 3D model body parts and UI display names
 */
export const bodyPartMapping: Record<BodyPart, string> = {
  'head': 'Head',
  'neck': 'Neck',
  'chest': 'Chest',
  'stomach': 'Stomach',
  'left_shoulder': 'Left Shoulder',
  'right_shoulder': 'Right Shoulder',
  'left_upper_arm': 'Left Upper Arm',
  'right_upper_arm': 'Right Upper Arm',
  'left_elbow': 'Left Elbow',
  'right_elbow': 'Right Elbow',
  'left_forearm': 'Left Forearm',
  'right_forearm': 'Right Forearm',
  'left_wrist': 'Left Wrist',
  'right_wrist': 'Right Wrist',
  'left_hand': 'Left Hand',
  'right_hand': 'Right Hand',
  'left_hip': 'Left Hip',
  'right_hip': 'Right Hip',
  'left_thigh': 'Left Thigh',
  'right_thigh': 'Right Thigh',
  'left_knee': 'Left Knee',
  'right_knee': 'Right Knee',
  'left_calf': 'Left Calf',
  'right_calf': 'Right Calf',
  'left_ankle': 'Left Ankle',
  'right_ankle': 'Right Ankle',
  'left_foot': 'Left Foot',
  'right_foot': 'Right Foot',
};

/**
 * Reverse mapping from display names to 3D model body parts
 */
export const displayToBodyPartMapping: Record<string, BodyPart> = 
  Object.entries(bodyPartMapping).reduce((acc, [key, value]) => {
    acc[value] = key as BodyPart;
    return acc;
  }, {} as Record<string, BodyPart>);

/**
 * Convert a display name to a 3D model body part ID
 * @param displayName - The display name to convert
 * @returns The corresponding BodyPart ID or null if not found
 */
export const displayNameToBodyPart = (displayName: string): BodyPart | null => {
  return displayToBodyPartMapping[displayName] || null;
};

/**
 * Convert a 3D model body part ID to a display name
 * @param bodyPart - The BodyPart ID to convert
 * @returns The corresponding display name
 */
export const bodyPartToDisplayName = (bodyPart: BodyPart): string => {
  return bodyPartMapping[bodyPart] || formatBodyPartName(bodyPart);
};

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}; 
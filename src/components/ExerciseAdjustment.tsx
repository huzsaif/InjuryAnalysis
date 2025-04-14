import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  Heading,
  VStack,
  HStack,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { generateSmartAdjustedExercises } from '../services/firebase';
import type { Exercise } from '../types';

interface ExerciseAdjustmentProps {
  injuryId: string;
  exercises: Exercise[];
  onAdjustmentComplete?: (exercises: Exercise[], summary: string) => void;
}

export const ExerciseAdjustment: React.FC<ExerciseAdjustmentProps> = ({ 
  injuryId, 
  exercises,
  onAdjustmentComplete 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustedExercises, setAdjustedExercises] = useState<Exercise[] | null>(null);
  const [adjustmentSummary, setAdjustmentSummary] = useState<string | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const highlightColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleGenerateAdjustment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await generateSmartAdjustedExercises(injuryId);
      setAdjustedExercises(result.exercises);
      setAdjustmentSummary(result.adjustmentSummary);
      
      if (onAdjustmentComplete) {
        onAdjustmentComplete(result.exercises, result.adjustmentSummary);
      }
      
      onOpen(); // Open the modal to show results
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred while adjusting exercises');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box p={4} borderWidth={1} borderRadius="lg" borderColor={borderColor} bg={bgColor}>
      <VStack align="stretch" spacing={4}>
        <Heading size="md">Exercise Program</Heading>
        
        {exercises.length > 0 ? (
          <>
            <Text>Your personalized exercise program consists of {exercises.length} exercise(s).</Text>
            <VStack align="stretch" spacing={3}>
              {exercises.map((exercise, index) => (
                <Box 
                  key={index} 
                  p={3} 
                  borderWidth={1} 
                  borderRadius="md" 
                  borderColor={borderColor}
                >
                  <Heading size="sm" mb={2}>{exercise.name}</Heading>
                  <HStack spacing={6} mb={2}>
                    <Text><strong>Sets:</strong> {exercise.sets}</Text>
                    <Text><strong>Reps:</strong> {exercise.reps}</Text>
                  </HStack>
                  {exercise.instructions && (
                    <Text fontSize="sm" mb={2}>{exercise.instructions}</Text>
                  )}
                </Box>
              ))}
            </VStack>
            
            <Button 
              colorScheme="blue" 
              isLoading={loading} 
              onClick={handleGenerateAdjustment}
            >
              Adjust Based on Progress
            </Button>
            
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}
          </>
        ) : (
          <Text>No exercises have been prescribed yet.</Text>
        )}
      </VStack>
      
      {/* Results Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Exercise Adjustments</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              {adjustmentSummary && (
                <Text fontWeight="medium" mb={2}>{adjustmentSummary}</Text>
              )}
              
              {adjustedExercises && adjustedExercises.map((exercise, index) => {
                const originalExercise = exercises[index];
                return (
                  <Box 
                    key={index} 
                    p={3} 
                    borderWidth={1} 
                    borderRadius="md" 
                    borderColor={borderColor}
                    bg={originalExercise.sets !== exercise.sets || originalExercise.reps !== exercise.reps ? highlightColor : undefined}
                  >
                    <Heading size="sm" mb={2}>{exercise.name}</Heading>
                    
                    <HStack spacing={6} mb={2}>
                      <Text>
                        <strong>Sets:</strong> {originalExercise.sets !== exercise.sets ? (
                          <Text as="span" color={originalExercise.sets < exercise.sets ? "green.500" : "red.500"}>
                            {originalExercise.sets} → {exercise.sets}
                          </Text>
                        ) : exercise.sets}
                      </Text>
                      
                      <Text>
                        <strong>Reps:</strong> {originalExercise.reps !== exercise.reps ? (
                          <Text as="span" color={originalExercise.reps < exercise.reps ? "green.500" : "red.500"}>
                            {originalExercise.reps} → {exercise.reps}
                          </Text>
                        ) : exercise.reps}
                      </Text>
                    </HStack>
                    
                    {exercise.notes && (
                      <Text fontSize="sm" color="gray.600">
                        {exercise.notes}
                      </Text>
                    )}
                  </Box>
                );
              })}
              
              <Button colorScheme="blue" onClick={onClose} mt={4} width="100%">
                Close
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 
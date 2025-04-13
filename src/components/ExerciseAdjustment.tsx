import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider,
  List,
  ListItem,
  ListIcon,
  Tooltip,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronUpIcon, ChevronDownIcon, InfoIcon, CheckCircleIcon } from '@chakra-ui/icons';
import { FaDumbbell, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { Exercise, ProgressEntry } from '../types';
import { format } from 'date-fns';
import { generateSmartAdjustedExercises } from '../services/firebase';

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
  
  const getAdjustmentIcon = (oldExercise: Exercise, newExercise: Exercise) => {
    if (oldExercise.sets < newExercise.sets || oldExercise.reps < newExercise.reps) {
      return <FaArrowUp color="green.500" />;
    } else if (oldExercise.sets > newExercise.sets || oldExercise.reps > newExercise.reps) {
      return <FaArrowDown color="red.500" />;
    } else {
      return <FaMinus color="gray.500" />;
    }
  };
  
  const getAdjustmentBadge = (oldExercise: Exercise, newExercise: Exercise) => {
    if (oldExercise.sets < newExercise.sets || oldExercise.reps < newExercise.reps) {
      return <Badge colorScheme="green">Increased</Badge>;
    } else if (oldExercise.sets > newExercise.sets || oldExercise.reps > newExercise.reps) {
      return <Badge colorScheme="red">Decreased</Badge>;
    } else {
      return <Badge colorScheme="gray">Maintained</Badge>;
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justifyContent="space-between">
          <Heading size="md">Smart Exercise Adjustment</Heading>
          <Tooltip 
            label="This feature analyzes your progress data and automatically adjusts your exercise program for optimal recovery"
            aria-label="Smart exercise info"
          >
            <InfoIcon color="blue.500" />
          </Tooltip>
        </HStack>
        
        <Text>
          Automatically adjust your exercise program based on your recent progress and pain levels.
          Smart adjustment requires at least two progress entries to analyze trends.
        </Text>
        
        <Button 
          leftIcon={<FaDumbbell />} 
          colorScheme="blue" 
          isLoading={loading}
          onClick={handleGenerateAdjustment}
        >
          Generate Smart Adjustments
        </Button>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {/* Modal to display results */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Exercise Program Updated</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {adjustmentSummary && (
                <Alert status="info" mb={4} borderRadius="md">
                  <AlertIcon />
                  <Text whiteSpace="pre-wrap">{adjustmentSummary}</Text>
                </Alert>
              )}
              
              {adjustedExercises && adjustedExercises.map((exercise, index) => {
                const originalExercise = exercises[index];
                
                return (
                  <Box 
                    key={`${exercise.name}-${index}`}
                    p={4} 
                    borderWidth={1} 
                    borderRadius="md" 
                    borderColor={borderColor}
                    mb={4}
                    bg={
                      originalExercise.sets !== exercise.sets || originalExercise.reps !== exercise.reps 
                        ? highlightColor 
                        : bgColor
                    }
                  >
                    <HStack justifyContent="space-between" mb={2}>
                      <Heading size="sm">{exercise.name}</Heading>
                      {getAdjustmentBadge(originalExercise, exercise)}
                    </HStack>
                    
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
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
}; 
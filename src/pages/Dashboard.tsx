import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import { DeleteIcon, InfoIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { getUserInjuries, getInjuryProgress, deleteInjury, getRecoveryPlan } from '../services/firebase';
import { generateRecoveryPlan } from '../services/openai';
import { useAuth } from '../contexts/AuthContext';
import type { Injury, ProgressEntry, RecoveryPlan, Exercise } from '../types';
import { ExerciseAdjustment } from '../components/ExerciseAdjustment';

export const Dashboard = () => {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [selectedInjury, setSelectedInjury] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [deletingInjury, setDeletingInjury] = useState<string | null>(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [recoveryPlan, setRecoveryPlan] = useState<string | null>(null);
  const [recoveryPlanData, setRecoveryPlanData] = useState<RecoveryPlan | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null) as React.RefObject<HTMLButtonElement>;
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDeleteClick = (injuryId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting the injury when clicking delete
    setDeletingInjury(injuryId);
    onOpen();
  };
  
  const handleDeleteConfirm = async () => {
    if (!deletingInjury) return;
  
    try {
      await deleteInjury(deletingInjury);
      
      // Remove the injury from state
      setInjuries(injuries.filter(injury => injury.id !== deletingInjury));
      if (selectedInjury === deletingInjury) {
        setSelectedInjury(null);
        setProgressData([]);
      }
  
      toast({
        title: 'Injury deleted',
        description: 'The injury and its progress data have been removed',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error deleting injury',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingInjury(null);
      onClose();
    }
  };

  const handleGenerateRecoveryPlan = async () => {
    setGeneratingPlan(true);
    setRecoveryPlan(null);
    
    try {
      if (!selectedInjury) {
        throw new Error('Please select an injury first');
      }

      const selectedInjuryData = injuries.find(injury => injury.id === selectedInjury);
      if (!selectedInjuryData) {
        throw new Error('Selected injury data not found');
      }

      // Format progress data for the AI - using safe date formatting
      const formatProgressDate = (date: any) => {
        try {
          if (date && typeof date.toDate === 'function') {
            return format(date.toDate(), 'MMM d, yyyy');
          } else if (date instanceof Date) {
            return format(date, 'MMM d, yyyy');
          }
          return 'Unknown date';
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Unknown date';
        }
      };

      const progressNotes = progressData.map(entry => {
        let dateStr = 'Unknown date';
        try {
          dateStr = formatProgressDate(entry.date);
        } catch (error) {
          console.error('Error formatting progress date:', error);
        }
        
        return `Date: ${dateStr}, Pain: ${entry.painLevel}/10, Mobility: ${entry.mobility}/10, Swelling: ${entry.swelling || 5}/10, Notes: ${entry.notes || 'None'}`;
      }).join('\n');

      const daysSinceInjury = Math.floor(
        (new Date().getTime() - selectedInjuryData.date.getTime()) / (1000 * 3600 * 24)
      );

      const additionalInfo = `
Progress Data (${progressData.length} entries):
${progressNotes}

Current Status:
- Days since injury: ${daysSinceInjury}
- Latest pain level: ${progressData.length > 0 ? progressData[0].painLevel : 'Unknown'}/10
- Latest mobility: ${progressData.length > 0 ? progressData[0].mobility : 'Unknown'}/10
- Latest swelling: ${progressData.length > 0 ? (progressData[0].swelling || 'Not recorded') : 'Unknown'}/10
`;

      const plan = await generateRecoveryPlan(selectedInjuryData, additionalInfo);
      setRecoveryPlan(plan);
      
      toast({
        title: 'Recovery plan generated',
        description: 'Your personalized recovery plan is ready',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error generating recovery plan:', error);
      toast({
        title: 'Error generating recovery plan',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchInjuries = async () => {
      try {
        console.log('Fetching injuries for user:', user.uid);
        const userInjuries = await getUserInjuries(user.uid);
        console.log('Fetched injuries:', userInjuries);
        setInjuries(userInjuries);
        if (userInjuries.length > 0) {
          setSelectedInjury(userInjuries[0].id);
        }
      } catch (error) {
        console.error('Error fetching injuries:', error);
        toast({
          title: 'Error loading injuries',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInjuries();
  }, [user, navigate, toast]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (selectedInjury) {
        setLoadingProgress(true);
        try {
          console.log('Fetching progress for injury:', selectedInjury);
          const progress = await getInjuryProgress(selectedInjury);
          console.log('Fetched progress:', progress);
          setProgressData(progress);
        } catch (error) {
          console.error('Error fetching progress:', error);
          toast({
            title: 'Error loading progress',
            description: error instanceof Error ? error.message : 'An error occurred',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoadingProgress(false);
        }
      }
    };
    fetchProgress();
  }, [selectedInjury, toast]);

  useEffect(() => {
    const fetchRecoveryPlan = async () => {
      if (selectedInjury) {
        try {
          const plan = await getRecoveryPlan(selectedInjury);
          setRecoveryPlanData(plan);
        } catch (error) {
          console.error('Error fetching recovery plan:', error);
        }
      }
    };
    
    fetchRecoveryPlan();
  }, [selectedInjury]);

  const handleExerciseAdjustmentComplete = (exercises: Exercise[], summary: string) => {
    if (recoveryPlanData) {
      setRecoveryPlanData({
        ...recoveryPlanData,
        exercises,
        lastAdjusted: new Date()
      });
      
      toast({
        title: 'Exercise plan adjusted',
        description: 'Your exercise program has been updated based on your progress',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'yellow';
      case 'recovered':
        return 'green';
      case 'needsAttention':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  const formatDate = (date: Date) => {
    try {
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Invalid date';
    }
  };

  // Prepare chart data with proper date handling
  const prepareChartData = () => {
    return progressData.map(entry => {
      try {
        // Create a new object with the date converted to a JavaScript Date
        const entryDate = entry.date && typeof entry.date.toDate === 'function' 
          ? entry.date.toDate() 
          : entry.date instanceof Date ? entry.date : new Date();
          
        return {
          ...entry,
          date: entryDate,
        };
      } catch (error) {
        console.error('Error preparing chart data:', error);
        return {
          ...entry,
          date: new Date(), // Fallback to current date
        };
      }
    });
  };

  const chartData = prepareChartData();

  return (
    <Box>
      <HStack justify="space-between" mb={8}>
        <Heading>Injury Dashboard</Heading>
        <Button
          as={RouterLink}
          to="/new-injury"
          colorScheme="blue"
        >
          Report New Injury
        </Button>
      </HStack>

      <Grid templateColumns={{ base: '1fr', md: '300px 1fr' }} gap={8}>
        {/* Injuries List */}
        <VStack align="stretch" spacing={4}>
          <Heading size="md" mb={2}>Your Injuries</Heading>
          {injuries.length === 0 ? (
            <VStack spacing={4} align="stretch">
              <Text color="gray.500">No injuries reported yet</Text>
              <Button 
                as={RouterLink} 
                to="/new-injury" 
                colorScheme="blue" 
                size="sm"
              >
                Report Your First Injury
              </Button>
            </VStack>
          ) : (
            <>
              <Text fontSize="sm" color="gray.500" mb={2}>
                Select an injury to view progress, or use the "Log Progress" button to record daily updates
              </Text>
              {injuries.map((injury) => (
                <Box
                  key={injury.id}
                  p={4}
                  borderWidth={1}
                  borderRadius="md"
                  bg={selectedInjury === injury.id ? 'blue.50' : bgColor}
                  borderColor={borderColor}
                  cursor="pointer"
                  onClick={() => setSelectedInjury(injury.id)}
                >
                  <HStack justify="space-between" mb={2}>
                    <Heading size="sm">{injury.bodyPart}</Heading>
                    <HStack>
                      <Badge colorScheme={getStatusColor(injury.status)}>
                        {injury.status}
                      </Badge>
                      <IconButton
                        aria-label="Delete injury"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => handleDeleteClick(injury.id, e)}
                      />
                    </HStack>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {injury.sport}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Reported: {formatDate(injury.date)}
                  </Text>
                  <Button
                    size="sm"
                    mt={2}
                    as={RouterLink}
                    to={`/progress/${injury.id}`}
                    variant="outline"
                  >
                    Log Progress
                  </Button>
                </Box>
              ))}
            </>
          )}
        </VStack>

        {/* Progress Chart and Recovery Plan */}
        <VStack align="stretch" spacing={6}>
          <Box
            p={6}
            borderWidth={1}
            borderRadius="lg"
            bg={bgColor}
            borderColor={borderColor}
          >
            <Heading size="md" mb={6}>Recovery Progress</Heading>
            {loadingProgress ? (
              <Center h="300px">
                <Spinner />
              </Center>
            ) : progressData.length > 0 ? (
              <>
                <HStack justify="space-between" mb={4}>
                  <Heading size="sm">Progress Chart</Heading>
                  <Button 
                    onClick={handleGenerateRecoveryPlan} 
                    colorScheme="blue" 
                    isLoading={generatingPlan}
                    leftIcon={<InfoIcon />}
                    size="sm"
                  >
                    Generate Recovery Plan
                  </Button>
                </HStack>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => {
                        try {
                          return format(date, 'MMM d');
                        } catch (error) {
                          return '';
                        }
                      }}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) => {
                        try {
                          return format(date, 'MMM d, yyyy');
                        } catch (error) {
                          return 'Unknown date';
                        }
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="painLevel"
                      stroke="#F56565"
                      name="Pain Level"
                    />
                    <Line
                      type="monotone"
                      dataKey="mobility"
                      stroke="#4299E1"
                      name="Mobility"
                    />
                    <Line
                      type="monotone"
                      dataKey="swelling"
                      stroke="#9F7AEA"
                      name="Swelling"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </>
            ) : (
              <VStack spacing={4} align="stretch">
                <Text color="gray.500">No progress data available</Text>
                {selectedInjury && (
                  <Button 
                    as={RouterLink} 
                    to={`/progress/${selectedInjury}`}
                    colorScheme="blue"
                    size="sm"
                  >
                    Log Your First Progress Update
                  </Button>
                )}
              </VStack>
            )}
          </Box>

          {/* Recovery Plan Section */}
          {recoveryPlan && (
            <Box 
              p={6} 
              borderWidth={1} 
              borderRadius="lg" 
              bg={bgColor}
              borderColor={borderColor}
              mb={4}
            >
              <Heading size="md" mb={4}>Your Recovery Plan</Heading>
              <Text whiteSpace="pre-wrap" fontSize="md">{recoveryPlan}</Text>
            </Box>
          )}
          
          {/* Smart Exercise Adjustment Section */}
          {recoveryPlanData && recoveryPlanData.exercises && recoveryPlanData.exercises.length > 0 && (
            <Box 
              p={6} 
              borderWidth={1} 
              borderRadius="lg" 
              bg={bgColor}
              borderColor={borderColor}
            >
              <ExerciseAdjustment 
                injuryId={selectedInjury || ''}
                exercises={recoveryPlanData.exercises}
                onAdjustmentComplete={handleExerciseAdjustmentComplete}
              />
            </Box>
          )}
        </VStack>
      </Grid>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Injury
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will permanently delete this injury and all its progress data.
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}; 
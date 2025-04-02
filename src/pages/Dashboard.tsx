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
import { DeleteIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { getUserInjuries, getInjuryProgress, deleteInjury } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Injury, ProgressEntry } from '../types';

export const Dashboard = () => {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [selectedInjury, setSelectedInjury] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [deletingInjury, setDeletingInjury] = useState<string | null>(null);
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

        {/* Progress Chart */}
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
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => format(date, 'MMM d')}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(date) => format(date, 'MMM d, yyyy')}
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
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Text color="gray.500">No progress data available</Text>
          )}
        </Box>
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
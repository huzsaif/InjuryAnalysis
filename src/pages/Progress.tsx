import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  Textarea,
  VStack,
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { addProgressEntry, getInjury } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Injury } from '../types';

export const Progress = () => {
  const { injuryId } = useParams<{ injuryId: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [injury, setInjury] = useState<Injury | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    painLevel: 5,
    mobility: 5,
    swelling: 5,
    notes: '',
    exerciseDifficulty: 5,
    exerciseNotes: ''
  });
  
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Progress component mounted, injuryId:', injuryId);
    console.log('User authenticated:', !!user);
    
    if (!user) {
      console.log('No authenticated user, redirecting to login');
      navigate('/login');
      return;
    }

    const loadInjury = async () => {
      if (!injuryId) {
        console.error('No injury ID provided in URL');
        setError('No injury selected. Please select an injury from the dashboard.');
        setLoading(false);
        return;
      }

      try {
        console.log('Loading injury data for ID:', injuryId);
        const injuryData = await getInjury(injuryId);
        
        if (!injuryData) {
          console.error('Injury not found for ID:', injuryId);
          setError('Injury not found. It may have been deleted.');
          setLoading(false);
          return;
        }

        console.log('Injury data loaded:', injuryData);
        console.log('Checking ownership - Current user:', user.uid, 'Injury owner:', injuryData.userId);
        if (injuryData.userId !== user.uid) {
          console.error('Access denied - User does not own this injury');
          setError('You do not have permission to access this injury.');
          setLoading(false);
          return;
        }

        console.log('Injury ownership verified, setting injury data');
        setInjury(injuryData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading injury:', error);
        setError('An error occurred while loading the injury details.');
        setLoading(false);
      }
    };

    loadInjury();
  }, [injuryId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    console.log('Submitting progress form for injury:', injuryId);

    if (!user) {
      console.error('No authenticated user on form submit');
      toast({
        title: 'Authentication required',
        description: 'Please sign in to log progress',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    if (!injuryId) {
      console.error('No injury ID on form submit');
      toast({
        title: 'Error logging progress',
        description: 'No injury selected',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      console.log('Adding progress entry with data:', {
        injuryId,
        userId: user.uid,
        painLevel: formData.painLevel,
        mobility: formData.mobility,
        swelling: formData.swelling,
      });
      
      await addProgressEntry({
        injuryId,
        userId: user.uid,
        painLevel: formData.painLevel,
        mobility: formData.mobility,
        swelling: formData.swelling,
        notes: formData.notes,
        exercises: [
          {
            exerciseId: 'overall',
            completed: true,
            difficulty: formData.exerciseDifficulty || 5,
            notes: formData.exerciseNotes || '',
          }
        ],
      });

      console.log('Progress entry added successfully');
      toast({
        title: 'Progress logged successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding progress entry:', error);
      toast({
        title: 'Error logging progress',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box width="100%" display="flex" justifyContent="center" mt={8}>
        <Box width={["90%", "80%", "60%", "800px"]}>
          <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" borderRadius="md">
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">Error</AlertTitle>
            <AlertDescription maxWidth="sm">{error}</AlertDescription>
            <Button as={Link} to="/dashboard" colorScheme="blue" mt={4}>
              Return to Dashboard
            </Button>
          </Alert>
        </Box>
      </Box>
    );
  }

  if (!injury) {
    return (
      <Box width="100%" display="flex" justifyContent="center" mt={8}>
        <Box width={["90%", "80%", "60%", "800px"]}>
          <Alert status="warning" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px" borderRadius="md">
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">No Injury Selected</AlertTitle>
            <AlertDescription maxWidth="sm">
              Please select an injury from the dashboard to log progress.
            </AlertDescription>
            <Button as={Link} to="/dashboard" colorScheme="blue" mt={4}>
              Return to Dashboard
            </Button>
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box width={["90%", "80%", "60%", "800px"]}>
        <VStack spacing={8} align="stretch">
          <VStack align="stretch" spacing={2}>
            <Heading>Log Daily Progress</Heading>
            <Text color="gray.600">
              {injury.bodyPart} injury from {injury.sport}
            </Text>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Pain Level (1-10)</FormLabel>
                <HStack spacing={4}>
                  <Slider
                    value={formData.painLevel}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => setFormData({ ...formData, painLevel: value })}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text w="40px" textAlign="center">
                    {formData.painLevel}
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Mobility (1-10)</FormLabel>
                <HStack spacing={4}>
                  <Slider
                    value={formData.mobility}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => setFormData({ ...formData, mobility: value })}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text w="40px" textAlign="center">
                    {formData.mobility}
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Swelling (1-10)</FormLabel>
                <HStack spacing={4}>
                  <Slider
                    value={formData.swelling}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => setFormData({ ...formData, swelling: value })}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text w="40px" textAlign="center">
                    {formData.swelling}
                  </Text>
                </HStack>
              </FormControl>

              <FormControl mt={6}>
                <FormLabel>Exercise Difficulty</FormLabel>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  How difficult were your prescribed exercises today? This helps our system adjust your program intelligently.
                </Text>
                <HStack spacing={4}>
                  <Slider
                    value={formData.exerciseDifficulty || 5}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(value) => setFormData({ ...formData, exerciseDifficulty: value })}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text w="40px" textAlign="center">
                    {formData.exerciseDifficulty || 5}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" width="100%" fontSize="xs" color="gray.500" mt={1}>
                  <Text>Very Easy</Text>
                  <Text>Moderate</Text>
                  <Text>Very Hard</Text>
                </HStack>
              </FormControl>

              <FormControl mt={6}>
                <FormLabel>Exercise Feedback</FormLabel>
                <Textarea
                  placeholder="Did you have any issues with specific exercises? Did you need to modify any exercises? Any pain during particular movements?"
                  value={formData.exerciseNotes || ''}
                  onChange={(e) => setFormData({ ...formData, exerciseNotes: e.target.value })}
                  size="md"
                  minH="100px"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="How are you feeling today? Any improvements or setbacks?"
                />
              </FormControl>

              <HStack spacing={4} mt={8} justify="flex-end">
                <Button as={Link} to="/dashboard" variant="outline">
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit" isLoading={saving}>
                  Log Progress
                </Button>
              </HStack>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
}; 
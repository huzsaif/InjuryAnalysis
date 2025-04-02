import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  Heading,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { analyzeInjury } from '../services/openai';
import { addInjury } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { InjuryDetails } from '../types';

const BODY_PARTS = [
  'Head',
  'Neck',
  'Shoulder',
  'Upper Arm',
  'Elbow',
  'Forearm',
  'Wrist',
  'Hand',
  'Chest',
  'Upper Back',
  'Lower Back',
  'Hip',
  'Thigh',
  'Knee',
  'Lower Leg',
  'Ankle',
  'Foot',
];

const SPORTS = [
  'Running',
  'Basketball',
  'Football',
  'Soccer',
  'Tennis',
  'Swimming',
  'Weightlifting',
  'CrossFit',
  'Volleyball',
  'Baseball',
  'Ultimate Frisbee',
  'Other',
];

export const NewInjury = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bodyPart: '',
    cause: '',
    sport: '',
    symptoms: '',
  });
  const [analysis, setAnalysis] = useState('');
  
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to report an injury',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
      return;
    }

    try {
      const injuryDetails: InjuryDetails = {
        bodyPart: formData.bodyPart,
        cause: formData.cause,
        date: new Date(),
        sport: formData.sport,
        symptoms: formData.symptoms.split(',').map(s => s.trim()),
      };

      const result = await analyzeInjury(injuryDetails);
      setAnalysis(result || '');
      
      // Save to Firebase
      const injuryId = await addInjury({
        ...injuryDetails,
        userId: user.uid,
        status: 'active',
        possibleInjuries: [], // This should ideally be extracted from the AI analysis
      });
      
      toast({
        title: 'Injury reported successfully',
        description: 'You can now track your progress',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Navigate to progress logging for this injury
      navigate(`/progress/${injuryId}`);
    } catch (error) {
      toast({
        title: 'Error reporting injury',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="container.md" mx="auto">
      <VStack spacing={8} align="stretch">
        <Heading>Report New Injury</Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Body Part</FormLabel>
              <Select
                placeholder="Select body part"
                value={formData.bodyPart}
                onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
              >
                {BODY_PARTS.map((part) => (
                  <option key={part} value={part}>
                    {part}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Sport/Activity</FormLabel>
              <Select
                placeholder="Select sport"
                value={formData.sport}
                onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
              >
                {SPORTS.map((sport) => (
                  <option key={sport} value={sport}>
                    {sport}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>How did it happen?</FormLabel>
              <Textarea
                placeholder="Describe how the injury occurred..."
                value={formData.cause}
                onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Symptoms</FormLabel>
              <Input
                placeholder="Enter symptoms (comma-separated)"
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              />
            </FormControl>

            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              loadingText="Analyzing..."
            >
              Analyze Injury
            </Button>
          </VStack>
        </form>

        {analysis && (
          <Box mt={8} p={6} borderRadius="md" borderWidth={1}>
            <Heading size="md" mb={4}>
              Analysis Results
            </Heading>
            <Text whiteSpace="pre-wrap">{analysis}</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}; 
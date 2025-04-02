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
  HStack,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate, Link } from 'react-router-dom';
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
  const [injuryId, setInjuryId] = useState<string | null>(null);
  
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
      const newInjuryId = await addInjury({
        ...injuryDetails,
        userId: user.uid,
        status: 'active',
        possibleInjuries: [], // This should ideally be extracted from the AI analysis
      });
      
      // Store the injury ID but don't navigate automatically
      setInjuryId(newInjuryId);
      
      toast({
        title: 'Injury reported successfully',
        description: 'Please review the analysis below',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
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

  const handleReset = () => {
    // Reset the form to report a new injury
    setFormData({
      bodyPart: '',
      cause: '',
      sport: '',
      symptoms: '',
    });
    setAnalysis('');
    setInjuryId(null);
  };

  return (
    <Box width="100%" display="flex" justifyContent="center">
      <Box width={["90%", "80%", "60%", "800px"]}>
        <VStack spacing={8} align="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading>Report New Injury</Heading>
            {injuryId && (
              <Button 
                onClick={handleReset}
                colorScheme="blue"
                variant="outline"
                size="sm"
              >
                Report Another Injury
              </Button>
            )}
          </Flex>
          
          {injuryId ? (
            <Box 
              p={4} 
              bg={useColorModeValue('green.50', 'green.900')} 
              borderRadius="md" 
              borderWidth={1}
              borderColor="green.200"
            >
              <Flex alignItems="center">
                <Box color="green.500" mr={3}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM8 15L3 10L4.41 8.59L8 12.17L15.59 4.58L17 6L8 15Z" fill="currentColor"/>
                  </svg>
                </Box>
                <Text fontWeight="medium" color={useColorModeValue('green.700', 'green.200')}>
                  Injury successfully reported. Please review the analysis below.
                </Text>
              </Flex>
            </Box>
          ) : (
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
                  disabled={injuryId !== null}
                >
                  Analyze Injury
                </Button>
              </VStack>
            </form>
          )}

          {analysis && (
            <Box 
              mt={8} 
              p={8} 
              borderRadius="lg" 
              borderWidth={1}
              borderColor="blue.200"
              boxShadow="md"
              bg={useColorModeValue('white', 'gray.800')}
            >
              <Heading 
                size="md" 
                mb={4} 
                pb={3} 
                borderBottomWidth={1} 
                borderBottomColor="blue.100"
                color="blue.600"
              >
                Analysis Results
              </Heading>
              
              <Box 
                bg={useColorModeValue('blue.50', 'gray.700')} 
                p={4} 
                borderRadius="md" 
                mb={6}
              >
                <Text whiteSpace="pre-wrap" fontSize="md" lineHeight="taller">{analysis}</Text>
              </Box>
              
              {injuryId && (
                <Box 
                  mt={8} 
                  pt={6} 
                  borderTopWidth={1} 
                  borderTopColor="blue.100"
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontWeight="medium">Ready to track your recovery progress?</Text>
                    <HStack spacing={4}>
                      <Button 
                        as={Link} 
                        to="/dashboard" 
                        variant="outline"
                      >
                        View Dashboard
                      </Button>
                      <Button
                        as={Link}
                        to={`/progress/${injuryId}`}
                        colorScheme="blue"
                        rightIcon={<ChevronRightIcon />}
                      >
                        Log Progress
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
              )}
            </Box>
          )}
        </VStack>
      </Box>
    </Box>
  );
}; 
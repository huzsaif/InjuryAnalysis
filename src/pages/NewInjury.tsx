import React, { useState } from 'react';
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
  Divider,
  Collapse,
  useDisclosure,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useNavigate, Link } from 'react-router-dom';
import { analyzeInjury } from '../services/openai';
import { addInjury } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { InjuryDetails } from '../types';
import { BodyPartSelector } from '../components/3DModel/BodyPartSelector';
import { bodyPartMapping } from '../utils/formatting';

// Convert the mappings to an array of display names
const BODY_PARTS = Object.values(bodyPartMapping);

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
    bodyParts: [] as string[],
    cause: '',
    sport: '',
    symptoms: '',
  });
  const [analysis, setAnalysis] = useState('');
  const [injuryId, setInjuryId] = useState<string | null>(null);
  const { isOpen: is3DOpen, onToggle: toggle3D } = useDisclosure({ defaultIsOpen: true });
  
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBodyPartSelect = (bodyPart: string, isSelected: boolean) => {
    if (isSelected) {
      // Add body part if it's not already selected
      if (!formData.bodyParts.includes(bodyPart)) {
        setFormData({ 
          ...formData, 
          bodyParts: [...formData.bodyParts, bodyPart]
        });
      }
    } else {
      // Remove body part
      setFormData({ 
        ...formData, 
        bodyParts: formData.bodyParts.filter(part => part !== bodyPart)
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one body part is selected
    if (formData.bodyParts.length === 0) {
      toast({
        title: 'Selection required',
        description: 'Please select at least one body part',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Additional validation for required fields
    if (!formData.sport) {
      toast({
        title: 'Sport/Activity required',
        description: 'Please select a sport or activity',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.cause) {
      toast({
        title: 'Cause required',
        description: 'Please describe how the injury occurred',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.symptoms) {
      toast({
        title: 'Symptoms required',
        description: 'Please enter at least one symptom',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
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
      console.log('Submitting form data:', formData);
      const bodyPartsString = formData.bodyParts.join(', ');
      
      const injuryDetails: InjuryDetails = {
        bodyPart: bodyPartsString,
        cause: formData.cause,
        date: new Date(),
        sport: formData.sport,
        symptoms: formData.symptoms.split(',').map(s => s.trim()),
      };

      console.log('Calling analyzeInjury with:', injuryDetails);
      const result = await analyzeInjury(injuryDetails);
      console.log('Analysis result:', result);
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
      console.error('Error analyzing injury:', error);
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
      bodyParts: [],
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
              <VStack spacing={6} align="stretch">
                {/* 3D Body Part Selector */}
                <FormControl id="bodyPart" isRequired>
                  <Flex 
                    justifyContent="space-between" 
                    alignItems="center" 
                    onClick={toggle3D} 
                    cursor="pointer"
                    mb={2}
                  >
                    <FormLabel margin="0" cursor="pointer">Select Injured Body Parts</FormLabel>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      rightIcon={is3DOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    >
                      {is3DOpen ? "Hide 3D Model" : "Show 3D Model"}
                    </Button>
                  </Flex>
                  
                  <Collapse in={is3DOpen} animateOpacity>
                    <BodyPartSelector 
                      selectedBodyParts={formData.bodyParts} 
                      onSelectBodyPart={handleBodyPartSelect}
                      bodyParts={BODY_PARTS}
                    />
                  </Collapse>
                  
                  {!is3DOpen && formData.bodyParts.length > 0 && (
                    <Box p={3} bg="blue.50" borderRadius="md" mt={2}>
                      <Text fontWeight="medium" mb={2}>
                        Selected: {formData.bodyParts.length} body part{formData.bodyParts.length !== 1 ? 's' : ''}
                      </Text>
                      <Wrap>
                        {formData.bodyParts.map(part => (
                          <WrapItem key={part}>
                            <Tag colorScheme="blue" size="md">{part}</Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Box>
                  )}
                  
                  {!is3DOpen && formData.bodyParts.length === 0 && (
                    <Box>
                      <Select
                        placeholder="Select body parts"
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleBodyPartSelect(e.target.value, true);
                          }
                        }}
                        isInvalid={formData.bodyParts.length === 0}
                      >
                        {BODY_PARTS.map((part) => (
                          <option key={part} value={part}>
                            {part}
                          </option>
                        ))}
                      </Select>
                      {formData.bodyParts.length === 0 && (
                        <Text fontSize="sm" color="red.500" mt={1}>
                          Please select at least one body part
                        </Text>
                      )}
                    </Box>
                  )}
                  
                  {/* Hidden field to satisfy form validation */}
                  <Input 
                    type="hidden" 
                    name="bodyParts" 
                    value={formData.bodyParts.join(',')} 
                    aria-hidden="true"
                    isRequired={false}
                  />
                </FormControl>

                <Divider />

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
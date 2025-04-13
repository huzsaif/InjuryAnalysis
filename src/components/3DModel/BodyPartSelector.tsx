import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  HStack,
  Checkbox,
  CheckboxGroup,
  VStack,
  Badge,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  VisuallyHidden,
  FormControl,
} from '@chakra-ui/react';
import { ModelViewer } from './ModelViewer';
import { BodyPart } from '../../types';
import { displayNameToBodyPart, bodyPartToDisplayName } from '../../utils/formatting';

interface BodyPartSelectorProps {
  selectedBodyParts: string[];
  onSelectBodyPart: (bodyPart: string, selected: boolean) => void;
  bodyParts: string[];
}

export const BodyPartSelector: React.FC<BodyPartSelectorProps> = ({
  selectedBodyParts,
  onSelectBodyPart,
  bodyParts,
}) => {
  const [viewMode, setViewMode] = useState<'3d' | 'list'>('3d');
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // State to store the selected 3D model body parts
  const [selected3DParts, setSelected3DParts] = useState<BodyPart[]>(
    selectedBodyParts.map(part => displayNameToBodyPart(part)).filter(Boolean) as BodyPart[]
  );

  // Update the selected 3D parts when the selectedBodyParts prop changes
  useEffect(() => {
    setSelected3DParts(
      selectedBodyParts.map(part => displayNameToBodyPart(part)).filter(Boolean) as BodyPart[]
    );
  }, [selectedBodyParts]);

  // Function to handle selection from the 3D model
  const handle3DSelection = (bodyPart: BodyPart) => {
    const displayName = bodyPartToDisplayName(bodyPart);
    const isSelected = selectedBodyParts.includes(displayName);
    onSelectBodyPart(displayName, !isSelected);
  };

  // Function to remove a body part selection
  const handleRemoveBodyPart = (bodyPart: BodyPart) => {
    const displayName = bodyPartToDisplayName(bodyPart);
    onSelectBodyPart(displayName, false);
  };

  // Group body parts by region for the list view
  const bodyPartsByRegion = {
    'Head & Neck': bodyParts.filter(part => ['Head', 'Neck'].includes(part)),
    'Upper Body': bodyParts.filter(part => 
      ['Shoulder', 'Upper Arm', 'Elbow', 'Forearm', 'Wrist', 'Hand', 'Chest', 'Upper Back'].some(keyword => 
        part.includes(keyword)
      )
    ),
    'Core': bodyParts.filter(part => ['Lower Back', 'Hip', 'Stomach'].some(keyword => part.includes(keyword))),
    'Lower Body': bodyParts.filter(part => 
      ['Thigh', 'Knee', 'Lower Leg', 'Ankle', 'Foot', 'Calf'].some(keyword => part.includes(keyword))
    ),
  };

  // Calculate how many parts are selected
  const selectedCount = selectedBodyParts.length;

  return (
    <Box 
      borderWidth={1} 
      borderColor={borderColor} 
      borderRadius="lg" 
      bg={bgColor}
      overflow="hidden"
    >
      {/* Accessible hidden input for form validation */}
      <FormControl>
        <VisuallyHidden>
          <Input 
            type="text" 
            name="bodyPartsValidation" 
            value={selectedBodyParts.join(',')} 
            tabIndex={-1}
            aria-hidden={false}
            readOnly
          />
        </VisuallyHidden>
      </FormControl>

      <Tabs isFitted variant="enclosed">
        <TabList>
          <Tab 
            onClick={() => setViewMode('3d')}
            bg={viewMode === '3d' ? 'blue.50' : undefined}
            color={viewMode === '3d' ? 'blue.600' : undefined}
            fontWeight={viewMode === '3d' ? 'medium' : undefined}
          >
            3D Selection
          </Tab>
          <Tab 
            onClick={() => setViewMode('list')}
            bg={viewMode === 'list' ? 'blue.50' : undefined}
            color={viewMode === 'list' ? 'blue.600' : undefined}
            fontWeight={viewMode === 'list' ? 'medium' : undefined}
          >
            List Selection
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Box p={4}>
              <Text fontSize="sm" color="gray.600">
                Click on body parts to select or deselect them. You can select multiple parts.
              </Text>
            </Box>
            <ModelViewer 
              selectedBodyParts={selected3DParts} 
              onSelectBodyPart={handle3DSelection}
              onRemoveBodyPart={handleRemoveBodyPart}
              height={400} 
            />
          </TabPanel>
          
          <TabPanel>
            <CheckboxGroup value={selectedBodyParts}>
              <VStack align="stretch" spacing={6} p={4}>
                {Object.entries(bodyPartsByRegion).map(([region, parts]) => (
                  <Box key={region}>
                    <Heading size="sm" mb={2}>{region}</Heading>
                    <Wrap spacing={2}>
                      {parts.map(part => (
                        <WrapItem key={part}>
                          <Checkbox 
                            value={part} 
                            colorScheme="blue"
                            isChecked={selectedBodyParts.includes(part)}
                            onChange={(e) => onSelectBodyPart(part, e.target.checked)}
                          >
                            {part}
                          </Checkbox>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                ))}
              </VStack>
            </CheckboxGroup>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {selectedBodyParts.length > 0 && (
        <Box 
          p={4} 
          borderTopWidth={1} 
          borderColor={borderColor} 
          bg="blue.50"
        >
          <VStack spacing={2} align="stretch">
            <HStack justifyContent="space-between">
              <Text fontWeight="medium">
                Selected body parts: <Badge colorScheme="blue">{selectedCount}</Badge>
              </Text>
              {selectedCount > 0 && (
                <Button 
                  size="xs" 
                  onClick={() => selectedBodyParts.forEach(part => onSelectBodyPart(part, false))}
                  colorScheme="blue"
                  variant="outline"
                >
                  Clear All
                </Button>
              )}
            </HStack>
            
            {selectedCount > 0 && (
              <Wrap spacing={2} mt={2}>
                {selectedBodyParts.map(part => (
                  <WrapItem key={part}>
                    <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                      <TagLabel>{part}</TagLabel>
                      <TagCloseButton onClick={() => onSelectBodyPart(part, false)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
}; 
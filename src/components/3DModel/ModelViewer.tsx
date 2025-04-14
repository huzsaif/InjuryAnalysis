import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import HumanModel from './HumanModel';
import { Box, Spinner, Center, Text, Tag, TagLabel, TagCloseButton, Wrap, WrapItem } from '@chakra-ui/react';
import { BodyPart } from '../../types';
import { formatBodyPartName } from '../../utils/formatting';

// Temporary workarounds for JSX elements
// @ts-ignore
const AmbientLight = (props: any) => <ambientLight {...props} />;
// @ts-ignore
const PointLight = (props: any) => <pointLight {...props} />;

interface ModelViewerProps {
  selectedBodyParts: BodyPart[];
  onSelectBodyPart: (bodyPart: BodyPart) => void;
  onRemoveBodyPart?: (bodyPart: BodyPart) => void;
  height?: string | number;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ 
  selectedBodyParts = [], 
  onSelectBodyPart,
  onRemoveBodyPart,
  height = '500px'
}) => {
  // Function to handle toggling a body part selection
  const handleSelectPart = (part: BodyPart) => {
    onSelectBodyPart(part);
  };

  // Function to handle removing a selected body part
  const handleRemovePart = (part: BodyPart) => {
    if (onRemoveBodyPart) {
      onRemoveBodyPart(part);
    }
  };

  return (
    <Box
      width="100%"
      height={height}
      borderRadius="md"
      overflow="hidden"
      borderWidth={1}
      borderColor="gray.200"
      position="relative"
    >
      <Canvas shadows>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 3]} />
          <AmbientLight intensity={0.5} />
          <PointLight position={[10, 10, 10]} intensity={1} castShadow />
          <HumanModel selectedParts={selectedBodyParts} onSelectPart={handleSelectPart} />
          <Environment preset="sunset" />
          <OrbitControls 
            enablePan={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            minDistance={1.5}
            maxDistance={4}
          />
        </Suspense>
      </Canvas>
      
      {/* Loading indicator */}
      <Suspense fallback={
        <Center position="absolute" top="0" left="0" width="100%" height="100%" bg="rgba(0,0,0,0.1)">
          <Spinner size="xl" color="blue.500" thickness="4px" />
        </Center>
      }>
        {null}
      </Suspense>
      
      {/* Instructions overlay */}
      <Text
        position="absolute"
        bottom="10px"
        left="10px"
        fontSize="sm"
        color="gray.600"
        bg="whiteAlpha.700"
        p={2}
        borderRadius="md"
      >
        Click on a body part to select/deselect it | Drag to rotate | Scroll to zoom
      </Text>
      
      {/* Selected parts indicator */}
      {selectedBodyParts.length > 0 && (
        <Box
          position="absolute"
          top="10px"
          left="10px"
          p={2}
          borderRadius="md"
          boxShadow="md"
          bg="blue.500"
          color="white"
          maxWidth="80%"
        >
          <Text fontSize="sm" fontWeight="bold" mb={1}>
            Selected Parts:
          </Text>
          <Wrap spacing={1}>
            {selectedBodyParts.map(part => (
              <WrapItem key={part}>
                <Tag size="sm" colorScheme="blue" variant="solid" borderRadius="full">
                  <TagLabel>{formatBodyPartName(part)}</TagLabel>
                  {onRemoveBodyPart && (
                    <TagCloseButton onClick={() => handleRemovePart(part)} />
                  )}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        </Box>
      )}
    </Box>
  );
}; 
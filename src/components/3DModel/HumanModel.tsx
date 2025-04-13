import React, { useRef, useState, forwardRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { BodyPart } from '../../types';
import * as THREE from 'three';
import { BoxGeometry, MeshStandardMaterial } from 'three';

// Extend Three.js elements to make them available as JSX elements
extend({ BoxGeometry, MeshStandardMaterial });

// Constants for colors
const DEFAULT_COLOR = 'gray';
const HIGHLIGHT_COLOR = 'lightblue';
const SELECTED_COLOR = 'blue';

// Body part mesh component props interface
interface BodyPartProps {
  position: [number, number, number];
  scale: [number, number, number];
  partName: BodyPart;
  isHighlighted: boolean;
  isSelected: boolean;
  onClick: (partName: BodyPart) => void;
  onPointerOver: (partName: BodyPart) => void;
  onPointerOut: () => void;
}

// Temporary workaround for TypeScript JSX element issues
// @ts-ignore
const Mesh = (props: any) => <mesh {...props} />;
// @ts-ignore
const BoxGeometryElement = () => <boxGeometry />;
// @ts-ignore
const MeshStandardMaterialElement = (props: any) => <meshStandardMaterial {...props} />;
// @ts-ignore
const AmbientLight = (props: any) => <ambientLight {...props} />;
// @ts-ignore
const DirectionalLight = (props: any) => <directionalLight {...props} />;

// Using forwardRef to properly handle refs
// @ts-ignore
const Group = forwardRef((props: any, ref) => <group ref={ref} {...props} />);

// Body part mesh component
const BodyPartMesh: React.FC<BodyPartProps> = ({
  position,
  scale,
  partName,
  isHighlighted,
  isSelected,
  onClick,
  onPointerOver,
  onPointerOut
}) => {
  // Determine color based on state
  const color = isSelected ? SELECTED_COLOR : isHighlighted ? HIGHLIGHT_COLOR : DEFAULT_COLOR;

  return (
    <Mesh
      position={new THREE.Vector3().fromArray(position)}
      scale={new THREE.Vector3().fromArray(scale)}
      onClick={() => onClick(partName)}
      onPointerOver={() => onPointerOver(partName)}
      onPointerOut={onPointerOut}
    >
      <BoxGeometryElement />
      <MeshStandardMaterialElement color={color} />
    </Mesh>
  );
};

// Human model component
const HumanModel: React.FC<HumanModelProps> = ({ selectedParts, onSelectPart }) => {
  // State for tracking which part is being hovered over
  const [hoveredPart, setHoveredPart] = useState<BodyPart | null>(null);
  
  // Refs for rotation animation
  const groupRef = useRef<THREE.Group>(null);
  
  // Handle pointer hover over a body part
  const handlePointerOver = (part: BodyPart) => {
    setHoveredPart(part);
  };
  
  // Handle pointer moving away from a body part
  const handlePointerOut = () => {
    setHoveredPart(null);
  };
  
  // Handle clicking on a body part
  const handleClick = (part: BodyPart) => {
    onSelectPart(part);
  };
  
  // Animation loop - rotate the model slowly
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });
  
  // Body parts with their positions and scales
  const bodyParts: Array<{
    partName: BodyPart;
    position: [number, number, number];
    scale: [number, number, number];
  }> = [
    // Head
    { partName: 'head', position: [0, 1.5, 0], scale: [0.5, 0.5, 0.5] },
    
    // Neck
    { partName: 'neck', position: [0, 1.15, 0], scale: [0.25, 0.2, 0.25] },
    
    // Chest and Stomach (replacing torso)
    { partName: 'chest', position: [0, 0.7, 0], scale: [1, 0.5, 0.5] },
    { partName: 'stomach', position: [0, 0.2, 0], scale: [0.9, 0.5, 0.4] },
    
    // Arms
    { partName: 'left_shoulder', position: [-0.8, 0.9, 0], scale: [0.25, 0.25, 0.25] },
    { partName: 'right_shoulder', position: [0.8, 0.9, 0], scale: [0.25, 0.25, 0.25] },
    { partName: 'left_upper_arm', position: [-0.8, 0.6, 0], scale: [0.2, 0.4, 0.2] },
    { partName: 'right_upper_arm', position: [0.8, 0.6, 0], scale: [0.2, 0.4, 0.2] },
    { partName: 'left_elbow', position: [-0.8, 0.2, 0], scale: [0.2, 0.2, 0.2] },
    { partName: 'right_elbow', position: [0.8, 0.2, 0], scale: [0.2, 0.2, 0.2] },
    { partName: 'left_forearm', position: [-0.8, -0.1, 0], scale: [0.15, 0.3, 0.15] },
    { partName: 'right_forearm', position: [0.8, -0.1, 0], scale: [0.15, 0.3, 0.15] },
    { partName: 'left_wrist', position: [-0.8, -0.35, 0], scale: [0.15, 0.1, 0.15] },
    { partName: 'right_wrist', position: [0.8, -0.35, 0], scale: [0.15, 0.1, 0.15] },
    { partName: 'left_hand', position: [-0.8, -0.5, 0], scale: [0.2, 0.15, 0.1] },
    { partName: 'right_hand', position: [0.8, -0.5, 0], scale: [0.2, 0.15, 0.1] },
    
    // Legs
    { partName: 'left_hip', position: [-0.3, -0.5, 0], scale: [0.3, 0.3, 0.3] },
    { partName: 'right_hip', position: [0.3, -0.5, 0], scale: [0.3, 0.3, 0.3] },
    { partName: 'left_thigh', position: [-0.3, -0.9, 0], scale: [0.25, 0.4, 0.25] },
    { partName: 'right_thigh', position: [0.3, -0.9, 0], scale: [0.25, 0.4, 0.25] },
    { partName: 'left_knee', position: [-0.3, -1.3, 0], scale: [0.2, 0.2, 0.2] },
    { partName: 'right_knee', position: [0.3, -1.3, 0], scale: [0.2, 0.2, 0.2] },
    { partName: 'left_calf', position: [-0.3, -1.7, 0], scale: [0.2, 0.4, 0.2] },
    { partName: 'right_calf', position: [0.3, -1.7, 0], scale: [0.2, 0.4, 0.2] },
    { partName: 'left_ankle', position: [-0.3, -2.1, 0], scale: [0.15, 0.1, 0.15] },
    { partName: 'right_ankle', position: [0.3, -2.1, 0], scale: [0.15, 0.1, 0.15] },
    { partName: 'left_foot', position: [-0.3, -2.3, 0.1], scale: [0.2, 0.1, 0.3] },
    { partName: 'right_foot', position: [0.3, -2.3, 0.1], scale: [0.2, 0.1, 0.3] }
  ];
  
  return (
    <Group ref={groupRef}>
      {/* Lighting */}
      <AmbientLight intensity={0.5} />
      
      {/* Directional light for shadows */}
      <DirectionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Render all body parts */}
      {bodyParts.map((part) => (
        <BodyPartMesh
          key={part.partName}
          position={part.position}
          scale={part.scale}
          partName={part.partName}
          isHighlighted={hoveredPart === part.partName}
          isSelected={selectedParts.includes(part.partName)}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        />
      ))}
    </Group>
  );
};

interface HumanModelProps {
  selectedParts: BodyPart[];
  onSelectPart: (part: BodyPart) => void;
}

export default HumanModel; 
import React, { useState } from 'react';
import { Box, Image, Flex, Heading } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  withText?: boolean; // kept for backward compatibility but not used for the image
}

export const Logo: React.FC<LogoProps> = ({ size = 'md' }) => {
  const [imageError, setImageError] = useState(false);
  
  // Size mapping for different display sizes with adjusted left alignment
  const sizeMap = {
    sm: { height: '40px', width: '200px', fallbackSize: '32px', fontSize: 'sm' },
    md: { height: '50px', width: '250px', fallbackSize: '40px', fontSize: 'md' },
    lg: { height: '60px', width: '320px', fallbackSize: '48px', fontSize: 'lg' },
  };
  
  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
  };
  
  return (
    <RouterLink to="/">
      {!imageError ? (
        <Image
          src="/logo.jpg"
          alt="RecovrAI Logo"
          height={sizeMap[size].height}
          width={sizeMap[size].width}
          objectFit="contain"
          objectPosition="left"
          onError={handleImageError}
        />
      ) : (
        // Fallback if image fails to load
        <Flex align="center" gap={2}>
          <Box 
            w={sizeMap[size].fallbackSize} 
            h={sizeMap[size].fallbackSize} 
            borderRadius="full" 
            bgGradient="linear(to-r, cyan.400, blue.500)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            fontSize={sizeMap[size].fontSize}
          >
            R
          </Box>
          
          <Heading 
            size={size} 
            bgGradient="linear(to-r, cyan.400, blue.600)" 
            bgClip="text"
            fontWeight="bold"
          >
            RecovrAI
          </Heading>
        </Flex>
      )}
    </RouterLink>
  );
};

export default Logo; 
import { Box, Container, Flex, Button, HStack, useColorModeValue, Text, Spacer } from '@chakra-ui/react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import { ColorModeToggle } from './ColorModeToggle';

export const Layout = () => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box 
        as="nav" 
        bg={useColorModeValue('blue.600', 'blue.900')} 
        color="white" 
        py={3}
        boxShadow="md"
      >
        <Container 
          maxW="container.xl" 
          px={0} 
          mx="0" 
          marginInlineStart="0"
          sx={{
            pl: "0 !important",
            ml: "0 !important"
          }}
        >
          <Flex justify="space-between" align="center">
            <Box 
              display="flex" 
              alignItems="center" 
              pl={0} 
              ml={0}
              position="relative"
              left={0}
            >
              <Logo size="lg" withText={false} />
            </Box>
            <Spacer />
            
            {user ? (
              <HStack spacing={4} pr={4}>
                <RouterLink to="/dashboard">
                  <Button variant="ghost" colorScheme="whiteAlpha">
                    Dashboard
                  </Button>
                </RouterLink>
                <RouterLink to="/new-injury">
                  <Button variant="ghost" colorScheme="whiteAlpha">
                    Report Injury
                  </Button>
                </RouterLink>
                <ColorModeToggle />
                <Button 
                  variant="outline" 
                  colorScheme="whiteAlpha" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </HStack>
            ) : (
              <HStack spacing={4} pr={4}>
                <ColorModeToggle />
                <RouterLink to="/login">
                  <Button colorScheme="whiteAlpha" variant="solid">
                    Login
                  </Button>
                </RouterLink>
              </HStack>
            )}
          </Flex>
        </Container>
      </Box>
      
      <Box as="main" flex="1" py={8}>
        <Container maxW="container.xl">
          <Outlet />
        </Container>
      </Box>
      
      <Box as="footer" bg={useColorModeValue('gray.100', 'gray.900')} py={4}>
        <Container maxW="container.xl">
          <Text textAlign="center" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            © {new Date().getFullYear()} RecovrAI. All rights reserved.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}; 
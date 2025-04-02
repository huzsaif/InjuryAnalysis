import { Box, Container, Flex, Heading, IconButton, useColorMode, Button } from '@chakra-ui/react';
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Link as ChakraLink } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';

export const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Box minH="100vh" w="100%" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
      <Box as="nav" bg={colorMode === 'light' ? 'white' : 'gray.900'} py={4} shadow="sm" w="100%">
        <Container maxW="100%" px={4}>
          <Flex justify="space-between" align="center">
            <Flex gap={8} align="center">
              <RouterLink to={user ? "/dashboard" : "/"}>
                <Heading size="md" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
                  Injury Analysis
                </Heading>
              </RouterLink>
              
              {/* Only show these links if user is authenticated */}
              {user && (
                <>
                  <ChakraLink as={RouterLink} to="/dashboard">Dashboard</ChakraLink>
                  <ChakraLink as={RouterLink} to="/new-injury">Report Injury</ChakraLink>
                  <ChakraLink as={RouterLink} to="/home">Home</ChakraLink>
                </>
              )}
            </Flex>
            <Flex gap={4} align="center">
              {user ? (
                <Button 
                  onClick={handleLogout} 
                  variant="ghost"
                  size="sm"
                >
                  Logout
                </Button>
              ) : (
                <ChakraLink as={RouterLink} to="/login">Login</ChakraLink>
              )}
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
              />
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Container maxW="100%" px={4} py={8}>
        <Outlet />
      </Container>
    </Box>
  );
}; 
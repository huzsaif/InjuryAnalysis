import { Box, Container, Flex, Heading, IconButton, useColorMode } from '@chakra-ui/react';
import { Link as RouterLink, Outlet } from 'react-router-dom';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';
import { Link as ChakraLink } from '@chakra-ui/react';

export const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box minH="100vh" bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}>
      <Box as="nav" bg={colorMode === 'light' ? 'white' : 'gray.900'} py={4} shadow="sm">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Flex gap={8} align="center">
              <RouterLink to="/">
                <Heading size="md" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
                  Injury Analysis
                </Heading>
              </RouterLink>
              <ChakraLink as={RouterLink} to="/dashboard">Dashboard</ChakraLink>
              <ChakraLink as={RouterLink} to="/new-injury">Report Injury</ChakraLink>
              {/* Progress requires an injury ID, so users should go through the Dashboard */}
            </Flex>
            <Flex gap={4} align="center">
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
      <Container maxW="container.xl" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
}; 
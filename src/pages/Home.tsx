import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaClipboardCheck, FaChartLine, FaBrain } from 'react-icons/fa';

const Feature = ({ icon, title, description }: { icon: any; title: string; description: string }) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={bg}
      borderWidth={1}
      borderColor={borderColor}
      borderRadius="lg"
      textAlign="center"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" mb={4} />
      <Heading size="md" mb={2}>
        {title}
      </Heading>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
};

export const Home = () => {
  return (
    <Box py={20}>
      <Container maxW="container.xl">
        <VStack spacing={8} textAlign="center" mb={16}>
          <Heading
            as="h1"
            size="2xl"
            bgGradient="linear(to-r, blue.400, blue.600)"
            bgClip="text"
            mb={4}
          >
            Track Your Recovery Journey
          </Heading>
          <Text fontSize="xl" maxW="container.md" color="gray.600">
            Get personalized injury recovery plans powered by AI. Track your progress,
            monitor symptoms, and stay on top of your rehabilitation journey.
          </Text>
          <Button
            as={RouterLink}
            to="/new-injury"
            size="lg"
            colorScheme="blue"
            px={8}
          >
            Report an Injury
          </Button>
        </VStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          <Feature
            icon={FaBrain}
            title="AI-Powered Analysis"
            description="Get intelligent insights about your injury and personalized recovery recommendations."
          />
          <Feature
            icon={FaClipboardCheck}
            title="Daily Progress Tracking"
            description="Log your symptoms, pain levels, and mobility to monitor your recovery journey."
          />
          <Feature
            icon={FaChartLine}
            title="Visual Progress"
            description="View detailed charts and analytics to understand your recovery trajectory."
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}; 
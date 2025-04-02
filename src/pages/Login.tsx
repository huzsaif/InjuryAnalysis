import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await signUp(email, password);
        toast({
          title: 'Account created successfully',
          description: 'You have been automatically signed in',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: isLogin ? 'Login failed' : 'Sign up failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="container.sm" mx="auto" py={10}>
      <VStack spacing={8}>
        <Heading>{isLogin ? 'Sign In' : 'Create Account'}</Heading>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>
            <Button
              type="submit"
              size="lg"
              isLoading={loading}
              loadingText={isLogin ? "Signing in..." : "Creating account..."}
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </Stack>
        </form>
        <HStack>
          <Text>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </Text>
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            colorScheme="blue"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}; 
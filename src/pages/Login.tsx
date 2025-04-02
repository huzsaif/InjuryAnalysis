import { useState, useEffect } from 'react';
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
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Check for redirect path in localStorage
  useEffect(() => {
    // If already logged in, redirect
    if (user) {
      navigate('/dashboard');
      return;
    }
    
    try {
      const savedRedirect = localStorage.getItem('auth_redirect');
      if (savedRedirect) {
        setRedirectPath(savedRedirect);
        console.log('Found saved redirect path:', savedRedirect);
      }
    } catch (error) {
      console.error('Error reading redirect path:', error);
    }
  }, [user, navigate]);

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
      
      // Clear the saved redirect path
      try {
        localStorage.removeItem('auth_redirect');
      } catch (error) {
        console.error('Error clearing redirect path:', error);
      }
      
      // Navigate to the saved path or dashboard as default
      navigate(redirectPath);
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
    <Box width="100%" py={10} display="flex" justifyContent="center">
      <Box width={["90%", "80%", "60%", "500px"]}>
        <VStack spacing={8} width="100%">
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
    </Box>
  );
}; 
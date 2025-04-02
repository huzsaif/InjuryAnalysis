import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { NewInjury } from './pages/NewInjury';
import { Progress } from './pages/Progress';
import { Login } from './pages/Login';
import { ThemeProvider } from './providers/ThemeProvider';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';
import React from 'react';
import { Center, Spinner } from '@chakra-ui/react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  const { user, loading } = useAuth();
  
  // Show a loading spinner while checking authentication
  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }
  
  if (!user) {
    // Store the intended destination for redirect after login
    try {
      localStorage.setItem('auth_redirect', window.location.pathname);
    } catch (error) {
      console.error('Error saving redirect path:', error);
    }
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Redirect from home to login page or dashboard if logged in */}
                <Route index element={
                  <RouteBasedOnAuth 
                    authenticated={<Navigate to="/dashboard" replace />} 
                    unauthenticated={<Navigate to="/login" replace />} 
                  />
                } />
                <Route path="login" element={
                  <RouteBasedOnAuth 
                    authenticated={<Navigate to="/dashboard" replace />}
                    unauthenticated={<Login />}
                  />
                } />
                <Route path="home" element={<Home />} />
                
                {/* Protected routes */}
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="new-injury" element={
                  <ProtectedRoute>
                    <NewInjury />
                  </ProtectedRoute>
                } />
                <Route path="progress" element={<Navigate to="/dashboard" replace />} />
                <Route path="progress/:injuryId" element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Helper component to decide what to render based on auth state
const RouteBasedOnAuth = ({ 
  authenticated, 
  unauthenticated 
}: { 
  authenticated: React.ReactElement; 
  unauthenticated: React.ReactElement;
}) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }
  
  return user ? authenticated : unauthenticated;
};

export default App;

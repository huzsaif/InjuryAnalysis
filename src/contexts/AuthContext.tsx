import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  // This effect sets up a listener for authentication state changes
  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Check for stored user in localStorage first for immediate UI response
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        // This doesn't actually authenticate, just provides UI continuity
        // until the real auth state is checked
        console.log('Found stored user data, providing temporary state');
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    
    // Listen for auth state changes from Firebase
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser ? 'User authenticated' : 'No user');
      
      if (currentUser) {
        setUser(currentUser);
        // Store a simplified version of the user object in localStorage
        try {
          const userData = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
          };
          localStorage.setItem('authUser', JSON.stringify(userData));
        } catch (error) {
          console.error('Error storing user data:', error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('authUser');
      }
      
      setLoading(false);
      setInitializing(false);
    }, (error) => {
      console.error('Auth state observer error:', error);
      setLoading(false);
      setInitializing(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      return userCredential;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      localStorage.removeItem('authUser');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    logOut,
  };

  // Only render children once the initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {!initializing ? children : null}
    </AuthContext.Provider>
  );
}; 
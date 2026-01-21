import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { User, AuthState } from '@/types/user';
import axios from 'axios';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (name: string) => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/_api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await fetchUserProfile(firebaseUser);
        if (userProfile) {
          setState({
            user: userProfile,
            loading: false,
            error: null,
          });
        } else {
          setState({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || undefined,
              tier: 'free',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            loading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await fetchUserProfile(userCredential.user);
      if (userProfile) {
        setState({
          user: userProfile,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to login',
      }));
      throw error;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }

     await userCredential.user.getIdToken();
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to sign up',
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to logout',
      }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to send reset email',
      }));
      throw error;
    }
  };

  const updateUserProfile = async (name: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No authenticated user');

      await updateProfile(currentUser, { displayName: name });

      const token = await currentUser.getIdToken();
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/_api/users/profile`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setState((prev) => ({
        ...prev,
        user: response.data,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || 'Failed to update profile',
      }));
      throw error;
    }
  };

  const getIdToken = async (): Promise<string | null> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return currentUser.getIdToken();
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile,
    getIdToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
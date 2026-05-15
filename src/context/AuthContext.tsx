import React, { createContext, useContext, useState, useEffect } from 'react';
import { validateSession, getUser, logoutUser } from '../utils/auth';

interface User {
  email: string;
  role: 'institution' | 'graduate' | 'verifier';
  name: string;
  walletAddress?: string;
  studentId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, rememberMe: boolean) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const { isValid, user: sessionUser } = validateSession();
      if (isValid && sessionUser) {
        setUser(sessionUser);
      } else {
        logoutUser();
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData: User, rememberMe: boolean) => {
    setUser(userData);
    // Session persistence is handled in the login page calling saveUser
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout,
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

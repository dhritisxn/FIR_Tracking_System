import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, LoginCredentials, SignupData } from '../types/auth';

const API_URL = 'http://localhost:5000/api';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string; field?: string }>;
  logout: () => void;
  adminLogin: (credentials: LoginCredentials) => Promise<boolean>;
  officerLogin: (credentials: LoginCredentials) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser(token);
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('Fetched user data:', userData);
        
        setAuthState({
          user: userData,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        console.error('Failed to fetch user:', await response.text());
        localStorage.removeItem('token');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const performLogin = async (credentials: LoginCredentials, endpoint: string) => {
    try {
      console.log(`Attempting ${credentials.role || 'user'} login:`, credentials.email);
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        })
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (!response.ok) {
        console.error('Login failed:', data);
        return false;
      }

      // Store token
      localStorage.setItem('token', data.token);

      // Update auth state
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    return performLogin({ ...credentials, role: 'citizen' }, 'login');
  };

  const adminLogin = async (credentials: LoginCredentials) => {
    return performLogin({ ...credentials, role: 'admin' }, 'admin/login');
  };

  const officerLogin = async (credentials: LoginCredentials) => {
    return performLogin({ ...credentials, role: 'officer' }, 'officer/login');
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          role: 'citizen'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error,
          field: result.field
        };
      }

      // Store token
      localStorage.setItem('token', result.token);

      // Update auth state
      setAuthState({
        user: result.user,
        isAuthenticated: true,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Failed to create account. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      signup,
      logout,
      adminLogin,
      officerLogin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
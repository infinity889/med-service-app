import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '@/api/axios';

type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city?: string;
  role?: 'admin' | 'user';
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, city?: string) => Promise<void>;
  logout: () => void;
};

interface AuthResponse {
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
      
      if (isMock) {
        await new Promise(resolve => setTimeout(resolve, 600));
        const savedUser = localStorage.getItem('medprice_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } else {
        const token = localStorage.getItem('medprice_token');
        if (token) {
          try {
            const { data } = await apiClient.get<User>('/auth/me');
            setUser(data);
            localStorage.setItem('medprice_user', JSON.stringify(data));
          } catch (error) {
            console.error('Failed to check auth status:', error);
            setUser(null);
            localStorage.removeItem('medprice_user');
            localStorage.removeItem('medprice_token');
          }
        } else {
          setUser(null);
          localStorage.removeItem('medprice_user');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
    
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const isAdmin = email.toLowerCase() === 'admin@medprice.kz';
      const mockUser: User = {
        id: '1',
        name: isAdmin ? 'Администратор' : 'Test User',
        email: email,
        avatar: isAdmin ? 'A' : 'T',
        city: 'Астана',
        role: isAdmin ? 'admin' : 'user'
      };
      setUser(mockUser);
      localStorage.setItem('medprice_user', JSON.stringify(mockUser));
      localStorage.setItem('medprice_token', 'mock_jwt_token_value');
    } else {
      const { data } = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      setUser(data.user);
      localStorage.setItem('medprice_user', JSON.stringify(data.user));
      localStorage.setItem('medprice_token', data.token);
    }
  };

  const register = async (name: string, email: string, password: string, city?: string) => {
    const isMock = import.meta.env.VITE_USE_MOCK !== 'false';
    
    if (isMock) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser: User = {
        id: '1',
        name: name,
        email: email,
        avatar: name.charAt(0).toUpperCase(),
        city: city || 'Астана',
        role: 'user'
      };
      setUser(mockUser);
      localStorage.setItem('medprice_user', JSON.stringify(mockUser));
      localStorage.setItem('medprice_token', 'mock_jwt_token_value');
    } else {
      const { data } = await apiClient.post<AuthResponse>('/auth/register', { 
        name, 
        email, 
        password, 
        city 
      });
      setUser(data.user);
      localStorage.setItem('medprice_user', JSON.stringify(data.user));
      localStorage.setItem('medprice_token', data.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medprice_user');
    localStorage.removeItem('medprice_token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


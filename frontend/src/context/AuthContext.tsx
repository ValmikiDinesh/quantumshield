import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { UserDTO, OrganizationDTO } from '../types';

interface AuthContextType {
  user: UserDTO | null;
  organization: OrganizationDTO | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, organizationName?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [organization, setOrganization] = useState<OrganizationDTO | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('qs_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
      setOrganization(data.organization);
      localStorage.setItem('qs_user', JSON.stringify(data.user));
    } catch {
      // If profile fetch fails, user token is invalid
      setUser(null);
      setOrganization(null);
      setToken(null);
      localStorage.removeItem('qs_token');
      localStorage.removeItem('qs_user');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('qs_token');
      if (savedToken) {
        setToken(savedToken);
        await refreshProfile();
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('qs_token', res.token);
    localStorage.setItem('qs_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setOrganization(res.organization);
  };

  const register = async (name: string, email: string, password: string, organizationName?: string) => {
    const res = await api.register({ name, email, password, organizationName });
    localStorage.setItem('qs_token', res.token);
    localStorage.setItem('qs_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    setOrganization(res.organization);
  };

  const logout = () => {
    api.logout().catch(() => {});
    localStorage.removeItem('qs_token');
    localStorage.removeItem('qs_user');
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  mode: 'autopilot' | 'copilot';
  setMode: (mode: 'autopilot' | 'copilot') => void;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<'autopilot' | 'copilot'>('autopilot');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedMode = localStorage.getItem('user_mode') as 'autopilot' | 'copilot';
    
    if (savedMode) {
      setMode(savedMode);
    }
    
    if (token) {
      setUser({
        id: '1',
        email: 'demo@smartsight.com',
        full_name: 'Demo User',
        is_active: true,
      });
    }
  }, []);

  const handleSetMode = (newMode: 'autopilot' | 'copilot') => {
    setMode(newMode);
    localStorage.setItem('user_mode', newMode);
  };

  const value = {
    user,
    mode,
    setMode: handleSetMode,
    setUser,
    isAuthenticated: !!user,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

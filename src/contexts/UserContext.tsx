import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  solvedChallenges: string[];
  totalScore: number;
  rank: string;
}

interface UserContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProgress: (challengeId: string, score: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Mock user for demo purposes
    return {
      id: '1',
      username: 'shellmaster',
      email: 'user@example.com',
      solvedChallenges: ['basic-ls', 'file-permissions'],
      totalScore: 150,
      rank: 'Intermediate'
    };
  });

  const login = async (username: string, password: string) => {
    // Mock login - in real app, this would call an API
    setUser({
      id: '1',
      username,
      email: 'user@example.com',
      solvedChallenges: ['basic-ls', 'file-permissions'],
      totalScore: 150,
      rank: 'Intermediate'
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updateProgress = (challengeId: string, score: number) => {
    if (!user) return;
    
    setUser(prev => prev ? {
      ...prev,
      solvedChallenges: prev.solvedChallenges.includes(challengeId) 
        ? prev.solvedChallenges 
        : [...prev.solvedChallenges, challengeId],
      totalScore: prev.totalScore + score
    } : null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateProgress }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
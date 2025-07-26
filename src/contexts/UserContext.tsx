import React, { createContext, useContext, useState } from "react";

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
    // Mock user for demo purposes - ONLY in development
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Using MOCK user data. This should not appear in production.",
      );
      return {
        id: "1",
        username: "shellmaster",
        email: "user@example.com",
        solvedChallenges: ["basic-ls", "file-permissions"],
        totalScore: 150,
        rank: "Intermediate",
      };
    }
    // In production or if not development, start with no user
    return null;
  });

  const login = async (username: string, password: string) => {
    // Mock login - ONLY in development
    if (process.env.NODE_ENV === "development") {
      console.warn("Using MOCK login. This should not appear in production.");
      // Mock login - in real app, this would likely be handled by Clerk
      setUser({
        id: "1",
        username, // Use the provided username for mock
        email: "user@example.com",
        solvedChallenges: ["basic-ls", "file-permissions"],
        totalScore: 150,
        rank: "Intermediate",
      });
      return; // Exit the function after mock login
    }
    // In production, Clerk handles login, so this function should ideally not be called
    // or be integrated with Clerk's signIn method.
    // For now, we just ensure the mock doesn't run.
    console.warn(
      "Login function called in non-development environment. Ensure Clerk handles this.",
    );
    // Potentially throw an error or do nothing in production
    // throw new Error("Mock login should not be used in production.");
  };

  const logout = () => {
    setUser(null);
    // Clerk's logout should also be called here in a real implementation
    // signOut(); // Assuming Clerk's signOut function is available
  };

  const updateProgress = (challengeId: string, score: number) => {
    if (!user) return;

    setUser((prev) =>
      prev
        ? {
            ...prev,
            solvedChallenges: prev.solvedChallenges.includes(challengeId)
              ? prev.solvedChallenges
              : [...prev.solvedChallenges, challengeId],
            totalScore: prev.totalScore + score,
          }
        : null,
    );
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
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}


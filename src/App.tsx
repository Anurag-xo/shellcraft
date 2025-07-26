import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import AuthWrapper from './components/AuthWrapper';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChallengesPage from './pages/ChallengesPage';
import ChallengePage from './pages/ChallengePage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  console.warn("Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <AuthWrapper>
              <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/challenges" element={<ChallengesPage />} />
                    <Route path="/challenge/:id" element={<ChallengePage />} />
                    <Route path="/leaderboard" element={<LeaderboardPage />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute adminOnly>
                          <AdminPage />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </AuthWrapper>
          </Router>
        </UserProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
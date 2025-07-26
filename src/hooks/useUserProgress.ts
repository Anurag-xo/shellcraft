import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { progressApi, UserProgress } from '../services/api';

export function useUserProgress() {
  const { user } = useUser();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadProgress();
    }
  }, [user?.id]);

  const loadProgress = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await progressApi.getUserProgress(user.id);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load progress');
      console.error('Error loading progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (challengeId: string, solution: string, completed: boolean, score: number) => {
    if (!user?.id) return;

    try {
      const progressData = {
        user_id: user.id,
        challenge_id: challengeId,
        completed,
        score,
        solution,
        completed_at: completed ? new Date().toISOString() : ''
      };

      const updatedProgress = await progressApi.updateProgress(progressData);
      
      setProgress(prev => {
        const existing = prev.find(p => p.challenge_id === challengeId);
        if (existing) {
          return prev.map(p => p.challenge_id === challengeId ? updatedProgress : p);
        } else {
          return [...prev, updatedProgress];
        }
      });

      return updatedProgress;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      throw err;
    }
  };

  const getChallengeProgress = (challengeId: string) => {
    return progress.find(p => p.challenge_id === challengeId);
  };

  const getCompletedChallenges = () => {
    return progress.filter(p => p.completed);
  };

  const getTotalScore = () => {
    return progress.reduce((total, p) => total + (p.completed ? p.score : 0), 0);
  };

  return {
    progress,
    loading,
    error,
    loadProgress,
    updateProgress,
    getChallengeProgress,
    getCompletedChallenges,
    getTotalScore
  };
}
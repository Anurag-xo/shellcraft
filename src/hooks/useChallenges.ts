import { useState, useEffect } from 'react';
import { challengeApi, Challenge } from '../services/api';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeApi.getAll();
      setChallenges(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
      console.error('Error loading challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const createChallenge = async (challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newChallenge = await challengeApi.create(challenge);
      setChallenges(prev => [newChallenge, ...prev]);
      return newChallenge;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create challenge');
      throw err;
    }
  };

  const updateChallenge = async (id: string, updates: Partial<Challenge>) => {
    try {
      const updatedChallenge = await challengeApi.update(id, updates);
      setChallenges(prev => prev.map(c => c.id === id ? updatedChallenge : c));
      return updatedChallenge;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update challenge');
      throw err;
    }
  };

  const deleteChallenge = async (id: string) => {
    try {
      await challengeApi.delete(id);
      setChallenges(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete challenge');
      throw err;
    }
  };

  return {
    challenges,
    loading,
    error,
    loadChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge
  };
}

export function useChallenge(id: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadChallenge(id);
    }
  }, [id]);

  const loadChallenge = async (challengeId: string) => {
    try {
      setLoading(true);
      const data = await challengeApi.getById(challengeId);
      setChallenge(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenge');
      console.error('Error loading challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    challenge,
    loading,
    error,
    loadChallenge
  };
}
// src/hooks/useChallenges.ts
import { useState, useEffect } from "react";
import { challengeApi, Challenge } from "../services/api";

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
      setError(
        err instanceof Error ? err.message : "Failed to load challenges",
      );
      console.error("Error loading challenges:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshChallenges = () => {
    loadChallenges();
  };

  return {
    challenges,
    loading,
    error,
    refreshChallenges,
  };
}

export function useChallenge(id: string) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadChallenge(id);
    } else {
      // If no ID is provided, set loading to false and clear data
      setLoading(false);
      setChallenge(null);
    }
  }, [id]);

  const loadChallenge = async (challengeId: string) => {
    try {
      setLoading(true);
      const data = await challengeApi.getById(challengeId);
      setChallenge(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load challenge");
      console.error("Error loading challenge:", err);
      setChallenge(null); // Ensure challenge is null on error
    } finally {
      setLoading(false);
    }
  };

  return {
    challenge,
    loading,
    error,
    loadChallenge,
  };
}

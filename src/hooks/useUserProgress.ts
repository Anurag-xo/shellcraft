// src/hooks/useUserProgress.ts
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { progressApi, UserProgress } from "../services/api";

export function useUserProgress() {
  const { user } = useUser();
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadProgress();
    } else if (user !== undefined) {
      setProgress([]);
      setLoading(false);
    }
    // If user is undefined, Clerk is still loading.
  }, [user?.id]);

  const loadProgress = async () => {
    // Guard clause if somehow called without user ID
    if (!user?.id) {
      console.warn("loadProgress called without a valid user ID.");
      setProgress([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await progressApi.getUserProgress(user.id);
      // Sanitize data to ensure it's an array
      const safeData = Array.isArray(data) ? data : [];
      setProgress(safeData);
    } catch (err) {
      console.error("Error loading user progress for user ID:", user.id, err);
      setError(err instanceof Error ? err.message : "Failed to load progress");
      setProgress([]); // Ensure state consistency
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (
    challengeId: string,
    solution: string,
    completed: boolean,
    score: number,
  ) => {
    if (!user?.id) {
      console.warn("updateProgress called without a valid user ID.");
      return;
    }

    try {
      const progressData = {
        user_id: user.id,
        challenge_id: challengeId,
        completed,
        score,
        solution,
        completed_at: completed ? new Date().toISOString() : "",
      };

      const updatedProgress = await progressApi.updateProgress(progressData);

      setProgress((prev) => {
        const existingIndex = prev.findIndex(
          (p) => p.challenge_id === challengeId,
        );
        if (existingIndex !== -1) {
          const updatedProgressArray = [...prev];
          updatedProgressArray[existingIndex] = updatedProgress;
          return updatedProgressArray;
        } else {
          return [...prev, updatedProgress];
        }
      });
    } catch (err) {
      console.error("Error updating progress for challenge:", challengeId, err);
    }
  };

  const getChallengeProgress = (challengeId: string) => {
    // Protect against progress not being an array
    if (!Array.isArray(progress)) {
      console.warn(
        "getChallengeProgress called, but progress is not an array:",
        progress,
      );
      return undefined;
    }
    return progress.find((p) => p.challenge_id === challengeId);
  };

  const getCompletedChallenges = () => {
    if (!Array.isArray(progress)) {
      console.warn(
        "getCompletedChallenges called, but progress is not an array:",
        progress,
      );
      return [];
    }
    return progress.filter((p) => p.completed);
  };

  const getTotalScore = () => {
    if (!Array.isArray(progress)) {
      console.warn(
        "getTotalScore called, but progress is not an array:",
        progress,
      );
      return 0;
    }
    return progress.reduce(
      (total, p) => total + (p.completed ? p.score : 0),
      0,
    );
  };

  return {
    progress,
    loading,
    error,
    loadProgress,
    updateProgress,
    getChallengeProgress,
    getCompletedChallenges,
    getTotalScore,
  };
}

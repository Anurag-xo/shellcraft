import { supabase } from "../lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  points: number;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  test_cases: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  challenge_id: string;
  completed: boolean;
  score: number;
  solution: string;
  completed_at: string; // Consider Date | string or string based on Supabase timestamptz handling
  created_at: string; // Consider Date | string or string
}

export interface ExecutionResult {
  output: string;
  error?: string;
  success: boolean;
  execution_time: number;
  execution_id?: string; // Added based on backend response
  test_results?: Array<{
    test_case: string;
    passed: boolean;
    expected?: string;
    actual?: string;
  }>;
}

// Challenge API
export const challengeApi = {
  async getAll(): Promise<Challenge[]> {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all challenges:", error);
      throw error;
    }
    return data || [];
  },

  async getById(id: string): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("id", id)
      .single(); // This can cause PGRST116

    if (error) {
      // Check if it's the "no rows found" error from PostgREST
      if (error.code === "PGRST116") {
        return null; // Expected: no challenge found
      }
      // Re-throw other unexpected errors
      console.error("Error fetching challenge by ID:", id, error);
      throw error;
    }

    return data;
  },

  async create(
    challenge: Omit<Challenge, "id" | "created_at" | "updated_at">,
  ): Promise<Challenge> {
    const { data, error } = await supabase
      .from("challenges")
      .insert([challenge])
      .select()
      .single();

    if (error) {
      console.error("Error creating challenge:", error);
      throw error;
    }
    return data;
  },

  async update(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const { data, error } = await supabase
      .from("challenges")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating challenge:", id, error);
      throw error;
    }
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("challenges").delete().eq("id", id);

    if (error) {
      console.error("Error deleting challenge:", id, error);
      throw error;
    }
  },
};

// User Progress API
export const progressApi = {
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    // Check if userId is valid
    if (!userId) {
      console.warn("getUserProgress called without a userId");
      return []; // Return empty array if no user ID
    }

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user progress for user:", userId, error);
      throw error;
    }
    return data || [];
  },

  async getChallengeProgress(
    userId: string,
    challengeId: string,
  ): Promise<UserProgress | null> {
    // Check if required IDs are valid
    if (!userId || !challengeId) {
      console.warn("getChallengeProgress called without required IDs:", {
        userId,
        challengeId,
      });
      return null;
    }

    const { data, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("challenge_id", challengeId)
      .single(); // This can cause PGRST116

    if (error) {
      // Check if it's the "no rows found" error from PostgREST
      if (error.code === "PGRST116") {
        return null; // Expected: no progress found for this user/challenge
      }
      // Re-throw other unexpected errors
      console.error(
        "Error fetching user progress for challenge:",
        userId,
        challengeId,
        error,
      );
      throw error;
    }

    return data;
  },

  async updateProgress(
    progress: Omit<UserProgress, "id" | "created_at">,
  ): Promise<UserProgress> {
    // Ensure user_id and challenge_id are present
    if (!progress.user_id || !progress.challenge_id) {
      const error = new Error(
        "user_id and challenge_id are required to update progress",
      );
      console.error("Invalid progress data for updateProgress:", progress);
      throw error;
    }

    const { data, error } = await supabase
      .from("user_progress")
      .upsert([progress], {
        onConflict: "user_id,challenge_id",
        ignoreDuplicates: false,
      })
      .select()
      .single(); // This can cause PGRST116 if upsert somehow results in no return?

    if (error) {
      // It's less common for upsert/select/single to return PGRST116, but check anyway
      if (error.code === "PGRST116") {
        console.warn(
          "Unexpected PGRST116 in updateProgress - no data returned after upsert:",
          error,
        );
        // Decide how to handle - maybe throw a specific app error?
        throw new Error("Failed to retrieve updated progress after upsert.");
      }
      console.error("Error updating progress:", progress, error);
      throw error;
    }
    return data;
  },
};

// Shell Execution API
export const executionApi = {
  async executeScript(
    script: string,
    challengeId?: string,
  ): Promise<ExecutionResult> {
    // Remove or make conditional any direct mock fallback at the beginning if it existed previously

    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          script,
          challengeId,
          timeout: 10000, // 10 seconds timeout
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const result: ExecutionResult = await response.json();
      return result;
    } catch (error) {
      // --- CONDITIONAL FALLBACK for development ONLY ---
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Backend API failed, falling back to mock execution in development:",
          error,
        );
        // You might want to refine mockExecuteScript to accept challengeId if needed
        // For now, keeping the original mock structure but ensuring it returns ExecutionResult
        return {
          output: `$ ${script}\n${mockExecuteScript(script)}`,
          success: true,
          execution_time: Math.floor(Math.random() * 500) + 200, // More realistic mock time
          execution_id: "mock-" + Date.now().toString(), // Add mock execution ID
          // test_results not included in mock for simplicity, but could be added
        };
      }
      // --- In PRODUCTION, re-throw the error ---
      console.error("Backend API request failed in production:", error);
      // Ensure the error is thrown so the calling component can handle it appropriately
      throw error; // Let the calling component handle the actual backend error
    }
  },
};

// Mock execution for development
function mockExecuteScript(script: string): string {
  const command = script.trim().toLowerCase();

  if (command.startsWith("ls")) {
    if (command.includes("-la") || command.includes("-al")) {
      return `total 24
drwxr-xr-x 3 user user 4096 Jan 15 10:30 .
drwxr-xr-x 5 root root 4096 Jan 14 09:15 ..
-rw-r--r-- 1 user user  220 Jan 14 09:15 .bashrc
-rw-r--r-- 1 user user 1024 Jan 15 10:25 backup.sh
drwxr-xr-x 2 user user 4096 Jan 15 10:30 scripts`;
    } else if (command.includes("-l")) {
      return `-rw-r--r-- 1 user user 1024 Jan 15 10:25 backup.sh
drwxr-xr-x 2 user user 4096 Jan 15 10:30 scripts`;
    } else {
      return `backup.sh  scripts`;
    }
  }

  if (command.startsWith("pwd")) {
    return "/home/user";
  }

  if (command.startsWith("whoami")) {
    return "user";
  }

  if (command.startsWith("echo")) {
    // Simple extraction, might need more robust parsing
    const match = script.match(/echo\s+(.+)/i);
    return match ? match[1] : "";
  }

  if (command.startsWith("cat")) {
    return "File contents would appear here...";
  }

  // Default mock response
  return `Mock executed: ${script}\n(Simulated because backend is unreachable in dev)`;
}

// Leaderboard API
export const leaderboardApi = {
  async getTopUsers(limit: number = 10) {
    // Ensure limit is a reasonable number
    const safeLimit = Math.max(1, Math.min(limit, 100));

    const { data, error } = await supabase
      .from("user_profiles")
      .select("username, total_score, rank")
      .order("total_score", { ascending: false })
      .limit(safeLimit);

    if (error) {
      console.error("Error fetching leaderboard:", error);
      throw error;
    }
    return data || [];
  },
};


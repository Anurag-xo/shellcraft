import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  instructions: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
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
  completed_at: string;
  created_at: string;
}

export interface ExecutionResult {
  output: string;
  error?: string;
  success: boolean;
  execution_time: number;
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
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<Challenge | null> {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(challenge: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>): Promise<Challenge> {
    const { data, error } = await supabase
      .from('challenges')
      .insert([challenge])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Challenge>): Promise<Challenge> {
    const { data, error } = await supabase
      .from('challenges')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// User Progress API
export const progressApi = {
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getChallengeProgress(userId: string, challengeId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProgress(progress: Omit<UserProgress, 'id' | 'created_at'>): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert([progress], { 
        onConflict: 'user_id,challenge_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Shell Execution API
export const executionApi = {
  async executeScript(script: string, challengeId?: string): Promise<ExecutionResult> {
    try {
      const response = await fetch(`${API_URL}/api/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script,
          challengeId,
          timeout: 10000 // 10 seconds timeout
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      // Fallback for development/demo
      console.warn('Backend not available, using mock execution');
      return {
        output: `$ ${script}\n${mockExecuteScript(script)}`,
        success: true,
        execution_time: Math.random() * 1000 + 500
      };
    }
  }
};

// Mock execution for development
function mockExecuteScript(script: string): string {
  const command = script.trim().toLowerCase();
  
  if (command.startsWith('ls')) {
    if (command.includes('-la') || command.includes('-al')) {
      return `total 24
drwxr-xr-x 3 user user 4096 Jan 15 10:30 .
drwxr-xr-x 5 root root 4096 Jan 14 09:15 ..
-rw-r--r-- 1 user user  220 Jan 14 09:15 .bashrc
-rw-r--r-- 1 user user 1024 Jan 15 10:25 backup.sh
drwxr-xr-x 2 user user 4096 Jan 15 10:30 scripts`;
    } else if (command.includes('-l')) {
      return `-rw-r--r-- 1 user user 1024 Jan 15 10:25 backup.sh
drwxr-xr-x 2 user user 4096 Jan 15 10:30 scripts`;
    } else {
      return `backup.sh  scripts`;
    }
  }
  
  if (command.startsWith('pwd')) {
    return '/home/user';
  }
  
  if (command.startsWith('whoami')) {
    return 'user';
  }
  
  if (command.startsWith('echo')) {
    return command.substring(5);
  }
  
  if (command.startsWith('cat')) {
    return 'File contents would appear here...';
  }
  
  return `Command executed: ${script}`;
}

// Leaderboard API
export const leaderboardApi = {
  async getTopUsers(limit: number = 10) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('username, total_score, rank')
      .order('total_score', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }
};
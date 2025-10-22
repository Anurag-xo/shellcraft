import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}


interface Example {
  input: string;
  output: string;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          instructions: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          category: string;
          points: number;
          examples: Example[];
          test_cases: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          instructions: string;
          difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
          category: string;
          points: number;
          examples?: Example[];
          test_cases?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          instructions?: string;
          difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
          category?: string;
          points?: number;
          examples?: Example[];
          test_cases?: string[];
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          challenge_id: string;
          completed: boolean;
          score: number;
          solution: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          challenge_id: string;
          completed?: boolean;
          score?: number;
          solution?: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          challenge_id?: string;
          completed?: boolean;
          score?: number;
          solution?: string;
          completed_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          total_score: number;
          rank: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          total_score?: number;
          rank?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          username?: string;
          email?: string;
          avatar_url?: string | null;
          total_score?: number;
          rank?: string;
          updated_at?: string;
        };
      };
    };
  };
};
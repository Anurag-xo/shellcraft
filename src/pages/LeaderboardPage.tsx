import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react';
import { leaderboardApi } from '../services/api';

interface LeaderboardEntry {
  username: string;
  total_score: number;
  rank: string;
  position?: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await leaderboardApi.getTopUsers(50);
      const leaderboardWithPositions = data.map((entry, index) => ({
        ...entry,
        position: index + 1
      }));
      setLeaderboard(leaderboardWithPositions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      console.error('Error loading leaderboard:', err);
      
      // Mock data for development
      const mockData: LeaderboardEntry[] = [
        { username: 'shellmaster', total_score: 2450, rank: 'Expert', position: 1 },
        { username: 'bashpro', total_score: 2100, rank: 'Advanced', position: 2 },
        { username: 'linuxguru', total_score: 1890, rank: 'Advanced', position: 3 },
        { username: 'scriptking', total_score: 1650, rank: 'Advanced', position: 4 },
        { username: 'terminalace', total_score: 1420, rank: 'Intermediate', position: 5 },
        { username: 'cmdliner', total_score: 1280, rank: 'Intermediate', position: 6 },
        { username: 'shellninja', total_score: 1150, rank: 'Intermediate', position: 7 },
        { username: 'bashbeast', total_score: 980, rank: 'Intermediate', position: 8 },
        { username: 'unixwarrior', total_score: 850, rank: 'Beginner', position: 9 },
        { username: 'codeshell', total_score: 720, rank: 'Beginner', position: 10 },
      ];
      setLeaderboard(mockData);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-500 dark:text-gray-400">#{position}</span>;
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Expert':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Leaderboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Top shell scripting masters on ShellCraft
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{leaderboard.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {leaderboard[0]?.total_score || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Highest Score</div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {Math.round(leaderboard.reduce((sum, user) => sum + user.total_score, 0) / leaderboard.length) || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Average Score</div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Top Performers</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboard.map((user) => (
              <div key={user.username} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 flex items-center justify-center">
                      {getRankIcon(user.position!)}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-lg font-medium text-gray-900 dark:text-white">
                          {user.username}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRankColor(user.rank)}`}>
                            {user.rank}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.total_score.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">points</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Note
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Showing demo data. Connect to database to see real leaderboard.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
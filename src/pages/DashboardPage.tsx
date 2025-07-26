import React from 'react';
import { Trophy, Target, Clock, TrendingUp, Star, Calendar, CheckCircle, Award } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Please Sign In</h2>
          <p className="text-gray-600 dark:text-gray-400">You need to be logged in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  const recentActivity = [
    { id: 1, type: 'completed', challenge: 'File Listing Basics', points: 25, date: '2025-01-15' },
    { id: 2, type: 'completed', challenge: 'File Permissions', points: 50, date: '2025-01-14' },
    { id: 3, type: 'attempted', challenge: 'Process Management', points: 0, date: '2025-01-13' },
  ];

  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first challenge', icon: Star, earned: true },
    { id: 2, title: 'File Master', description: 'Complete 5 file operation challenges', icon: Trophy, earned: true },
    { id: 3, title: 'Security Expert', description: 'Master all security challenges', icon: Award, earned: false },
    { id: 4, title: 'Consistent Learner', description: 'Practice for 7 days straight', icon: Calendar, earned: false },
  ];

  const recommendedChallenges = [
    { id: 'text-processing', title: 'Text Processing with Grep', difficulty: 'Intermediate', points: 40 },
    { id: 'shell-variables', title: 'Shell Variables and Environment', difficulty: 'Beginner', points: 30 },
    { id: 'loops-conditionals', title: 'Loops and Conditionals', difficulty: 'Intermediate', points: 60 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {user.username}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Track your progress and continue your shell scripting journey.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{user.totalScore}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Challenges Solved</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{user.solvedChallenges.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Rank</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{user.rank}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Practice Streak</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">3 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Progress Chart */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Progress Overview</h2>
              
              {/* Progress by Category */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">File Operations</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2/3 completed</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">1/2 completed</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Admin</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">0/4 completed</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Text Processing</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">0/3 completed</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'completed' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                    }`}>
                      {activity.type === 'completed' ? (
                        <CheckCircle className={`h-5 w-5 ${
                          activity.type === 'completed' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
                        }`} />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.type === 'completed' ? 'Completed' : 'Attempted'} "{activity.challenge}"
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activity.points > 0 ? `+${activity.points} points` : 'No points earned'} • {activity.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Achievements */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Achievements</h2>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className={`flex items-center space-x-3 p-3 rounded-lg ${
                    achievement.earned ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-700'
                  }`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      achievement.earned ? 'bg-yellow-100 dark:bg-yellow-900/40' : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      <achievement.icon className={`h-4 w-4 ${
                        achievement.earned ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        achievement.earned ? 'text-yellow-900 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {achievement.title}
                      </p>
                      <p className={`text-xs ${
                        achievement.earned ? 'text-yellow-700 dark:text-yellow-300' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Challenges */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recommended for You</h2>
              <div className="space-y-4">
                {recommendedChallenges.map((challenge) => (
                  <Link
                    key={challenge.id}
                    to={`/challenge/${challenge.id}`}
                    className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{challenge.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        challenge.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{challenge.points} points</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Trophy, CheckCircle, Clock, ArrowRight } from 'lucide-react';

export default function ChallengesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const challenges = [
    {
      id: 'basic-ls',
      title: 'File Listing Basics',
      description: 'Learn to use ls command with various options to list and examine files in different formats.',
      difficulty: 'Beginner',
      points: 25,
      solved: 1234,
      category: 'File Operations',
      estimatedTime: '15 min',
      completed: true
    },
    {
      id: 'file-permissions',
      title: 'File Permissions Management',
      description: 'Master chmod, chown, and understanding Unix file permissions system.',
      difficulty: 'Intermediate',
      points: 50,
      solved: 892,
      category: 'Security',
      estimatedTime: '30 min',
      completed: true
    },
    {
      id: 'process-management',
      title: 'Process Management',
      description: 'Handle processes using ps, kill, jobs, and background operations effectively.',
      difficulty: 'Advanced',
      points: 75,
      solved: 456,
      category: 'System Admin',
      estimatedTime: '45 min',
      completed: false
    },
    {
      id: 'text-processing',
      title: 'Text Processing with Grep',
      description: 'Use grep, sed, and awk to process and manipulate text files efficiently.',
      difficulty: 'Intermediate',
      points: 40,
      solved: 678,
      category: 'Text Processing',
      estimatedTime: '25 min',
      completed: false
    },
    {
      id: 'shell-variables',
      title: 'Shell Variables and Environment',
      description: 'Understand environment variables, shell variables, and parameter expansion.',
      difficulty: 'Beginner',
      points: 30,
      solved: 943,
      category: 'Basics',
      estimatedTime: '20 min',
      completed: false
    },
    {
      id: 'loops-conditionals',
      title: 'Loops and Conditionals',
      description: 'Master for loops, while loops, if statements, and conditional logic in shell scripts.',
      difficulty: 'Intermediate',
      points: 60,
      solved: 534,
      category: 'Control Flow',
      estimatedTime: '40 min',
      completed: false
    }
  ];

  const categories = ['All', 'File Operations', 'Security', 'System Admin', 'Text Processing', 'Basics', 'Control Flow'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = !selectedDifficulty || selectedDifficulty === 'All' || challenge.difficulty === selectedDifficulty;
    const matchesCategory = !selectedCategory || selectedCategory === 'All' || challenge.category === selectedCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Shell Scripting Challenges
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Master shell scripting through hands-on practice. Choose from {challenges.length} carefully crafted challenges.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty} Level</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredChallenges.length} of {challenges.length} challenges
          </p>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Filter className="h-4 w-4" />
            <span>Sort by difficulty</span>
          </div>
        </div>

        {/* Challenge Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredChallenges.map((challenge) => (
            <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {challenge.completed ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : (
                      <div className="h-6 w-6 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{challenge.category}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    challenge.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    challenge.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                    'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {challenge.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {challenge.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>{challenge.points} pts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{challenge.estimatedTime}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span>{challenge.solved.toLocaleString()} solved</span>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/challenge/${challenge.id}`}
                  className={`w-full inline-flex items-center justify-center px-4 py-2 font-medium rounded-lg transition-colors duration-200 ${
                    challenge.completed
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {challenge.completed ? 'Review Solution' : 'Start Challenge'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredChallenges.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No challenges found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search terms or filters to find more challenges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
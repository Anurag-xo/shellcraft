import React from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Code, Trophy, Users, ArrowRight, Play, CheckCircle } from 'lucide-react';

export default function HomePage() {
  const featuredChallenges = [
    {
      id: 'basic-ls',
      title: 'File Listing Basics',
      description: 'Learn to use ls command with various options to list and examine files.',
      difficulty: 'Beginner',
      points: 25,
      solved: 1234,
      category: 'File Operations'
    },
    {
      id: 'file-permissions',
      title: 'File Permissions',
      description: 'Master chmod, chown, and understanding Unix file permissions.',
      difficulty: 'Intermediate',
      points: 50,
      solved: 892,
      category: 'Security'
    },
    {
      id: 'process-management',
      title: 'Process Management',
      description: 'Handle processes using ps, kill, jobs, and background operations.',
      difficulty: 'Advanced',
      points: 75,
      solved: 456,
      category: 'System Admin'
    }
  ];

  const stats = [
    { icon: Terminal, label: 'Active Challenges', value: '50+' },
    { icon: Users, label: 'Active Learners', value: '10,000+' },
    { icon: Trophy, label: 'Solutions Submitted', value: '250,000+' },
    { icon: Code, label: 'Lines of Shell Code', value: '1M+' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Master Shell Scripting Through
                <span className="text-yellow-300 block">Interactive Challenges</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                From basic commands to advanced automation, practice shell scripting in a real Linux environment. 
                Build confidence with hands-on challenges designed by industry experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/challenges"
                  className="inline-flex items-center px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-4 border-2 border-white/30 hover:border-white/50 hover:bg-white/10 font-semibold rounded-lg transition-all duration-200"
                >
                  View Dashboard
                  <Play className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-gray-900 rounded-lg p-6 shadow-2xl">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-400 ml-4 text-sm">user@shellcraft:~$</span>
                </div>
                <div className="text-green-400 font-mono text-sm space-y-2">
                  <div>$ ls -la /home/user/projects</div>
                  <div className="text-gray-400">drwxr-xr-x 3 user user 4096 Jan 15 10:30 scripts</div>
                  <div className="text-gray-400">-rw-r--r-- 1 user user 1024 Jan 15 10:25 backup.sh</div>
                  <div>$ chmod +x backup.sh</div>
                  <div>$ ./backup.sh</div>
                  <div className="text-blue-400">✓ Backup completed successfully!</div>
                  <div className="animate-pulse">_</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Challenges */}
      <section className="bg-gray-50 dark:bg-gray-900 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Featured Challenges
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Start your journey with these popular challenges, carefully crafted to build your shell scripting skills progressively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredChallenges.map((challenge) => (
              <div key={challenge.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      challenge.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      challenge.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {challenge.difficulty}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{challenge.category}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {challenge.title}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {challenge.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-4 w-4" />
                      <span>{challenge.points} pts</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>{challenge.solved.toLocaleString()} solved</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/challenge/${challenge.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Solve Challenge
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/challenges"
              className="inline-flex items-center px-8 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors duration-200"
            >
              View All Challenges
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose ShellCraft?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide the most comprehensive and interactive shell scripting learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg mb-6">
                <Terminal className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Real Linux Environment</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Practice in an actual Linux terminal with all the tools and commands you'll use in production environments.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-6">
                <Code className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Progressive Learning</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start with basics and advance to complex automation scripts. Each challenge builds upon previous knowledge.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mb-6">
                <Trophy className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Instant Feedback</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get immediate results and detailed explanations for your solutions. Learn from mistakes quickly.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
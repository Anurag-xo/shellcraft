import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Check,
  RefreshCw,
  Clock,
  Trophy,
  Users,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useChallenge } from "../hooks/useChallenges";
import { useUserProgress } from "../hooks/useUserProgress";
import { executionApi } from "../services/api";
import Terminal from "../components/Terminal";

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const { challenge, loading: challengeLoading } = useChallenge(id!);
  const { updateProgress, getChallengeProgress } = useUserProgress();
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const progress = getChallengeProgress(id!);

  useEffect(() => {
    if (challenge) {
      setCode("# Your solution here\n");
      setIsSubmitted(progress?.completed || false);
    }
  }, [challenge, progress]);

  const handleExecuteCode = async (script: string) => {
    setIsRunning(true);

    try {
      const result = await executionApi.executeScript(script, challenge?.id);

      let outputText = result.output;

      if (result.test_results && result.test_results.length > 0) {
        outputText += "\n\n--- Test Results ---\n";
        result.test_results.forEach((test, index) => {
          const status = test.passed ? "✅" : "❌";
          outputText += `${status} ${test.test_case}\n`;
          if (!test.passed && test.expected) {
            outputText += `   Expected: ${test.expected}\n`;
            outputText += `   Actual: ${test.actual}\n`;
          }
        });

        const allPassed = result.test_results.every((test) => test.passed);
        if (allPassed && user && challenge) {
          setIsSubmitted(true);
          await updateProgress(challenge.id, script, true, challenge.points);
        }
      }

      setOutput(outputText);
      return { output: outputText, success: result.success };
    } catch (error) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
      setOutput(errorMessage);
      return { output: errorMessage, success: false };
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode("# Your solution here\n");
    setOutput("");
    setIsSubmitted(false);
  };

  if (challengeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Loading challenge...
          </p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Challenge Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The requested challenge could not be found.
          </p>
          <Link
            to="/challenges"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/challenges"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Challenges
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Challenge Info */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {challenge.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {challenge.category}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    challenge.difficulty === "Beginner"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : challenge.difficulty === "Intermediate"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  {challenge.difficulty}
                </span>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{challenge.points} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{challenge.estimatedTime}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  {/* <span>{challenge.solved.toLocaleString()} solved</span> */}
                  <span>
                    {challenge.solved
                      ? new Date(challenge.solved).toLocaleString()
                      : "Not solved yet"}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {challenge.description}
                </p>
                <div className="whitespace-pre-line text-gray-600 dark:text-gray-400">
                  {challenge.instructions}
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Example
              </h2>
              {challenge.examples &&
                challenge.examples.map((example: any, index: number) => (
                  <div key={index} className="mb-4">
                    <div className="mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Input:
                      </span>
                      <div className="mt-1 bg-gray-900 text-green-400 p-3 rounded font-mono text-sm">
                        $ {example.input}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Output:
                      </span>
                      <div className="mt-1 bg-gray-100 dark:bg-gray-700 p-3 rounded font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre">
                        {example.output}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Test Cases */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Test Cases
              </h2>
              <ul className="space-y-2">
                {challenge.test_cases.map((testCase, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-400"
                  >
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span>{testCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code Editor and Output */}
          <div className="space-y-6">
            {/* Interactive Terminal */}
            <Terminal
              code={code}
              onCodeChange={setCode}
              onExecute={handleExecuteCode}
              className="shadow-sm border border-gray-200 dark:border-gray-700"
            />

            {/* Output */}
            {output && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Output
                  </h3>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-900 text-gray-300 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              </div>
            )}

            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                      Challenge Completed!
                    </h3>
                    <p className="text-green-700 dark:text-green-300">
                      You earned {challenge.points} points. Great job!
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to="/challenges"
                    className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Next Challenge
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


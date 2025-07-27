// src/pages/ChallengePage.tsx
import React, { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  Check,
  RefreshCw,
  Clock,
  Trophy,
  Users,
  Loader2,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useChallenge } from "../hooks/useChallenges";
import { useUserProgress } from "../hooks/useUserProgress";
import { executionApi } from "../services/api";
import Terminal from "../components/Terminal";

export default function ChallengePage() {
  const { id } = useParams<{ id: string }>();
  const { user, isLoaded: isUserLoaded } = useUser();
  const {
    challenge,
    loading: challengeLoading,
    error: challengeError,
  } = useChallenge(id!);
  const {
    updateProgress,
    getChallengeProgress,
    loading: progressLoading,
    error: progressError,
  } = useUserProgress();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const progress = getChallengeProgress(id!);

  useEffect(() => {
    if (challenge) {
      setCode("# Your solution here");
      // ULTRA-DEFENSIVE CHECK before setIsSubmitted
      if (
        progress !== null &&
        progress !== undefined &&
        typeof progress === "object" &&
        "completed" in progress
      ) {
        setIsSubmitted(!!progress.completed);
      } else {
        setIsSubmitted(false);
      }
    }
  }, [challenge, progress]);

  const handleExecuteCode = async (script: string) => {
    setIsRunning(true);
    setOutput(""); // Clear previous output
    try {
      if (!challenge?.id) {
        throw new Error("Challenge ID is missing.");
      }
      const result = await executionApi.executeScript(script, challenge.id);

      let outputText = result.output || "";

      if (result.test_results && result.test_results.length > 0) {
        outputText += "\n--- Test Results ---\n";
        result.test_results.forEach((test, index) => {
          const status = test.passed ? "✅" : "❌";
          outputText += `${status} ${test.test_case}\n`;
          if (!test.passed) {
            if (test.expected !== undefined) {
              outputText += `   Expected: ${test.expected}\n`;
            }
            if (test.actual !== undefined) {
              outputText += `   Actual: ${test.actual}\n`;
            }
          }
        });

        const allPassed = result.test_results.every((test) => test.passed);

        if (allPassed && user) {
          setIsSubmitted(true);
          await updateProgress(challenge.id, script, true, challenge.points);
        }
      }

      setOutput(outputText);
      return { output: outputText, success: result.success };
    } catch (error: any) {
      const errorMessage = `Error: ${error instanceof Error ? error.message : String(error)}`;
      setOutput(errorMessage);
      console.error("Execution error in ChallengePage:", error);
      return { output: errorMessage, success: false };
    } finally {
      setIsRunning(false);
    }
  };

  // RENDER GUARDS
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading user...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please Sign In
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need to be logged in to view challenges.
          </p>
          <Link
            to="/sign-in"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your progress...
          </p>
        </div>
      </div>
    );
  }

  if (challengeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading challenge...
          </p>
        </div>
      </div>
    );
  }

  if (progressError) {
    console.error("ChallengePage: Error loading user progress:", progressError);
    // Log and proceed, assuming not completed
  }

  if (challengeError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Challenge
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {challengeError}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/challenges"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Challenges
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {challenge.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{challenge.estimated_time}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-4 w-4" />
                  <span>{challenge.points} points</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{challenge.solved?.toLocaleString() || 0} solved</span>
                </div>
              </div>
            </div>
            {isSubmitted && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full text-sm font-medium">
                <Check className="h-4 w-4" />
                Completed
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge Details */}
          <div className="space-y-6">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-600 dark:text-gray-400">
                  {challenge.description}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Instructions
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {typeof challenge.instructions === "string" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: challenge.instructions }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(challenge.instructions, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            {/* Test Cases */}
            {challenge.testCases && challenge.testCases.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Test Cases
                </h2>
                <div className="space-y-3">
                  {challenge.testCases.map((testCase, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm font-mono"
                    >
                      {testCase}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Terminal & Output */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <Terminal onExecute={handleExecuteCode} className="border-0" />
            </div>

            {/* Output Display */}
            {output && (
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-y-auto max-h-60">
                {output}
              </div>
            )}

            {/* Completion Message */}
            {isSubmitted && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
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

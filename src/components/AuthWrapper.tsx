import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  return (
    <Routes>
      <Route 
        path="/sign-in/*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Sign in to ShellCraft
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Continue your shell scripting journey
                </p>
              </div>
              <SignIn 
                routing="path" 
                path="/sign-in" 
                redirectUrl="/dashboard"
                signUpUrl="/sign-up"
              />
            </div>
          </div>
        } 
      />
      <Route 
        path="/sign-up/*" 
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
              <div className="text-center">
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Join ShellCraft
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Start mastering shell scripting today
                </p>
              </div>
              <SignUp 
                routing="path" 
                path="/sign-up" 
                redirectUrl="/dashboard"
                signInUrl="/sign-up"
              />
            </div>
          </div>
        } 
      />
      <Route path="/*" element={children} />
    </Routes>
  );
}
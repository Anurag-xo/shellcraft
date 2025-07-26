import { ClerkProvider } from '@clerk/clerk-react';

export const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_PUBLISHABLE_KEY) {
  console.warn('Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.');
}

export { ClerkProvider };
# ShellCraft - Interactive Command-Line Challenge Platform

ShellCraft is a web-based platform designed to help users learn and master command-line skills through a series of interactive challenges. It provides a simulated terminal environment where users can practice commands, receive instant feedback, and track their progress.

## Features

- **Interactive Terminal:** A web-based terminal (Xterm.js) to execute shell commands directly in the browser.
- **Sandboxed Environment:** Secure execution of commands using Docker containers for isolation.
- **Diverse Challenges:** A variety of challenges covering different command-line tools and concepts.
- **Instant Feedback:** Real-time validation of solutions and test case results.
- **User Authentication:** Secure user management and authentication with Clerk.
- **Progress Tracking:** Users can track their completed challenges and scores.

## Technologies Used

- **Frontend:**
  - React
  - Vite
  - TypeScript
  - Tailwind CSS
- **Backend:**
  - Node.js
  - Express.js
- **Database:**
  - Supabase
- **Authentication:**
  - Clerk
- **Containerization:**
  - Docker

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- [Docker](https://www.docker.com/products/docker-desktop/)

## Setup Instructions

Follow these steps to get the application running locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shellcraft.git
cd shellcraft
```

### 2. Install Dependencies

Install the required npm packages for both the frontend and backend.

```bash
npm install
cd backend
npm install
cd ..
```

### 3. Set Up Environment Variables

The application requires environment variables for Clerk, Supabase, and the backend server.

Create a `.env` file in the root of the project:

```bash
touch .env
```

Add the following variables to the `.env` file, replacing the placeholder values with your actual credentials:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend Server Configuration
FRONTEND_URL=http://localhost:5173
PORT=3001
NODE_ENV=development
```

**How to get your credentials:**

- **Clerk:** Sign up for a free account at [Clerk.dev](https://clerk.dev/) and create a new application to get your Publishable Key.
- **Supabase:** Create a new project at [Supabase.io](https://supabase.io/) to get your Project URL and anon (public) key.

### 4. Set Up Supabase Database

The database schema is managed through migrations. To apply the migrations to your Supabase project, you can use the Supabase CLI or run the SQL from the migration files directly in the Supabase SQL editor.

The migration files are located in the `supabase/migrations` directory.

### 5. Run the Application

You need to run the frontend and backend servers in separate terminals.

**Terminal 1: Start the Backend Server**

```bash
cd backend
npm start
```

The backend server will start on the port specified in your `.env` file (default: 3001).

**Terminal 2: Start the Frontend Development Server**

```bash
# In the root directory
npm run dev
```

The frontend application will be available at `http://localhost:5173`.

## Available Scripts

The following scripts are available in the `package.json`:

- `npm run dev`: Starts the frontend development server with Vite.
- `npm run build`: Builds the frontend application for production.
- `npm run lint`: Lints the frontend codebase using ESLint.
- `npm run preview`: Serves the production build locally for preview.

For the backend, the primary script is:

- `npm start` (in the `backend` directory): Starts the backend Express server.

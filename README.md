````md
# ShellCraft: Interactive Shell Scripting Learning Platform

ShellCraft is an interactive web application designed to teach shell scripting concepts through hands-on challenges. Users can write, execute, and validate shell scripts directly in the browser, receiving immediate feedback on their solutions based on predefined rules.

## Features

- **Interactive Coding Environment:** Write and execute shell scripts within a browser-based terminal emulator.
- **Structured Challenge Validation:** Challenges define specific validation rules (e.g., checking for required command flags or output content) to assess solutions.
- **Docker-Based Execution:** Scripts are executed securely within isolated Docker containers.
- **Progress Tracking:** (Implied by `user_progress` table and `useUserProgress` hook) Track user progress and scores.
- **Admin Panel:** (Implied by `AdminPage.tsx`) Manage challenges, including defining validation rules.
- **User Authentication & Profiles:** (Implied by `user_profiles` table and `UserContext.tsx`) User accounts with profiles and rankings.

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS, `xterm.js` (for terminal emulation), Clerk (for authentication).
- **Backend:** Node.js, Express.js.
- **Database:** Supabase (PostgreSQL).
- **Containerization:** Docker (for secure script execution).

## Prerequisites

- **Node.js & npm:** Ensure you have Node.js (version 16 or later recommended) and npm installed.
- **Docker:** Docker Engine must be installed and running on the machine where the backend server will run. The backend uses the Docker SDK to manage containers.
- **Supabase Account:** You need a Supabase project. Sign up at [https://supabase.com/](https://supabase.com/).
- **Clerk Account (Optional but recommended for auth):** Sign up at [https://clerk.com/](https://clerk.com/) if you intend to use the authentication features.

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shellcraft.git
cd shellcraft
```
````

_(Replace `your-username` with your actual GitHub username if you've forked it)_

### 2. Set Up Supabase

1.  **Create a Supabase Project:** Go to your Supabase dashboard and create a new project.
2.  **Apply Database Migrations:**
    - Copy the SQL files from the `supabase/migrations/` directory (`20250727000000_create_initial_schema.sql` and `20250727000001_seed_challenges_with_validation.sql`).
    - In your Supabase project dashboard, go to the **SQL Editor**.
    - Paste and run the `20250727000000_create_initial_schema.sql` file first. This creates the necessary tables (`challenges`, `user_profiles`, `user_progress`) and types.
    - Then, paste and run the `20250727000001_seed_challenges_with_validation.sql` file. This populates the database with initial challenge data, including the crucial `validation_rules`.
3.  **Get Supabase Credentials:**
    - Go to **Project Settings > API** in your Supabase dashboard.
    - Note down the **Project URL** (`VITE_SUPABASE_URL`) and the \*\*anon public`VITE_SUPABASE_ANON_KEY`).

### 3. Configure Environment Variables

Create `.env` files in both the root (for backend) and `client` (for frontend) directories.

**Backend (`.env` in project root):**

```env
# Supabase
SUPABASE_URL=your_supabase_project_url # e.g., https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key # Found under Project Settings > API. More powerful than anon key.

# Docker
# Ensure Docker is running locally. No specific env var usually needed for local Docker daemon access by the SDK.

# (Optional) Port for backend server
PORT=3001
```

**Frontend (`.env` in `client` directory):**

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_project_url # Same as backend SUPABASE_URL
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key # From Project Settings > API

# Clerk (if using)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX # Your Clerk publishable key

# Backend API URL (where your Express server runs)
VITE_BACKEND_URL=http://localhost:3001 # Adjust if you use a different backend port
```

Replace `your_supabase_project_url`, `your_supabase_service_role_key`, `your_supabase_anon_key`, and `your_clerk_publishable_key` with your actual credentials.

### 4. Install Dependencies

Open two separate terminal windows/tabs.

- **Terminal 1 (Frontend):**

  ```bash
  cd client # Assuming frontend code is in a 'client' directory
  npm install
  ```

- **Terminal 2 (Backend):**

  ```bash
  npm install
  ```

### 5. Start the Application

- **Terminal 2 (Backend):**

  ```bashver is listening (e.g., on port 3001) and connecting to Supabase and Docker.

  ```

- **Terminal 1 (Frontend):**

  ```bash
  npm run dev # Or your defined script to start the Vite development server
  ```

  The terminal will display the local development URL (e.g., `http://localhost:5173`).

### 6. Access the Application

Open your web browser and navigate to the frontend URL provided by Vite (e.g., `http://localhost:5173`).

## How It Works

1.  **Challenge Selection:** Users browse and select challenges from the Challenges page.
2.  **Coding:** Users write their shell script solution in the provided terminal/code editor interface (`ChallengePlayground.tsx` -> `Terminal.tsx`).
3.  **Execution & Validation:**
    - When the user submits their code, the frontend sends it to the backend `/api/execute` endpoint (`server.js`).
    - The backend (`server.js`) uses the Docker SDK to create and run a container, executing the user's script.
    - The backend fetches the `validation_rules` for the specific `challengeId` from the Supabase `challenges` table.
    - The `validateChallengeOutput` function in `server.js` applies these rules against the user's script (and potentially the output/error). Supported rule types include `script_includes`, `script_includes_regex`, `output_includes`, `output_matches_regex`, and `no_error`.
    - A structured set of `test_results` (pass/fail status for each rule) is generated.
4.  **Feedback:** The backend returns the script output, execution status, and the `test_results`.
5.  **Display:** The frontend (`useExecution.ts` -> `ChallengePlayground.tsx`) receives the response, displays the script output in the terminal, and formats and displays the individual `test_results` (e.g., `✅ Rule passed` or `❌ Rule failed: Expected ... Actual ...`).
6.  **Progress Update:** If all validation rules pass, the frontend updates the user's progress via the `useUserProgress` hook, which interacts with Supabase.

## Project Structure (Key Files)

- `client/src/`: Frontend source code (React/TypeScript).
  - `components/`: Reusable UI components (e.g., `Terminal.tsx`).
  - `pages/`: Main application pages (e.g., `ChallengePlayground.tsx`, `ChallengesPage.tsx`, `AdminPage.tsx`).
  - `hooks/`: Custom React hooks (e.g., `useExecution.ts`, `useChallenges.ts`, `useUserProgress.ts`).
  - `services/`: API interaction logic (`api.ts`).
  - `contexts/`: React context providers (e.g., `UserContext.tsx`).
- `server.js`: Main backend server file (Node.js/Express).
- `supabase/migrations/`: Database schema and seed data.
- `.env`: (Not included in repo) Environment variables for configuration.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

Specify your license here (e.g., MIT, Apache 2.0).

````

You can copy and paste this Markdown content into your `README.md` file. Remember to replace placeholder values like `your-username`, `your_supabase_project_url`, etc., with your actual project details.
    npm run dev # Or your defined script to start the Express server (e.g., node server.js if not using a specific dev runner)
    ```
    You should see logs indicating the ser
````


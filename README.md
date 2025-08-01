# ShellCraft - Interactive Command-Line Challenge Platform

<p align="center">
  <img src="https://raw.githubusercontent.com/your-username/shellcraft/main/path/to/your/logo.png" alt="ShellCraft Logo" width="200"/>
</p>

<p align="center">
  <strong>Learn and master command-line skills through a series of interactive challenges.</strong>
</p>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

ShellCraft is a web-based platform designed to help users learn and master command-line skills in a fun and interactive way. It provides a simulated terminal environment where users can practice commands, receive instant feedback, and track their progress.

## Key Features

- **Interactive Terminal:** A web-based terminal (Xterm.js) to execute shell commands directly in the browser.
- **Sandboxed Environment:** Secure execution of commands using Docker containers for isolation.
- **Diverse Challenges:** A variety of challenges covering different command-line tools and concepts.
- **Instant Feedback:** Real-time validation of solutions and test case results.
- **User Authentication:** Secure user management and authentication with Clerk.
- **Progress Tracking:** Users can track their completed challenges and scores.
- **Leaderboard:** See how you rank against other users.

## Tech Stack

| Category      | Technology -                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**  | ![React](https://img.shields.io/badge/-React-61DAFB?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) - |
| **Backend**   | ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/-Express.js-000000?style=for-the-badge&logo=express&logoColor=white) -                                                                                                                                                                                                                        |
| **Database**  | ![Supabase](https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white) -                                                                                                                                                                                                                                                                                                                                     |
| **Auth**      | ![Clerk](https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white) -                                                                                                                                                                                                                                                                                                                                              |
| **Container** | ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) -                                                                                                                                                                                                                                                                                                                                           |

## Architecture

The application is composed of three main services: a frontend, a backend, and a database.

```
+-----------------+      +-----------------+      +-----------------+
|     Browser     |----->|     Frontend    |----->|     Backend     |
| (React/Vite)    |      | (Nginx/Docker)  |      | (Node.js/Docker)|
+-----------------+      +-----------------+      +-----------------+
        ^                      |                      |
        |                      |                      |
        |                      v                      v
        |              +-----------------+      +-----------------+
        +--------------|      Clerk      |      |     Supabase    |
                       | (Authentication)|      |    (Database)   |
                       +-----------------+      +-----------------+
```

- **Frontend:** A React application built with Vite and styled with Tailwind CSS. It's served by Nginx in a Docker container.
- **Backend:** A Node.js/Express server responsible for executing user commands in a secure Docker environment.
- **Database:** A Supabase instance for storing user data, challenges, and progress.
- **Authentication:** Clerk is used for user authentication and management.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later)
- [npm](https://www.npmjs.com/) (v9 or later)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/shellcraft.git
cd shellcraft
```

### 2. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following variables:

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

### 3. Build and Run with Docker Compose

```bash
docker-compose up --build
```

The application will be available at `http://localhost:5173`.

## Project Structure

```
.
├── backend/              # Backend Node.js/Express application
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile.frontend   # Dockerfile for the frontend
├── src/                  # Frontend React application source code
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Libraries and clients (Clerk, Supabase)
│   ├── pages/            # Application pages
│   └── services/         # API services
├── supabase/             # Supabase migrations
└── ...                   # Other configuration files
```

## Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


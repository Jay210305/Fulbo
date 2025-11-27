# Fulbo Mobile App Prototype

## 🛠 Tech Stack

**Frontend**

- React (Vite)
- TypeScript
- TailwindCSS
- Radix UI / Shadcn UI
- Lucide React (Icons)

**Backend**

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL (Relational DB)
- MongoDB (NoSQL DB)

**Infrastructure**

- Docker & Docker Compose

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## 🚀 Getting Started

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd Fulbo
    ```

2.  **Start Databases**

    ```bash
    docker-compose up -d
    ```

3.  **Backend Setup**

    ```bash
    cd backend
    npm install
    # Generate Prisma Client
    npx prisma generate
    # Start Development Server
    npm run dev
    ```

4.  **Frontend Setup**
    ```bash
    cd ../frontend
    npm install
    # Start Development Server
    npm run dev
    ```

---

## 🤝 Team Workflow & Guidelines

### 1. Daily Routine (Start of Day)

**Never work directly on `develop` or `main`.**

1.  **Update your local codebase:**

    ```bash
    git checkout develop
    git pull origin develop
    ```

2.  **Create a feature branch:**
    _Naming convention:_ `feat/task-name`
    _Examples:_ `feat/auth-login`, `feat/booking-engine`
    ```bash
    git checkout -b feat/my-feature
    ```

### 2. Saving Progress

Commit frequently (every 1-2 hours).

```bash
git add .
git commit -m "Dev: Implementing validation logic for login"
```

### 3. Update Ritual (Before breaks/end of day)

Keep your branch up-to-date with `develop` to minimize conflicts.

1.  **Commit local changes:**

    ```bash
    git commit -am "WIP: Saving changes before update"
    ```

2.  **Pull latest changes from develop:**
    ```bash
    git pull origin develop
    ```

### 4. Submitting Changes (Pull Request)

When your feature is complete:

1.  **Push your branch:**
    ```bash
    git push origin feat/my-feature
    ```
2.  **Create a Pull Request (PR)** on GitHub/GitLab from `feat/my-feature` to `develop`.

### ⚠ Conflict Resolution

If `git pull origin develop` results in a **MERGE CONFLICT**:

1.  Open VS Code.
2.  Go to the **Source Control** tab.
3.  Open files marked in red.
4.  Look for conflict markers:
    - `<<<<<<< Current Change` (Your code)
    - `>>>>>>> Incoming Change` (Incoming code from develop)
5.  Choose "Accept Current", "Accept Incoming", or manually merge.
6.  **Finalize the merge:**
    ```bash
    git add .
    git commit -m "Fix: Resolving merge conflicts"
    git push origin feat/my-feature
    ```

### 🏆 Golden Rules

- **File Ownership:**
  - **Dev A**: Auth
  - **Dev B**: Fields & Booking
  - **Dev C**: Chat
- **Critical Files:**
  - Do **NOT** modify `backend/src/index.ts` or `frontend/src/App.tsx` without notifying the team.
  - **`schema.prisma` is sacred.** If modified, notify the team immediately so everyone can run `npx prisma generate`.

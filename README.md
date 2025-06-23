
# GreenWatt: Intelligent Energy Monitoring & Optimization

GreenWatt is a web application designed to help households monitor, understand, and optimize their electricity consumption. It provides personalized insights, energy-saving tips, and visual analytics to empower users to reduce their carbon footprint and save money on utility bills.

## ✨ Features

  * **Multi-Step User Onboarding:** A guided setup process for new users to collect essential profile information (personal details, electricity rate, household size), register their first appliance, and log their initial meter reading, ensuring a personalized experience from day one.

  * **Interactive Dashboard:** A comprehensive overview of energy consumption trends, month-over-month changes, daily usage, estimated monthly bills, and total savings.

  * **AI-Powered Energy Tips:** Personalized recommendations generated based on user consumption patterns to help optimize energy usage.

  * **Carbon Footprint Tracking:** Monitor CO2 emissions reductions directly linked to energy savings.

  * **Energy Efficiency Score:** Track progress against personal energy reduction targets.

  * **Responsive Design:** Optimized for seamless experience across various devices (desktop, tablet, mobile).

  * **Secure Authentication:** User login and signup with secure token-based authentication.

  * **Robust Data Management:** Backend API for managing user profiles, meter readings, and appliance data.

## 🚀 Technologies Used

### Frontend

  * **React:** A JavaScript library for building user interfaces.

  * **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.

  * **Framer Motion:** A powerful animation library for React to create smooth and engaging UI transitions and gestures.

  * **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

  * **React Chart.js 2 & Chart.js:** For creating interactive and dynamic data visualizations on the dashboard.

  * **Lucide React:** A set of beautiful, open-source icons.

  * **Axios:** A promise-based HTTP client for making API requests.

  * **React Router DOM:** For declarative routing in the application.

### Backend

  * **Node.js:** A JavaScript runtime environment.

  * **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.

  * **Prisma:** An open-source database toolkit (ORM) for Node.js and TypeScript, used for database access and migrations.

  * **PostgreSQL:** A powerful, open-source relational database system.

  * **JWT (JSON Web Tokens):** For secure user authentication.

  * **Bcrypt.js:** For hashing passwords securely.

  * **dotenv:** For loading environment variables from a `.env` file.

  * **Gemini (or similar LLM API):** For generating personalized energy tips. (Implicitly used by the `updateUserEmbedding` service if it leverages LLMs).

## 🛠️ Setup Instructions

Follow these steps to get GreenWatt up and running on your local machine.

### Prerequisites

  * Node.js (LTS version recommended)

  * npm or Yarn

  * PostgreSQL database instance

  * Git

### 1\. Clone the Repository

```
git clone <your-repository-url>
cd greenwatt-project # Replace with your project's root directory name

```


---

## 🛠️ Backend Setup

Navigate to your backend directory (e.g., `backend/` or `server/`):

```bash
cd backend # or server
npm install # or yarn install
```

### 📦 Environment Configuration

Create a `.env` file in your backend directory and add your **NeonDB PostgreSQL** connection string:

```env
# .env in backend directory
DATABASE_URL="postgresql://username:password@your-neon-db.neon.tech/db_name?sslmode=require"
SHADOW_DATABASE_URL="postgresql://username:password@your-neon-db.neon.tech/shadow_db?sslmode=require" # For Prisma Migrate
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_gemini_api_key" # Optional if you use Gemini/OpenAI for embeddings
```

### 🔄 Run Prisma Migrations

Run this to apply your schema and generate the Prisma client:

```bash
npx prisma migrate dev --name init_greenwatt_db
```

> If you add new fields like `onboardingComplete`, run:

```bash
npx prisma migrate dev --name add_onboarding_complete
```

---

### 🧠 Enabling Vector Embeddings in NeonDB

Prisma doesn't natively support PostgreSQL `vector` types, so you must manually add the `embedding` column.

#### 1. Enable the `pgvector` Extension

Log into your Neon dashboard → SQL Editor, and run:

```sql
create extension if not exists vector;
```

#### 2. Add the `embedding` Column to `user_embeddings`

```sql
alter table public.UserEmbedding
add column if not exists embedding vector(1536);
```

> ⚠️ Prisma will ignore this column. Make sure any embeddings you insert use raw SQL or `prisma.$executeRaw`.

---

### ▶️ Start Backend Server

```bash
npm run dev
```

The server should now be live at `http://localhost:3000`.

---

### 3\. Frontend Setup

Open a new terminal and navigate to your frontend directory (e.g., `frontend/` or `client/`).

```
cd frontend # or client
npm install # or yarn install

```

#### Environment Variables

Create a `.env` file in your frontend directory if you need to configure the backend API URL.

```
# .env in frontend directory
REACT_APP_API_BASE_URL=http://localhost:5000/api # Adjust if your backend is on a different port/path

```

#### Start Frontend Development Server

```
npm start # or yarn start

```

The frontend application should open in your browser, usually at `http://localhost:3000`.

## 🖥️ Usage

1.  **Landing Page:** Access `http://localhost:3000`.

      * If you are not logged in, the "Get Started" and "Start Free Trial" buttons will lead to the signup page.

      * If you are logged in (a token exists in localStorage), these buttons will lead directly to the Dashboard.

2.  **Sign Up:** Create a new account. After successful signup, you will be automatically redirected to the onboarding wizard.

3.  **Onboarding Wizard:**

      * **Step 1 (Personal Info):** Fill in your personal details, household information, electricity rate, and optional eco-goals. This data updates your `User` and `UserProfile` records.

      * **Step 2 (Add Appliance):** Add at least one appliance to your profile. This data is saved to the `Appliance` model.

      * **Step 3 (Add Reading):** Input your first energy meter reading. This data is saved to the `MeterReading` model, and crucially, your `UserProfile`'s `onboardingComplete` flag is set to `true`.

4.  **Dashboard:** After completing the onboarding, you will be redirected to the interactive dashboard, displaying personalized energy analytics based on the data you provided.

5.  **Protected Routes:** Attempting to access `/dashboard` or `/onboarding` directly:

      * If not logged in, you'll be redirected to `/auth/login`.

      * If logged in but onboarding is incomplete, you'll be redirected to `/onboarding`.

      * If logged in and onboarding is complete, you'll gain access to the requested protected route (e.g., `/dashboard`).

## 📁 Project Structure (High-Level)

```
greenwatt-project/
├── backend/                  # Node.js Express backend
│   ├── src/
│   │   ├── controllers/      # API logic (userProfileController.ts, etc.)
│   │   ├── middleware/       # Authentication middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (updateUserEmbedding.ts, etc.)
│   │   └── server.ts         # Main server file
│   ├── prisma/               # Prisma schema and migrations
│   └── .env                  # Backend environment variables
├── frontend/                 # React TypeScript frontend
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Dashboard/    # Main dashboard components
│   │   │   ├── Landing/      # Landing page, Login, Signup, ProtectedRoute
│   │   │   └── Onboarding/   # OnboardingWizard, PersonalInfoForm, AddApplianceForm, AddReadingForm
│   │   ├── utils/            # Axios instance, utility functions
│   │   └── App.tsx           # Main application component and routing
│   └── .env                  # Frontend environment variables
├── .gitignore
├── package.json (root)
└── README.md                 # This file

```

## 💡 Future Enhancements

  * **Detailed Analytics Pages:** Dedicated pages for in-depth analysis of monthly/daily usage, appliance-specific consumption, and cost breakdowns.

  * **Historical Data Import:** Allow users to import historical utility bills for richer historical analysis.

  * **Smart Meter Integration:** Direct integration with popular smart meter APIs for automated data fetching.

  * **Custom Energy-Saving Goals:** Allow users to set specific, measurable energy-saving goals and track progress towards them.

  * **Gamification:** Badges, leaderboards, and challenges to encourage energy-saving habits.

  * **Notification System:** In-app or email notifications for usage anomalies, new tips, and goal progress.

  * **Community Features:** Allow users to share tips, insights, and compete with friends/family.

  * **Appliance Recommendations:** Suggest more efficient appliances based on current usage.
# 

## 1. Overview

This backend serves as the core engine for an energy-saving application. It handles:

- User authentication and profile management.
- Storage of energy consumption data and appliance details.
- Generation of user embeddings (vector representations of user profiles) using Google Gemini Embeddings.
- AI-powered personalized energy tip generation based on user embeddings and other context.
- Storage and retrieval of generated tips.

## 2. Technologies Used

- **Node.js / Express.js:** Backend runtime and web framework.
- **TypeScript:** For type-safe development.
- **Prisma:** ORM for database interaction (PostgreSQL).
- **PostgreSQL:** Relational database.
- **Supabase:** Provides PostgreSQL database, authentication, and hosting for `pgvector`.
- **`pgvector`:** PostgreSQL extension for storing and querying vector embeddings.
- **LangChain.js:** Framework for developing applications powered by language models (used for `SupabaseVectorStore`, `GoogleGenerativeAIEmbeddings`, `ChatGoogleGenerativeAI`).
- **Google Gemini API:** For generating embeddings and conversational AI.
- **`jsonwebtoken`:** For handling JWTs (if custom auth is used, or to demonstrate).
- **`dotenv`:** For managing environment variables.

## 3\. Folder Structure

 electricityRatePerKWh Float? 
```
.
├── src/
│   ├── config/              # Environment variable loading/configuration
│   │   └── config.ts
│   ├── controllers/         # Handles incoming requests, calls services
│   │   ├── auth.controller.ts
│   │   ├── energyTips.controller.ts
│   │   └── profile.controller.ts
│   ├── middleware/          # Express middleware (e.g., authentication)
│   │   └── authMiddleware.ts
│   ├── routes/              # Defines API endpoints and links to controllers
│   │   ├── auth.routes.ts
│   │   ├── tips.routes.ts
│   │   └── profile.routes.ts
│   ├── services/            # Contains business logic, interacts with Prisma/LangChain
│   │   ├── auth.service.ts
│   │   ├── profile.service.ts
│   │   ├── tipGenerationService.ts # Main logic for generating tips
│   │   └── updateUserEmbedding.ts  # Logic for creating/updating user embeddings
│   ├── lib/                 # Utility functions, external client initializations
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── supabaseClient.ts # Supabase client instance (if used for auth)
│   │   └── vectorStore.ts   # LangChain's vector store setup (SupabaseVectorStore, Embeddings)
│   ├── types/               # Custom TypeScript types/interfaces
│   │   └── express.d.ts     # Global Express types (e.g., Request.user)
│   └── app.ts               # Main Express application setup
├── prisma/
│   ├── migrations/          # Database migration files managed by Prisma
│   │   └── <timestamp>_create_user_embeddings_table/
│   │       └── migration.sql # Contains SQL for user_embeddings table & pgvector extension
│   └── schema.prisma        # Prisma database schema definition
├── .env.example             # Example environment variables
├── .env                     # Your actual environment variables
├── package.json
├── tsconfig.json
├── README.md

```

## 4\. Database Schema (Prisma)

The `prisma/schema.prisma` defines the structure of your database.

```
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  // previewFeatures = ["postgresqlExtensions"] // Can be enabled here, but better handled in migrations for pgvector
}

datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  // extensions = [vector] // Can be enabled here, but better handled in migrations
}

model User {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email           String         @unique
  password        String         // IMPORTANT: Hash passwords in production!
  firstName       String?
  lastName        String?
  phoneNumber     String?        @map("phone_number") // Example, add if needed
  householdSize   Int?           @map("household_size")
  city            String?
  state           String?
  zipCode         String?        @map("zip_code")
  createdAt       DateTime       @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime       @updatedAt @map("updated_at") @db.Timestamptz(6)

  userProfile     UserProfile?   // One-to-one relation to UserProfile
  readings        EnergyReading[] // One-to-many relation to EnergyReading
  appliances      Appliance[]    // One-to-many relation to Appliance
  energyTips      EnergyTip[]    // One-to-many relation to EnergyTip
  userEmbeddings  UserEmbedding[] // One-to-many relation to UserEmbedding
}

model UserProfile {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId          String    @unique @map("user_id") @db.Uuid // Foreign key to User
  ecoGoals        String?   @db.Text
  targetReduction Float?    @map("target_reduction") // e.g., 0.15 for 15%
  createdAt       DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt       DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_profiles")
}

model EnergyReading {
  id             String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId         String    @map("user_id") @db.Uuid // Foreign key to User
  readingDate    DateTime  @map("reading_date") @db.Date // Date of the reading (e.g., start of month)
  consumptionKWH Float     @map("consumption_kwh")
  emissionCO2kg  Float?    @map("emission_co2_kg") // Optional: Calculated CO2 emissions
  createdAt      DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt      DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("energy_readings")
}

model Appliance {
  id                      String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId                  String    @map("user_id") @db.Uuid // Foreign key to User
  type                    String    // e.g., "Refrigerator", "HVAC", "Washing Machine"
  modelName               String?   @map("model_name")
  ageYears                Int?      @map("age_years")
  energyEfficiencyRating  String?   @map("energy_efficiency_rating") // e.g., "Energy Star", "A+++", "Old"
  annualConsumptionKWH    Float?    @map("annual_consumption_kwh") // Estimated annual consumption
  createdAt               DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt               DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  user                    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("appliances")
}

model EnergyTip {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String    @map("user_id") @db.Uuid // Foreign key to User
  title        String
  description  String    @db.Text
  category     String?   // e.g., "HVAC", "Lighting", "Behavioral"
  source       String?   // e.g., "AI", "Admin"
  isDismissed  Boolean   @default(false) @map("is_dismissed")
  createdAt    DateTime  @default(now()) @map("created_at") @db.Timestamptz(6)
  updatedAt    DateTime  @updatedAt @map("updated_at") @db.Timestamptz(6)

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("energy_tips")
}

// Dedicated table for user embeddings managed by LangChain
model UserEmbedding {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId       String    @map("user_id") @db.Uuid // Foreign key to the User model
  content      String?   @db.Text // The raw text that was embedded (e.g., concatenated user profile data)
  embedding    Unsupported("vector(768)") // Stores the vector embedding. Dimension 768 for Gemini's models.
  createdAt    DateTime? @default(now()) @map("created_at") @db.Timestamptz(6)

  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@map("user_embeddings") // Maps this model to the 'user_embeddings' table name
}

```

## 5\. Environment Variables

Create a `.env` file in the root directory of your backend based on `.env.example`.

```
# Database Connection (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database"
SHADOW_DATABASE_URL="postgresql://user:password@host:port/shadow_database" # Used by Prisma for migrations

# Supabase Project Credentials
SUPABASE_URL="<https://your-project-ref.supabase.co>"
SUPABASE_ANON_KEY="your-anon-key-from-supabase-settings" # Public key, safe for client-side
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-from-supabase-settings" # Secret key, ONLY for backend operations

# Google Gemini API Key
GEMINI_API_KEY="your-google-gemini-api-key"

# JWT Secret (for authentication)
JWT_SECRET="a_very_secret_key_for_jwt_signing" # Use a strong, random string in production

```

## 6\. Setup Instructions

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- A Supabase Project (with PostgreSQL database enabled)
- A Google Cloud Project with the Gemini API enabled and an API Key generated.

### Backend Setup

1. **Clone the repository:**
    
    ```bash
    git clone <repository-url>
    cd <project-directory>/Backend
    
    ```
    
2. **Install dependencies:**
    
    ```bash
    npm install
    # or yarn install
    
    ```
    
3. **Create `.env` file:**
Copy `.env.example` to `.env` and fill in all your credentials.

### Supabase Database Setup

1. **Enable `pgvector` Extension:**
    - Go to your **Supabase Dashboard** -\> **`Database`** -\> **`Extensions`**.
    - Search for `vector` and toggle it to `Enabled`.
2. **Run Prisma Migrations:**
This will create all tables defined in `schema.prisma`, including `User`, `UserProfile`, `EnergyReading`, `Appliance`, `EnergyTip`, and `user_embeddings`.
    - **Crucially, after generating the migration (`npx prisma migrate dev`), you *must* manually edit the generated SQL file.**
    - Open `prisma/migrations/<timestamp>_create_user_embeddings_table/migration.sql` (or your latest migration file that creates `user_embeddings`).
    - **At the very top of the SQL file, add:**
        
        ```sql
        CREATE EXTENSION IF NOT EXISTS vector;
        
        ```
        
    - **At the end of the SQL file, add a vector index:**
        
        ```sql
        CREATE INDEX ON user_embeddings USING ivfflat (embedding vector_l2_ops);
        -- OR, if using HNSW (often faster for very large datasets, check Supabase support):
        -- CREATE INDEX ON user_embeddings USING hnsw (embedding vector_cosine_ops);
        
        ```
        
    - Now, apply the migration:
    (If you used `npx prisma migrate dev`, it might have applied already. Confirm in Supabase Table Editor).
        
        ```bash
        npx prisma migrate deploy
        
        ```
        
3. **Create `match_documents` SQL Function:**
This PostgreSQL function is used by LangChain for similarity searches.
    - Go to **Supabase Dashboard** -\> **`SQL Editor`** -\> **`New Query`**.
    - Paste the following SQL and click **"RUN"**:
        
        ```sql
        create function match_documents (
          query_embedding vector(768), -- Must match your embedding dimension (e.g., 768 for Gemini)
          match_count int,
          filter_id uuid default null -- Used to filter out specific user IDs (e.g., the current user)
        )
        returns table (
          id uuid,
          user_id uuid,
          content text,
          similarity float
        )
        language plpgsql
        as $$
        #variable_conflict use_column
        begin
          return query
          select
            id,
            user_id,
            content,
            1 - (user_embeddings.embedding <=> query_embedding) as similarity -- Cosine similarity calculation
          from user_embeddings
          where
            (filter_id is null or user_id <> filter_id) -- Filters records by user_id
          order by user_embeddings.embedding <=> query_embedding -- Orders by vector distance (closest first)
          limit match_count;
        end;
        $$;
        
        ```
        
4. **Configure Row Level Security (RLS) Policies:**
RLS is enabled by default by Supabase for new tables. You need policies to allow your backend to interact with the `user_embeddings` and `energy_tips` tables.
    - Go to **Supabase Dashboard** -\> **`Authentication`** -\> **`Policies`**.
    - **For `user_embeddings` (for `INSERT` and `SELECT` by service role):**
        - **Policy 1 (INSERT):**
            - **Name:** `Allow service role to insert into user_embeddings`
            - **Permissive:** `INSERT`
            - **Target roles:** `service_role`
            - **Using Expression:** `(true)`
            - **With Check Expression:** `(true)`
        - **Policy 2 (SELECT - for `match_documents`):**
            - **Name:** `Allow all users to select from user_embeddings` (or `authenticated` if you want to restrict)
            - **Permissive:** `SELECT`
            - **Target roles:** `public` (or `authenticated`)
            - **Using Expression:** `(true)`
            - (For `service_role`, it generally bypasses RLS by default, but explicit policies don't hurt)
    - **For `energy_tips` (for `INSERT` and `SELECT`):**
        - **Policy 1 (INSERT):**
            - **Name:** `Allow service role to insert into energy_tips`
            - **Permissive:** `INSERT`
            - **Target roles:** `service_role`
            - **Using Expression:** `(true)`
            - **With Check Expression:** `(true)`
        - **Policy 2 (SELECT):**
            - **Name:** `Allow authenticated users to select their own energy tips`
            - **Permissive:** `SELECT`
            - **Target roles:** `authenticated`
            - **Using Expression:** `(auth.uid() = user_id)` (assuming `user_id` column on `energy_tips`)
            - **With Check Expression:** `(true)`

## 7\. API Routes

All routes are prefixed with `/api/`. The base URL for local development is typically `http://localhost:3000`.

### Authentication Routes (`src/routes/auth.routes.ts`)

- **`POST /api/auth/signup`**
    - **Description:** Registers a new user account.
    - **Request Body:**
        
        ```json
        {
          "email": "user@example.com",
          "password": "strongpassword123",
          "firstName": "Jane",
          "lastName": "Doe"
        }
        
        ```
        
    - **Response:**
        
        ```json
        {
          "message": "User registered successfully. Redirect to profile setup.",
          "user": {
            "id": "a_user_id_uuid",
            "email": "user@example.com"
          }
        }
        
        ```
        
    - **Notes:** After signup, the frontend should typically redirect to a profile setup page.
- **`POST /api/auth/login`**
    - **Description:** Authenticates an existing user and returns a JWT.
    - **Request Body:**
        
        ```json
        {
          "email": "user@example.com",
          "password": "strongpassword123"
        }
        
        ```
        
    - **Response:**
        
        ```json
        {
          "message": "Login successful",
          "access_token": "your_jwt_token_here",
          "user": {
            "id": "a_user_id_uuid",
            "email": "user@example.com"
          }
        }
        
        ```
        

### User Profile Routes (`src/routes/profile.routes.ts`)

- **`POST /api/profile/setup`**
    - **Description:** Creates or updates a user's detailed profile information, including eco-goals and household details.
    - **Access:** Private (requires `Authorization: Bearer <token>`)
    - **Request Body:**
        
        ```json
        {
          "userId": "the_authenticated_user_id", // Can be obtained from req.user.id in controller
          "firstName": "John",
          "lastName": "Doe",
          "phoneNumber": "9876543210",
          "householdSize": 4,
          "address": "123 Green Street",
          "city": "Mumbai",
          "state": "Maharashtra",
          "zipCode": "400001",
          "targetReduction": 0.15,
          "ecoGoals": "Reduce electricity bill by optimizing appliance usage, especially AC in summer. Aim for a 15% reduction in kWh by year-end."
        }
        
        ```
        
    - **Response:**
        
        ```json
        {
          "message": "Profile data saved and embedding triggered successfully."
        }
        
        ```
        
    - **Notes:** This route automatically triggers the `updateUserEmbedding` process after saving the profile data.

### Energy Data Routes (`src/routes/energyData.routes.ts` - Conceptual)

- **`POST /api/energy-readings`**
    - **Description:** Adds a new energy consumption reading for the user.
    - **Access:** Private
    - **Request Body:**
        
        ```json
        {
          "userId": "authenticated_user_id",
          "readingDate": "2025-05-01",
          "consumptionKWH": 450.5,
          "emissionCO2kg": 180.2 // Optional
        }
        
        ```
        
    - **Notes:** You would likely trigger `updateUserEmbedding` when enough new readings are added or a significant change occurs.

### Appliance Routes (`src/routes/appliances.routes.ts` - Conceptual)

- **`POST /api/appliances`**
    - **Description:** Adds a new appliance record for the user.
    - **Access:** Private
    - **Request Body:**
        
        ```json
        {
          "userId": "authenticated_user_id",
          "type": "Refrigerator",
          "modelName": "EnergyStarFridgeXYZ",
          "ageYears": 5,
          "energyEfficiencyRating": "Energy Star",
          "annualConsumptionKWH": 350
        }
        
        ```
        
    - **Notes:** You would likely trigger `updateUserEmbedding` when new appliances are added/removed or significantly updated.

### Energy Tips Generation & Retrieval Routes (`src/routes/tips.routes.ts`)

- **`POST /api/tips/generate-personalized`**
    - **Description:** Triggers the generation of new personalized energy-saving tips for the authenticated user based on their latest profile and data. Tips are saved to the `energy_tips` table.
    - **Access:** Private (requires `Authorization: Bearer <token>`)
    - **Request Body:** None needed (userId is extracted from token).
    - **Response:**
        
        ```json
        {
          "message": "Personalized energy tips generated and saved successfully!",
          "tipsCount": 5 // Example, number of tips generated
        }
        
        ```
        
- **`GET /api/tips/my-tips`** (Conceptual)
    - **Description:** Retrieves personalized energy tips previously generated for the authenticated user.
    - **Access:** Private
    - **Response:**
        
        ```json
        [
          {
            "id": "tip_uuid_1",
            "title": "Optimize HVAC Schedule",
            "description": "Adjust your thermostat schedule to raise temperature when away...",
            "category": "HVAC",
            "isDismissed": false
          },
          // ... more tips
        ]
        
        ```
        

## 8\. Core Logic & Flow

1. **User Onboarding:**
    - User signs up via `/api/auth/signup`. A basic `User` record is created.
    - Frontend redirects to a "Profile Setup" page.
    - User submits their detailed profile information (eco-goals, household size, etc.) via `POST /api/profile/setup`.
    - The `profile.controller.ts` calls `profile.service.ts` to save this to `UserProfile` and update the `User` record.
    - **Crucially, `profile.service.ts` then triggers `updateUserEmbedding(userId)`** to process this new profile data into a vector and store it in `user_embeddings`.
2. **Data Collection:**
    - Users continuously input `EnergyReading` data (e.g., monthly meter readings) via `POST /api/energy-readings`.
    - Users add/update `Appliance` data via `POST /api/appliances`.
    - These actions, especially when enough new data accumulates, should also trigger `updateUserEmbedding(userId)` to keep the user's embedding current.
3. **Embedding Generation (`updateUserEmbedding` service):**
    - This service fetches all relevant user data (`UserProfile`, `EnergyReading` history, `Appliance` list).
    - It concatenates this data into a single text string (the `userEnergyProfileText`).
    - It uses `GoogleGenerativeAIEmbeddings` to convert this text into a high-dimensional vector.
    - It then stores/updates this vector in the `user_embeddings` table using `SupabaseVectorStore.addVectors()`.
4. **Personalized Tip Generation (`generatePersonalizedTips` service):**
    - Triggered by `POST /api/tips/generate-personalized`.
    - Fetches the current user's embedding from `user_embeddings`.
    - Performs a similarity search (`SupabaseVectorStore.similaritySearchWithScore`) to find similar user profiles (and their associated generated tips or contextual data) or general energy-saving knowledge.
    - Uses a LangChain `ChatGoogleGenerativeAI` model, feeding it the current user's profile, recent consumption, appliances, and insights from similar users/knowledge.
    - The AI generates personalized energy-saving tips relevant to the user.
    - These newly generated tips are saved to the `energy_tips` table.

## 9\. Running the Application

1. **Ensure all setup steps are completed.**
2. **Start the backend server:**
(Assuming `dev` script in `package.json` runs `ts-node-dev src/app.ts` or similar)
    
    ```bash
    npm run dev
    # or yarn dev
    
    ```
    

The server will typically run on `http://localhost:3000`.

## 10\. API Testing with Postman

You can use Postman (or Insomnia) to test the API routes:

1. **Login/Signup First:** Obtain an `access_token` by making a request to `/api/auth/login`.
2. **Set Authorization Header:** For all subsequent authenticated requests, set the `Authorization` header to `Bearer <your_access_token>`.
3. **Make Requests:** Send JSON bodies as specified in the "API Routes" section.

---

This `README.md` should give you a solid foundation for understanding, setting up, and developing your backend\!
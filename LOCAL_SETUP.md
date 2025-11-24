# How to Run 99Grind Locally

You can run the application locally before deploying. However, you **DO** need a Supabase project (either hosted on Supabase.com or running locally via Docker) because the app relies on it for Authentication and Database.

## Prerequisites

1.  **Node.js** installed.
2.  **Supabase Project**:
    - Go to [database.new](https://database.new) to create a free project.
    - OR run Supabase locally if you have Docker installed (`npx supabase start`).

## Setup Steps

### 1. Configure Environment Variables

Rename `.env.example` to `.env.local` (if you haven't already) and fill in your Supabase credentials.

```bash
cp .env.example .env.local
```

Open `.env.local` and update the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

*You can find these in your Supabase Dashboard under Project Settings > API.*

### 2. Setup the Database

You need to run the SQL scripts to create the tables.

1.  Go to your Supabase Dashboard > **SQL Editor**.
2.  Copy the content from `supabase/schema.sql` in this project and run it.
3.  (Optional) Copy the content from `supabase/seed.sql` and run it to add default exercises.

### 3. Run the Development Server

Run the following command in your terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

When you are ready to deploy:

1.  Push this code to a GitHub repository.
2.  Import the repository into **Vercel**.
3.  Add the same `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables in Vercel Project Settings.

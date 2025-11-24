# Deployment Guide: Vercel + Supabase

Follow these steps to deploy **99Grind** to production.

## Part 1: Supabase Setup (Backend)

1.  **Create Project**: Go to [database.new](https://database.new) and create a new project.
2.  **Get Credentials**:
    - Go to **Project Settings** (cog icon) > **API**.
    - Copy the `Project URL` and `anon` `public` key. You will need these for Vercel.
3.  **Setup Database**:
    - Go to the **SQL Editor** in the Supabase dashboard.
    - Open the `supabase/schema.sql` file from this repository.
    - Copy/Paste the content into the SQL Editor and click **Run**.
    - **IMPORTANT**: Also run `supabase/migrations/01_add_email_to_profiles.sql` to support username login.
    - (Optional) Do the same for `supabase/seed.sql` to add default exercises.
4.  **Configure Auth**:
    - Go to **Authentication** > **URL Configuration**.
    - You will update the **Site URL** *after* you deploy to Vercel. For now, you can leave it as localhost or default.

## Part 2: Vercel Deployment (Frontend)

1.  **Import Project**:
    - Go to [vercel.com/new](https://vercel.com/new).
    - Select the **99grind** repository you just pushed to GitHub.
2.  **Configure Project**:
    - **Framework Preset**: Next.js (should be auto-detected).
    - **Root Directory**: `./` (default).
3.  **Environment Variables**:
    - Expand the **Environment Variables** section.
    - Add the following variables using the credentials from Part 1:
        - `NEXT_PUBLIC_SUPABASE_URL` : `your-project-url`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY` : `your-anon-key`
4.  **Deploy**:
    - Click **Deploy**.
    - Wait for the build to finish. You will get a production URL (e.g., `https://99grind.vercel.app`).

## Part 3: Final Configuration

1.  **Update Supabase Auth URL**:
    - Go back to your Supabase Dashboard > **Authentication** > **URL Configuration**.
    - Set **Site URL** to your new Vercel URL (e.g., `https://99grind.vercel.app`).
    - Under **Redirect URLs**, ensure you have:
        - `https://99grind.vercel.app/**`
        - `https://99grind.vercel.app/auth/callback`
    - Click **Save**.

## Verification

1.  Open your Vercel URL.
2.  Try to **Sign Up**.
3.  If successful, you should be redirected to the dashboard.
4.  Check your Supabase **Table Editor** > `profiles` table to see your new user.

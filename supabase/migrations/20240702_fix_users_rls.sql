-- Fix RLS policies for users table to allow inserts during signup

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Service role can insert data" ON public.users;

-- Create policies with proper permissions
-- Allow users to view their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid()::text = user_id);

-- Allow users to insert their own data
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow service role to insert data (for server-side operations)
CREATE POLICY "Service role can insert data" ON public.users
  FOR INSERT WITH CHECK (true);

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

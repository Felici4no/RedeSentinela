/*
  # Add Profile Creation Trigger and Test Users

  1. Changes
    - Create automatic profile creation trigger for new users
    - Create profiles for existing users in auth.users
    - Add test user maria@example.com with USER role
    - Ensure admin user has proper profile
  
  2. Security
    - Trigger runs with SECURITY DEFINER to bypass RLS
    - Test users created with secure authentication
*/

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'USER'),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users
INSERT INTO public.profiles (id, name, role, points)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  CASE 
    WHEN u.email = 'admin@redesentinela.com' THEN 'ADMIN'::user_role
    ELSE 'USER'::user_role
  END,
  0
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Create test user maria@example.com if not exists
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if user exists
  SELECT id INTO user_id FROM auth.users WHERE email = 'maria@example.com';
  
  -- If user doesn't exist, create it
  IF user_id IS NULL THEN
    -- Insert into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'maria@example.com',
      crypt('User@123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Maria Silva","role":"USER"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

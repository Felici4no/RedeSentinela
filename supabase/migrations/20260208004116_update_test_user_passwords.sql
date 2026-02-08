/*
  # Update Test User Passwords

  1. Changes
    - Update admin@redesentinela.com password to Admin@123
    - Update maria@example.com password to User@123
    - Ensure passwords are properly hashed
  
  2. Security
    - Uses crypt with bcrypt algorithm for secure password hashing
*/

-- Update admin password
UPDATE auth.users
SET 
  encrypted_password = crypt('Admin@123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'admin@redesentinela.com';

-- Update maria password
UPDATE auth.users
SET 
  encrypted_password = crypt('User@123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'maria@example.com';

-- Update lucas password (existing user)
UPDATE auth.users
SET 
  encrypted_password = crypt('User@123', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'lucas@faculzeira.com';

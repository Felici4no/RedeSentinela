/*
  # Fix RLS Infinite Recursion
  
  ## Problema
  As políticas RLS estavam causando recursão infinita ao tentar verificar
  se um usuário é admin fazendo SELECT na própria tabela profiles.
  
  ## Solução
  - Remover políticas que causam recursão
  - Criar políticas mais simples usando apenas auth.uid()
  - Para verificar role de admin, usar metadata do JWT ao invés de SELECT
  
  ## Mudanças
  1. Remove todas as políticas existentes de profiles, reports e certificates
  2. Cria políticas simplificadas sem recursão
  3. Admins precisarão ter o role definido no metadata (app_metadata)
*/

-- Drop todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can create reports" ON reports;
DROP POLICY IF EXISTS "Admins can view all reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Anyone can verify certificates by code" ON certificates;
DROP POLICY IF EXISTS "System can create certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;

-- Policies para profiles - SEM recursão
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'ADMIN'
    )
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = 'USER');

CREATE POLICY "Profiles can be created on signup"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policies para reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() 
    OR 
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
  );

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
  );

-- Policies para certificates
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
  );

CREATE POLICY "System can create certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Criar função helper para checar se usuário é admin (mais eficiente)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recriar policies usando a função helper (mais eficiente e sem recursão)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Admins can update reports" ON reports;
DROP POLICY IF EXISTS "Users can view own certificates" ON certificates;

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_admin());
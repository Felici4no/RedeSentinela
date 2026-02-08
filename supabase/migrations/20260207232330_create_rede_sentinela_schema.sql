/*
  # Rede Sentinela - Sistema de Prevenção Ativa de Acidentes
  
  ## Descrição
  Schema completo para o sistema Rede Sentinela que permite:
  - Cidadãos registrarem situações de risco próximas à rede elétrica
  - Gestores validarem registros e gerarem dados preventivos
  - Sistema de gamificação com pontos e certificados

  ## 1. New Tables
  
  ### `profiles`
  Extensão do auth.users com informações do perfil e gamificação
  - `id` (uuid, FK para auth.users)
  - `name` (text) - Nome completo do usuário
  - `role` (text) - Papel: USER ou ADMIN
  - `points` (integer) - Pontos acumulados
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Última atualização

  ### `reports`
  Registros de situações de risco enviados por cidadãos
  - `id` (uuid, PK)
  - `user_id` (uuid, FK para profiles)
  - `type` (text) - Tipo de risco
  - `severity` (text) - Severidade: BAIXA, MEDIA, ALTA
  - `risk_score` (integer) - Score de risco 0-100
  - `status` (text) - Status: PENDING, VALIDATED, REJECTED
  - `lat` (numeric) - Latitude
  - `lng` (numeric) - Longitude
  - `address_text` (text) - Endereço textual
  - `description` (text) - Descrição do risco
  - `photo_url` (text) - URL ou base64 da foto
  - `ai_classification` (text) - Classificação do SafeScan AI
  - `created_at` (timestamptz) - Data de criação
  - `validated_at` (timestamptz) - Data de validação
  - `validated_by` (uuid) - Admin que validou

  ### `certificates`
  Certificados emitidos para usuários
  - `id` (uuid, PK)
  - `user_id` (uuid, FK para profiles)
  - `level` (text) - Nível: BRONZE, PRATA, OURO, DIAMANTE
  - `issued_at` (timestamptz) - Data de emissão
  - `verify_code` (text) - Código único de verificação

  ## 2. Security
  - RLS habilitado em todas as tabelas
  - Políticas restritivas por role
  - Usuários só acessam seus próprios dados
  - Admins têm acesso completo

  ## 3. Important Notes
  - Sistema de pontuação calculado via triggers
  - Anti-spam: limite de 3 registros por dia por usuário (implementado na aplicação)
  - Localização opcional mas incentivada
*/

-- Criar enum types para garantir consistência
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE report_status AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');
CREATE TYPE report_severity AS ENUM ('BAIXA', 'MEDIA', 'ALTA');
CREATE TYPE certificate_level AS ENUM ('BRONZE', 'PRATA', 'OURO', 'DIAMANTE');

-- Tabela de profiles (extensão do auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'USER',
  points integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de reports (registros de risco)
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity report_severity NOT NULL,
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  status report_status NOT NULL DEFAULT 'PENDING',
  lat numeric,
  lng numeric,
  address_text text,
  description text NOT NULL,
  photo_url text,
  ai_classification text,
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  validated_by uuid REFERENCES profiles(id)
);

-- Tabela de certificates
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  level certificate_level NOT NULL,
  issued_at timestamptz DEFAULT now(),
  verify_code text UNIQUE NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON reports(severity);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_verify_code ON certificates(verify_code);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Policies para reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Policies para certificates
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can verify certificates by code"
  ON certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view all certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular pontos quando report é validado
CREATE OR REPLACE FUNCTION update_points_on_validation()
RETURNS TRIGGER AS $$
DECLARE
  points_to_add integer := 0;
BEGIN
  -- Só adiciona pontos quando status muda para VALIDATED
  IF NEW.status = 'VALIDATED' AND (OLD.status IS NULL OR OLD.status != 'VALIDATED') THEN
    -- Pontos base
    points_to_add := 10;
    
    -- Bônus por alta severidade
    IF NEW.severity = 'ALTA' THEN
      points_to_add := points_to_add + 10;
    END IF;
    
    -- Bônus por localização e descrição completa
    IF NEW.lat IS NOT NULL AND NEW.lng IS NOT NULL AND length(NEW.description) > 50 THEN
      points_to_add := points_to_add + 5;
    END IF;
    
    -- Atualizar pontos do usuário
    UPDATE profiles
    SET points = points + points_to_add
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_points
  AFTER UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_points_on_validation();
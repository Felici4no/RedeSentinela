import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'USER' | 'ADMIN';
export type ReportStatus = 'PENDING' | 'VALIDATED' | 'REJECTED';
export type ReportSeverity = 'BAIXA' | 'MEDIA' | 'ALTA';
export type CertificateLevel = 'BRONZE' | 'PRATA' | 'OURO' | 'DIAMANTE';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  type: string;
  severity: ReportSeverity;
  risk_score: number;
  status: ReportStatus;
  lat: number | null;
  lng: number | null;
  address_text: string | null;
  description: string;
  photo_url: string | null;
  ai_classification: string | null;
  created_at: string;
  validated_at: string | null;
  validated_by: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  level: CertificateLevel;
  issued_at: string;
  verify_code: string;
}

export const RISK_TYPES = [
  'Construção civil',
  'Máquinas agrícolas',
  'Poda',
  'Pipa',
  'Cabo no solo',
  'Poste danificado',
  'Veículos altos',
  'Outro'
];

export const SEVERITY_LEVELS: ReportSeverity[] = ['BAIXA', 'MEDIA', 'ALTA'];

export const CERTIFICATE_CRITERIA = {
  BRONZE: { minReports: 1, maxReports: 2 },
  PRATA: { minReports: 3, maxReports: 5 },
  OURO: { minReports: 6, maxReports: 10, minHighSeverity: 2 },
  DIAMANTE: { minReports: 11, minHighSeverity: 3, minMonthsActive: 3 }
};

export const calculateRiskScore = (
  severity: ReportSeverity,
  hasLocation: boolean,
  descriptionLength: number
): number => {
  let score = 0;

  switch (severity) {
    case 'BAIXA':
      score = 30;
      break;
    case 'MEDIA':
      score = 60;
      break;
    case 'ALTA':
      score = 90;
      break;
  }

  if (hasLocation) score += 5;
  if (descriptionLength > 100) score += 5;

  return Math.min(score, 100);
};

export const getAIClassification = (type: string): string => {
  const classifications: Record<string, string> = {
    'Construção civil': 'Possível estrutura metálica próxima a cabos',
    'Máquinas agrícolas': 'Veículo alto detectado próximo a rede',
    'Poda': 'Vegetação próxima a rede elétrica',
    'Pipa': 'Objeto voador detectado',
    'Cabo no solo': 'Cabo energizado detectado',
    'Poste danificado': 'Estrutura danificada detectada',
    'Veículos altos': 'Veículo alto em movimento',
    'Outro': 'Situação de risco identificada'
  };

  return classifications[type] || 'Análise em processamento';
};

export const getEducationalMessage = (type: string): string => {
  const messages: Record<string, string> = {
    'Construção civil': 'Em obras, mantenha andaimes, guindastes e vergalhões a pelo menos 3 metros da rede elétrica.',
    'Máquinas agrícolas': 'Ao operar máquinas altas, sempre verifique a altura da rede elétrica. Mantenha distância segura.',
    'Poda': 'Nunca realize podas próximas à rede. Solicite poda técnica à concessionária.',
    'Pipa': 'Evite empinar pipas próximo à rede elétrica. Use linhas sem material condutor.',
    'Cabo no solo': 'Nunca toque em cabos caídos. Isole a área e acione imediatamente a concessionária.',
    'Poste danificado': 'Postes danificados devem ser reportados imediatamente à concessionária para manutenção.',
    'Veículos altos': 'Veículos com caçamba ou equipamentos elevados devem sempre verificar altura antes de passar sob a rede.',
    'Outro': 'Mantenha sempre distância segura da rede elétrica. Em caso de dúvida, consulte a concessionária.'
  };

  return messages[type] || 'Obrigado por contribuir com a segurança da sua comunidade!';
};

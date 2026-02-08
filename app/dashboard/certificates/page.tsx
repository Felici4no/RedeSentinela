'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase, Report, CertificateLevel, CERTIFICATE_CRITERIA } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, ArrowLeft, Download, CheckCircle, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatDateLong } from '@/lib/date-utils';

export default function Certificates() {
  return (
    <ProtectedRoute requiredRole="USER">
      <CertificatesContent />
    </ProtectedRoute>
  );
}

function CertificatesContent() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [achievedLevels, setAchievedLevels] = useState<CertificateLevel[]>([]);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'VALIDATED')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReports(data);
      calculateAchievedLevels(data);
    }

    setLoading(false);
  };

  const calculateAchievedLevels = (validatedReports: Report[]) => {
    const count = validatedReports.length;
    const highSeverityCount = validatedReports.filter(r => r.severity === 'ALTA').length;
    const levels: CertificateLevel[] = [];

    if (count >= CERTIFICATE_CRITERIA.BRONZE.minReports) {
      levels.push('BRONZE');
    }
    if (count >= CERTIFICATE_CRITERIA.PRATA.minReports) {
      levels.push('PRATA');
    }
    if (count >= CERTIFICATE_CRITERIA.OURO.minReports && highSeverityCount >= CERTIFICATE_CRITERIA.OURO.minHighSeverity) {
      levels.push('OURO');
    }
    if (count >= CERTIFICATE_CRITERIA.DIAMANTE.minReports && highSeverityCount >= CERTIFICATE_CRITERIA.DIAMANTE.minHighSeverity) {
      levels.push('DIAMANTE');
    }

    setAchievedLevels(levels);
  };

  const getLevelColor = (level: CertificateLevel) => {
    const colors = {
      BRONZE: 'from-orange-600 to-orange-800',
      PRATA: 'from-gray-400 to-gray-600',
      OURO: 'from-yellow-400 to-yellow-600',
      DIAMANTE: 'from-blue-400 to-blue-600'
    };
    return colors[level];
  };

  const getLevelDescription = (level: CertificateLevel) => {
    const descriptions = {
      BRONZE: `${CERTIFICATE_CRITERIA.BRONZE.minReports}-${CERTIFICATE_CRITERIA.BRONZE.maxReports} registros validados`,
      PRATA: `${CERTIFICATE_CRITERIA.PRATA.minReports}-${CERTIFICATE_CRITERIA.PRATA.maxReports} registros validados`,
      OURO: `${CERTIFICATE_CRITERIA.OURO.minReports}+ registros validados, incluindo ${CERTIFICATE_CRITERIA.OURO.minHighSeverity}+ de alta severidade`,
      DIAMANTE: `${CERTIFICATE_CRITERIA.DIAMANTE.minReports}+ registros validados, incluindo ${CERTIFICATE_CRITERIA.DIAMANTE.minHighSeverity}+ de alta severidade, com ${CERTIFICATE_CRITERIA.DIAMANTE.minMonthsActive}+ meses de atividade`
    };
    return descriptions[level];
  };

  const generateCertificate = async (level: CertificateLevel) => {
    const verifyCode = `RS-${profile!.id.slice(0, 8).toUpperCase()}-${level}`;

    const { error } = await supabase
      .from('certificates')
      .upsert({
        user_id: profile!.id,
        level,
        verify_code: verifyCode,
        issued_at: new Date().toISOString()
      }, { onConflict: 'user_id,level' });

    if (error) {
      console.error('Error saving certificate:', error);
    }

    const certificateWindow = window.open('', '_blank');
    if (certificateWindow) {
      certificateWindow.document.write(generateCertificateHTML(level, verifyCode));
      certificateWindow.document.close();
    }
  };

  const generateCertificateHTML = (level: CertificateLevel, verifyCode: string) => {
    const levelColors = {
      BRONZE: '#c2410c',
      PRATA: '#6b7280',
      OURO: '#ca8a04',
      DIAMANTE: '#2563eb'
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Certificado ${level} - Rede Sentinela</title>
        <style>
          @page { size: landscape; margin: 0; }
          body {
            margin: 0;
            padding: 40px;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            text-align: center;
          }
          .header {
            margin-bottom: 40px;
          }
          .logo {
            font-size: 48px;
            color: ${levelColors[level]};
            margin-bottom: 20px;
          }
          h1 {
            color: #1f2937;
            font-size: 36px;
            margin: 0 0 10px 0;
          }
          .subtitle {
            color: #6b7280;
            font-size: 18px;
            margin-bottom: 40px;
          }
          .level-badge {
            display: inline-block;
            padding: 15px 40px;
            background: ${levelColors[level]};
            color: white;
            font-size: 32px;
            font-weight: bold;
            border-radius: 50px;
            margin: 30px 0;
          }
          .recipient {
            font-size: 28px;
            color: #1f2937;
            margin: 30px 0;
            font-weight: bold;
          }
          .description {
            color: #4b5563;
            font-size: 16px;
            line-height: 1.6;
            margin: 30px 0;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
          }
          .footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
          }
          .verify-code {
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
            font-family: monospace;
          }
          .date {
            color: #9ca3af;
            font-size: 14px;
            margin-top: 10px;
          }
          @media print {
            body { background: white; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">
            <div class="logo">🛡️</div>
            <h1>Rede Sentinela</h1>
            <div class="subtitle">Sistema de Prevenção Ativa de Acidentes</div>
          </div>

          <div>Certificamos que</div>
          <div class="recipient">${profile!.name}</div>

          <div>alcançou o nível</div>
          <div class="level-badge">${level}</div>

          <div class="description">
            Por sua contribuição ativa na identificação e registro de situações de risco
            próximas à rede elétrica, auxiliando na prevenção de acidentes e na proteção
            da comunidade através da vigilância cidadã responsável.
          </div>

          <div class="description">
            <strong>Critérios alcançados:</strong><br>
            ${getLevelDescription(level)}
          </div>

          <div class="footer">
            <div><strong>${reports.length}</strong> registros validados</div>
            <div><strong>${profile!.points}</strong> pontos acumulados</div>
            <div class="verify-code">
              Código de verificação: ${verifyCode}
            </div>
            <div class="date">
              Emitido em ${formatDateLong(new Date())}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const certificateLevels: CertificateLevel[] = ['BRONZE', 'PRATA', 'OURO', 'DIAMANTE'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Certificados</h1>
          <p className="text-gray-600">
            Reconhecimento pela sua contribuição com a prevenção de acidentes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Seu Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Registros validados:</span>
                  <strong>{reports.length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Alta severidade:</span>
                  <strong>{reports.filter(r => r.severity === 'ALTA').length}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Pontos totais:</span>
                  <strong>{profile?.points || 0}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Níveis Conquistados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {achievedLevels.map((level) => (
                  <Badge
                    key={level}
                    className={`bg-gradient-to-r ${getLevelColor(level)} text-white`}
                  >
                    {level}
                  </Badge>
                ))}
                {achievedLevels.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    Nenhum certificado conquistado ainda
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {certificateLevels.map((level) => {
            const isAchieved = achievedLevels.includes(level);

            return (
              <Card key={level} className={isAchieved ? 'border-2 border-blue-500' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Award className={`h-5 w-5 ${isAchieved ? 'text-blue-600' : 'text-gray-400'}`} />
                        Certificado {level}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {getLevelDescription(level)}
                      </CardDescription>
                    </div>
                    {isAchieved ? (
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    ) : (
                      <Lock className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`h-32 rounded-lg bg-gradient-to-r ${getLevelColor(level)} flex items-center justify-center mb-4`}
                  >
                    <Award className="h-16 w-16 text-white" />
                  </div>

                  {isAchieved ? (
                    <Button
                      onClick={() => generateCertificate(level)}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Gerar Certificado
                    </Button>
                  ) : (
                    <Button disabled className="w-full">
                      <Lock className="h-4 w-4 mr-2" />
                      Bloqueado
                    </Button>
                  )}

                  {!isAchieved && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Continue registrando situações de risco para desbloquear
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Como Verificar um Certificado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Cada certificado possui um código único de verificação no formato:
              <code className="bg-gray-100 px-2 py-1 rounded ml-1">RS-XXXXXXXX-NIVEL</code>
            </p>
            <p className="text-gray-600">
              Este código pode ser usado para validar a autenticidade do certificado através
              do sistema de verificação (funcionalidade disponível em produção).
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
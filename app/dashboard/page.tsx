'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase, Report, CertificateLevel, CERTIFICATE_CRITERIA } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Plus, LogOut, TrendingUp, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/date-utils';

export default function Dashboard() {
  return (
    <ProtectedRoute requiredRole="USER">
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLevel, setCurrentLevel] = useState<CertificateLevel>('BRONZE');
  const [nextLevel, setNextLevel] = useState<CertificateLevel | null>('PRATA');
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;

    await refreshProfile();

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReports(data);
      calculateLevel(data);
    }

    setLoading(false);
  };

  const calculateLevel = (userReports: Report[]) => {
    const validatedReports = userReports.filter(r => r.status === 'VALIDATED');
    const count = validatedReports.length;
    const highSeverityCount = validatedReports.filter(r => r.severity === 'ALTA').length;

    let level: CertificateLevel = 'BRONZE';
    let next: CertificateLevel | null = 'PRATA';
    let progress = 0;

    if (count >= CERTIFICATE_CRITERIA.DIAMANTE.minReports && highSeverityCount >= CERTIFICATE_CRITERIA.DIAMANTE.minHighSeverity) {
      level = 'DIAMANTE';
      next = null;
      progress = 100;
    } else if (count >= CERTIFICATE_CRITERIA.OURO.minReports && highSeverityCount >= CERTIFICATE_CRITERIA.OURO.minHighSeverity) {
      level = 'OURO';
      next = 'DIAMANTE';
      progress = (count / CERTIFICATE_CRITERIA.DIAMANTE.minReports) * 100;
    } else if (count >= CERTIFICATE_CRITERIA.PRATA.minReports) {
      level = 'PRATA';
      next = 'OURO';
      progress = (count / CERTIFICATE_CRITERIA.OURO.minReports) * 100;
    } else if (count >= CERTIFICATE_CRITERIA.BRONZE.minReports) {
      level = 'BRONZE';
      next = 'PRATA';
      progress = (count / CERTIFICATE_CRITERIA.PRATA.minReports) * 100;
    } else {
      level = 'BRONZE';
      next = 'BRONZE';
      progress = (count / CERTIFICATE_CRITERIA.BRONZE.minReports) * 100;
    }

    setCurrentLevel(level);
    setNextLevel(next);
    setProgressPercentage(Math.min(progress, 100));
  };

  const getLevelColor = (level: CertificateLevel) => {
    const colors = {
      BRONZE: 'text-orange-700 bg-orange-100',
      PRATA: 'text-gray-700 bg-gray-200',
      OURO: 'text-yellow-700 bg-yellow-100',
      DIAMANTE: 'text-blue-700 bg-blue-100'
    };
    return colors[level];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      VALIDATED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: 'Pendente',
      VALIDATED: 'Validado',
      REJECTED: 'Rejeitado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Rede Sentinela</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Olá, {profile?.name}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pontos Totais</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.points || 0}</div>
              <p className="text-xs text-gray-500 mt-1">
                Acumulados em {reports.filter(r => r.status === 'VALIDATED').length} registros validados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nível Atual</CardTitle>
              <Award className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className={getLevelColor(currentLevel)}>
                  {currentLevel}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {nextLevel ? `Próximo: ${nextLevel}` : 'Nível máximo atingido!'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{reports.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {reports.filter(r => r.status === 'PENDING').length} pendentes de validação
              </p>
            </CardContent>
          </Card>
        </div>

        {nextLevel && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Progresso para {nextLevel}</CardTitle>
              <CardDescription>
                Continue registrando situações de risco para alcançar o próximo nível
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {progressPercentage.toFixed(0)}% completo
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Meus Registros</h2>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/dashboard/register">
                <Plus className="h-4 w-4 mr-2" />
                Novo Registro
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard/certificates">
                <Award className="h-4 w-4 mr-2" />
                Certificados
              </Link>
            </Button>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum registro ainda</h3>
              <p className="text-gray-600 mb-6">
                Comece a contribuir registrando sua primeira situação de risco
              </p>
              <Button asChild>
                <Link href="/dashboard/register">
                  <Plus className="h-4 w-4 mr-2" />
                  Fazer Primeiro Registro
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusLabel(report.status)}
                        </Badge>
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge variant="outline" className={
                          report.severity === 'ALTA' ? 'border-red-500 text-red-700' :
                          report.severity === 'MEDIA' ? 'border-orange-500 text-orange-700' :
                          'border-blue-500 text-blue-700'
                        }>
                          {report.severity}
                        </Badge>
                      </div>
                      <p className="text-gray-900 mb-2">{report.description}</p>
                      {report.address_text && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-3 w-3" />
                          <span>{report.address_text}</span>
                        </div>
                      )}
                    </div>
                    {report.photo_url && (
                      <img
                        src={report.photo_url}
                        alt="Foto do registro"
                        className="w-24 h-24 object-cover rounded-lg ml-4"
                      />
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Registrado em {formatDate(report.created_at)}
                    </span>
                    {report.status === 'VALIDATED' && (
                      <span className="text-green-600 font-medium">
                        +{report.severity === 'ALTA' ? 25 : 15} pontos
                      </span>
                    )}
                  </div>
                  {report.ai_classification && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-blue-600">
                        <span className="font-medium">SafeScan AI:</span> {report.ai_classification}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
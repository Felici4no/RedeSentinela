'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase, Report, ReportSeverity, SEVERITY_LEVELS } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shield, LogOut, CheckCircle, X, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/date-utils';
import { toast } from 'sonner';

export default function AdminValidate() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminValidateContent />
    </ProtectedRoute>
  );
}

function AdminValidateContent() {
  const { profile, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [action, setAction] = useState<'validate' | 'reject'>('validate');
  const [newSeverity, setNewSeverity] = useState<ReportSeverity>('MEDIA');

  useEffect(() => {
    loadPendingReports();
  }, []);

  const loadPendingReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReports(data);
    }

    setLoading(false);
  };

  const handleAction = (report: Report, actionType: 'validate' | 'reject') => {
    setSelectedReport(report);
    setNewSeverity(report.severity);
    setAction(actionType);
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedReport) return;

    const updateData: any = {
      status: action === 'validate' ? 'VALIDATED' : 'REJECTED',
      validated_at: new Date().toISOString(),
      validated_by: profile!.id
    };

    if (action === 'validate' && newSeverity !== selectedReport.severity) {
      updateData.severity = newSeverity;
    }

    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', selectedReport.id);

    if (error) {
      toast.error('Erro ao processar registro');
      console.error(error);
    } else {
      toast.success(
        action === 'validate'
          ? 'Registro validado com sucesso!'
          : 'Registro rejeitado'
      );
      setReports(reports.filter(r => r.id !== selectedReport.id));
      setShowDialog(false);
      setSelectedReport(null);
    }
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-bold">Rede Sentinela - Admin</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Admin</Badge>
              <span className="text-sm text-gray-600">{profile?.name}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b bg-white">
        <div className="container mx-auto px-4">
          <nav className="flex gap-6 py-4">
            <Link
              href="/admin"
              className="text-gray-600 hover:text-gray-900 pb-1"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/map"
              className="text-gray-600 hover:text-gray-900 pb-1"
            >
              Mapa de Calor
            </Link>
            <Link
              href="/admin/validate"
              className="text-blue-600 border-b-2 border-blue-600 pb-1 font-medium flex items-center gap-2"
            >
              Validação
              {reports.length > 0 && (
                <Badge className="bg-orange-500">{reports.length}</Badge>
              )}
            </Link>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Validação de Registros</h2>
          <p className="text-gray-600">
            {reports.length} registro{reports.length !== 1 ? 's' : ''} pendente{reports.length !== 1 ? 's' : ''} de análise
          </p>
        </div>

        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Todos os registros foram processados!
              </h3>
              <p className="text-gray-600 mb-6">
                Não há registros pendentes de validação no momento.
              </p>
              <Button asChild>
                <Link href="/admin">Voltar ao Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge className={
                          report.severity === 'ALTA' ? 'bg-red-100 text-red-800' :
                          report.severity === 'MEDIA' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }>
                          {report.severity}
                        </Badge>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Score: {report.risk_score}/100
                        </Badge>
                      </div>
                      <CardTitle className="text-xl mb-2">
                        {report.description}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(report.created_at)}
                          </span>
                        </div>
                        {report.address_text && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{report.address_text}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      {report.photo_url && (
                        <div className="mb-4">
                          <img
                            src={report.photo_url}
                            alt="Foto do registro"
                            className="w-full rounded-lg object-cover max-h-96"
                          />
                        </div>
                      )}

                      {report.ai_classification && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <p className="text-sm font-medium text-blue-900 mb-1">
                            SafeScan AI - Classificação Automática
                          </p>
                          <p className="text-sm text-blue-700">{report.ai_classification}</p>
                        </div>
                      )}

                      {report.lat && report.lng && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            Coordenadas GPS
                          </p>
                          <p className="text-sm text-gray-700 font-mono">
                            {report.lat.toFixed(6)}, {report.lng.toFixed(6)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col justify-between">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Informações do Registro</h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Tipo:</dt>
                              <dd className="font-medium">{report.type}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Severidade:</dt>
                              <dd className="font-medium">{report.severity}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Score de Risco:</dt>
                              <dd className="font-medium">{report.risk_score}/100</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-600">Localização:</dt>
                              <dd className="font-medium">
                                {report.lat && report.lng ? 'Sim' : 'Não informada'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <Button
                          onClick={() => handleAction(report, 'validate')}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Validar
                        </Button>
                        <Button
                          onClick={() => handleAction(report, 'reject')}
                          variant="destructive"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'validate' ? 'Validar Registro' : 'Rejeitar Registro'}
            </DialogTitle>
            <DialogDescription>
              {action === 'validate'
                ? 'Confirme a validação deste registro. O usuário receberá pontos pela contribuição.'
                : 'Tem certeza que deseja rejeitar este registro? Esta ação não pode ser desfeita.'}
            </DialogDescription>
          </DialogHeader>

          {action === 'validate' && selectedReport && (
            <div className="py-4">
              <Label className="mb-2 block">Reclassificar Severidade (opcional)</Label>
              <Select
                value={newSeverity}
                onValueChange={(v: ReportSeverity) => setNewSeverity(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SEVERITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newSeverity !== selectedReport.severity && (
                <p className="text-sm text-orange-600 mt-2">
                  Severidade será alterada de {selectedReport.severity} para {newSeverity}
                </p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              className={action === 'validate' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={action === 'reject' ? 'destructive' : 'default'}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Label({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <label className={`text-sm font-medium ${className}`}>{children}</label>;
}
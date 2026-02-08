'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase, Report } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Shield, AlertTriangle, CheckCircle, Clock, Map, FileCheck, LogOut, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { profile, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'7' | '30'>('30');

  useEffect(() => {
    loadData();
  }, [timeFilter]);

  const loadData = async () => {
    const daysAgo = parseInt(timeFilter);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReports(data);
    }

    setLoading(false);
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'PENDING').length,
    validated: reports.filter(r => r.status === 'VALIDATED').length,
    highRisk: reports.filter(r => r.severity === 'ALTA').length
  };

  const typeData = reports.reduce((acc, report) => {
    const existing = acc.find(item => item.name === report.type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: report.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const severityData = [
    { name: 'Baixa', value: reports.filter(r => r.severity === 'BAIXA').length },
    { name: 'Média', value: reports.filter(r => r.severity === 'MEDIA').length },
    { name: 'Alta', value: reports.filter(r => r.severity === 'ALTA').length }
  ];

  const statusData = [
    { name: 'Pendente', value: stats.pending },
    { name: 'Validado', value: stats.validated },
    { name: 'Rejeitado', value: reports.filter(r => r.status === 'REJECTED').length }
  ];

  const COLORS = {
    pending: '#f59e0b',
    validated: '#10b981',
    rejected: '#ef4444',
    baixa: '#3b82f6',
    media: '#f59e0b',
    alta: '#ef4444'
  };

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
              className="text-blue-600 border-b-2 border-blue-600 pb-1 font-medium"
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
              className="text-gray-600 hover:text-gray-900 pb-1 flex items-center gap-2"
            >
              Validação
              {stats.pending > 0 && (
                <Badge className="bg-orange-500">{stats.pending}</Badge>
              )}
            </Link>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Dashboard Geral</h2>
            <p className="text-gray-600">Visão geral dos registros de prevenção</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeFilter === '7' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('7')}
            >
              7 dias
            </Button>
            <Button
              variant={timeFilter === '30' ? 'default' : 'outline'}
              onClick={() => setTimeFilter('30')}
            >
              30 dias
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                Últimos {timeFilter} dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
              <p className="text-xs text-gray-500 mt-1">
                Aguardando validação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Validados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.validated}</div>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.validated / stats.total) * 100 || 0).toFixed(0)}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.highRisk}</div>
              <p className="text-xs text-gray-500 mt-1">
                Severidade alta
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Registros por Tipo</CardTitle>
              <CardDescription>Distribuição dos tipos de risco identificados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Severidade</CardTitle>
              <CardDescription>Níveis de risco registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Alta' ? COLORS.alta :
                          entry.name === 'Média' ? COLORS.media :
                          COLORS.baixa
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status de Validação</CardTitle>
              <CardDescription>Estado atual dos registros</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === 'Pendente' ? COLORS.pending :
                          entry.name === 'Validado' ? COLORS.validated :
                          COLORS.rejected
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/validate">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Validar Registros Pendentes ({stats.pending})
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/admin/map">
                  <Map className="h-4 w-4 mr-2" />
                  Ver Mapa de Zonas Críticas
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registros Recentes</CardTitle>
            <CardDescription>Últimos 5 registros enviados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{report.type}</Badge>
                      <Badge className={
                        report.severity === 'ALTA' ? 'bg-red-100 text-red-800' :
                        report.severity === 'MEDIA' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {report.severity}
                      </Badge>
                      <Badge className={
                        report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'VALIDATED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
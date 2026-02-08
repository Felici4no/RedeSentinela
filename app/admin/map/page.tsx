'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase, Report, ReportSeverity, RISK_TYPES } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, LogOut, MapPin, Filter } from 'lucide-react';
import Link from 'next/link';

export default function AdminMap() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <AdminMapContent />
    </ProtectedRoute>
  );
}

interface LocationCluster {
  lat: number;
  lng: number;
  count: number;
  avgSeverity: string;
  address: string;
  reports: Report[];
}

function AdminMapContent() {
  const { profile, signOut } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clusters, setClusters] = useState<LocationCluster[]>([]);
  const [topAreas, setTopAreas] = useState<{ area: string; count: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, typeFilter, severityFilter, statusFilter]);

  const loadData = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setReports(data);
    }

    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...reports];

    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.type === typeFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(r => r.severity === severityFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    setFilteredReports(filtered);
    calculateClusters(filtered);
    calculateTopAreas(filtered);
  };

  const calculateClusters = (reportsData: Report[]) => {
    const CLUSTER_THRESHOLD = 0.01;
    const clusterMap = new Map<string, LocationCluster>();

    reportsData.forEach(report => {
      if (!report.lat || !report.lng) return;

      const clusterKey = `${Math.floor(report.lat / CLUSTER_THRESHOLD)},${Math.floor(report.lng / CLUSTER_THRESHOLD)}`;

      if (clusterMap.has(clusterKey)) {
        const cluster = clusterMap.get(clusterKey)!;
        cluster.count++;
        cluster.reports.push(report);
      } else {
        clusterMap.set(clusterKey, {
          lat: report.lat,
          lng: report.lng,
          count: 1,
          avgSeverity: report.severity,
          address: report.address_text || 'Localização não especificada',
          reports: [report]
        });
      }
    });

    const clustersArray = Array.from(clusterMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setClusters(clustersArray);
  };

  const calculateTopAreas = (reportsData: Report[]) => {
    const areaMap = new Map<string, number>();

    reportsData.forEach(report => {
      if (report.address_text) {
        const area = extractAreaFromAddress(report.address_text);
        areaMap.set(area, (areaMap.get(area) || 0) + 1);
      }
    });

    const topAreasArray = Array.from(areaMap.entries())
      .map(([area, count]) => ({ area, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setTopAreas(topAreasArray);
  };

  const extractAreaFromAddress = (address: string): string => {
    const parts = address.split('-');
    if (parts.length > 1) {
      return parts[parts.length - 1].trim();
    }
    return address;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      ALTA: '#ef4444',
      MEDIA: '#f59e0b',
      BAIXA: '#3b82f6'
    };
    return colors[severity as keyof typeof colors] || '#6b7280';
  };

  const getClusterSize = (count: number) => {
    if (count >= 5) return 60;
    if (count >= 3) return 45;
    return 30;
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
              className="text-blue-600 border-b-2 border-blue-600 pb-1 font-medium"
            >
              Mapa de Calor
            </Link>
            <Link
              href="/admin/validate"
              className="text-gray-600 hover:text-gray-900 pb-1"
            >
              Validação
            </Link>
          </nav>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Mapa de Zonas Críticas</h2>
          <p className="text-gray-600">
            Visualização geográfica dos registros de risco e identificação de áreas prioritárias
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              <CardDescription>
                Filtre os registros por tipo, severidade ou status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo de Risco</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {RISK_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Severidade</label>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="ALTA">Alta</SelectItem>
                      <SelectItem value="MEDIA">Média</SelectItem>
                      <SelectItem value="BAIXA">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="PENDING">Pendente</SelectItem>
                      <SelectItem value="VALIDATED">Validado</SelectItem>
                      <SelectItem value="REJECTED">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Exibindo {filteredReports.length} de {reports.length} registros
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setTypeFilter('all');
                    setSeverityFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mapa de Registros</CardTitle>
              <CardDescription>
                Distribuição geográfica dos registros (visualização simplificada)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-lg p-8 relative" style={{ height: '500px' }}>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MapPin className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg font-medium">Visualização de Mapa</p>
                    <p className="text-sm">
                      {filteredReports.length} registro{filteredReports.length !== 1 ? 's' : ''} com localização
                    </p>
                  </div>
                </div>

                <div className="relative z-10 flex flex-wrap gap-4 p-4">
                  {clusters.slice(0, 8).map((cluster, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-full shadow-lg flex items-center justify-center font-bold border-4 cursor-pointer hover:scale-110 transition-transform"
                      style={{
                        width: `${getClusterSize(cluster.count)}px`,
                        height: `${getClusterSize(cluster.count)}px`,
                        borderColor: getSeverityColor(cluster.avgSeverity),
                        color: getSeverityColor(cluster.avgSeverity)
                      }}
                      title={`${cluster.address}: ${cluster.count} registros`}
                    >
                      {cluster.count}
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-4">
                  <p className="text-xs font-semibold mb-2">Legenda</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#ef4444' }}></div>
                      <span>Alta Severidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#f59e0b' }}></div>
                      <span>Média Severidade</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#3b82f6' }}></div>
                      <span>Baixa Severidade</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                Nota: Esta é uma visualização simplificada. Em produção, integrar com Leaflet/MapBox para mapa interativo completo.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Áreas com Recorrência</CardTitle>
                <CardDescription>
                  Regiões com maior número de registros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topAreas.length > 0 ? (
                  <div className="space-y-3">
                    {topAreas.map((area, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{area.area}</p>
                            <p className="text-sm text-gray-600">
                              {area.count} registro{area.count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <Badge>{area.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum registro com endereço disponível
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clusters Críticos</CardTitle>
                <CardDescription>
                  Agrupamentos com maior concentração de registros
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clusters.length > 0 ? (
                  <div className="space-y-3">
                    {clusters.slice(0, 5).map((cluster, index) => (
                      <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{cluster.address}</p>
                          <p className="text-xs text-gray-600">
                            {cluster.lat.toFixed(4)}, {cluster.lng.toFixed(4)}
                          </p>
                        </div>
                        <Badge
                          className={
                            cluster.count >= 5 ? 'bg-red-100 text-red-800' :
                            cluster.count >= 3 ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }
                        >
                          {cluster.count} registros
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum cluster identificado com os filtros atuais
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
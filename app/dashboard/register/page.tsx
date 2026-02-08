'use client';

import { useState, useRef, useEffect } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/lib/auth-context';
import { supabase, RISK_TYPES, SEVERITY_LEVELS, calculateRiskScore, getAIClassification, getEducationalMessage } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, MapPin, ArrowLeft, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RegisterReport() {
  return (
    <ProtectedRoute requiredRole="USER">
      <RegisterReportContent />
    </ProtectedRoute>
  );
}

function RegisterReportContent() {
  const { profile } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState('');
  const [severity, setSeverity] = useState<'BAIXA' | 'MEDIA' | 'ALTA'>('MEDIA');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addressText, setAddressText] = useState('');
  const [aiClassification, setAiClassification] = useState('');
  const [riskScore, setRiskScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (error) {
      toast.error('Não foi possível acessar a câmera');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setPhoto(photoData);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.success('Localização capturada com sucesso');
        },
        (error) => {
          toast.error('Não foi possível obter a localização');
        }
      );
    } else {
      toast.error('Geolocalização não suportada pelo navegador');
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value);
    const classification = getAIClassification(value);
    setAiClassification(classification);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!photo) {
      toast.error('Por favor, capture uma foto da situação de risco');
      return;
    }

    if (!type) {
      toast.error('Por favor, selecione o tipo de risco');
      return;
    }

    const reportsToday = await checkDailyLimit();
    if (reportsToday >= 3) {
      toast.error('Você atingiu o limite de 3 registros por dia');
      return;
    }

    setLoading(true);

    try {
      const score = calculateRiskScore(
        severity,
        location !== null,
        description.length
      );
      setRiskScore(score);

      const { error } = await supabase
        .from('reports')
        .insert({
          user_id: profile!.id,
          type,
          severity,
          risk_score: score,
          status: 'PENDING',
          lat: location?.lat || null,
          lng: location?.lng || null,
          address_text: addressText || null,
          description,
          photo_url: photo,
          ai_classification: aiClassification
        });

      if (error) {
        toast.error('Erro ao enviar registro');
        console.error(error);
      } else {
        setShowSuccess(true);
        toast.success('Registro enviado com sucesso!');
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      }
    } catch (error) {
      toast.error('Erro ao enviar registro');
    } finally {
      setLoading(false);
    }
  };

  const checkDailyLimit = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('reports')
      .select('id')
      .eq('user_id', profile!.id)
      .gte('created_at', today.toISOString());

    return data?.length || 0;
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Registro Enviado!</h2>
            <p className="text-gray-600 mb-4">
              Seu registro preventivo foi enviado para validação. Você será notificado quando for analisado pela equipe técnica.
            </p>
            <Alert className="mb-6 text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Mensagem educativa:</strong><br />
                {getEducationalMessage(type)}
              </AlertDescription>
            </Alert>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>Score de risco estimado: <strong>{riskScore}/100</strong></p>
              <p>Status: <strong>Aguardando validação</strong></p>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard">Voltar ao Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Registrar Situação de Risco</h1>
        <p className="text-gray-600 mb-8">
          Documente situações de risco próximas à rede elétrica para gerar ações preventivas
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Capturar Evidência</CardTitle>
              <CardDescription>
                Tire uma foto clara da situação de risco identificada
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!photo && !cameraActive && (
                <Button type="button" onClick={startCamera} className="w-full">
                  <Camera className="h-4 w-4 mr-2" />
                  Abrir Câmera
                </Button>
              )}

              {cameraActive && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={capturePhoto} className="flex-1">
                      Capturar Foto
                    </Button>
                    <Button type="button" onClick={stopCamera} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {photo && (
                <div className="space-y-4">
                  <img src={photo} alt="Foto capturada" className="w-full rounded-lg" />
                  <Button
                    type="button"
                    onClick={() => {
                      setPhoto(null);
                      startCamera();
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Tirar Nova Foto
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. Classificar Risco</CardTitle>
              <CardDescription>
                Forneça detalhes sobre a situação identificada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="type">Tipo de Risco *</Label>
                <Select value={type} onValueChange={handleTypeChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {RISK_TYPES.map((riskType) => (
                      <SelectItem key={riskType} value={riskType}>
                        {riskType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severidade *</Label>
                <Select value={severity} onValueChange={(v: any) => setSeverity(v)} required>
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
              </div>

              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva a situação de risco observada..."
                  rows={4}
                  maxLength={280}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {description.length}/280 caracteres
                </p>
              </div>

              {aiClassification && (
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <strong>SafeScan AI:</strong> {aiClassification}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Localização</CardTitle>
              <CardDescription>
                Ajuda a mapear zonas de risco (opcional mas recomendado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                type="button"
                onClick={getLocation}
                variant="outline"
                className="w-full"
              >
                <MapPin className="h-4 w-4 mr-2" />
                {location ? 'Localização Capturada ✓' : 'Capturar GPS'}
              </Button>

              {location && (
                <p className="text-sm text-gray-600">
                  Coordenadas: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}

              <div>
                <Label htmlFor="address">Endereço ou Referência</Label>
                <Input
                  id="address"
                  value={addressText}
                  onChange={(e) => setAddressText(e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                />
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lembre-se:</strong> Este não é um sistema de denúncia. Registramos situações de risco
              para gerar dados preventivos e proteger a comunidade.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button type="button" variant="outline" asChild className="flex-1">
              <Link href="/dashboard">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={loading || !photo} className="flex-1">
              {loading ? 'Enviando...' : 'Enviar Registro'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
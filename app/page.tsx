'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Eye, Award, MapPin, AlertTriangle, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    if (!loading && user && profile) {
      if (profile.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Rede Sentinela</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setAuthMode('user'); setShowAuthDialog(true); }}>
              Entrar como Cidadão
            </Button>
            <Button onClick={() => { setAuthMode('admin'); setShowAuthDialog(true); }}>
              Entrar como Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Prevenção Ativa de Acidentes
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transforme risco invisível em evidência. Registre situações de risco próximas à rede elétrica
            e ajude a proteger sua comunidade antes que acidentes aconteçam.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => { setAuthMode('user'); setShowAuthDialog(true); }}>
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => { setAuthMode('admin'); setShowAuthDialog(true); }}>
              Acesso Administrativo
            </Button>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <Eye className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Identificação Precoce</h3>
              <p className="text-gray-600">
                Registre quase-acidentes e situações de risco iminente antes que se tornem tragédias.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <MapPin className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Dados Acionáveis</h3>
              <p className="text-gray-600">
                Gere mapas de calor e identifique zonas críticas para ações preventivas direcionadas.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <Award className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Reconhecimento</h3>
              <p className="text-gray-600">
                Ganhe pontos e certificados por contribuir ativamente com a segurança da sua região.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 bg-blue-50 rounded-2xl">
          <h3 className="text-3xl font-bold text-center mb-12">Como Funciona</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h4 className="font-semibold mb-2">Registre</h4>
              <p className="text-sm text-gray-600">Capture foto e descreva a situação de risco identificada</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h4 className="font-semibold mb-2">SafeScan AI</h4>
              <p className="text-sm text-gray-600">Sistema analisa e classifica o nível de risco automaticamente</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h4 className="font-semibold mb-2">Validação</h4>
              <p className="text-sm text-gray-600">Equipe técnica valida e classifica os registros</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">4</div>
              <h4 className="font-semibold mb-2">Prevenção</h4>
              <p className="text-sm text-gray-600">Dados geram ações preventivas e você ganha reconhecimento</p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-12 rounded-2xl text-center">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4">Não é um Sistema de Denúncia</h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              A Rede Sentinela é uma ferramenta de prevenção ativa. Registramos quase-acidentes e situações de risco
              para gerar inteligência preventiva, não para responsabilizar indivíduos.
            </p>
            <p className="text-sm opacity-90">
              Dados agregados são anonimizados e utilizados exclusivamente para planejamento de ações preventivas.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">Rede Sentinela - Sistema de Prevenção Ativa de Acidentes</p>
          <p className="text-sm">Transformando vigilância cidadã em segurança coletiva</p>
        </div>
      </footer>

      <AuthDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        mode={authMode}
      />
    </div>
  );
}

function AuthDialog({ open, onOpenChange, mode }: { open: boolean; onOpenChange: (open: boolean) => void; mode: 'user' | 'admin' }) {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Erro ao fazer login. Verifique suas credenciais.');
        } else {
          toast.success('Login realizado com sucesso!');
          onOpenChange(false);
        }
      } else {
        if (!name.trim()) {
          toast.error('Por favor, insira seu nome completo.');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
        if (error) {
          toast.error('Erro ao criar conta. Tente novamente.');
        } else {
          toast.success('Conta criada com sucesso!');
          onOpenChange(false);
        }
      }
    } catch (error) {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'admin' ? 'Acesso Administrativo' : 'Acesso do Cidadão'}
          </DialogTitle>
          <DialogDescription>
            {isLogin ? 'Entre com suas credenciais' : 'Crie sua conta para começar'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email-register">Email</Label>
                <Input
                  id="email-register"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password-register">Senha</Label>
                <Input
                  id="password-register"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {mode === 'admin' && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Para testar: admin@redesentinela.com / Admin@123
          </p>
        )}
        {mode === 'user' && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Para testar: maria@example.com / User@123
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

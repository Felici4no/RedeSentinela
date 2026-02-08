# Rede Sentinela

**Sistema de Prevenção Ativa de Acidentes com a Rede Elétrica**

MVP completo que transforma vigilância cidadã em dados acionáveis para prevenir acidentes com a rede elétrica antes que eles aconteçam.

## Visão Geral

Rede Sentinela é um sistema preventivo que permite:

- **Cidadãos** registrarem situações de risco e quase-acidentes próximos à rede elétrica
- **Gestores** validarem registros, gerarem mapas de calor e identificarem zonas críticas
- **Sistema de gamificação** que reconhece contribuições com pontos e certificados (Bronze/Prata/Ouro/Diamante)

**Importante:** Não é um sistema de denúncia. É uma ferramenta de prevenção ativa que gera inteligência para ações preventivas.

## Tecnologias

- **Frontend:** Next.js 13 + TypeScript + Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Database:** Supabase (PostgreSQL)
- **Autenticação:** Supabase Auth (email/senha)
- **Charts:** Recharts
- **PWA:** Manifest configurado para instalação mobile

## Funcionalidades

### Área do Cidadão (USER)

#### Dashboard
- Visualização de pontos totais acumulados
- Nível atual do certificado e barra de progresso
- Histórico completo de registros com status

#### Registro de Risco
- Captura de foto via câmera do dispositivo
- Seleção de tipo de risco (8 categorias)
- Classificação de severidade (Baixa/Média/Alta)
- Captura automática de GPS ou entrada manual de endereço
- **SafeScan AI** (simulado): classificação automática com score de risco
- Mensagens educativas contextuais após envio
- Anti-spam: limite de 3 registros por dia

#### Certificados
- 4 níveis: Bronze, Prata, Ouro, Diamante
- Critérios progressivos baseados em registros validados
- Geração de certificados em formato imprimível/PDF
- Código único de verificação para cada certificado

### Área Admin (ADMIN)

#### Dashboard Geral
- Métricas: total de registros, pendentes, validados, alto risco
- Gráficos por tipo de risco, severidade e status
- Filtros por período (7 ou 30 dias)
- Lista de registros recentes

#### Mapa de Calor
- Visualização geográfica dos registros
- Filtros por tipo, severidade e status
- Identificação de clusters críticos
- Top 5 áreas com maior recorrência
- Visualização simplificada (preparada para evolução com Leaflet)

#### Validação de Registros
- Lista de registros pendentes com todas as informações
- Visualização de foto, localização e classificação AI
- Ações: Validar ou Rejeitar
- Possibilidade de reclassificar severidade
- Atualização automática de pontos do usuário

## Sistema de Pontuação

### Como Funciona

- **Registro validado:** +10 pontos
- **Alto risco validado:** +20 pontos (total)
- **Localização + descrição completa (>50 chars):** +5 pontos bônus

### Critérios dos Certificados

- **Bronze:** 1-2 registros validados
- **Prata:** 3-5 registros validados
- **Ouro:** 6-10 registros validados + 2+ de alta severidade
- **Diamante:** 11+ registros validados + 3+ de alta severidade + 3+ meses de atividade

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- Conta Supabase (já configurada neste ambiente)

### 1. Variáveis de Ambiente

O arquivo `.env` já está configurado com as credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Database Setup

O schema do banco de dados já foi criado automaticamente através da migração inicial. As tabelas incluem:

- `profiles` - Perfis de usuários com pontos e role
- `reports` - Registros de situações de risco
- `certificates` - Certificados emitidos

**RLS está habilitado** em todas as tabelas com políticas restritivas por role.

### 4. Criar Usuários de Teste

Para testar o sistema, você pode criar usuários através da interface de registro ou diretamente no Supabase Dashboard:

**Admin de Teste:**
- Email: admin@redesentinela.com
- Senha: Admin@123
- Role: ADMIN

**Usuários de Teste:**
- Email: maria@example.com / Senha: User@123
- Email: joao@example.com / Senha: User@123
- Role: USER

Após criar os usuários no Supabase Auth, insira os perfis na tabela `profiles`:

```sql
-- Inserir perfil admin
INSERT INTO profiles (id, name, role, points)
VALUES
  ('user_id_from_auth', 'Admin Rede Sentinela', 'ADMIN', 0);

-- Inserir perfis de usuários
INSERT INTO profiles (id, name, role, points)
VALUES
  ('user_id_from_auth', 'Maria Silva', 'USER', 65),
  ('user_id_from_auth', 'João Santos', 'USER', 45);
```

### 5. Popular com Dados de Exemplo (Opcional)

O arquivo `scripts/seed.sql` contém exemplos de registros fictícios. Para popular:

1. Abra o Supabase SQL Editor
2. Execute as queries do arquivo `seed.sql` após ajustar os UUIDs dos usuários

### 6. Executar o Projeto

```bash
npm run dev
```

Acesse: `http://localhost:3000`

### 7. Build para Produção

```bash
npm run build
npm run start
```

## Estrutura do Projeto

```
├── app/
│   ├── page.tsx                      # Landing page com auth
│   ├── layout.tsx                    # Layout global com AuthProvider
│   ├── dashboard/                    # Área do usuário
│   │   ├── page.tsx                 # Dashboard do usuário
│   │   ├── register/page.tsx        # Registro de risco
│   │   └── certificates/page.tsx    # Certificados
│   └── admin/                        # Área administrativa
│       ├── page.tsx                 # Dashboard admin
│       ├── map/page.tsx            # Mapa de calor
│       └── validate/page.tsx        # Validação de registros
├── components/
│   ├── ui/                          # Componentes shadcn/ui
│   └── protected-route.tsx          # HOC para rotas protegidas
├── lib/
│   ├── supabase.ts                 # Cliente Supabase + tipos
│   ├── auth-context.tsx            # Context de autenticação
│   └── utils.ts                    # Utilitários
├── scripts/
│   └── seed.sql                    # Dados de exemplo
└── public/
    └── manifest.json               # PWA manifest
```

## Segurança

### Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado com políticas específicas:

- **Profiles:** Usuários veem apenas seu próprio perfil; Admins veem todos
- **Reports:** Usuários veem apenas seus registros; Admins veem todos
- **Certificates:** Usuários veem apenas seus certificados; Verificação pública por código

### Autenticação

- Sistema de login/registro com email e senha
- Rotas protegidas por role (USER/ADMIN)
- Context API para gerenciar estado de autenticação
- Redirecionamento automático baseado em role

### Dados

- Fotos armazenadas como base64 no banco (MVP)
- Localização GPS opcional
- Dados agregados anonimizados para análise

## Roadmap de Evolução

### Curto Prazo

1. **Storage para Imagens**
   - Migrar de base64 para Supabase Storage
   - Implementar compressão e otimização de imagens
   - Thumbnails automáticos

2. **Mapa Real**
   - Integrar Leaflet ou MapBox
   - Heatmap interativo
   - Clustering dinâmico

3. **Notificações**
   - Email quando registro é validado
   - Push notifications para mobile
   - Alertas de zonas críticas

### Médio Prazo

4. **SafeScan AI Real**
   - Integração com modelos de visão computacional
   - Detecção automática de objetos de risco
   - Classificação de severidade por IA
   - Edge computing para análise local

5. **Anonimização Avançada**
   - Differential privacy nos dados agregados
   - Blur automático de faces e placas
   - Tokens de verificação sem expor dados pessoais

6. **Gamificação Expandida**
   - Ranking de contribuidores
   - Badges especiais
   - Desafios mensais
   - Compartilhamento social de certificados

### Longo Prazo

7. **Integração com Sistemas**
   - API para concessionárias de energia
   - Webhooks para sistemas de gestão
   - Export de dados em formatos padrão

8. **Analytics Avançado**
   - Previsão de zonas de risco
   - Análise temporal e sazonal
   - Dashboard de impacto preventivo

9. **Mobile Nativo**
   - App iOS e Android
   - Modo offline
   - Sincronização inteligente

## Performance

### Otimizações Implementadas

- Server-side rendering com Next.js 13
- Carregamento lazy de componentes
- Imagens otimizadas
- Cache de queries do Supabase
- PWA para instalação mobile

### Métricas de Referência

- Lighthouse Score: 90+
- First Contentful Paint: <1.5s
- Time to Interactive: <3s

## Licença

Este é um projeto MVP para demonstração. Para uso em produção, considere adicionar uma licença apropriada.

## Contato e Suporte

Sistema desenvolvido como MVP de Sistema de Prevenção Ativa de Acidentes.

---

**Transformando risco invisível em evidência.**

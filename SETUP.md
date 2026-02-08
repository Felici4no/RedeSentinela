# Configuração Inicial - Rede Sentinela

## Passo a Passo para Configurar o Sistema

### 1. Criar Usuários de Teste no Supabase

Acesse o Supabase Dashboard e crie os seguintes usuários:

#### Admin
1. Vá para Authentication > Users > Add user
2. Email: `admin@redesentinela.com`
3. Senha: `Admin@123`
4. Salve o ID do usuário criado

#### Usuário 1
1. Email: `maria@example.com`
2. Senha: `User@123`
3. Salve o ID do usuário criado

#### Usuário 2
1. Email: `joao@example.com`
2. Senha: `User@123`
3. Salve o ID do usuário criado

### 2. Inserir Perfis no Banco de Dados

No SQL Editor do Supabase, execute as seguintes queries (substitua os UUIDs pelos IDs criados acima):

```sql
-- Inserir perfil do admin
INSERT INTO profiles (id, name, role, points)
VALUES
  ('COLE_O_UUID_DO_ADMIN_AQUI', 'Admin Rede Sentinela', 'ADMIN', 0);

-- Inserir perfis dos usuários
INSERT INTO profiles (id, name, role, points)
VALUES
  ('COLE_O_UUID_DA_MARIA_AQUI', 'Maria Silva', 'USER', 0),
  ('COLE_O_UUID_DO_JOAO_AQUI', 'João Santos', 'USER', 0);
```

### 3. (Opcional) Popular com Registros de Exemplo

Se quiser ter alguns registros de exemplo para visualização, use as queries no arquivo `scripts/seed.sql`.

**IMPORTANTE:** Ajuste os UUIDs dos usuários nas queries antes de executar.

### 4. Testar o Sistema

Agora você pode fazer login com qualquer uma das contas criadas:

**Admin:**
- URL: http://localhost:3000
- Clique em "Entrar como Admin"
- Email: admin@redesentinela.com
- Senha: Admin@123

**Cidadão (Maria):**
- URL: http://localhost:3000
- Clique em "Entrar como Cidadão"
- Email: maria@example.com
- Senha: User@123

### 5. Fluxo de Teste Recomendado

#### Como Cidadão:
1. Acesse o dashboard
2. Clique em "Novo Registro"
3. Capture uma foto (ou permita acesso à câmera)
4. Preencha o formulário
5. Envie o registro
6. Verifique que o registro aparece no dashboard como "Pendente"

#### Como Admin:
1. Acesse o dashboard admin
2. Veja as métricas gerais
3. Vá para "Validação"
4. Valide ou rejeite os registros pendentes
5. Vá para "Mapa de Calor" para ver a distribuição geográfica

#### Como Cidadão (novamente):
1. Volte ao dashboard do cidadão
2. Veja que o registro foi validado
3. Veja os pontos ganhos
4. Vá para "Certificados"
5. Veja seu progresso e certificados conquistados

## Troubleshooting

### Erro ao fazer login
- Verifique se o usuário foi criado corretamente no Supabase Auth
- Verifique se o perfil foi inserido na tabela `profiles`
- Verifique se o UUID no perfil corresponde ao UUID do usuário no Auth

### Erro de permissão ao acessar dados
- Verifique se as políticas RLS estão habilitadas
- Verifique se o role do usuário está correto (USER ou ADMIN)

### Registros não aparecem
- Verifique se o usuário está logado
- Verifique se as políticas RLS permitem o acesso
- Abra o console do navegador para ver erros

## Próximos Passos

Depois de testar o MVP, considere:

1. **Adicionar Storage para Imagens:** Migrar fotos de base64 para Supabase Storage
2. **Implementar Notificações:** Email quando registro é validado
3. **Integrar Mapa Real:** Usar Leaflet ou MapBox para visualização interativa
4. **Melhorar SafeScan AI:** Integrar com modelos de visão computacional reais
5. **Mobile App:** Criar app nativo para iOS e Android

Consulte o README.md para mais informações sobre o roadmap completo.

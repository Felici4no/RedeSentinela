-- Seed data para Rede Sentinela
-- Este script cria usuários de exemplo e registros fictícios

-- NOTA: Para criar usuários no Supabase, use o dashboard ou a API
-- Este script assume que os usuários já foram criados no auth.users

-- Exemplos de coordenadas em diferentes regiões do Brasil
-- São Paulo centro: -23.550520, -46.633308
-- Rio de Janeiro: -22.906847, -43.172896
-- Belo Horizonte: -19.916681, -43.934493

-- Inserir profiles de exemplo (ajuste os UUIDs conforme necessário)
-- ADMIN: admin@redesentinela.com / senha: Admin@123
-- USER1: maria@example.com / senha: User@123
-- USER2: joao@example.com / senha: User@123

-- Nota: Execute manualmente ou via Supabase Dashboard após criar os usuários

-- Exemplos de INSERT para reports (após criar os usuários)
/*
INSERT INTO reports (user_id, type, severity, risk_score, status, lat, lng, address_text, description, photo_url, ai_classification, created_at, validated_at) VALUES
-- Registros validados de Maria (user1)
((SELECT id FROM profiles WHERE name = 'Maria Silva'), 'Construção civil', 'ALTA', 85, 'VALIDATED', -23.550520, -46.633308, 'Av. Paulista, 1000 - Bela Vista, São Paulo', 'Andaime muito próximo da rede elétrica, risco de contato durante movimentação', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFuZGFpbWUgcHLDs3hpbW8gw6AgcmVkZTwvdGV4dD48L3N2Zz4=', 'Possível estrutura metálica próxima a cabos', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'),

((SELECT id FROM profiles WHERE name = 'Maria Silva'), 'Poda', 'MEDIA', 60, 'VALIDATED', -23.557520, -46.635308, 'Rua Augusta, 500 - Consolação, São Paulo', 'Árvore com galhos tocando fiação, necessita poda urgente', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPsOBcnZvcmUgdG9jYW5kbyBmaW88L3RleHQ+PC9zdmc+', 'Vegetação próxima a rede elétrica', NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'),

((SELECT id FROM profiles WHERE name = 'Maria Silva'), 'Cabo no solo', 'ALTA', 90, 'VALIDATED', -23.545520, -46.640308, 'Rua da Consolação, 2000 - Consolação, São Paulo', 'Cabo partido caído no chão após tempestade, área isolada pelos moradores', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNhYm8gbm8gc29sbzwvdGV4dD48L3N2Zz4=', 'Cabo energizado detectado', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

-- Registros validados de João (user2)
((SELECT id FROM profiles WHERE name = 'João Santos'), 'Máquinas agrícolas', 'MEDIA', 65, 'VALIDATED', -22.906847, -43.172896, 'Zona Rural, Km 15 - Santa Cruz, Rio de Janeiro', 'Colheitadeira alta operando próxima à rede de transmissão', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNvbGhlaXRhZGVpcmEgYWx0YTwvdGV4dD48L3N2Zz4=', 'Veículo alto próximo a rede', NOW() - INTERVAL '8 days', NOW() - INTERVAL '7 days'),

((SELECT id FROM profiles WHERE name = 'João Santos'), 'Poste danificado', 'ALTA', 80, 'VALIDATED', -22.910847, -43.176896, 'Rua das Flores, 200 - Campo Grande, Rio de Janeiro', 'Poste inclinado após colisão, risco de queda e rompimento de cabos', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBvc3RlIGluY2xpbmFkbzwvdGV4dD48L3N2Zz4=', 'Estrutura danificada detectada', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

-- Registros pendentes (não validados ainda)
((SELECT id FROM profiles WHERE name = 'Maria Silva'), 'Pipa', 'BAIXA', 40, 'PENDING', -23.560520, -46.638308, 'Praça da República - República, São Paulo', 'Criança empinando pipa próxima à rede, possível risco', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlBpcGEgcHLDs3hpbWE8L3RleHQ+PC9zdmc+', 'Objeto voador detectado', NOW() - INTERVAL '1 day', NULL),

((SELECT id FROM profiles WHERE name = 'João Santos'), 'Veículos altos', 'MEDIA', 70, 'PENDING', -22.915847, -43.180896, 'Av. Brasil, Km 30 - Paciência, Rio de Janeiro', 'Caminhão basculante com caçamba levantada sob fiação', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNhbWluw6NvIGFsdG88L3RleHQ+PC9zdmc+', 'Veículo alto em movimento', NOW() - INTERVAL '6 hours', NULL),

((SELECT id FROM profiles WHERE name = 'Maria Silva'), 'Outro', 'MEDIA', 55, 'PENDING', -23.548520, -46.642308, 'Rua Oscar Freire, 800 - Jardins, São Paulo', 'Decoração de natal com estrutura metálica próxima à fiação', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkRlY29yYcOnw6NvIG1ldMOhbGljYTwvdGV4dD48L3N2Zz4=', 'Objeto metálico próximo', NOW() - INTERVAL '2 hours', NULL),

-- Registros adicionais em outras localidades (Belo Horizonte)
((SELECT id FROM profiles WHERE name = 'João Santos'), 'Construção civil', 'ALTA', 88, 'PENDING', -19.916681, -43.934493, 'Av. Afonso Pena, 1500 - Centro, Belo Horizonte', 'Guindaste operando muito próximo à linha de alta tensão', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkd1aW5kYXN0ZSBhbHRvPC90ZXh0Pjwvc3ZnPg==', 'Maquinário de construção detectado', NOW() - INTERVAL '12 hours', NULL),

((SELECT id FROM profiles WHERE name = 'Maria Silva'), 'Poda', 'BAIXA', 45, 'PENDING', -19.920681, -43.938493, 'Rua da Bahia, 1000 - Centro, Belo Horizonte', 'Galhos crescendo em direção aos fios, requer manutenção preventiva', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkdhbGhvcyBjcmVzY2VuZG88L3RleHQ+PC9zdmc+', 'Vegetação crescendo', NOW() - INTERVAL '3 hours', NULL);
*/

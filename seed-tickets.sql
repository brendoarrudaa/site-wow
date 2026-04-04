USE acore_auth;

INSERT INTO tickets (account_id, username, email, category, priority, subject, status) VALUES
  (2, 'TESTANDO', 'testando@email.com', 'bug',        'high',   'Personagem travado em Dalaran apos DC', 'open'),
  (2, 'TESTANDO', 'testando@email.com', 'character',  'medium', 'Talentos resetados sem motivo',         'open'),
  (2, 'TESTANDO', 'testando@email.com', 'account',    'high',   'Nao consigo logar - senha correta',     'in-progress'),
  (2, 'TESTANDO', 'testando@email.com', 'report',     'medium', 'Player usando speed hack na BG',        'open'),
  (2, 'TESTANDO', 'testando@email.com', 'suggestion', 'low',    'Adicionar evento de Natal no servidor', 'open'),
  (2, 'TESTANDO', 'testando@email.com', 'bug',        'medium', 'Quest A Espada Quebrada nao completa',  'in-progress'),
  (1, 'ADMIN',    'admin@email.com',    'other',      'low',    'Teste interno de sistema',              'resolved'),
  (2, 'TESTANDO', 'testando@email.com', 'character',  'high',   'Item sumiu do inventario apos restart', 'open');

INSERT INTO ticket_messages (ticket_id, author, content, is_staff) VALUES
  (1, 'TESTANDO', 'Estava em Dalaran e o servidor deu DC. Quando reconectei meu personagem ficou invisivel e nao consigo me mover. Ja tentei reconectar 3 vezes.', 0),
  (2, 'TESTANDO', 'Meus talentos foram resetados do nada. Estou com o spec errado agora e perdi todos os pontos configurados.', 0),
  (3, 'TESTANDO', 'Tentei logar hoje e aparece informacoes invalidas, mas tenho certeza que a senha esta certa. Ja usei o reset e continua.', 0),
  (3, 'ADMIN',    'Verificamos sua conta. Identificamos uma tentativa de acesso suspeita. Por seguranca, bloqueamos temporariamente. Estamos desbloqueando agora.', 1),
  (4, 'TESTANDO', 'Player Speedster estava claramente se movendo mais rapido que o normal na Battleground. Gravei prints.', 0),
  (5, 'TESTANDO', 'Seria incrivel ter um evento de Natal com boss especial e drops tematicos. Outros servidores fazem isso e e muito divertido!', 0),
  (6, 'TESTANDO', 'A quest A Espada Quebrada no Eversong Woods nao completa o objetivo mesmo depois de entregar o item para o NPC correto.', 0),
  (6, 'ADMIN',    'Encontramos o problema! E um bug conhecido no script do NPC. Ja corrigimos na proxima atualizacao. Tente abandonar e pegar a quest novamente.', 1),
  (7, 'ADMIN',    'Ticket de teste do sistema de suporte. Tudo funcionando corretamente.', 0),
  (8, 'TESTANDO', 'Tinha uma Hearthstone no inventario e depois do restart ela desapareceu. Verifico meu banco e correio mas nao encontrei.', 0);

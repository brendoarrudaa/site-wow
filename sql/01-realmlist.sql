-- ============================================================================
-- 01-realmlist.sql
-- Configura o realm em acore_auth.realmlist
--
-- Como aplicar:
--   docker exec -i ac-database mysql -uroot -ppassword < sql/01-realmlist.sql
--
-- Variáveis para ajustar:
--   address  → IP público do servidor (ou 127.0.0.1 para dev local)
--   name     → Nome do realm exibido no client
--   port     → Porta do worldserver (padrão 8085)
--   gamebuild→ 12340 = WotLK 3.3.5a
-- ============================================================================

-- Atualiza o realm existente (id=1) ou insere se não existir
INSERT INTO acore_auth.realmlist
  (id, name, address, localAddress, localSubnetMask, port, icon, flag, timezone, allowedSecurityLevel, gamebuild)
VALUES
  (1, 'Azeroth Legacy', '127.0.0.1', '127.0.0.1', '255.255.255.0', 8085, 1, 0, 8, 0, 12340)
ON DUPLICATE KEY UPDATE
  name               = VALUES(name),
  address            = VALUES(address),
  localAddress       = VALUES(localAddress),
  port               = VALUES(port),
  gamebuild          = VALUES(gamebuild);

SELECT id, name, address, port, gamebuild FROM acore_auth.realmlist;

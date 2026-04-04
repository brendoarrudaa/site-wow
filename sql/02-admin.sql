-- ============================================================================
-- 02-admin.sql
-- Promove uma conta para GM/Admin em acore_auth.account_access
--
-- Como aplicar:
--   docker exec -i ac-database mysql -uroot -ppassword < sql/02-admin.sql
--
-- Níveis de GM (gmlevel):
--   0 = Jogador normal
--   1 = Moderador (kick, mute)
--   2 = GM (comandos básicos) — mínimo para acessar painel do site
--   3 = Administrador (comandos avançados)
--   4 = Console / Super Admin
--
-- IMPORTANTE: troque 'ADMIN' pelo username da conta desejada (case-insensitive
-- na tabela, mas guarde em MAIÚSCULAS como o AzerothCore armazena).
-- ============================================================================

SET @target_username = 'ADMIN';  -- << TROQUE AQUI
SET @gmlevel         = 3;        -- << nível desejado (2, 3 ou 4)

-- Insere ou atualiza o nível de acesso
INSERT INTO acore_auth.account_access (id, gmlevel, RealmID, comment)
SELECT
  a.id,
  @gmlevel,
  -1,                              -- -1 = vale para todos os realms
  CONCAT('Admin via site-wow setup — ', NOW())
FROM acore_auth.account a
WHERE UPPER(a.username) = UPPER(@target_username)
ON DUPLICATE KEY UPDATE
  gmlevel = @gmlevel,
  comment = CONCAT('Atualizado via site-wow setup — ', NOW());

-- Confirmação
SELECT
  a.id,
  a.username,
  aa.gmlevel,
  aa.RealmID,
  aa.comment
FROM acore_auth.account a
JOIN acore_auth.account_access aa ON aa.id = a.id
WHERE UPPER(a.username) = UPPER(@target_username);

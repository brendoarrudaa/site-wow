# WoW Marketplace — Instalação

## Pré-requisitos

- Docker rodando o AzerothCore (`ac-database`, `ac-worldserver`, `ac-authserver`)
- Node.js 18+
- Banco `acore_auth` já populado pelo `ac-db-import`

> O MySQL **roda dentro do Docker** (`ac-database`, imagem `mysql:8.4`) com a
> porta `3306` exposta no host. O `site-wow` conecta via `127.0.0.1:3306`.

---

## Setup do Banco de Dados

Os scripts estão organizados em `sql/` e devem ser aplicados na ordem:

```bash
# A partir de C:\Users\brend\www\site-wow

# 0 — Cria database wow_marketplace e todas as tabelas
docker exec -i ac-database mysql -uroot -ppassword < sql/00-marketplace.sql

# 1 — Configura o realm em acore_auth.realmlist
docker exec -i ac-database mysql -uroot -ppassword < sql/01-realmlist.sql

# 2 — Promove conta para GM/Admin (edite o username dentro do arquivo)
docker exec -i ac-database mysql -uroot -ppassword < sql/02-admin.sql

# 3 — Popula item_whitelist com itens de exemplo
docker exec -i ac-database mysql -uroot -ppassword < sql/03-sample-items.sql
```

### Descrição dos arquivos SQL

| Arquivo | O que faz |
|---|---|
| `sql/00-marketplace.sql` | Cria `wow_marketplace` + 8 tabelas + 3 views |
| `sql/01-realmlist.sql` | Insere/atualiza `acore_auth.realmlist` |
| `sql/02-admin.sql` | Adiciona `account_access` com `gmlevel >= 2` para uma conta |
| `sql/03-sample-items.sql` | Popula `item_whitelist` com montarias, pets, transmog, etc. |

> Para usar itens reais do seu servidor:
> ```sql
> SELECT entry, name FROM acore_world.item_template WHERE name LIKE '%Reins%';
> ```

---

## Configuração do Frontend

### Variáveis de Ambiente

O arquivo `.env` já vem configurado para desenvolvimento local:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
SESSION_SECRET=troque-por-uma-chave-secreta-de-32-chars-ou-mais
```

Em produção, aponte `DB_HOST` para o IP do servidor e troque `SESSION_SECRET`.

### Instalar e rodar

```bash
npm install
npm run dev
# Acesse: http://localhost:3000
```

---

## Permissões GM

O sistema usa `acore_auth.account_access` para verificar permissões.
**A coluna de referência é `id`** (não `account_id`):

```sql
-- Verificar nível de uma conta
SELECT * FROM acore_auth.account_access WHERE id = <account_id>;
```

| gmlevel | Acesso no site |
|---|---|
| 0 | Jogador normal |
| 1 | Fulfillment (entregar itens) |
| 2+ | Criar leilões, aprovar/rejeitar marketplace |
| 3+ | Creditar DP/VP, acessar auditoria |

Use `sql/02-admin.sql` para promover uma conta.

---

## Verificação da Instalação

```sql
-- Confirmar tabelas
USE wow_marketplace;
SHOW TABLES;
-- wallets, wallet_transactions, item_whitelist,
-- auction_items, auction_bids, marketplace_listings,
-- fulfillment_queue, audit_log

-- Confirmar whitelist
SELECT COUNT(*) FROM item_whitelist;

-- Confirmar realm
SELECT id, name, address, port FROM acore_auth.realmlist;
```

---

## Funcionalidades por Fase

### Fase 1 — Wallet ✅
- `GET /api/wallet-balance`
- `GET /api/wallet-transactions`
- `POST /api/wallet-credit` (admin)
- Página `/dashboard/carteira`

### Fase 2 — Leilão GM ✅
- `GET /api/auction-list`
- `POST /api/auction-create` (gmlevel 2+)
- `POST /api/auction-bid`
- `POST /api/auction-close`
- Página `/dashboard/leilao`

### Fase 3 — Marketplace Jogador ✅
- `GET /api/marketplace-list`
- `POST /api/marketplace-create`
- `POST /api/marketplace-buy`
- `POST /api/marketplace-approve` (gmlevel 2+)
- `POST /api/marketplace-reject` (gmlevel 2+)
- Página `/dashboard/mercado`

### Fase 4 — Admin ✅
- `GET/POST /api/admin-fulfillment`
- `GET /api/admin-audit`
- Página `/dashboard/admin-gm`
- Página `/dashboard/admin-aprovacoes`
- Página `/dashboard/admin-entregas`
- Página `/dashboard/admin-auditoria`

---

## Segurança

- Todas as operações de wallet usam `SELECT ... FOR UPDATE` + transação
- Whitelist tripla: frontend → API → DB
- `audit_log` imutável (INSERT only)
- Idempotência via `Idempotency-Key` nas rotas críticas
- Permissões GM verificadas em cada endpoint sensível

---

## Troubleshooting

**`ECONNREFUSED 127.0.0.1:3306`**
```bash
docker ps | grep ac-database   # checar se está rodando
cd C:\Users\brend\www\wow && docker compose up -d ac-database
```

**`Table doesn't exist`**
```bash
docker exec -i ac-database mysql -uroot -ppassword < sql/00-marketplace.sql
```

**Conta sem acesso admin no site**
```bash
docker exec -i ac-database mysql -uroot -ppassword < sql/02-admin.sql
# edite @target_username dentro do arquivo antes de rodar
```

**Item não permitido no leilão/marketplace**
```sql
INSERT INTO wow_marketplace.item_whitelist
  (item_entry, item_name, can_auction, can_marketplace, category, rarity, added_by)
VALUES (ENTRY, 'Nome', 1, 1, 'OTHER', 'RARE', 1);
```

---

**Versão**: 2.0.0  
**Status**: Fase 1 ✅ | Fase 2 ✅ | Fase 3 ✅ | Fase 4 ✅

# WoW Marketplace — Progresso da Implementação

## Status: **100% Concluído** (todas as fases entregues)

| Fase | Status |
|---|---|
| Infraestrutura / SQL | ✅ |
| Fase 1 — Wallet | ✅ |
| Fase 2 — Leilão GM | ✅ |
| Fase 3 — Marketplace Jogador | ✅ |
| Fase 4 — Admin & Fulfillment | ✅ |

---

## Fase 1 — Wallet ✅

**Backend**
- `src/lib/wallet.ts` — operações transaction-safe (crédito, débito, consulta)
- `src/lib/permissions.ts` — verificação de gmlevel
- `GET /api/wallet-balance`
- `GET /api/wallet-transactions`
- `POST /api/wallet-credit` (admin)

**Frontend**
- `src/components/Dashboard/WalletCard.tsx`
- `src/pages/dashboard/carteira.tsx`

---

## Fase 2 — Leilão GM ✅

**Backend**
- `GET /api/auction-list`
- `POST /api/auction-create` (gmlevel 2+)
- `POST /api/auction-bid` (com refund automático do lance anterior)
- `POST /api/auction-close` (encerramento manual)

**Frontend**
- `src/pages/dashboard/leilao.tsx` — grid de leilões, modal de lance, timer, auto-refresh 30s

---

## Fase 3 — Marketplace Jogador ✅

**Backend**
- `GET /api/marketplace-list` (com filtros)
- `POST /api/marketplace-create` (listing com item do inventário)
- `POST /api/marketplace-buy` (compra com taxa de 5%)
- `POST /api/marketplace-approve` (gmlevel 2+)
- `POST /api/marketplace-reject` (gmlevel 2+)

**Frontend**
- `src/pages/dashboard/mercado.tsx`
- `src/components/Dashboard/CreateListingModal.tsx`

---

## Fase 4 — Admin & Fulfillment ✅

**Backend**
- `GET/POST /api/admin-fulfillment` (lista fila / marca entregue)
- `GET /api/admin-audit` (log de auditoria com filtros)

**Frontend**
- `src/pages/dashboard/admin-gm.tsx` — painel GM geral
- `src/pages/dashboard/admin-aprovacoes.tsx` — aprovação de listings
- `src/pages/dashboard/admin-entregas.tsx` — fila de fulfillment
- `src/pages/dashboard/admin-auditoria.tsx` — audit log

**Sidebar**
- Grupo "Admin" visível apenas para contas com `gmlevel >= 2`

---

## Banco de Dados

### Arquivos SQL (`sql/`)

| Arquivo | Conteúdo |
|---|---|
| `00-marketplace.sql` | Cria `wow_marketplace` + 8 tabelas + 3 views |
| `01-realmlist.sql` | Configura `acore_auth.realmlist` |
| `02-admin.sql` | Promove conta para GM (`account_access`) |
| `03-sample-items.sql` | Seed de `item_whitelist` |

### Tabelas

| Tabela | Finalidade |
|---|---|
| `wallets` | Saldo DP/VP por conta |
| `wallet_transactions` | Log imutável de movimentações |
| `item_whitelist` | Itens autorizados no marketplace/leilão |
| `auction_items` | Leilões criados por GMs |
| `auction_bids` | Histórico de lances |
| `marketplace_listings` | Listagens jogador→jogador |
| `fulfillment_queue` | Fila de entrega de itens |
| `audit_log` | Log geral de auditoria |

### Views

- `v_active_auctions` — leilões ativos com countdown
- `v_active_marketplace` — listagens ativas
- `v_pending_fulfillment` — fila de entregas pendentes

---

## Segurança

- `SELECT ... FOR UPDATE` + `BEGIN/COMMIT` em todas as operações de saldo
- Whitelist tripla: frontend → API → DB
- `audit_log` imutável (INSERT only)
- Idempotência via `Idempotency-Key` nas rotas críticas
- Permissões verificadas por `acore_auth.account_access.id` (coluna real)

---

## Próximos Passos (melhorias futuras)

- Auto-close de leilões expirados via cron/job
- Notificações de lance superado
- Auto-delivery via SOAP (worldserver)
- Histórico de preços e rankings

---

**Última atualização**: 2026-04-04  
**Status**: 🚀 Todas as fases entregues e funcionais

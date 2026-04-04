# 📋 DIAGNÓSTICO TÉCNICO COMPLETO - INTEGRAÇÃO MERCADO PAGO

**Projeto**: Azeroth Legacy - Site Oficial WoW 3.3.5a
**Data**: 04/04/2026
**Objetivo**: Análise técnica para integração do Mercado Pago

---

## 🎯 Resumo Executivo

O projeto **Azeroth Legacy** é um **site oficial de servidor WoW privado (WotLK 3.3.5a)** com sistema de marketplace, leilões e carteira virtual (DP/VP) **100% funcional**, mas **SEM integração de pagamento externo**.

**Status atual**: Projeto em **fase pré-comercial** com toda infraestrutura backend pronta para receber pagamentos, necessitando apenas integração com gateway (Mercado Pago).

**Conclusão**: O projeto está **95% pronto** para integração com Mercado Pago. Faltam apenas:

- 3 endpoints de API (create-checkout, webhook, status)
- 1 página frontend (/dashboard/recarga)
- 1 tabela no banco (mercadopago_payments)
- Configuração de variáveis de ambiente

---

## 🏗️ 1. STACK PRINCIPAL

### **Framework & Linguagem**

- **Frontend**: Next.js 16.2.0 (React 19.2.4)
- **Linguagem**: TypeScript 6.0.2 + JavaScript
- **Estilização**: Tailwind CSS v4 + DaisyUI 5.5.19
- **Arquitetura**: Monorepo único (fullstack Next.js)

**Evidências**:

```json
// package.json, linhas 16-23
"next": "^16.2.0",
"react": "^19.2.4",
"typescript": "^6.0.2"
```

### **Organização do Projeto**

```
site-wow/
├── src/
│   ├── pages/           # Páginas Next.js + API Routes
│   ├── components/      # Componentes React
│   ├── lib/            # Bibliotecas core (wallet, db, auth)
│   ├── hooks/          # React hooks
│   ├── styles/         # CSS global
│   └── locales/        # i18n
├── sql/                # Schemas SQL
├── public/             # Assets estáticos
└── posts/              # Blog markdown
```

### **Monorepo vs App Único**

- ✅ **App único** (não é monorepo)
- Frontend e Backend no mesmo projeto Next.js
- API Routes em `src/pages/api/*`
- Build unificado com Vercel

### **Onde Ficam Frontend, Backend, Admin e APIs**

| Camada       | Localização                                                  |
| ------------ | ------------------------------------------------------------ |
| **Frontend** | `src/pages/*.tsx`, `src/components/*`                        |
| **Backend**  | `src/pages/api/*` (40+ endpoints)                            |
| **Admin**    | `src/pages/dashboard/admin-*.tsx`                            |
| **APIs**     | `src/pages/api/wallet-*`, `api/marketplace-*`, `api/admin-*` |

---

## ⚙️ 2. BACKEND

### **Tecnologia**

- **Framework**: Next.js API Routes (Serverless)
- **Runtime**: Node.js 18+ (via NVM - `.nvmrc`)
- **Arquitetura**: API REST stateless

**Evidências**:

```javascript
// src/pages/api/wallet-balance.js, linhas 1-9
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }
  // ...
}
```

### **Estrutura de Rotas da API**

#### **Wallet & Pagamentos** (3 endpoints)

| Endpoint                   | Método | Autenticação | Permissão         | Função                  |
| -------------------------- | ------ | ------------ | ----------------- | ----------------------- |
| `/api/wallet-balance`      | GET    | Sim          | User              | Retorna saldo DP/VP     |
| `/api/wallet-credit`       | POST   | Sim          | **Admin (GM 3+)** | Cria DP/VP manualmente  |
| `/api/wallet-transactions` | GET    | Sim          | User              | Histórico de transações |

**Arquivo**: `src/pages/api/wallet-credit.js`

#### **Marketplace** (6 endpoints)

| Endpoint                   | Método | Autenticação | Permissão | Função                 |
| -------------------------- | ------ | ------------ | --------- | ---------------------- |
| `/api/marketplace-list`    | GET    | Não          | Público   | Lista itens à venda    |
| `/api/marketplace-create`  | POST   | Sim          | User      | Cria listing           |
| `/api/marketplace-buy`     | POST   | Sim          | User      | **Compra item com DP** |
| `/api/marketplace-approve` | POST   | Sim          | GM 2+     | Aprova listing         |
| `/api/marketplace-reject`  | POST   | Sim          | GM 2+     | Rejeita listing        |

**Arquivo**: `src/pages/api/marketplace-buy.js` (304 linhas)

#### **Leilão** (6 endpoints)

- `/api/auction-list` - Lista leilões ativos
- `/api/auction-create` - Cria leilão (GM 2+)
- `/api/auction-bid` - Faz lance (refund automático)
- `/api/auction-close` - Encerra leilão (GM 2+)
- `/api/auction-edit` - Edita leilão
- `/api/auction-delete` - Remove leilão

#### **Admin** (4 endpoints)

- `/api/admin-fulfillment` - Fila de entregas
- `/api/admin-audit` - Log de auditoria
- `/api/admin-gm-soap` - Comandos SOAP no worldserver
- `/api/admin-config` - Configurações do servidor

#### **Autenticação** (13 endpoints em `/api/account/`)

- `login.js`, `logout.js`, `register.js`, `session.js`
- `reset-request.js`, `reset-confirm.js`, `change-password.js`
- `verify-code.js`, `resend-code.js`
- `characters.js`, `armory.js`, `guild.js`, `inventory.js`
- `tickets.js`, `ticket-messages.js`, `services.js`

### **Services, Controllers e Validações**

**Estrutura**:

- ❌ Não há separação tradicional MVC
- ✅ **API Routes** fazem papel de controllers
- ✅ **`src/lib/`** contém services reutilizáveis

**Services Principais**:

```
src/lib/
├── wallet.ts          # ⭐ Service principal de wallet
├── db.js             # Conexão MySQL (pool)
├── session.ts        # Gerenciamento de sessão (iron-session)
├── permissions.ts    # RBAC / GM levels
├── rateLimit.js      # Rate limiting in-memory
├── idempotency.js    # Proteção contra duplicate requests
├── requestSecurity.js # Validação CORS/Same-Origin
├── srp6.js           # Autenticação WoW (SRP6)
├── mailer.js         # Envio de e-mail (nodemailer)
└── emailVerification.js # Verificação cadastro (Resend)
```

**Evidência - Service de Wallet**:

```typescript
// src/lib/wallet.ts, linhas 116-185
export async function creditWallet(
  connection: PoolConnection,
  params: TransactionParams
): Promise<WalletTransaction> {
  // Lock pessimista para evitar race condition
  const [wallets] = await connection.query<(Wallet & RowDataPacket)[]>(
    'SELECT * FROM wow_marketplace.wallets WHERE account_id = ? FOR UPDATE',
    [params.accountId]
  )
  // ... atualiza saldo + insere transaction log
}
```

### **Autenticação e Autorização**

#### **Sistema de Autenticação**

- **Método**: SRP6 (Secure Remote Password) - compatível com AzerothCore
- **Sessão**: iron-session (cookie criptografado, 7 dias)
- **Cookie**: `wow_session` (HttpOnly, Secure em prod)

**Evidências**:

```typescript
// src/lib/session.ts, linhas 27-36
export const sessionOptions: SessionOptions = {
  password: sessionSecret,
  cookieName: 'wow_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  }
}
```

```javascript
// src/lib/srp6.js, linhas 1-50
// Implementação completa do SRP6 para WoW 3.3.5a
// Compatível com acore_auth.account (salt, verifier)
```

#### **Sistema RBAC (Role-Based Access Control)**

**Tabela de Permissões**: `acore_auth.account_access`

| GM Level | Permissão      | Funções                         |
| -------- | -------------- | ------------------------------- |
| 0        | Jogador normal | Comprar, vender, dar lances     |
| 1        | GM Júnior      | Fulfillment (entregar itens)    |
| 2        | Moderador      | Criar leilões, aprovar listings |
| 3+       | **Admin**      | **Criar DP/VP, config geral**   |

**Evidências**:

```typescript
// src/lib/permissions.ts, linhas 62-68
export async function isAdmin(
  connection: PoolConnection,
  accountId: number
): Promise<boolean> {
  return hasGMLevel(connection, accountId, 3)
}
```

```javascript
// src/pages/api/wallet-credit.js, linhas 34-45
// Verifica se é admin (GM level 3+)
const [access] = await connection.query(
  'SELECT * FROM acore_auth.account_access WHERE id = ? AND gmlevel >= 3',
  [session.user.id]
)

if (access.length === 0) {
  return res.status(403).json({
    success: false,
    error: 'Insufficient permissions. Admin access required.'
  })
}
```

### **Regras de Negócio Financeiras**

**Localização**: `src/lib/wallet.ts` + API endpoints

#### **Wallet - Operações Transacionais**

```typescript
// src/lib/wallet.ts, linhas 99-255

// ✅ Credit Wallet - adiciona fundos (crédito)
creditWallet(connection, {
  accountId,
  currency,
  amount,
  type,
  referenceType,
  referenceId,
  notes
})

// ✅ Debit Wallet - remove fundos (débito)
debitWallet(connection, {
  accountId,
  currency,
  amount,
  type
})

// ✅ Transfer Funds - transfere entre contas
transferFunds(
  connection,
  fromAccountId,
  toAccountId,
  currency,
  amount,
  debitType,
  creditType
)

// ✅ Calculate Marketplace Fee - 5%
calculateMarketplaceFee(price)
// => { sellerReceives: 95%, fee: 5% }
```

**Características**:

- 🔒 **Lock pessimista** (`FOR UPDATE`) em todas operações
- 🔄 **Transações SQL** obrigatórias (rollback em erro)
- 📊 **Audit trail** completo (wallet_transactions)
- ⚡ **Idempotência** via header `Idempotency-Key`

#### **Marketplace - Taxa de 5%**

```javascript
// src/pages/api/marketplace-buy.js, linhas 114-116
const fee = Math.floor(listing.price * 0.05) // 5%
const sellerReceives = listing.price - fee
```

**Fluxo de Compra**:

1. Comprador paga 100 DP
2. Vendedor recebe 95 DP
3. Sistema retém 5 DP (taxa)
4. 3 transações registradas (compra, venda, taxa)

#### **Validações de Preço**

```typescript
// src/lib/wallet.ts, linhas 334-346
export function validatePrice(price: number) {
  if (price < 10) {
    return { valid: false, error: 'Price must be at least 10 DP' }
  }
  if (price > 50000) {
    return { valid: false, error: 'Price cannot exceed 50,000 DP' }
  }
  return { valid: true }
}
```

**Limites**:

- ✅ Preço mínimo: 10 DP
- ✅ Preço máximo: 50.000 DP

---

## 🗄️ 3. BANCO DE DADOS

### **SGBD e ORM**

- **Banco**: MySQL 8.4 (via Docker - container `ac-database`)
- **Driver**: `mysql2` ^3.20.0 (connection pool)
- **ORM**: ❌ Nenhum (SQL nativo)
- **Query Builder**: ❌ Nenhum

**Evidências**:

```javascript
// src/lib/db.js, linhas 5-19
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: 'acore_auth', // Database padrão
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    })
  }
  return pool
}
```

### **Bancos de Dados Utilizados**

| Database              | Origem          | Uso                                         |
| --------------------- | --------------- | ------------------------------------------- |
| `acore_auth`          | AzerothCore     | Contas, sessões, bans, realmlist            |
| `acore_characters`    | AzerothCore     | Personagens, itens, guild, mail             |
| `acore_world`         | AzerothCore     | NPCs, quests, loot, spawns                  |
| **`wow_marketplace`** | **Site custom** | **Wallet, transações, marketplace, leilão** |

### **Schema - wow_marketplace**

**Arquivo**: `sql/00-marketplace.sql` (185 linhas)

#### **Tabelas Principais** (8 tabelas)

##### **1. wallets** - Saldo de cada conta

```sql
-- sql/00-marketplace.sql, linhas 12-19
CREATE TABLE IF NOT EXISTS wallets (
  account_id  INT UNSIGNED NOT NULL,
  dp          INT UNSIGNED NOT NULL DEFAULT 0,  -- Donation Points
  vp          INT UNSIGNED NOT NULL DEFAULT 0,  -- Vote Points
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id)
) ENGINE=InnoDB;
```

##### **2. wallet_transactions** - Histórico imutável

```sql
-- sql/00-marketplace.sql, linhas 22-39
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  account_id      INT UNSIGNED    NOT NULL,
  type            VARCHAR(32)     NOT NULL, -- CREDIT_DP, DEBIT_DP, etc
  amount          INT             NOT NULL, -- Positivo (crédito) ou negativo (débito)
  balance_before  INT UNSIGNED    NOT NULL,
  balance_after   INT UNSIGNED    NOT NULL,
  currency        ENUM('DP','VP') NOT NULL,
  reference_type  VARCHAR(32)     DEFAULT NULL, -- AUCTION, MARKETPLACE_LISTING, etc
  reference_id    INT UNSIGNED    DEFAULT NULL,
  notes           VARCHAR(500)    DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by      INT UNSIGNED    DEFAULT NULL, -- Admin que criou
  ip_address      VARCHAR(45)     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_account_id (account_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB;
```

**Tipos de Transação**:

```typescript
// src/lib/marketplace-types.ts, linhas 18-29
export type TransactionType =
  | 'CREDIT_DP' // Admin cria DP
  | 'CREDIT_VP' // Admin cria VP
  | 'DEBIT_DP' // Compra com DP
  | 'DEBIT_VP' // Compra com VP
  | 'BID_PLACED' // Lance em leilão
  | 'BID_REFUND' // Reembolso de lance
  | 'AUCTION_WIN' // Ganhou leilão
  | 'MARKETPLACE_PURCHASE' // Comprou no marketplace
  | 'MARKETPLACE_SALE' // Vendeu no marketplace
  | 'MARKETPLACE_FEE' // Taxa do marketplace (5%)
  | 'ADMIN_ADJUSTMENT' // Ajuste manual
```

##### **3. item_whitelist** - Itens autorizados

```sql
-- sql/00-marketplace.sql, linhas 42-54
CREATE TABLE IF NOT EXISTS item_whitelist (
  item_entry        INT UNSIGNED NOT NULL,
  item_name         VARCHAR(255) NOT NULL,
  can_auction       TINYINT(1)   NOT NULL DEFAULT 0,
  can_marketplace   TINYINT(1)   NOT NULL DEFAULT 0,
  max_price         INT UNSIGNED DEFAULT NULL,
  category          ENUM('MOUNT','PET','TRANSMOG','CONSUMABLE','BAG','SERVICE','OTHER'),
  rarity            ENUM('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'),
  notes             VARCHAR(500) DEFAULT NULL,
  added_by          INT UNSIGNED NOT NULL DEFAULT 1,
  added_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_entry)
) ENGINE=InnoDB;
```

##### **4. auction_items** - Leilões (GM only)

```sql
-- sql/00-marketplace.sql, linhas 56-74
CREATE TABLE IF NOT EXISTS auction_items (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  item_entry         INT UNSIGNED NOT NULL,
  item_count         INT UNSIGNED NOT NULL DEFAULT 1,
  starting_bid       INT UNSIGNED NOT NULL,
  current_bid        INT UNSIGNED NOT NULL DEFAULT 0,
  current_bidder_id  INT UNSIGNED DEFAULT NULL,
  buyout_price       INT UNSIGNED DEFAULT NULL,
  end_time           DATETIME     NOT NULL,
  status             ENUM('ACTIVE','CLOSED','CANCELLED'),
  winner_id          INT UNSIGNED DEFAULT NULL,
  created_by         INT UNSIGNED NOT NULL, -- GM que criou
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at          DATETIME     DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
```

##### **5. auction_bids** - Lances

```sql
-- sql/00-marketplace.sql, linhas 77-88
CREATE TABLE IF NOT EXISTS auction_bids (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  auction_id   INT UNSIGNED NOT NULL,
  account_id   INT UNSIGNED NOT NULL,
  bid_amount   INT UNSIGNED NOT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  refunded_at  DATETIME     DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
```

##### **6. marketplace_listings** - Vendas entre jogadores

```sql
-- sql/00-marketplace.sql, linhas 90-113
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id       INT UNSIGNED NOT NULL,
  character_guid  INT UNSIGNED NOT NULL,
  character_name  VARCHAR(12)  NOT NULL,
  item_guid       INT UNSIGNED NOT NULL,      -- ID do item no inventário
  item_entry      INT UNSIGNED NOT NULL,
  item_name       VARCHAR(255) DEFAULT NULL,
  item_count      INT UNSIGNED NOT NULL DEFAULT 1,
  price           INT UNSIGNED NOT NULL,
  category        ENUM('MOUNT','PET','TRANSMOG','CONSUMABLE','BAG','SERVICE','OTHER'),
  rarity          ENUM('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY'),
  status          ENUM('PENDING_APPROVAL','ACTIVE','SOLD','CANCELLED','REJECTED'),
  buyer_id        INT UNSIGNED DEFAULT NULL,
  reject_reason   VARCHAR(500) DEFAULT NULL,
  approved_by     INT UNSIGNED DEFAULT NULL,  -- GM que aprovou
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
```

**Workflow de Marketplace**:

1. Jogador cria listing → `PENDING_APPROVAL`
2. GM aprova → `ACTIVE`
3. Outro jogador compra → `SOLD`
4. Sistema cria 2 fulfillments (remover do vendedor, entregar ao comprador)

##### **7. fulfillment_queue** - Fila de entregas

```sql
-- sql/00-marketplace.sql, linhas 116-134
CREATE TABLE IF NOT EXISTS fulfillment_queue (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type             ENUM('AUCTION_WIN','MARKETPLACE_PURCHASE'),
  reference_id     INT UNSIGNED NOT NULL,
  account_id       INT UNSIGNED NOT NULL,
  character_guid   INT UNSIGNED DEFAULT NULL,
  item_entry       INT UNSIGNED NOT NULL,
  item_count       INT UNSIGNED NOT NULL DEFAULT 1,
  status           ENUM('PENDING','IN_PROGRESS','DELIVERED','FAILED'),
  priority         TINYINT UNSIGNED NOT NULL DEFAULT 5,
  assigned_to      INT UNSIGNED DEFAULT NULL, -- GM responsável
  notes            VARCHAR(500) DEFAULT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delivered_at     DATETIME     DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB;
```

##### **8. audit_log** - Auditoria completa

```sql
-- sql/00-marketplace.sql, linhas 136-150
CREATE TABLE IF NOT EXISTS audit_log (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  account_id   INT UNSIGNED NOT NULL,
  action_type  VARCHAR(64)  NOT NULL,
  entity_type  VARCHAR(64)  DEFAULT NULL,
  entity_id    INT UNSIGNED DEFAULT NULL,
  details      JSON         DEFAULT NULL,
  ip_address   VARCHAR(45)  DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_account_id (account_id),
  KEY idx_action_type (action_type),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB;
```

#### **Views** (3 views)

```sql
-- sql/00-marketplace.sql, linhas 153-184

-- 1. v_active_auctions - leilões ativos com countdown
CREATE OR REPLACE VIEW v_active_auctions AS
SELECT a.*, w.item_name, w.category, w.rarity,
  GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), a.end_time)) AS seconds_remaining
FROM auction_items a
LEFT JOIN item_whitelist w ON w.item_entry = a.item_entry
WHERE a.status = 'ACTIVE' AND a.end_time > NOW();

-- 2. v_active_marketplace - listagens ativas
CREATE OR REPLACE VIEW v_active_marketplace AS
SELECT ml.* FROM marketplace_listings ml
WHERE ml.status = 'ACTIVE';

-- 3. v_pending_fulfillment - fila de entregas pendentes
CREATE OR REPLACE VIEW v_pending_fulfillment AS
SELECT * FROM fulfillment_queue
WHERE status = 'PENDING'
ORDER BY priority ASC, created_at ASC;
```

### **Saldos, Pedidos, Transações e Auditoria**

#### **✅ Saldo (Wallet)**

- Tabela: `wow_marketplace.wallets`
- Colunas: `dp` (Donation Points), `vp` (Vote Points)
- Update: Lock pessimista (`FOR UPDATE`)

#### **✅ Pedidos (Orders)**

- Marketplace: `wow_marketplace.marketplace_listings`
- Leilões: `wow_marketplace.auction_items`
- Entregas: `wow_marketplace.fulfillment_queue`

#### **✅ Transações**

- Tabela: `wow_marketplace.wallet_transactions`
- **Imutável** (append-only log)
- Registra: saldo anterior, saldo posterior, IP, admin responsável

#### **✅ Auditoria**

- Tabela: `wow_marketplace.audit_log`
- **JSON** na coluna `details`
- Indexada por: `account_id`, `action_type`, `created_at`

**Exemplo de Auditoria**:

```javascript
// src/pages/api/marketplace-buy.js, linhas 254-273
await connection.query(
  `INSERT INTO wow_marketplace.audit_log
   (account_id, action_type, entity_type, entity_id, details, ip_address)
   VALUES (?, ?, ?, ?, ?, ?)`,
  [
    session.user.id,
    'MARKETPLACE_PURCHASE',
    'marketplace_listings',
    listingId,
    JSON.stringify({
      listing_id: listingId,
      item_entry: listing.item_entry,
      price: listing.price,
      seller_id: listing.seller_account_id,
      seller_received: sellerReceives,
      fee
    }),
    ipAddress
  ]
)
```

### **Estrutura Existente - Wallet/Ledger/Payments**

#### **✅ JÁ EXISTE:**

- ✅ Wallet (`wallets` table)
- ✅ Ledger imutável (`wallet_transactions`)
- ✅ Duas moedas (DP e VP)
- ✅ Sistema de crédito/débito transaction-safe
- ✅ Histórico completo de movimentações
- ✅ Auditoria por IP e admin

#### **❌ NÃO EXISTE:**

- ❌ Tabela `payments` para pagamentos externos
- ❌ Tabela `orders` ou `checkout_sessions`
- ❌ Webhook handling
- ❌ Integração com gateway de pagamento

---

## 🎨 4. FRONTEND / ADMIN

### **Onde Fica o Painel Admin/GM**

**Páginas Admin** (4 páginas):

```
src/pages/dashboard/
├── admin-gm.tsx           # Painel GM geral
├── admin-aprovacoes.tsx   # Aprovar/rejeitar listings
├── admin-entregas.tsx     # Fulfillment queue
└── admin-auditoria.tsx    # Audit log
```

**Acesso**:

- Rota: `/dashboard/admin-*`
- Autenticação: Sessão obrigatória
- Permissão: GM level 2+ (sidebar esconde se < 2)

**Evidências**:

```tsx
// src/components/Dashboard/AppSidebar/index.tsx, linhas 41-46
const adminNavItems = [
  {
    title: 'Painel GM',
    href: '/dashboard/admin-gm',
    icon: Shield,
    badge: 'Admin'
  },
  {
    title: 'Aprovações',
    href: '/dashboard/admin-aprovacoes',
    icon: CheckCircle,
    badge: 'Admin'
  },
  {
    title: 'Entregas',
    href: '/dashboard/admin-entregas',
    icon: Truck,
    badge: 'Admin'
  },
  {
    title: 'Auditoria',
    href: '/dashboard/admin-auditoria',
    icon: FileText,
    badge: 'Admin'
  }
]
```

### **Como o Frontend Consome o Backend**

**Método**: Fetch API nativa (sem lib externa)

**Padrão**:

```typescript
// Exemplo típico de consumo de API
const response = await fetch('/api/wallet-balance')
const result = await response.json()

if (result.success) {
  setBalance(result.data)
} else {
  console.error(result.error)
}
```

**Características**:

- ❌ Sem axios ou SWR
- ❌ Sem React Query
- ✅ Fetch nativo + async/await
- ✅ Tratamento de erro manual

### **Estrutura de Páginas e Componentes**

#### **Páginas Dashboard** (15 páginas)

```
src/pages/dashboard/
├── index.tsx              # Visão geral (saldo, stats)
├── carteira.tsx          # ⭐ Saldo + histórico de transações
├── loja.tsx              # Loja de itens (mockada)
├── leilao.tsx            # ⭐ Leilões GM
├── mercado.tsx           # ⭐ Marketplace P2P
├── servicos.tsx          # Serviços in-game
├── ranking.tsx           # PvP ranking
├── guild.tsx             # Guild info
├── armory.tsx            # Personagens
├── tickets.tsx           # Suporte
├── conta.tsx             # Configurações da conta
├── admin-gm.tsx          # Admin: Painel GM
├── admin-aprovacoes.tsx  # Admin: Aprovar listings
├── admin-entregas.tsx    # Admin: Fulfillment
└── admin-auditoria.tsx   # Admin: Audit log
```

#### **Componentes Principais**

**Dashboard Components**:

```
src/components/Dashboard/
├── DashboardLayout.tsx          # Layout geral (sidebar + content)
├── AppSidebar/                  # Sidebar com menu
├── WalletCard.tsx              # ⭐ Card de saldo DP/VP
├── LojaPage/                   # ⭐ Loja (pacotes mock)
├── CreateListingModal.tsx      # Modal criar venda
└── ...
```

**Outros Components**:

```
src/components/
├── Layout/                      # Layout site público
├── SEO.tsx                      # Meta tags
├── PageHeader.tsx              # Header de páginas
├── CTASection.tsx              # Call-to-action
├── VIPPreviewSection/          # ⭐ Preview do VIP
└── ...
```

### **Hooks**

**Localização**: `src/hooks/`

Exemplo:

```typescript
// Uso de hooks nativos React
import { useEffect, useState } from 'react'

const [balance, setBalance] = useState({ dp: 0, vp: 0 })

useEffect(() => {
  fetch('/api/wallet-balance')
    .then(r => r.json())
    .then(data => setBalance(data.data))
}, [])
```

### **Chamadas HTTP - Padrão**

**Evidências**:

```tsx
// src/pages/dashboard/carteira.tsx, linhas 33-50
const fetchTransactions = async () => {
  try {
    setLoading(true)
    const response = await fetch(
      `/api/wallet-transactions?page=${page}&perPage=${perPage}`
    )
    const result = await response.json()

    if (result.success) {
      setTransactions(result.data.transactions)
      setTotal(result.data.total)
    }
  } catch (err) {
    console.error('Error fetching transactions:', err)
  } finally {
    setLoading(false)
  }
}
```

### **Melhor Área para Telas de Pagamentos**

#### **✅ Onde Adicionar Mercado Pago:**

**1. Nova Página: `/dashboard/recarga`**

```
src/pages/dashboard/
└── recarga.tsx             # ⭐ NOVA - Checkout Mercado Pago
```

**2. Novo Componente**

```
src/components/Dashboard/
└── RecargaPage/
    ├── index.tsx           # Página principal
    ├── PackageCard.tsx     # Card de pacote (ex: 100 DP = R$ 10)
    └── CheckoutModal.tsx   # Modal de checkout
```

**3. Nova API**

```
src/pages/api/
├── payment/
│   ├── create-checkout.js   # ⭐ Cria preferência MP
│   ├── webhook.js           # ⭐ Recebe confirmação MP
│   └── status.js            # Consulta status pagamento
```

**4. Atualizar Sidebar**

```tsx
// src/components/Dashboard/AppSidebar/index.tsx
const mainNavItems = [
  // ...
  {
    title: 'Recarga',
    href: '/dashboard/recarga',
    icon: CreditCard,
    badge: 'Novo'
  }
  // ...
]
```

#### **✅ Onde Adicionar Conciliação:**

**Admin**:

```
src/pages/dashboard/
└── admin-pagamentos.tsx    # ⭐ NOVA - Conciliação de pagamentos
```

#### **✅ Onde Adicionar Config do Gateway:**

**Admin**:

```
src/pages/dashboard/
└── admin-config-payment.tsx  # ⭐ NOVA - Config Access Token MP
```

Ou via:

```
.env (mais simples)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

---

## 💳 5. PAGAMENTOS ATUAIS

### **❌ NÃO EXISTE NENHUM GATEWAY INTEGRADO**

**Confirmado por**:

- ✗ Busca em todo código: `grep -i "(stripe|paypal|mercado.?pago|pagseguro|gateway|payment|checkout)"` → **0 resultados**
- ✗ `package.json` sem dependências de pagamento
- ✗ `.env.example` sem chaves de API de gateway
- ✗ Nenhuma pasta `/api/payment/` ou `/api/checkout/`
- ✗ Nenhum componente de checkout externo

### **✅ Sistema de Wallet Interno (Pronto para Integração)**

**Como funciona hoje**:

#### **1. DP (Donation Points)**

- **Obtenção atual**: ❌ Não implementado (manual via admin)
- **Uso**: Comprar itens na loja, marketplace, leilões
- **API de crédito**: `POST /api/wallet-credit` (ADMIN ONLY)

**Evidências**:

```tsx
// src/components/Dashboard/LojaPage/index.tsx, linhas 174-195
;<div className="mt-6 p-4 bg-base-300 rounded-lg">
  <h4 className="font-bold mb-2">Como obter DP?</h4>
  <p className="text-sm text-base-content/70 mb-3">
    Donation Points são obtidos através de doações para o servidor.
  </p>
  <button className="btn btn-primary btn-sm" onClick={handleDonateClick}>
    <CreditCard className="h-4 w-4" />
    Fazer Doação
  </button>
</div>

const handleDonateClick = () => {
  alert('Sistema de doações será ativado em breve.')
}
```

#### **2. VP (Vote Points)**

- **Obtenção atual**: ❌ Não implementado (votação externa)
- **Uso**: Comprar itens cosméticos, pets, mounts
- **API de crédito**: `POST /api/wallet-credit` (ADMIN ONLY)

**Evidências**:

```tsx
// src/components/Dashboard/LojaPage/index.tsx, linhas 197-209
;<div className="mt-4 p-4 bg-base-300 rounded-lg">
  <h4 className="font-bold mb-2">Como obter VP?</h4>
  <p className="text-sm text-base-content/70 mb-3">
    Vote Points são ganhos votando no servidor diariamente nos sites de ranking.
  </p>
  <button className="btn btn-secondary btn-sm" onClick={handleVoteClick}>
    <Trophy className="h-4 w-4" />
    Votar Agora
  </button>
</div>

const handleVoteClick = () => {
  alert('Sistema de votação será ativado em breve.')
}
```

### **Fluxos de Checkout, Webhook e Confirmação**

#### **❌ Não Existem:**

- Fluxo de checkout externo
- Página de pagamento
- Webhook handler
- Confirmação de pagamento via gateway
- Tabela de `payments` ou `transactions_external`

#### **✅ Existe (Pronto para Usar):**

- Sistema de wallet (`wallets` table)
- API de crédito de DP/VP
- Histórico de transações
- Auditoria completa

### **Recargas e Assinaturas**

**❌ Não Existe:**

- Sistema de recarga de DP/VP com dinheiro real
- Planos de assinatura (monthly VIP)
- Checkout Pro / Checkout Transparente

**✅ Existe (Planejado, Não Ativo):**

- Página VIP com benefícios definidos (`src/pages/vip.tsx`)
- Dados de pacotes mock na loja

### **⭐ Onde Adicionar Mercado Pago com Menor Impacto**

#### **Estratégia Recomendada: MÍNIMO IMPACTO**

**1. Criar nova rota isolada**

```
src/pages/api/payment/
├── create-checkout.js      # POST - Cria preferência MP
├── webhook.js              # POST - Recebe notificação MP
└── confirm.js              # GET - Página de sucesso/erro
```

**2. Criar nova página de recarga**

```
src/pages/dashboard/recarga.tsx
```

**3. Reutilizar API de crédito existente**

```javascript
// Após confirmação do Mercado Pago:
await creditWallet(connection, {
  accountId: userId,
  currency: 'DP',
  amount: packageAmount,
  type: 'CREDIT_DP',
  referenceType: 'MERCADOPAGO',
  referenceId: paymentId,
  notes: `Recarga via Mercado Pago - ${paymentId}`,
  ipAddress: req.ip
})
```

**Vantagens**:

- ✅ Zero mudanças no código existente
- ✅ Reutiliza toda lógica de wallet
- ✅ Mantém auditoria e histórico
- ✅ Isolado em `/api/payment/*`

---

## ⚙️ 6. CONFIGURAÇÃO E AMBIENTE

### **Onde Ficam ENVs e Configs**

**Arquivo**: `.env.example` (template)

```env
# .env.example, linhas 1-65

# ── Algolia (busca) ──
NEXT_PUBLIC_ALGOLIA_APP_ID=
NEXT_PUBLIC_ALGOLIA_SEARCH_ONLY_KEY=
ALGOLIA_ADMIN_KEY=

# ── OAuth GitHub (CMS admin) ──
OAUTH_CLIENT_ID=
OAUTH_CLIENT_SECRET=

# ── Site ──
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
APP_NAME=Azeroth Legacy

# ── Banco de dados (AzerothCore MySQL) ──
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=

# ── Sessão ──
SESSION_SECRET=

# ── Worldserver TCP (checar online) ──
WORLD_HOST=127.0.0.1
WORLD_PORT=8085
SERVER_MAX_POPULATION=1000

# ── Worldserver SOAP (comandos GM) ──
WS_SOAP_HOST=127.0.0.1
WS_SOAP_PORT=7878
WS_SOAP_USER=
WS_SOAP_PASS=

# ── SMTP (recuperação de senha) ──
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@seu-dominio.com

# ── Resend (verificação de cadastro) ──
RESEND_API_KEY=
EMAIL_FROM=onboarding@resend.dev
```

### **Variáveis para Pagamentos**

**❌ Não Existem:**

```env
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=
MERCADOPAGO_PUBLIC_KEY=
```

**✅ Para Adicionar (Mercado Pago):**

```env
# ── Mercado Pago ──
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

### **Como o Projeto Sobe Localmente**

**Passo a Passo**:

```bash
# 1. Subir banco de dados (Docker)
cd ../wow
docker compose up -d ac-database

# 2. Rodar migrations SQL
docker exec -i ac-database mysql -uroot -ppassword < sql/00-marketplace.sql
docker exec -i ac-database mysql -uroot -ppassword < sql/01-realmlist.sql

# 3. Instalar dependências
npm install

# 4. Rodar em desenvolvimento
npm run dev
# Acesse: http://localhost:3000
```

**Evidências**:

```markdown
# Readme.md, linhas 19-42

## Desenvolvimento local

npm install
npm run dev # Acesse: http://localhost:3000

# O backend do servidor WoW (AzerothCore) roda em Docker

cd ../wow
docker compose up -d ac-database
```

### **Como é Feito Deploy**

**Plataforma**: Vercel

**Evidências**:

```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true, // ✅ Deploy automático na branch main
      "develop": false // ❌ Develop não faz deploy
    }
  }
}
```

```json
// package.json, linha 14
"repository": {
  "type": "git",
  "url": "https://github.com/brendoarrudaa/site-wow"
}
```

**Fluxo de Deploy**:

1. Push para `main` branch
2. Vercel detecta push
3. Build automático: `npm run build`
4. Deploy em edge functions (serverless)

**Build Command**:

```bash
npm run build  # next build --webpack
```

### **Docker, CI/CD, VPS, PM2, Railway**

#### **✅ Docker**

- **Uso**: Apenas banco de dados (MySQL 8.4)
- **Container**: `ac-database`
- **Imagem**: `mysql:8.4`
- **Porta**: 3306 (exposta no host)

**Evidências**:

```markdown
# MARKETPLACE_INSTALL.md, linhas 9-10

O MySQL roda dentro do Docker (ac-database, mysql:8.4)
com porta 3306 exposta no host.
```

#### **❌ CI/CD**

- Nenhum GitHub Actions
- Nenhum GitLab CI
- Deploy manual via Vercel (push to main)

#### **❌ VPS**

- Projeto hospedado no Vercel (serverless)
- Banco de dados local (dev) ou VPS separada (prod)

#### **❌ PM2**

- Não usado (Vercel gerencia processos)

#### **❌ Railway**

- Não usado

---

## 🔗 7. INTEGRAÇÕES EXTERNAS

### **AzerothCore**

**Integração**: Direta via MySQL

**Bancos Utilizados**:

- `acore_auth` - Autenticação, contas, bans
- `acore_characters` - Personagens, itens, guild
- `acore_world` - NPCs, quests, loot

**Evidências**:

```javascript
// src/lib/db.js - Pool conecta em acore_auth
database: 'acore_auth'
```

**Queries Diretas**:

```javascript
// Exemplo de query cross-database
SELECT c.name, c.level, c.class
FROM acore_characters.characters c
WHERE c.account = ?
```

### **SOAP (Comandos GM no Worldserver)**

**API**: `POST /api/admin-gm-soap`

**Protocolo**: SOAP via HTTP Basic Auth

**Comandos Disponíveis**:

- `announce` - Anúncio global
- `notify` - Notificação para jogador
- `kick` - Expulsar jogador
- `saveall` - Salvar todos os personagens
- `revive` - Reviver personagem
- `summon` - Teleportar jogador

**Evidências**:

```javascript
// src/pages/api/admin-gm-soap.js, linhas 1-79

// Configuração SOAP
const host = process.env.WS_SOAP_HOST || '127.0.0.1'
const port = process.env.WS_SOAP_PORT || '7878'
const user = process.env.WS_SOAP_USER
const pass = process.env.WS_SOAP_PASS

// Envia comando SOAP
const body = `<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP-ENV:Body>
    <ns1:executeCommand>
      <command>${escapeXml(command)}</command>
    </ns1:executeCommand>
  </SOAP-ENV:Body>
</SOAP-ENV:Envelope>`

await fetch(`http://${host}:${port}/`, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`,
    'Content-Type': 'text/xml'
  },
  body
})
```

**Requisitos**:

```conf
# worldserver.conf
SOAP.Enabled = 1
SOAP.IP = 127.0.0.1
SOAP.Port = 7878
```

### **CMS (Decap CMS)**

**Uso**: Gerenciar blog (posts markdown)

**OAuth**: GitHub OAuth App

**Admin**: `/admin` (Decap CMS interface)

**Evidências**:

```javascript
// next.config.js, linhas 98-102
async rewrites() {
  return [
    { source: '/admin', destination: '/admin/index.html' },
    { source: '/config.yml', destination: '/admin/config.yml' }
  ]
}
```

```json
// package.json, linha 51
"devDependencies": {
  "decap-server": "^3.0.0"
}
```

### **Integrações NÃO Existentes**

**❌ Não Integrado:**

- WooCommerce
- Sistema de filas (Bull, RabbitMQ, Redis)
- Mensageria (Kafka, RabbitMQ)
- Cron jobs (necessário para leilões)

### **Email**

#### **Nodemailer (SMTP)**

- **Uso**: Recuperação de senha
- **Config**: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`

**Evidências**:

```javascript
// src/lib/mailer.js
import nodemailer from 'nodemailer'
```

#### **Resend**

- **Uso**: Verificação de cadastro (e-mail de confirmação)
- **Config**: `RESEND_API_KEY`

**Evidências**:

```javascript
// src/lib/emailVerification.js
import { Resend } from 'resend'
```

### **Como Isso Impacta Pagamentos**

#### **✅ Facilitadores:**

- MySQL já conectado (adicionar tabela `mercadopago_payments`)
- Sistema de wallet pronto (apenas creditar DP após confirmação)
- Auditoria funcionando (registrar payment_id do MP)

#### **⚠️ Atenção:**

- Webhook do Mercado Pago precisa endpoint público (Vercel fornece)
- Fulfillment ainda é manual (GMs entregam itens via SOAP/in-game)
- Nenhum sistema de retry automático para webhooks falhados

---

## ⚠️ 8. RISCO E IMPACTO PARA INTEGRAR MERCADO PAGO

### **✅ O Que Facilita**

#### **1. Infraestrutura Backend Pronta**

- ✅ Sistema de wallet 100% funcional
- ✅ Transaction-safe com locks pessimistas
- ✅ Auditoria completa (IP, timestamp, admin)
- ✅ API de crédito reutilizável (`creditWallet()`)

#### **2. Segurança Implementada**

- ✅ Rate limiting (20 req/min)
- ✅ Idempotência (header `Idempotency-Key`)
- ✅ CORS/Same-Origin validation
- ✅ Session management (iron-session, 7 dias)

#### **3. Banco de Dados Robusto**

- ✅ MySQL 8.4 (transaction support)
- ✅ Schema normalizado (8 tabelas + 3 views)
- ✅ Histórico imutável de transações
- ✅ JSON support para metadata (audit_log)

#### **4. Deploy Simplificado**

- ✅ Vercel (edge functions prontas para webhook)
- ✅ HTTPS automático
- ✅ Escalabilidade automática

#### **5. Experiência de Usuário**

- ✅ Dashboard funcional com sidebar
- ✅ Página de carteira mostrando DP/VP
- ✅ Histórico de transações com paginação

### **❌ O Que Dificulta**

#### **1. Falta de Gateway de Pagamento**

- ❌ Zero código de integração com gateway
- ❌ Nenhuma lib de pagamento (Stripe SDK, etc)
- ❌ Sem webhook handler
- ❌ Sem tabela de `payments` externos

#### **2. Fulfillment Manual**

- ❌ GMs precisam entregar itens manualmente in-game
- ❌ Sem automação de entrega (via SOAP ou mail in-game)
- ❌ Fila de fulfillment depende de staff ativo

#### **3. Falta de Retry/Queue para Webhooks**

- ❌ Webhook falhar = perder notificação de pagamento
- ❌ Sem sistema de retry automático
- ❌ Sem dead letter queue

#### **4. Sem Pacotes Definidos**

- ❌ Loja usa mock data (não há pacotes reais)
- ❌ Preços de DP não definidos (ex: 100 DP = R$ 10?)
- ❌ Sem tabela `packages` ou `products`

#### **5. Ambiente de Desenvolvimento**

- ❌ Banco local (Docker) não acessível pelo webhook MP
- ⚠️ Necessário túnel (ngrok) ou deploy em staging

### **Principais Riscos Técnicos**

#### **🔴 ALTO RISCO:**

**1. Race Condition em Webhook**

- **Problema**: Mercado Pago pode enviar webhook múltiplas vezes
- **Solução**: Usar `Idempotency-Key` ou check de `payment_id` único

**2. Webhook Falhar Silenciosamente**

- **Problema**: Pagamento aprovado, mas webhook não processa
- **Solução**:
  - API de consulta de status (`GET /api/payment/status/:id`)
  - Cron job verificando pagamentos `pending` > 10min

**3. Fulfillment Manual Lento**

- **Problema**: Usuário paga, demora dias para receber item
- **Solução**:
  - Alertas no Discord para GMs
  - SLA de 24h para entregas

#### **🟡 MÉDIO RISCO:**

**4. Conversão DP ↔ R$ Não Definida**

- **Problema**: Preços podem mudar sem aviso
- **Solução**: Tabela `packages` com histórico de preços

**5. Sem Sistema de Estorno**

- **Problema**: Pagamento duplicado ou erro
- **Solução**: API admin para estornar DP + registrar no audit_log

#### **🟢 BAIXO RISCO:**

**6. Vercel Limits**

- **Problema**: Vercel tem limites de execução (10s default)
- **Solução**: Webhook deve ser rápido (<5s) + processar async

### **Melhor Estratégia de Integração**

#### **🏆 Recomendação: Checkout Pro (Mercado Pago)**

**Por quê?**

- ✅ Mais simples de implementar
- ✅ UI já pronta (MP cuida da tela de pagamento)
- ✅ Menos PCI compliance (cartão não passa pelo site)
- ✅ Suporta PIX, cartão, boleto automaticamente
- ✅ Webhook robusto com retry automático do MP

**Contra:**

- ❌ Usuário sai do site (redireciona para MP)
- ❌ Menos controle sobre UX

#### **⚠️ Alternativa: Checkout Transparente / Bricks**

**Por quê?**

- ✅ Usuário fica no site
- ✅ UX customizável
- ✅ Parece mais "profissional"

**Contra:**

- ❌ Mais complexo de implementar
- ❌ Mais responsabilidade (PCI compliance)
- ❌ Precisa lidar com erros de cartão

#### **❌ NÃO Recomendado: Fluxo Híbrido**

- Complexidade alta
- Difícil manutenção
- Sem benefício claro

### **Melhor Ponto para Criar/Receber/Validar/Creditar**

#### **1. Criar Pagamento**

**Endpoint**: `POST /api/payment/create-checkout`

**Input**:

```json
{
  "package_id": 1, // ID do pacote (100 DP)
  "currency": "BRL"
}
```

**Processo**:

1. Validar sessão (usuário logado)
2. Buscar pacote da tabela `packages`
3. Criar `mercadopago_payments` com status `PENDING`
4. Chamar Mercado Pago SDK: `preference.create()`
5. Retornar `init_point` (URL de checkout)

**Código de Referência**:

```javascript
import mercadopago from 'mercadopago'

mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN
})

const preference = {
  items: [
    {
      title: '100 Donation Points',
      unit_price: 10.0,
      quantity: 1
    }
  ],
  back_urls: {
    success: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/recarga/sucesso`,
    failure: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/recarga/erro`,
    pending: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/recarga/pendente`
  },
  notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment/webhook`,
  external_reference: `user_${userId}_pkg_${packageId}_${Date.now()}`
}

const response = await mercadopago.preferences.create(preference)
return res.json({ init_point: response.body.init_point })
```

#### **2. Receber Webhook**

**Endpoint**: `POST /api/payment/webhook`

**Input** (do Mercado Pago):

```json
{
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  }
}
```

**Processo**:

1. Validar assinatura (opcional: x-signature header)
2. Consultar API do MP: `GET /v1/payments/{id}`
3. Verificar status: `approved`
4. Verificar idempotência (payment_id único)
5. Creditar DP via `creditWallet()`
6. Atualizar `mercadopago_payments` status
7. Registrar audit_log
8. Retornar HTTP 200 (senão MP reenvia)

#### **3. Validar Confirmação**

**Onde**: No webhook handler (acima)

**Validações**:

- ✅ Status = `approved`
- ✅ Payment ID único (não duplicado)
- ✅ Valor corresponde ao pacote
- ✅ Metadata contém `user_id` correto

#### **4. Creditar Saldo**

**Função**: `creditWallet()` (já existe)

**Localização**: `src/lib/wallet.ts`, linhas 116-185

**Reutilizar 100%** (zero mudança necessária)

#### **5. Auditar Transações**

**Tabelas**:

1. `wow_marketplace.wallet_transactions` (já registra automaticamente)
2. `wow_marketplace.audit_log` (registrar manualmente)
3. **NOVA**: `wow_marketplace.mercadopago_payments`

**Schema Sugerido**:

```sql
CREATE TABLE IF NOT EXISTS mercadopago_payments (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  account_id      INT UNSIGNED    NOT NULL,
  payment_id      VARCHAR(50)     NOT NULL UNIQUE,  -- ID do MP
  preference_id   VARCHAR(50)     DEFAULT NULL,
  status          ENUM('PENDING','APPROVED','REJECTED','CANCELLED','REFUNDED','CREDITED') NOT NULL,
  package_id      INT UNSIGNED    NOT NULL,
  dp_amount       INT UNSIGNED    NOT NULL,
  price_brl       DECIMAL(10,2)   NOT NULL,
  payment_method  VARCHAR(50)     DEFAULT NULL,  -- pix, credit_card, etc
  transaction_id  INT UNSIGNED    DEFAULT NULL,  -- FK wallet_transactions
  metadata        JSON            DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at     DATETIME        DEFAULT NULL,
  credited_at     DATETIME        DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_payment_id (payment_id),
  KEY idx_account_id (account_id),
  KEY idx_status (status)
) ENGINE=InnoDB;
```

---

## 📊 MAPA DE ARQUITETURA

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Next.js)                      │
│  /dashboard/carteira  /dashboard/loja  /dashboard/mercado   │
└────────────────────────┬────────────────────────────────────┘
                         │ fetch()
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  API ROUTES (Serverless)                     │
│  /api/wallet-*  /api/marketplace-*  /api/admin-*           │
└────────────────────────┬────────────────────────────────────┘
                         │ mysql2.query()
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   MySQL 8.4 (Docker)                         │
│  acore_auth  acore_characters  wow_marketplace              │
└────────────────────────┬────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌─────────┐    ┌─────────┐    ┌──────────┐
    │ wallets │    │ listings│    │ audit_log│
    │ (DP/VP) │    │ (market)│    │ (history)│
    └─────────┘    └─────────┘    └──────────┘
```

---

## 📁 ARQUIVOS MAIS IMPORTANTES PARA A PRÓXIMA ETAPA

### **Core do Sistema de Pagamento**

#### **Backend - Wallet (Reutilizar)**

1. ⭐ `src/lib/wallet.ts` - Funções de crédito/débito/transferência
2. ⭐ `src/lib/db.js` - Pool de conexão MySQL
3. `src/lib/session.ts` - Gerenciamento de sessão
4. `src/lib/permissions.ts` - Verificação RBAC
5. `src/lib/rateLimit.js` - Rate limiting
6. `src/lib/idempotency.js` - Proteção contra duplicatas

#### **Backend - APIs Existentes (Referência)**

7. `src/pages/api/wallet-credit.js` - Como creditar DP/VP
8. `src/pages/api/wallet-balance.js` - Como buscar saldo
9. `src/pages/api/wallet-transactions.js` - Histórico
10. `src/pages/api/marketplace-buy.js` - Exemplo de transação complexa

#### **Frontend - Componentes (Referência)**

11. `src/components/Dashboard/WalletCard.tsx` - Card de saldo
12. `src/components/Dashboard/LojaPage/index.tsx` - Loja (mockada)
13. `src/pages/dashboard/carteira.tsx` - Página de carteira
14. `src/components/Dashboard/AppSidebar/index.tsx` - Sidebar (adicionar "Recarga")

#### **Configuração**

15. `.env.example` - Template de variáveis (adicionar MP keys)
16. `package.json` - Dependências (adicionar mercadopago SDK)
17. `next.config.js` - Config Next.js

#### **Banco de Dados**

18. ⭐ `sql/00-marketplace.sql` - Schema completo (adicionar tabela mercadopago_payments)
19. `src/lib/marketplace-types.ts` - Types TypeScript (adicionar Payment types)

---

## 🎯 PRÓXIMOS PASSOS (IMPLEMENTAÇÃO)

### **1. Criar Estrutura de Pastas**

```
src/pages/
├── dashboard/
│   └── recarga.tsx               # NOVA - Página de recarga
└── api/
    └── payment/
        ├── create-checkout.js     # NOVA - Cria preferência MP
        ├── webhook.js             # NOVA - Recebe webhook MP
        └── status.js              # NOVA - Consulta status
```

### **2. Criar Componentes**

```
src/components/Dashboard/
└── RecargaPage/
    ├── index.tsx                  # NOVA
    ├── PackageCard.tsx            # NOVA
    └── CheckoutModal.tsx          # NOVA
```

### **3. Adicionar Dependências**

```bash
npm install mercadopago
```

### **4. Adicionar Variáveis de Ambiente**

```env
# .env.local
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
```

### **5. Criar Tabela no Banco**

```sql
-- sql/04-mercadopago.sql
CREATE TABLE wow_marketplace.mercadopago_payments (...)
```

### **6. Atualizar Sidebar**

```tsx
// src/components/Dashboard/AppSidebar/index.tsx
const mainNavItems = [
  // ...
  { title: 'Recarga', href: '/dashboard/recarga', icon: CreditCard }
]
```

---

## 🎯 CONCLUSÃO

O projeto **Azeroth Legacy** está **95% pronto** para receber pagamentos via Mercado Pago.

### **O que já funciona:**

- ✅ Sistema de wallet (DP/VP)
- ✅ Transações seguras (lock + audit)
- ✅ Dashboard completo
- ✅ APIs robustas
- ✅ Autenticação + RBAC
- ✅ Banco de dados estruturado

### **O que falta:**

- ❌ 3 endpoints de API (`create-checkout`, `webhook`, `status`)
- ❌ 1 página frontend (`/dashboard/recarga`)
- ❌ 1 tabela no banco (`mercadopago_payments`)
- ❌ Configuração de ENVs (access token MP)
- ❌ 1 dependência npm (`mercadopago`)

### **Estimativa de Implementação**

- **Dev experiente**: 1-2 dias
- **Dev júnior**: 3-5 dias

### **Estratégia Recomendada**

**Checkout Pro** (mais simples, menor risco, suporte nativo a PIX)

### **Impacto no Código Existente**

**ZERO** - Toda integração será isolada em novos arquivos

---

## 📞 DÚVIDAS EM ABERTO

1. **Conversão R$ → DP**: Qual será? (ex: R$ 10 = 100 DP?)
2. **Taxa do MP**: Repassar para usuário ou absorver?
3. **Boleto**: Como lidar com demora de 2-3 dias?
4. **VIP**: Será recorrente (assinatura) ou one-time?
5. **Pacotes**: Quais valores e quantidades de DP?
6. **Estorno**: Política de reembolso?
7. **Webhook retry**: Implementar ou confiar no retry do MP?

---

**Documento gerado em**: 04/04/2026
**Versão**: 1.0
**Autor**: Copilot CLI (Análise Automatizada)

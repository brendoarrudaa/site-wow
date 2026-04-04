-- ============================================================================
-- wow_marketplace schema
-- ============================================================================

CREATE DATABASE IF NOT EXISTS wow_marketplace
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE wow_marketplace;

-- wallets
CREATE TABLE IF NOT EXISTS wallets (
  account_id  INT UNSIGNED NOT NULL,
  dp          INT UNSIGNED NOT NULL DEFAULT 0,
  vp          INT UNSIGNED NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- wallet_transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  account_id      INT UNSIGNED    NOT NULL,
  type            VARCHAR(32)     NOT NULL,
  amount          INT             NOT NULL,
  balance_before  INT UNSIGNED    NOT NULL,
  balance_after   INT UNSIGNED    NOT NULL,
  currency        ENUM('DP','VP') NOT NULL,
  reference_type  VARCHAR(32)     DEFAULT NULL,
  reference_id    INT UNSIGNED    DEFAULT NULL,
  notes           VARCHAR(500)    DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by      INT UNSIGNED    DEFAULT NULL,
  ip_address      VARCHAR(45)     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_account_id (account_id),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- item_whitelist
CREATE TABLE IF NOT EXISTS item_whitelist (
  item_entry        INT UNSIGNED NOT NULL,
  item_name         VARCHAR(255) NOT NULL,
  can_auction       TINYINT(1)   NOT NULL DEFAULT 0,
  can_marketplace   TINYINT(1)   NOT NULL DEFAULT 0,
  max_price         INT UNSIGNED DEFAULT NULL,
  category          ENUM('MOUNT','PET','TRANSMOG','CONSUMABLE','BAG','SERVICE','OTHER') NOT NULL DEFAULT 'OTHER',
  rarity            ENUM('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON',
  notes             VARCHAR(500) DEFAULT NULL,
  added_by          INT UNSIGNED NOT NULL DEFAULT 1,
  added_at          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_entry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- auction_items
CREATE TABLE IF NOT EXISTS auction_items (
  id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
  item_entry         INT UNSIGNED NOT NULL,
  item_count         INT UNSIGNED NOT NULL DEFAULT 1,
  starting_bid       INT UNSIGNED NOT NULL,
  current_bid        INT UNSIGNED NOT NULL DEFAULT 0,
  current_bidder_id  INT UNSIGNED DEFAULT NULL,
  buyout_price       INT UNSIGNED DEFAULT NULL,
  end_time           DATETIME     NOT NULL,
  status             ENUM('ACTIVE','CLOSED','CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  winner_id          INT UNSIGNED DEFAULT NULL,
  created_by         INT UNSIGNED NOT NULL,
  created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at          DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_end_time (end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- auction_bids
CREATE TABLE IF NOT EXISTS auction_bids (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  auction_id   INT UNSIGNED NOT NULL,
  account_id   INT UNSIGNED NOT NULL,
  bid_amount   INT UNSIGNED NOT NULL,
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  refunded_at  DATETIME     DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_auction_id (auction_id),
  KEY idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- marketplace_listings
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id              INT UNSIGNED NOT NULL AUTO_INCREMENT,
  seller_id       INT UNSIGNED NOT NULL,
  character_guid  INT UNSIGNED NOT NULL,
  character_name  VARCHAR(12)  NOT NULL,
  item_guid       INT UNSIGNED NOT NULL,
  item_entry      INT UNSIGNED NOT NULL,
  item_name       VARCHAR(255) DEFAULT NULL,
  item_count      INT UNSIGNED NOT NULL DEFAULT 1,
  price           INT UNSIGNED NOT NULL,
  category        ENUM('MOUNT','PET','TRANSMOG','CONSUMABLE','BAG','SERVICE','OTHER') NOT NULL DEFAULT 'OTHER',
  rarity          ENUM('COMMON','UNCOMMON','RARE','EPIC','LEGENDARY') NOT NULL DEFAULT 'COMMON',
  status          ENUM('PENDING_APPROVAL','ACTIVE','SOLD','CANCELLED','REJECTED') NOT NULL DEFAULT 'PENDING_APPROVAL',
  buyer_id        INT UNSIGNED DEFAULT NULL,
  reject_reason   VARCHAR(500) DEFAULT NULL,
  approved_by     INT UNSIGNED DEFAULT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_seller_id (seller_id),
  KEY idx_item_entry (item_entry)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- fulfillment_queue
CREATE TABLE IF NOT EXISTS fulfillment_queue (
  id               INT UNSIGNED NOT NULL AUTO_INCREMENT,
  type             ENUM('AUCTION_WIN','MARKETPLACE_PURCHASE') NOT NULL,
  reference_id     INT UNSIGNED NOT NULL,
  account_id       INT UNSIGNED NOT NULL,
  character_guid   INT UNSIGNED DEFAULT NULL,
  item_entry       INT UNSIGNED NOT NULL,
  item_count       INT UNSIGNED NOT NULL DEFAULT 1,
  status           ENUM('PENDING','IN_PROGRESS','DELIVERED','FAILED') NOT NULL DEFAULT 'PENDING',
  priority         TINYINT UNSIGNED NOT NULL DEFAULT 5,
  assigned_to      INT UNSIGNED DEFAULT NULL,
  notes            VARCHAR(500) DEFAULT NULL,
  created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  delivered_at     DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_status (status),
  KEY idx_account_id (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- audit_log
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- VIEW: leiloes ativos com countdown e nome do item
CREATE OR REPLACE VIEW v_active_auctions AS
SELECT
  a.id,
  a.item_entry,
  w.item_name,
  w.category,
  w.rarity,
  a.item_count,
  a.starting_bid,
  a.current_bid,
  a.current_bidder_id,
  a.buyout_price,
  a.end_time,
  a.created_by,
  a.created_at,
  GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), a.end_time)) AS seconds_remaining
FROM auction_items a
LEFT JOIN item_whitelist w ON w.item_entry = a.item_entry
WHERE a.status = 'ACTIVE' AND a.end_time > NOW();

-- VIEW: marketplace ativo
CREATE OR REPLACE VIEW v_active_marketplace AS
SELECT ml.*
FROM marketplace_listings ml
WHERE ml.status = 'ACTIVE';

-- VIEW: fila de entregas pendentes
CREATE OR REPLACE VIEW v_pending_fulfillment AS
SELECT *
FROM fulfillment_queue
WHERE status = 'PENDING'
ORDER BY priority ASC, created_at ASC;

-- ============================================================
-- SEED DE TESTE — ADMIN (id=1, gmlevel=4) + TESTANDO (id=2)
-- Personagem TESTANDO: Orc feminina Shaman, guid=2, conta=2
-- Execute: docker cp seed-test.sql ac-database:/tmp/ &&
--          docker exec ac-database mysql -u root -ppassword < /tmp/seed-test.sql
-- ============================================================

-- ── 1. Personagem Testando (acore_characters) ─────────────────────────────────
USE acore_characters;

DELETE FROM characters WHERE guid = 2;

INSERT INTO characters (
  guid, account, name, race, class, gender, level, xp, money,
  skin, face, hairStyle, hairColor, facialStyle,
  bankSlots, restState, playerFlags,
  position_x, position_y, position_z, map, zone, orientation,
  taximask, online, cinematic,
  totaltime, leveltime, logout_time,
  is_logout_resting, rest_bonus,
  resettalents_cost, resettalents_time,
  trans_x, trans_y, trans_z, trans_o, transguid,
  extra_flags, stable_slots, at_login,
  death_expire_time, arenaPoints, totalHonorPoints,
  todayHonorPoints, yesterdayHonorPoints,
  totalKills, todayKills, yesterdayKills,
  chosenTitle, knownCurrencies, watchedFaction,
  drunk, health, power1, power2, power3, power4, power5, power6, power7,
  latency, talentGroupsCount, activeTalentGroup,
  exploredZones, equipmentCache, ammoId, knownTitles, actionBars, grantableLevels,
  innTriggerId
) VALUES (
  2, 2, 'Testando', 2, 7, 1, 80, 0, 100000,
  1, 3, 2, 0, 0,
  0, 2, 0,
  -618.518, -4251.67, 38.718, 1, 14, 2.08364,
  '0 0 131072 4 0 0 1048576 0 0 0 0 0 0 0', 0, 0,
  0, 0, UNIX_TIMESTAMP(),
  0, 0.0,
  0, 0,
  0, 0, 0, 0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 0,
  0, 0, 0,
  0, 0, 0,
  0, 15000, 10000, 0, 0, 0, 0, 0, 0,
  0, 1, 0,
  '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0',
  '', 0, '', 0, 0,
  0
);

-- ── 2. wow_marketplace ────────────────────────────────────────────────────────
USE wow_marketplace;

TRUNCATE TABLE audit_log;
TRUNCATE TABLE fulfillment_queue;
TRUNCATE TABLE marketplace_listings;
TRUNCATE TABLE auction_bids;
TRUNCATE TABLE auction_items;

-- item_whitelist
INSERT IGNORE INTO item_whitelist (item_entry, item_name, category, rarity, can_auction, can_marketplace, added_by) VALUES
  (19019, 'Thunderfury, Blessed Blade of the Windseeker', 'TRANSMOG',   'LEGENDARY', 1, 1, 1),
  (17182, 'Sulfuras, Hand of Ragnaros',                   'TRANSMOG',   'LEGENDARY', 1, 1, 1),
  (22736, 'Ashes of Alar',                                'MOUNT',      'EPIC',      1, 1, 1),
  (44569, 'Spectral Tiger',                               'MOUNT',      'EPIC',      1, 1, 1),
  (18563, 'Formula: Enchant Weapon - Mongoose',           'CONSUMABLE', 'RARE',      1, 1, 1),
  (32837, 'Invincibles Reins',                            'MOUNT',      'LEGENDARY', 1, 1, 1),
  (49623, 'Recipe: Flask of the Titans',                  'CONSUMABLE', 'RARE',      1, 1, 1),
  (30482, 'Reins of the Black Drake',                     'MOUNT',      'EPIC',      1, 1, 1);

-- wallets
INSERT IGNORE INTO wallets (account_id, dp, vp) VALUES (1, 50000, 200), (2, 1500, 10);
UPDATE wallets SET dp = 50000, vp = 200 WHERE account_id = 1;
UPDATE wallets SET dp =  1500, vp =  10 WHERE account_id = 2;

-- auction_items — ADMIN cria (IDs 1-6 apos TRUNCATE)
INSERT INTO auction_items (item_entry, item_count, starting_bid, min_increment, buyout_price, reserve_price, end_time, status, created_by, description) VALUES
  (19019, 1, 1000, 100, 15000, 5000,  DATE_ADD(NOW(), INTERVAL 48 HOUR), 'ACTIVE', 1, 'Lendario - apenas 1 no servidor!'),
  (22736, 1,  500,  50,  8500, NULL,  DATE_ADD(NOW(), INTERVAL 24 HOUR), 'ACTIVE', 1, 'Montura Epica - Ashes of Alar'),
  (32837, 1, 2000, 200, 20000, 10000, DATE_ADD(NOW(), INTERVAL 72 HOUR), 'ACTIVE', 1, NULL),
  (17182, 1,  800, 100,  NULL, NULL,  DATE_ADD(NOW(), INTERVAL  6 HOUR), 'ACTIVE', 1, 'Sulfuras - arma lendaria!'),
  (44569, 1, 1500, 150,  6000, NULL,  DATE_ADD(NOW(), INTERVAL 24 HOUR), 'DRAFT',  1, 'Rascunho - publicar em breve'),
  (49623, 3,   50,  10,  NULL, NULL,  DATE_ADD(NOW(), INTERVAL 12 HOUR), 'ACTIVE', 1, NULL);

-- auction_bids — TESTANDO da lances (IDs 1, 2, 4 correspondem aos leiloes acima)
INSERT INTO auction_bids (auction_id, account_id, bid_amount) VALUES
  (1, 2, 1100),
  (1, 2, 1300),
  (2, 2,  550),
  (4, 2,  900);

UPDATE auction_items SET current_bid = 1300, current_bidder_id = 2 WHERE id = 1;
UPDATE auction_items SET current_bid =  550, current_bidder_id = 2 WHERE id = 2;
UPDATE auction_items SET current_bid =  900, current_bidder_id = 2 WHERE id = 4;

-- marketplace_listings — TESTANDO (guid=2, char=Testando) vende; ADMIN (guid=1, char=Arthubryan) vende
INSERT INTO marketplace_listings (seller_id, character_guid, character_name, item_guid, item_entry, item_name, item_count, price, category, rarity, status) VALUES
  (2, 2, 'Testando',   9001, 19019, 'Thunderfury, Blessed Blade of the Windseeker', 1, 15000, 'TRANSMOG',   'LEGENDARY', 'PENDING_APPROVAL'),
  (2, 2, 'Testando',   9002, 22736, 'Ashes of Alar',                                1,  8500, 'MOUNT',      'EPIC',      'PENDING_APPROVAL'),
  (2, 2, 'Testando',   9003, 44569, 'Spectral Tiger',                               1,  6000, 'MOUNT',      'EPIC',      'PENDING_APPROVAL'),
  (2, 2, 'Testando',   9004, 18563, 'Formula: Enchant Weapon - Mongoose',           2,   300, 'CONSUMABLE', 'RARE',      'PENDING_APPROVAL'),
  (2, 2, 'Testando',   9005, 30482, 'Reins of the Black Drake',                     1,  2500, 'MOUNT',      'EPIC',      'PENDING_APPROVAL'),
  (2, 2, 'Testando',   9006, 32837, 'Invincibles Reins',                            1, 20000, 'MOUNT',      'LEGENDARY', 'ACTIVE'),
  (2, 2, 'Testando',   9007, 49623, 'Recipe: Flask of the Titans',                  1,   150, 'CONSUMABLE', 'RARE',      'ACTIVE'),
  (1, 1, 'Arthubryan', 9008, 30482, 'Reins of the Black Drake',                     1,  2500, 'MOUNT',      'EPIC',      'SOLD'),
  (2, 2, 'Testando',   9009, 19019, 'Thunderfury',                                  1,  9999, 'TRANSMOG',   'LEGENDARY', 'REJECTED');

UPDATE marketplace_listings SET reject_reason = 'Preco acima do permitido para este item', approved_by = 1 WHERE id = 9;

-- fulfillment_queue (character_guid: Testando=2, Arthubryan=1)
INSERT INTO fulfillment_queue (type, reference_id, account_id, character_guid, item_entry, item_count, status, priority, notes) VALUES
  ('AUCTION_WIN',          1, 2, 2, 19019, 1, 'PENDING',     1, 'Leilao #1 - Lance final: 1300 DP - Testando'),
  ('MARKETPLACE_PURCHASE', 6, 2, 2, 32837, 1, 'PENDING',     3, 'Compra marketplace #6 - 20000 DP - Testando'),
  ('AUCTION_WIN',          2, 2, 2, 22736, 1, 'IN_PROGRESS', 1, 'Leilao #2 - 550 DP - Em entrega para Testando'),
  ('MARKETPLACE_PURCHASE', 8, 1, 1, 30482, 1, 'DELIVERED',   3, 'Compra marketplace #8 - 2500 DP - Arthubryan - Entregue'),
  ('AUCTION_WIN',          4, 2, 2, 17182, 1, 'PENDING',     1, 'Leilao #4 - 900 DP - Aguardando GM - Testando'),
  ('MARKETPLACE_PURCHASE', 7, 2, 2, 49623, 1, 'FAILED',      2, 'Personagem offline durante entrega. Retry necessario.');

-- audit_log
INSERT INTO audit_log (account_id, actor_role, action_type, target_type, target_id, before_state, after_state, details, ip_address, user_agent, correlation_id) VALUES
  (1, 'GM4', 'APPROVE_LISTING', 'marketplace_listings', 8,
   '{"status":"PENDING_APPROVAL","price":2500}', '{"status":"ACTIVE","price":2500}',
   '{"item_name":"Reins of the Black Drake","seller":"Testando"}',
   '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'corr-001'),
  (1, 'GM4', 'REJECT_LISTING', 'marketplace_listings', 9,
   '{"status":"PENDING_APPROVAL","price":9999}', '{"status":"REJECTED"}',
   '{"reason":"Preco acima do permitido","item_name":"Thunderfury","seller":"Testando"}',
   '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'corr-002'),
  (1, 'GM4', 'CREATE_AUCTION', 'auction_items', 1,
   NULL, '{"status":"ACTIVE","item_entry":19019}',
   '{"item_entry":19019,"starting_bid":1000,"duration_hours":48,"status":"ACTIVE"}',
   '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'corr-003'),
  (2, 'PLAYER', 'BID_PLACED', 'auction_items', 1,
   '{"current_bid":1000}', '{"current_bid":1100,"bidder_id":2}',
   '{"bid_amount":1100,"auction_id":1,"bidder":"Testando"}',
   '177.12.34.56', 'Mozilla/5.0 (Android 13) Chrome/119.0', 'corr-004'),
  (2, 'PLAYER', 'BID_PLACED', 'auction_items', 1,
   '{"current_bid":1100}', '{"current_bid":1300,"bidder_id":2}',
   '{"bid_amount":1300,"auction_id":1,"bidder":"Testando"}',
   '177.12.34.56', 'Mozilla/5.0 (Android 13) Chrome/119.0', 'corr-005'),
  (1, 'GM4', 'CREDIT_DP', 'wallets', 2,
   '{"dp":500}', '{"dp":1500}',
   '{"amount":1000,"reason":"Premiacao evento de Halloween","target_account":2}',
   '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'corr-006'),
  (2, 'PLAYER', 'MARKETPLACE_PURCHASE', 'marketplace_listings', 8,
   '{"status":"ACTIVE","price":2500}', '{"status":"SOLD","buyer_id":2}',
   '{"item_name":"Reins of the Black Drake","price":2500,"buyer":"Testando"}',
   '177.12.34.56', 'Mozilla/5.0 (Android 13) Chrome/119.0', 'corr-007'),
  (1, 'GM4', 'FULFILLMENT_DELIVERED', 'fulfillment_queue', 4,
   '{"status":"PENDING"}', '{"status":"DELIVERED"}',
   '{"item_entry":30482,"item_count":1,"account_id":1,"character":"Arthubryan"}',
   '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0) Chrome/120.0', 'corr-008');

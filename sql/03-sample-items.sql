-- ============================================================================
-- 03-sample-items.sql
-- Popula item_whitelist com itens de exemplo para Marketplace e Leilão GM
-- Todos os item_entry são do WotLK 3.3.5a (gamebuild 12340)
--
-- Como aplicar:
--   docker exec -i ac-database mysql -uroot -ppassword < sql/03-sample-items.sql
--
-- Para obter mais item_entry: consulte acore_world.item_template
--   SELECT entry, name FROM acore_world.item_template WHERE name LIKE '%Reins%';
-- ============================================================================

USE wow_marketplace;

INSERT INTO item_whitelist
  (item_entry, item_name, can_auction, can_marketplace, max_price, category, rarity, notes, added_by)
VALUES
  -- ── MONTARIAS ────────────────────────────────────────────────────────────
  (44151, 'Reins of the Blue Proto-Drake',          1, 1, 5000, 'MOUNT', 'EPIC',      'Drop Skadi (H)',            1),
  (44160, 'Reins of the Red Proto-Drake',           1, 1, 5000, 'MOUNT', 'EPIC',      'Meta-achievement 10man',    1),
  (43954, 'Reins of the Twilight Drake',            1, 1, 8000, 'MOUNT', 'EPIC',      'Drop Sartharion 3D 25',     1),
  (44178, 'Reins of the Plagued Proto-Drake',       1, 1, 8000, 'MOUNT', 'EPIC',      'Meta-achievement 25man',    1),
  (44170, 'Reins of the Ironbound Proto-Drake',     1, 1, 8000, 'MOUNT', 'EPIC',      'Meta-achievement 25man HM', 1),
  (49636, 'Invincible''s Reins',                    0, 1, 50000,'MOUNT', 'LEGENDARY', 'Drop Lich King 25 HM',      1),
  (45693, 'Mimiron''s Head',                        0, 1, 50000,'MOUNT', 'LEGENDARY', 'Drop Yogg-Saron 0-lights',  1),
  (25527, 'Ashes of Al''ar',                        0, 1, 30000,'MOUNT', 'LEGENDARY', 'Drop Kael''thas (TBC)',     1),

  -- ── PETS ─────────────────────────────────────────────────────────────────
  (33818, 'Pandaren Monk',                          1, 1, 2000, 'PET',   'EPIC',      'TCG / Loja',                1),
  (22114, 'Magical Crawdad',                        1, 1, 1500, 'PET',   'RARE',      'Fishing Mr. Pinchy',        1),
  (40653, 'Egbert''s Egg',                          1, 1, 500,  'PET',   'UNCOMMON',  'Children''s Week',          1),

  -- ── TRANSMOG ─────────────────────────────────────────────────────────────
  (31331, 'Warglaive of Azzinoth (MH)',             1, 0, 3000, 'TRANSMOG','LEGENDARY','Drop Illidan (TBC)',        1),
  (31332, 'Warglaive of Azzinoth (OH)',             1, 0, 3000, 'TRANSMOG','LEGENDARY','Drop Illidan (TBC)',        1),

  -- ── CONSUMÍVEIS ──────────────────────────────────────────────────────────
  (43599, 'Potion of Speed',                        1, 1, 50,  'CONSUMABLE','UNCOMMON','Alchemy 400',              1),
  (43569, 'Flask of the Frost Wyrm',                1, 1, 100, 'CONSUMABLE','UNCOMMON','Alchemy 420',              1),

  -- ── BOLSAS ───────────────────────────────────────────────────────────────
  (41599, 'Gigantic Bag',                           1, 1, 800, 'BAG',   'EPIC',      '22-slot',                   1),
  (38082, 'Portable Hole',                          1, 1, 600, 'BAG',   'RARE',      '24-slot',                   1)

ON DUPLICATE KEY UPDATE
  item_name       = VALUES(item_name),
  can_auction     = VALUES(can_auction),
  can_marketplace = VALUES(can_marketplace),
  max_price       = VALUES(max_price),
  category        = VALUES(category),
  rarity          = VALUES(rarity),
  notes           = VALUES(notes);

-- Resumo do que foi inserido
SELECT item_entry, item_name, category, rarity, can_auction, can_marketplace, max_price
FROM item_whitelist
ORDER BY category, rarity DESC;

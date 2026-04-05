-- ============================================================================
-- Migração: Check-in diário (Check Points)
-- ============================================================================
-- Adiciona coluna last_checkin na tabela wallets para controlar
-- o ganho diário de Check Points (VP) por presença online.

ALTER TABLE wow_marketplace.wallets
  ADD COLUMN last_checkin DATE NULL DEFAULT NULL
    COMMENT 'Data do último check-in diário para ganho de CP';

-- Adiciona tipo DAILY_CHECKIN ao enum de transações (se necessário,
-- a aplicação aceita strings — sem necessidade de alterar o enum do banco)

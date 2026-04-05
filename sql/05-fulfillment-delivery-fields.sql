-- ============================================================================
-- Migration: Adiciona campos de delivery na tabela fulfillment_queue
-- ============================================================================
-- Adiciona delivery_method e delivery_notes para rastreamento completo de entregas

USE wow_marketplace;

-- Adicionar campo delivery_method (método usado para entregar o item)
ALTER TABLE fulfillment_queue
ADD COLUMN delivery_method ENUM('SOAP_AUTO', 'SOAP_MANUAL', 'INGAME_TRADE', 'OTHER') DEFAULT NULL
AFTER delivered_at;

-- Adicionar campo delivery_notes (observações da entrega)
ALTER TABLE fulfillment_queue
ADD COLUMN delivery_notes VARCHAR(500) DEFAULT NULL
AFTER delivery_method;

-- Adicionar índice para buscas por método de entrega
ALTER TABLE fulfillment_queue
ADD KEY idx_delivery_method (delivery_method);

SELECT 'Migration 05-fulfillment-delivery-fields.sql completed successfully!' AS status;

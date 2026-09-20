-- =========================================================
-- Migration 005 — Reconcile inquiry status enum
-- - Keep database enum: new, contacted, resolved
-- - This aligns with PRD and provides better workflow semantics
-- =========================================================

-- The current enum already has the correct values: new, contacted, resolved
-- This migration documents the decision and ensures consistency
-- No changes needed to the enum itself, but we document the chosen values

-- If there were any existing records with 'open' or 'closed' status,
-- we would migrate them here. Since this is a fresh setup, no data migration needed.

-- Document the approved enum values for reference:
-- new: Inquiry just created, not yet contacted
-- contacted: Admin has reached out to the customer
-- resolved: Inquiry has been resolved/closed

-- Note: API code will be updated to use these values instead of new/open/closed

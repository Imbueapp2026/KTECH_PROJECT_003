-- =========================================================
-- Migration 023 — Add source_page to inquiries table
-- - Tracks which page the inquiry originated from
-- =========================================================

-- Add source_page column (nullable text)
alter table inquiries add column if not exists source_page text;

-- Add index for source_page (useful for analytics)
create index if not exists idx_inquiries_source_page on inquiries(source_page);

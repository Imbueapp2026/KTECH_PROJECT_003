-- =========================================================
-- Migration 032 — Add automated keep-alive / stay-awake cron
-- Prevents Supabase project from pausing after 7 days of inactivity
-- =========================================================

-- Enable pg_cron extension if not already active
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule a lightweight query to run every day at midnight (UTC)
-- Touching any table keeps the project active and resets the inactivity countdown
SELECT cron.schedule(
  'supabase-keep-alive',
  '0 0 * * *',
  $$ SELECT count(*) FROM public.categories; $$
);

COMMENT ON EXTENSION pg_cron IS 'Keeps database active by executing scheduled daily touch query';

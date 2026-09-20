-- =========================================================
-- Migration 006 — Fix RLS policies for proper public/admin separation
-- - Remove overly permissive public policies
-- - Add proper service role (admin) policies for full CRUD access
-- =========================================================

-- ── Drop existing overly permissive policies ─────────────────────────────

-- Drop inquiries public policies
drop policy if exists "inquiries: public insert" on inquiries;
drop policy if exists "inquiries: public select" on inquiries;
drop policy if exists "inquiries: public update" on inquiries;

-- Drop visits public policies
drop policy if exists "visits: public insert" on visits;
drop policy if exists "visits: public select" on visits;

-- Drop products public policy (will be recreated with service role support)
drop policy if exists "products: public read published" on products;

-- Drop categories public policy (will be recreated with service role support)
drop policy if exists "categories: public read" on categories;

-- ── Create proper public policies (read-only for public, insert for forms) ──

-- Categories: Public can read all
do $$ begin
  create policy "categories: public read"
    on categories for select using (true);
exception when duplicate_object then null; end $$;

-- Products: Public can read published products only
do $$ begin
  create policy "products: public read published"
    on products for select using (status = 'published');
exception when duplicate_object then null; end $$;

-- Inquiries: Public can insert only (for contact form)
do $$ begin
  create policy "inquiries: public insert"
    on inquiries for insert with check (true);
exception when duplicate_object then null; end $$;

-- Visits: Public can insert only (for analytics tracking)
do $$ begin
  create policy "visits: public insert"
    on visits for insert with check (true);
exception when duplicate_object then null; end $$;

-- ── Create service role (admin) policies for full CRUD access ─────────────

-- Categories: Service role has full access
do $$ begin
  create policy "categories: service role full access"
    on categories for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- Products: Service role has full access
do $$ begin
  create policy "products: service role full access"
    on products for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- Inquiries: Service role has full access
do $$ begin
  create policy "inquiries: service role full access"
    on inquiries for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

-- Visits: Service role has full access
do $$ begin
  create policy "visits: service role full access"
    on visits for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
exception when duplicate_object then null; end $$;

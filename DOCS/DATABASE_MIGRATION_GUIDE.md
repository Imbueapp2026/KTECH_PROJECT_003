# Database Migration Guide

## Overview
This guide provides instructions for applying database migrations to the Supabase production database for the Avirat Jewelers project.

## Prerequisites
- Access to Supabase project dashboard
- Supabase CLI installed (optional, for command-line application)
- Service role key (for CLI operations)

## Migration Files

The following migrations must be applied in order:

1. **001_initial_schema.sql** - Creates core tables (categories, products, inquiries, visits)
2. **002_seed_categories.sql** - Seeds 16 Indian jewellery categories
3. **003_add_offers_discounts.sql** - Adds offers and discounts tables
4. **004_update_products_schema.sql** - Updates products table with price and offer_id
5. **005_reconcile_inquiry_status.sql** - Documents inquiry status enum (no changes)
6. **006_fix_rls_policies.sql** - Fixes RLS policies for proper public/admin separation

## Applying Migrations

### Option 1: Via Supabase Dashboard (Recommended)

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. For each migration file (in numerical order):
   - Click "New Query"
   - Copy the contents of the migration file
   - Paste into the SQL editor
   - Click "Run" to execute
   - Verify no errors occurred
4. After all migrations are applied, verify tables exist in **Table Editor**

### Option 2: Via Supabase CLI

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Link your local project to Supabase:
   ```bash
   cd c:\Projects\KTech\AVIRAT\KTECH_PROJECT_003
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

## Verification

After applying migrations, verify the following:

### Tables Created
- ✓ categories
- ✓ products
- ✓ inquiries
- ✓ visits
- ✓ offers
- ✓ discounts

### RLS Policies Active
- Categories: Public read, Service role full access
- Products: Public read published, Service role full access
- Inquiries: Public insert, Service role full access
- Visits: Public insert, Service role full access
- Offers: Public read active, Service role full access
- Discounts: Public read via active offers, Service role full access

### Indexes Created
- idx_products_status
- idx_products_category_id
- idx_products_updated_at
- idx_products_offer_id
- idx_products_price
- idx_inquiries_status
- idx_inquiries_created_at
- idx_inquiries_product_id
- idx_visits_page_path
- idx_visits_product_id
- idx_visits_created_at
- idx_offers_is_active
- idx_offers_start_date
- idx_offers_end_date
- idx_discounts_offer_id

### Categories Seeded
- 16 Indian jewellery categories with SVG icons
- All marked as system categories (is_system = true)

## Troubleshooting

### Migration Fails
- Check if tables already exist (may need to drop them first)
- Verify you have sufficient permissions
- Check for syntax errors in the SQL

### RLS Policies Not Working
- Ensure RLS is enabled on all tables: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
- Verify service role key is being used in admin app
- Check policy names match exactly

### Missing Data
- Run migration 002 again to seed categories
- Check for constraint violations

## Rollback

If you need to rollback migrations, you can either:
1. Manually drop tables and re-run migrations
2. Use Supabase CLI: `supabase db reset` (WARNING: This deletes all data)

## Notes

- Migration 005 is a documentation-only migration (no schema changes)
- Migration 006 is critical for security - it fixes overly permissive RLS policies
- All migrations use `IF NOT EXISTS` and `DROP IF EXISTS` for safety
- The service role key must be used for admin operations to bypass RLS

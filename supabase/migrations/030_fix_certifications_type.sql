-- =========================================================
-- Migration 030 — Fix certifications column type to text[]
-- =========================================================

-- Helper function to safely convert certifications text to text[] without USING subquery limitation
CREATE OR REPLACE FUNCTION pg_temp.parse_certifications_to_array(val text)
RETURNS text[]
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF val IS NULL OR trim(val) = '' THEN
    RETURN NULL;
  END IF;

  IF val ~ '^\s*\[' THEN
    BEGIN
      RETURN ARRAY(SELECT json_array_elements_text(val::json));
    EXCEPTION WHEN OTHERS THEN
      RETURN string_to_array(val, ',');
    END;
  ELSE
    RETURN string_to_array(val, ',');
  END IF;
END;
$$;

-- Convert certifications column to text[] safely
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'products' 
      AND column_name = 'certifications' 
      AND data_type = 'text'
  ) THEN
    ALTER TABLE products 
    ALTER COLUMN certifications TYPE text[] 
    USING pg_temp.parse_certifications_to_array(certifications);
  END IF;
END $$;

COMMENT ON COLUMN products.certifications IS 'Postgres array of certifications (e.g. {BIS Hallmark, IGI})';

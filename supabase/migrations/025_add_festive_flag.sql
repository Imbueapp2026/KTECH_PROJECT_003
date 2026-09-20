-- Create festivals table if it doesn't already exist
CREATE TABLE IF NOT EXISTS festivals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  date TEXT, -- Festival date (can be flexible format for different calendars)
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE festivals IS 'Stores festival information for seasonal product collections';
COMMENT ON COLUMN festivals.is_active IS 'Whether this festival is currently active and should be displayed on the website';

-- Create index on is_active for quick filtering
CREATE INDEX IF NOT EXISTS idx_festivals_is_active ON festivals(is_active) WHERE is_active = true;

-- Add festival_id to products table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'festival_id'
  ) THEN
    ALTER TABLE products 
    ADD COLUMN festival_id UUID REFERENCES festivals(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN products.festival_id IS 'Foreign key to festivals table - links product to specific festival collection';

-- Create index on festival_id for filtering
CREATE INDEX IF NOT EXISTS idx_products_festival_id ON products(festival_id) WHERE festival_id IS NOT NULL;

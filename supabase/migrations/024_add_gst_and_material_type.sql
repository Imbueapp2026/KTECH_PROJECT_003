-- Add GST percentage field to products table
ALTER TABLE products 
ADD COLUMN gst_percent NUMERIC DEFAULT 5.0 NOT NULL CHECK (gst_percent >= 0 AND gst_percent <= 100);

-- Add material_type field to products table (gold/silver)
ALTER TABLE products 
ADD COLUMN material_type TEXT DEFAULT 'gold' NOT NULL CHECK (material_type IN ('gold', 'silver'));

-- Add comment for documentation
COMMENT ON COLUMN products.gst_percent IS 'GST percentage to apply to product pricing (default 5%)';
COMMENT ON COLUMN products.material_type IS 'Material type of the product: gold or silver';

-- Create index on material_type for filtering
CREATE INDEX idx_products_material_type ON products(material_type);

-- Update RLS policies to handle new fields
-- No changes needed as existing policies will work with new fields

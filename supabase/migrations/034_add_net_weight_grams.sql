-- Add net_weight_grams column to products table
ALTER TABLE products 
ADD COLUMN if not exists net_weight_grams NUMERIC(8, 3);

-- Add comment for documentation
COMMENT ON COLUMN products.net_weight_grams IS 'Net weight of the metal (gold/silver) in grams, excluding stones or additions';

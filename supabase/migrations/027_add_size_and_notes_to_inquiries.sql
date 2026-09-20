-- Add size and additional_notes columns to inquiries table
ALTER TABLE inquiries 
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS additional_notes TEXT;

-- Add index on size for faster filtering
CREATE INDEX IF NOT EXISTS idx_inquiries_size ON inquiries(size);

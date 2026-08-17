-- Add traceability columns to product_embeddings
-- Tracks which source PDF and page each chunk came from

ALTER TABLE product_embeddings
  ADD COLUMN IF NOT EXISTS source_document text,
  ADD COLUMN IF NOT EXISTS page_number int;

-- Allow 'manual' as a product category for the full application guide
ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_category_check;

ALTER TABLE products
  ADD CONSTRAINT products_category_check
  CHECK (category IN ('primer','base_coat','finish_coat','sealer','pigment','manual'));

-- Index to quickly find all chunks from a given source document
CREATE INDEX IF NOT EXISTS product_embeddings_source_idx
  ON product_embeddings (source_document);

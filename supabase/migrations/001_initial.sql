-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Product library (Semco admin managed, read-only for installers)
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('primer','base_coat','finish_coat','sealer','pigment')),
  coverage_min_sqm_per_kg decimal,
  coverage_max_sqm_per_kg decimal,
  pack_size_kg decimal DEFAULT 1,
  pot_life_minutes int,
  cure_time_hours int,
  tds_content text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

-- Chunked TDS text embeddings for RAG (semantic search)
CREATE TABLE IF NOT EXISTS product_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  chunk_text text NOT NULL,
  embedding vector(1536),
  metadata jsonb DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS product_embeddings_vector_idx
  ON product_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Vector similarity search function used by the embed-and-search edge function
CREATE OR REPLACE FUNCTION match_product_embeddings(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  product_id uuid,
  chunk_text text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.id,
    pe.product_id,
    pe.chunk_text,
    pe.metadata,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM product_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Standard + installer custom color formulas
CREATE TABLE IF NOT EXISTS colors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  is_standard boolean DEFAULT true,
  installer_id uuid REFERENCES auth.users(id),
  pigments jsonb NOT NULL DEFAULT '[]',
  photo_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER colors_updated_at BEFORE UPDATE ON colors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Project files
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid REFERENCES auth.users(id) NOT NULL,
  client_name text,
  client_email text,
  client_phone text,
  site_address text,
  substrate_type text,
  total_area_sqm decimal,
  selected_color_id uuid REFERENCES colors(id),
  finish_type text,
  sealer_product_id uuid REFERENCES products(id),
  status text DEFAULT 'active' CHECK (status IN ('active','complete','on_hold')),
  warranty_issued boolean DEFAULT false,
  completion_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Progress photos for warranty documentation
CREATE TABLE IF NOT EXISTS project_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  installer_id uuid REFERENCES auth.users(id) NOT NULL,
  stage text NOT NULL CHECK (stage IN ('substrate','primer','base_coat','finish_coat','sealed','final')),
  photo_url text NOT NULL,
  caption text,
  taken_at timestamptz DEFAULT now()
);

-- Batch logs for QC and warranty traceability
CREATE TABLE IF NOT EXISTS batch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) NOT NULL,
  batch_number text NOT NULL,
  quantity_kg decimal,
  coverage_achieved_sqm decimal,
  applied_at timestamptz DEFAULT now(),
  notes text
);

-- Saved coverage calculations
CREATE TABLE IF NOT EXISTS calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id),
  installer_id uuid REFERENCES auth.users(id),
  area_sqm decimal NOT NULL,
  substrate_type text NOT NULL,
  waste_pct decimal DEFAULT 10,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI conversation history
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installer_id uuid REFERENCES auth.users(id),
  title text,
  messages jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TRIGGER conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;

-- Installer policies: own data only
CREATE POLICY "installers_own_projects" ON projects
  USING (installer_id = auth.uid());

CREATE POLICY "installers_own_project_photos" ON project_photos
  USING (installer_id = auth.uid());

CREATE POLICY "installers_own_batch_logs" ON batch_logs
  USING (project_id IN (SELECT id FROM projects WHERE installer_id = auth.uid()));

CREATE POLICY "installers_own_calculations" ON calculations
  USING (installer_id = auth.uid());

CREATE POLICY "installers_own_conversations" ON conversations
  USING (installer_id = auth.uid());

CREATE POLICY "standard_colors_readable_by_all" ON colors
  FOR SELECT USING (is_standard = true);

CREATE POLICY "installers_own_custom_colors" ON colors
  USING (is_standard = false AND installer_id = auth.uid());

-- Products are read-only for all authenticated users
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_readable_by_authenticated" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

ALTER TABLE product_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "embeddings_readable_by_authenticated" ON product_embeddings
  FOR SELECT USING (auth.role() = 'authenticated');

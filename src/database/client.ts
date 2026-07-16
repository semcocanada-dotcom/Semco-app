import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const sqlite = SQLite.openDatabaseSync('semco_pro.db', { enableChangeListener: true });

export const db = drizzle(sqlite, { schema });

export async function initDatabase() {
  await sqlite.execAsync(`PRAGMA journal_mode = WAL;`);
  await sqlite.execAsync(`PRAGMA foreign_keys = ON;`);

  await sqlite.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      coverage_min_sqm_per_kg REAL,
      coverage_max_sqm_per_kg REAL,
      pack_size_kg REAL DEFAULT 1,
      pot_life_minutes INTEGER,
      cure_time_hours INTEGER,
      tds_content TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
    CREATE INDEX IF NOT EXISTS products_sku_idx ON products(sku);

    CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
      sku,
      name,
      category,
      tds_content,
      content='products',
      content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS products_fts_insert AFTER INSERT ON products BEGIN
      INSERT INTO products_fts(rowid, sku, name, category, tds_content)
      VALUES (new.rowid, new.sku, new.name, new.category, new.tds_content);
    END;

    CREATE TRIGGER IF NOT EXISTS products_fts_update AFTER UPDATE ON products BEGIN
      UPDATE products_fts SET
        sku = new.sku,
        name = new.name,
        category = new.category,
        tds_content = new.tds_content
      WHERE rowid = new.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS products_fts_delete AFTER DELETE ON products BEGIN
      DELETE FROM products_fts WHERE rowid = old.rowid;
    END;

    CREATE TABLE IF NOT EXISTS colors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT,
      is_standard INTEGER NOT NULL DEFAULT 1,
      installer_id TEXT,
      pigments TEXT NOT NULL DEFAULT '[]',
      swatch_hex TEXT,
      photo_url TEXT,
      storage_path TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS colors_installer_idx ON colors(installer_id);
    CREATE INDEX IF NOT EXISTS colors_is_standard_idx ON colors(is_standard);

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      installer_id TEXT NOT NULL,
      client_name TEXT,
      client_email TEXT,
      client_phone TEXT,
      site_address TEXT,
      substrate_type TEXT,
      total_area_sqm REAL,
      selected_color_id TEXT,
      finish_type TEXT,
      sealer_product_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      warranty_issued INTEGER NOT NULL DEFAULT 0,
      completion_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS projects_installer_idx ON projects(installer_id);
    CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);

    CREATE TABLE IF NOT EXISTS project_photos (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      installer_id TEXT NOT NULL,
      stage TEXT NOT NULL,
      photo_url TEXT NOT NULL,
      storage_path TEXT,
      caption TEXT,
      taken_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS project_photos_project_idx ON project_photos(project_id);

    CREATE TABLE IF NOT EXISTS batch_logs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      quantity_kg REAL,
      coverage_achieved_sqm REAL,
      applied_at TEXT NOT NULL,
      notes TEXT
    );
    CREATE INDEX IF NOT EXISTS batch_logs_project_idx ON batch_logs(project_id);
    CREATE INDEX IF NOT EXISTS batch_logs_product_idx ON batch_logs(product_id);

    CREATE TABLE IF NOT EXISTS calculations (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      installer_id TEXT,
      area_sqm REAL NOT NULL,
      substrate_type TEXT NOT NULL,
      waste_pct REAL NOT NULL DEFAULT 10,
      result TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS calculations_project_idx ON calculations(project_id);
    CREATE INDEX IF NOT EXISTS calculations_installer_idx ON calculations(installer_id);

    CREATE TABLE IF NOT EXISTS order_requests (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      calculation_id TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS order_requests_project_idx ON order_requests(project_id);
    CREATE INDEX IF NOT EXISTS order_requests_status_idx ON order_requests(status);

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      installer_id TEXT,
      title TEXT,
      messages TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS conversations_installer_idx ON conversations(installer_id);

    CREATE TABLE IF NOT EXISTS installer_profiles (
      id TEXT PRIMARY KEY,
      installer_id TEXT NOT NULL,
      company_name TEXT,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      company_address TEXT,
      city TEXT,
      province TEXT,
      postal_code TEXT,
      semco_account_id TEXT,
      certification_status TEXT NOT NULL DEFAULT 'pending',
      assigned_dealer_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS installer_profiles_installer_idx ON installer_profiles(installer_id);
    CREATE INDEX IF NOT EXISTS installer_profiles_postal_idx ON installer_profiles(postal_code);

    CREATE TABLE IF NOT EXISTS reward_credits (
      id TEXT PRIMARY KEY,
      installer_id TEXT NOT NULL,
      project_id TEXT,
      source_type TEXT NOT NULL,
      source_id TEXT,
      sqft REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      verified_at TEXT
    );
    CREATE INDEX IF NOT EXISTS reward_credits_installer_idx ON reward_credits(installer_id);
    CREATE INDEX IF NOT EXISTS reward_credits_project_idx ON reward_credits(project_id);
    CREATE INDEX IF NOT EXISTS reward_credits_status_idx ON reward_credits(status);

    CREATE TABLE IF NOT EXISTS warranty_reviews (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      installer_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'in_review',
      products_summary TEXT,
      effective_date TEXT,
      reviewer_name TEXT,
      reviewer_signature_url TEXT,
      warranty_document_url TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      reviewed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS warranty_reviews_project_idx ON warranty_reviews(project_id);
    CREATE INDEX IF NOT EXISTS warranty_reviews_installer_idx ON warranty_reviews(installer_id);
    CREATE INDEX IF NOT EXISTS warranty_reviews_status_idx ON warranty_reviews(status);

    CREATE TABLE IF NOT EXISTS purchase_receipts (
      id TEXT PRIMARY KEY,
      installer_id TEXT NOT NULL,
      project_id TEXT,
      dealer_name TEXT,
      receipt_number TEXT,
      receipt_url TEXT,
      sqft_claimed REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      reviewed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS purchase_receipts_installer_idx ON purchase_receipts(installer_id);
    CREATE INDEX IF NOT EXISTS purchase_receipts_project_idx ON purchase_receipts(project_id);
    CREATE INDEX IF NOT EXISTS purchase_receipts_status_idx ON purchase_receipts(status);

    CREATE TABLE IF NOT EXISTS project_signoffs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      installer_id TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      title TEXT NOT NULL,
      customer_name TEXT,
      customer_email TEXT,
      summary TEXT,
      notes TEXT,
      form_data TEXT NOT NULL DEFAULT '{}',
      signature_data TEXT,
      signed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS project_signoffs_project_idx ON project_signoffs(project_id);
    CREATE INDEX IF NOT EXISTS project_signoffs_type_idx ON project_signoffs(type);
    CREATE INDEX IF NOT EXISTS project_signoffs_status_idx ON project_signoffs(status);
  `);

  try {
    await sqlite.execAsync(`ALTER TABLE colors ADD COLUMN swatch_hex TEXT;`);
  } catch {
    // Existing local databases may already have the column.
  }

  try {
    await sqlite.execAsync(`ALTER TABLE colors ADD COLUMN storage_path TEXT;`);
  } catch {
    // Existing local databases may already have the column.
  }

  try {
    await sqlite.execAsync(`ALTER TABLE project_photos ADD COLUMN storage_path TEXT;`);
  } catch {
    // Existing local databases may already have the column.
  }

  const { migrateLegacyIdsForCloud } = await import('./cloud-migrations');
  await migrateLegacyIdsForCloud();
}

export { sqlite };

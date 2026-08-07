import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const read = (...parts: string[]) => fs.readFileSync(path.join(root, ...parts), 'utf8');
const providerScreen = read('app', '(tabs)', 'providers.tsx');
const officialLinks = read('lib', 'officialLinks.ts');
const schema = read('supabase', 'schema.sql');
const migration = read(
  'supabase',
  'migrations',
  '20260807133411_remove_global_provider_directory.sql',
);

describe('private provider records', () => {
  it('links only to the official Saskatchewan registry in the browser', () => {
    expect(officialLinks).toContain('https://www.saskatchewan.ca/');
    expect(providerScreen).toContain('Linking.openURL(SASKATCHEWAN_PROVIDER_REGISTRY_URL)');
    expect(providerScreen).toContain('does not copy, store, rank, or endorse its public directory');
  });

  it('reads, updates, and deletes providers only for the signed-in account', () => {
    expect(providerScreen).toContain(".eq('parent_id', session.user.id)");
    expect(providerScreen).not.toContain(".is('parent_id', null)");
    expect(providerScreen).not.toContain(".eq('is_approved_sk', true)");
    expect(providerScreen).not.toContain("Linking.openURL(`tel:");
    expect(providerScreen).not.toContain("Linking.openURL(`mailto:");
  });

  it('removes shared database rows and restricts reads to private rows', () => {
    expect(migration).toContain('DELETE FROM public.providers');
    expect(migration).toContain('WHERE parent_id IS NULL');
    expect(migration).toContain('ALTER COLUMN parent_id SET NOT NULL');
    expect(migration).toContain('ALTER COLUMN is_approved_sk SET DEFAULT FALSE');
    expect(migration).toContain('USING (parent_id = (SELECT auth.uid()))');
    expect(schema).toContain('CREATE POLICY "providers: read own"');
    expect(schema).toContain('parent_id      UUID NOT NULL REFERENCES auth.users(id)');
    expect(schema).toContain('is_approved_sk BOOLEAN NOT NULL DEFAULT false');
    expect(schema).not.toContain('parent_id IS NULL OR parent_id = auth.uid()');
  });

  it('does not bundle the former scraped directory or notes', () => {
    const removed = [
      'seed_providers.sql',
      'update_provider_notes_part1.sql',
      'update_provider_notes_part2.sql',
      'update_provider_notes_part3.sql',
      'update_provider_notes_part4.sql',
    ];
    for (const file of removed) {
      expect(fs.existsSync(path.join(root, 'supabase', file))).toBe(false);
    }
  });
});

import fs from 'fs';
import path from 'path';

const root = path.join(__dirname, '..');
const sourceRoots = ['app', 'components', 'lib', 'docs', 'supabase'];

function sourceFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(file);
    return /\.(?:ts|tsx|html|sql)$/.test(entry.name) ? [file] : [];
  });
}

const productionSource = sourceRoots
  .flatMap(directory => sourceFiles(path.join(root, directory)))
  .map(file => fs.readFileSync(file, 'utf8'))
  .join('\n');

describe('mapping service privacy', () => {
  it('contains no public OpenStreetMap, Nominatim, or OSRM endpoint', () => {
    expect(productionSource).not.toMatch(/nominatim\.openstreetmap\.org/i);
    expect(productionSource).not.toMatch(/router\.project-osrm\.org/i);
    expect(productionSource).not.toMatch(/openstreetmap\.org/i);
  });

  it('uses manual address entry instead of network autocomplete', () => {
    expect(fs.existsSync(path.join(root, 'components', 'AddressAutocomplete.tsx'))).toBe(false);
    expect(productionSource).not.toContain('@components/AddressAutocomplete');
    expect(readFile('app', '(tabs)', 'mileage.tsx')).toContain('Enter the distance manually');
  });

  it('contains no client geocoding or routing implementation', () => {
    expect(fs.existsSync(path.join(root, 'lib', 'geocoding.ts'))).toBe(false);
    expect(productionSource).not.toContain('@lib/geocoding');
    expect(productionSource).not.toContain('buildMileageProposal');
    expect(productionSource).not.toContain('maps.googleapis.com/maps');
  });
});

function readFile(...parts: string[]): string {
  return fs.readFileSync(path.join(root, ...parts), 'utf8');
}

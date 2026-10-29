import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Read-only release verification. Fetch exactly the manifest an installed
// production client requests, then verify its downloadable launch asset.
const [artifactDirectory, expectedIos, expectedAndroid] = process.argv.slice(2);
if (!artifactDirectory || !expectedIos || !expectedAndroid) {
  throw new Error('Usage: node scripts/verify-expo-update.mjs <export-directory> <ios-update-id> <android-update-id>');
}
const root = process.cwd();
const directory = path.resolve(root, artifactDirectory);
if (!directory.startsWith(`${root}${path.sep}`)) throw new Error('Export directory must be inside the project');
const app = JSON.parse(readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const metadata = JSON.parse(readFileSync(path.join(directory, 'metadata.json'), 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('base64url');

function parseUpdate(response, body) {
  const type = response.headers.get('content-type') ?? '';
  if (type.includes('multipart/mixed')) {
    const boundary = type.match(/boundary=(?:"([^"]+)"|([^;\s]+))/)?.slice(1).find(Boolean);
    if (!boundary) throw new Error('Multipart response omitted its boundary');
    const parts = {};
    for (const part of body.split(`--${boundary}`)) {
      const separator = part.indexOf('\r\n\r\n');
      if (separator < 0) continue;
      const name = part.slice(0, separator).match(/name="(manifest|extensions)"/i)?.[1];
      if (name) parts[name] = JSON.parse(part.slice(separator + 4).trim());
    }
    if (!parts.manifest) throw new Error('No update manifest was served');
    return parts;
  }
  return { manifest: JSON.parse(body), extensions: {} };
}

const reports = await Promise.all([['ios', expectedIos], ['android', expectedAndroid]].map(async ([platform, expectedId]) => {
  const response = await fetch(app.updates.url, {
    headers: {
      'expo-platform': platform,
      'expo-runtime-version': app.version,
      'expo-channel-name': 'production',
      'expo-protocol-version': '1',
      accept: 'multipart/mixed,application/expo+json,application/json',
    },
  });
  if (!response.ok) throw new Error(`${platform} manifest request failed: HTTP ${response.status}`);
  const { manifest, extensions } = parseUpdate(response, await response.text());
  if (manifest.id !== expectedId) throw new Error(`${platform} is serving ${manifest.id}, expected ${expectedId}`);
  if (manifest.runtimeVersion !== app.version) throw new Error(`${platform} runtime mismatch`);
  // Expo supplies short-lived asset authorization in the multipart extensions,
  // just as expo-updates receives it. Never log or persist those headers.
  const assetUrl = new URL(manifest.launchAsset.url);
  if (assetUrl.protocol !== 'https:' || assetUrl.hostname !== 'assets.eascdn.net') {
    throw new Error('Unexpected Expo asset host');
  }
  const asset = await fetch(assetUrl, {
    headers: extensions?.assetRequestHeaders?.[manifest.launchAsset.key] ?? {},
  });
  if (!asset.ok) throw new Error(`${platform} bundle download failed: HTTP ${asset.status}`);
  const downloaded = new Uint8Array(await asset.arrayBuffer());
  const downloadHash = hash(downloaded);
  const localBundle = path.resolve(directory, metadata.fileMetadata[platform].bundle);
  if (!localBundle.startsWith(`${directory}${path.sep}`)) throw new Error('Bundle must be inside export directory');
  const localHash = hash(readFileSync(localBundle));
  if (downloadHash !== manifest.launchAsset.hash || downloadHash !== localHash) {
    throw new Error(`${platform} served bundle does not match the verified local artifact`);
  }
  return {
    platform, updateId: manifest.id, runtimeVersion: manifest.runtimeVersion,
    createdAt: manifest.createdAt, downloadedBytes: downloaded.byteLength,
    sha256Base64Url: downloadHash, matchesVerifiedLocalArtifact: true,
  };
}));

const report = { verifiedAt: new Date().toISOString(), channel: 'production', platforms: reports };
writeFileSync(path.join(directory, 'production-verification.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));

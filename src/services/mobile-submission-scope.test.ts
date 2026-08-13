import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '../..');

function sourceFiles(relativeDirectory: string): string[] {
  const root = path.join(REPO_ROOT, relativeDirectory);
  const files: string[] = [];

  function visit(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) visit(fullPath);
      else if (/\.(?:ts|tsx|js|json)$/.test(entry.name)) files.push(fullPath);
    }
  }

  visit(root);
  return files;
}

function combinedText(files: string[]): string {
  return files.map((file) => readFileSync(file, 'utf8')).join('\n');
}

describe('App Store mobile submission scope', () => {
  it('contains no remote generation or semantic-retrieval implementation in mobile source', () => {
    const mobileSource = combinedText([
      ...sourceFiles('app'),
      ...sourceFiles('src/services/ai'),
      path.join(REPO_ROOT, 'src/hooks/useAssistant.ts'),
    ]);

    expect(mobileSource).not.toMatch(
      /firebase\/ai|@react-native-firebase|generateContent|Gemini|OpenAI|embed-and-search|retrieveRelevantChunks/i,
    );
  });

  it('removes the Firebase runtime configuration and production dependencies', () => {
    const packageJson = JSON.parse(readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'));
    const allDependencies = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ].join('\n');
    const runtimeConfig = combinedText([
      path.join(REPO_ROOT, 'app.json'),
      path.join(REPO_ROOT, 'app.config.js'),
      path.join(REPO_ROOT, 'eas.json'),
    ]);

    expect(allDependencies).not.toMatch(/firebase|openai|anthropic/i);
    expect(runtimeConfig).not.toMatch(/firebase|GoogleService-Info|google-services/i);
    expect(existsSync(path.join(REPO_ROOT, 'config/firebase/GoogleService-Info.plist'))).toBe(false);
    expect(existsSync(path.join(REPO_ROOT, 'config/firebase/google-services.json'))).toBe(false);
  });

  it('excludes administrator, portal, and rewards routes and claims', () => {
    const removedRoutes = [
      'app/portal/index.tsx',
      'app/(app)/admin/index.tsx',
      'app/(app)/assistant/debug.tsx',
      'app/(app)/rewards/index.tsx',
      'src/services/admin-workbench.ts',
      'src/services/portal-cloud.ts',
      'src/services/admin-access.ts',
    ];
    for (const route of removedRoutes) {
      expect(existsSync(path.join(REPO_ROOT, route))).toBe(false);
    }

    const appSource = combinedText(sourceFiles('app'));
    expect(appSource).not.toMatch(/['"]\/(?:admin|portal|rewards)(?:['"/])/i);
    expect(appSource).not.toMatch(/reward tiers?|unlocked (?:reward|prize)|Las Vegas|admin portal/i);

    const cloudSync = readFileSync(path.join(REPO_ROOT, 'src/services/cloud-sync.ts'), 'utf8');
    expect(cloudSync).not.toMatch(/rewardCredits|reward_credits|syncRewardCreditToCloud/i);
  });

  it('does not show a microphone affordance without microphone functionality', () => {
    const appAndUiSource = combinedText([
      ...sourceFiles('app'),
      ...sourceFiles('src/components'),
    ]);

    expect(appAndUiSource).not.toMatch(/showMic|mic-outline/i);
  });

  it('keeps guide conversation persistence local to the device', () => {
    const assistantHook = readFileSync(path.join(REPO_ROOT, 'src/hooks/useAssistant.ts'), 'utf8');
    const cloudSync = readFileSync(path.join(REPO_ROOT, 'src/services/cloud-sync.ts'), 'utf8');

    expect(assistantHook).not.toMatch(/supabase|syncConversationToCloud|hydrateCloudConversations/i);
    expect(cloudSync).not.toMatch(/syncConversationToCloud|hydrateCloudConversations|fetchCloud\(['"]conversations/i);
  });

  it('uses the App Store version line and excludes every release export directory', () => {
    const appJson = JSON.parse(readFileSync(path.join(REPO_ROOT, 'app.json'), 'utf8'));
    const gitIgnore = readFileSync(path.join(REPO_ROOT, '.gitignore'), 'utf8');
    const easIgnore = readFileSync(path.join(REPO_ROOT, '.easignore'), 'utf8');

    expect(appJson.expo.version).toBe('1.0.2');
    expect(gitIgnore).toContain('.release*/');
    expect(easIgnore).toContain('.release*/');
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Get bump type (patch, minor, major) or explicit version from CLI arg
const typeOrVersion = process.argv[2] || 'patch';

// Read current root version
const rootPkgPath = path.join(rootDir, 'package.json');
const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
const currentVersion = rootPkg.version;

function calculateNextVersion(curr, type) {
  if (/^\d+\.\d+\.\d+/.test(type)) return type;
  const [major, minor, patch] = curr.split('.').map(Number);
  if (type === 'major') return `${major + 1}.0.0`;
  if (type === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`; // default patch
}

const nextVersion = calculateNextVersion(currentVersion, typeOrVersion);
console.log(`\n🚀 Bumping HomuraJS version: v${currentVersion} -> v${nextVersion}\n`);

// 1. Update all package.json files
const pkgPaths = [
  'package.json',
  'packages/core/package.json',
  'packages/db/package.json',
  'packages/devtools/package.json',
  'packages/homura-js/package.json',
  'packages/react/package.json',
  'packages/vanilla/package.json',
  'packages/vue/package.json',
  'docs/package.json',
  'playground/package.json'
];

for (const rel of pkgPaths) {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    const json = JSON.parse(fs.readFileSync(full, 'utf8'));
    json.version = nextVersion;
    fs.writeFileSync(full, JSON.stringify(json, null, 2) + '\n');
    console.log(`✓ Updated ${rel} to ${nextVersion}`);
  }
}

// 2. Update HTML & README version tags
const htmlFiles = ['docs/index.html', 'playground/index.html'];
for (const rel of htmlFiles) {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(
      /(class="version-tag">v|\bclass="badge">v)\d+\.\d+\.\d+/g,
      `$1${nextVersion}`
    );
    fs.writeFileSync(full, content);
    console.log(`✓ Updated ${rel} badge to v${nextVersion}`);
  }
}

const readmeFiles = ['README.md', 'packages/homura-js/README.md', 'packages/core/README.md'];
for (const rel of readmeFiles) {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/version-v\d+\.\d+\.\d+/g, `version-v${nextVersion}`);
    fs.writeFileSync(full, content);
    console.log(`✓ Updated ${rel} badge to v${nextVersion}`);
  }
}

// 3. Run Build & Tests
console.log('\n🔨 Building packages and running tests...');
execSync('pnpm build', { stdio: 'inherit', cwd: rootDir });

// Copy bundle to WordPress plugin assets
const distGlobal = path.join(rootDir, 'packages/homura-js/dist/index.global.js');
const wpAssetJs = path.join(rootDir, 'examples/wordpress-plugin/assets/js/homura.min.js');
if (fs.existsSync(distGlobal)) {
  fs.copyFileSync(distGlobal, wpAssetJs);
  console.log(`✓ Synchronized updated bundle to ${wpAssetJs}`);
}

execSync('pnpm test', { stdio: 'inherit', cwd: rootDir });
execSync('pnpm --filter "@homura-js/docs" run build', { stdio: 'inherit', cwd: rootDir });

// 4. Publish to NPM
console.log('\n📦 Publishing @biagioscaglia/homurajs to NPM...');
try {
  execSync('pnpm --filter "@biagioscaglia/homurajs" publish --access public --no-git-checks', {
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Successfully published to NPM!');
} catch (err) {
  console.warn('\n⚠️ NPM publish encountered an issue.');
  console.warn('👉 Make sure you are logged into NPM by running: npm login');
  console.warn('👉 Then you can retry publishing with: pnpm --filter "@biagioscaglia/homurajs" publish --access public --no-git-checks\n');
}

// 5. Git Commit & Push
console.log('\n🌿 Committing and pushing to Git...');
try {
  execSync('git add .', { stdio: 'inherit', cwd: rootDir });
  execSync(`git commit -m "release: v${nextVersion}"`, { stdio: 'inherit', cwd: rootDir });
  execSync('git push origin main', { stdio: 'inherit', cwd: rootDir });
} catch (err) {
  console.warn('⚠️ Git commit/push note:', err.message);
}

console.log(`\n🎉 Process completed for HomuraJS v${nextVersion}!\n`);

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

// 2. Update WordPress Plugin files
const wpPhpPath = path.join(rootDir, 'examples/wordpress-plugin/homura-time-travel-form-recovery.php');
if (fs.existsSync(wpPhpPath)) {
  let php = fs.readFileSync(wpPhpPath, 'utf8');
  php = php.replace(/Version:\s*\d+\.\d+\.\d+/g, `Version:           ${nextVersion}`);
  php = php.replace(/const VERSION = '\d+\.\d+\.\d+';/g, `const VERSION = '${nextVersion}';`);
  fs.writeFileSync(wpPhpPath, php);
  console.log(`✓ Updated WordPress plugin PHP to v${nextVersion}`);
}

const wpTxtPath = path.join(rootDir, 'examples/wordpress-plugin/readme.txt');
if (fs.existsSync(wpTxtPath)) {
  let txt = fs.readFileSync(wpTxtPath, 'utf8');
  txt = txt.replace(/Stable tag:\s*\d+\.\d+\.\d+/g, `Stable tag: ${nextVersion}`);
  fs.writeFileSync(wpTxtPath, txt);
  console.log(`✓ Updated WordPress plugin readme.txt to v${nextVersion}`);
}

// 3. Update HTML & README version tags
const htmlFiles = ['docs/index.html', 'playground/index.html', 'examples/wordpress-plugin/demo-static.html'];
for (const rel of htmlFiles) {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/(class="version-tag">v|\bclass="badge">v|WP_PLUGIN \/\/ <span>v?)\d+\.\d+\.\d+/g, (match, prefix) => `${prefix}${nextVersion}`);
    content = content.replace(/softwareVersion": "\d+\.\d+\.\d+"/g, `softwareVersion": "${nextVersion}"`);
    fs.writeFileSync(full, content);
    console.log(`✓ Updated ${rel} tags to v${nextVersion}`);
  }
}

const readmeFiles = ['README.md', 'packages/homura-js/README.md', 'packages/core/README.md', 'examples/wordpress-plugin/README.md'];
for (const rel of readmeFiles) {
  const full = path.join(rootDir, rel);
  if (fs.existsSync(full)) {
    let content = fs.readFileSync(full, 'utf8');
    content = content.replace(/version-v\d+\.\d+\.\d+/g, `version-v${nextVersion}`);
    content = content.replace(/Plugin%20v\d+\.\d+\.\d+/g, `Plugin%20v${nextVersion}`);
    fs.writeFileSync(full, content);
    console.log(`✓ Updated ${rel} badge to v${nextVersion}`);
  }
}

// 4. Run Build & Tests
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

// 5. Package zip
console.log('\n📦 Rebuilding WordPress plugin ZIP archive...');
const zipScript = `
$src = "${path.join(rootDir, 'examples/wordpress-plugin')}"
$tmp = "${path.join(rootDir, 'wp-plugin-tmp/homura-time-travel-form-recovery')}"
New-Item -ItemType Directory -Path $tmp -Force | Out-Null
Copy-Item "$src\\homura-time-travel-form-recovery.php" "$tmp\\" -Force
Copy-Item "$src\\readme.txt" "$tmp\\" -Force
Copy-Item "$src\\LICENSE" "$tmp\\" -Force
New-Item -ItemType Directory -Path "$tmp\\assets\\js" -Force | Out-Null
Copy-Item "$src\\assets\\js\\homura.min.js" "$tmp\\assets\\js\\" -Force
Remove-Item "${path.join(rootDir, 'homura-time-travel-form-recovery.zip')}" -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $tmp -DestinationPath "${path.join(rootDir, 'homura-time-travel-form-recovery.zip')}" -CompressionLevel Optimal
Remove-Item "${path.join(rootDir, 'wp-plugin-tmp')}" -Recurse -Force
`;
try {
  execSync(`powershell -Command "${zipScript.replace(/\n/g, '; ')}"`, { stdio: 'inherit', cwd: rootDir });
  console.log('✓ Rebuilt homura-time-travel-form-recovery.zip');
} catch (e) {
  console.warn('⚠️ Zip packaging note:', e.message);
}

// 6. Publish to NPM
console.log('\n📦 Publishing @biagioscaglia/homurajs to NPM...');
try {
  execSync('pnpm --filter "@biagioscaglia/homurajs" publish --access public --no-git-checks', {
    stdio: 'inherit',
    cwd: rootDir
  });
  console.log('✅ Successfully published to NPM!');
} catch (err) {
  console.warn('\n⚠️ NPM publish note: if not logged in, run: npm login');
  console.warn('👉 Command to publish: pnpm --filter "@biagioscaglia/homurajs" publish --access public --no-git-checks\n');
}

// 7. Git Commit & Push
console.log('\n🌿 Committing and pushing to Git...');
try {
  execSync('git add .', { stdio: 'inherit', cwd: rootDir });
  execSync(`git commit -m "release: v${nextVersion}"`, { stdio: 'inherit', cwd: rootDir });
  execSync('git push origin main', { stdio: 'inherit', cwd: rootDir });
} catch (err) {
  console.warn('⚠️ Git commit/push note:', err.message);
}

console.log(`\n🎉 Process completed successfully for HomuraJS v${nextVersion}!\n`);

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Step 1: Building with OpenNext Cloudflare adapter ---');
execSync('npx opennextjs-cloudflare', { stdio: 'inherit' });

console.log('--- Step 2: Preparing Cloudflare Pages Advanced Mode (_worker.js) ---');
const src = path.join(process.cwd(), '.open-next', 'worker.js');
const dest = path.join(process.cwd(), '.open-next', 'assets', '_worker.js');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('✓ Successfully copied .open-next/worker.js -> .open-next/assets/_worker.js');
} else {
  console.error('✗ Error: .open-next/worker.js was not found after build!');
  process.exit(1);
}

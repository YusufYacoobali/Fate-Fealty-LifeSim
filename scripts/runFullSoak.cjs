const { spawnSync } = require('node:child_process');
const path = require('node:path');

const jestEntry = path.join(process.cwd(), 'node_modules', 'jest', 'bin', 'jest.js');
const full = !process.argv.includes('--quick');
const result = spawnSync(process.execPath, [jestEntry, '--runInBand', 'src/__tests__/persistentWorldFullSoak.test.ts'], {
  cwd: process.cwd(),
  env: { ...process.env, MLS_FULL_SOAK: full ? '1' : '0' },
  stdio: 'inherit',
  shell: false,
});
process.exit(result.status ?? 1);

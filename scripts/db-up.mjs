import { spawnSync } from 'node:child_process';

const result = spawnSync('docker', ['compose', 'up', '-d'], {
  stdio: 'inherit'
});

process.exit(result.status ?? 1);

const { spawn } = require('child_process');
const path = require('path');

const isWin = process.platform === 'win32';
const cmd = isWin ? 'npx.cmd' : 'npx';

const child = spawn(cmd, ['expo', 'start', '--web'], {
  cwd: path.join(__dirname, 'mobile'),
  stdio: 'inherit',
  shell: true,
});

child.on('exit', code => process.exit(code || 0));

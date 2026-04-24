// Simple preview server for Tidefall dist
import { spawn } from 'child_process';
const cwd = 'C:/Users/Tyson/clawd/tidefall-phaser/dist';
const srv = spawn('node', ['C:/Users/Tyson/clawd/tidefall-phaser/node_modules/vite/bin/vite.js', '--port', '3003', '--host', '127.0.0.1', '--root', cwd], {
  cwd,
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, FORCE_COLOR: '0' }
});
srv.on('error', e => console.error('Error:', e.message));
setTimeout(() => process.exit(0), 300000); // 5 min

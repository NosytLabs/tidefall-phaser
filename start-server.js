#!/usr/bin/env node
// Simple Vite dev server launcher
import { spawn } from 'child_process';
const server = spawn('node', ['node_modules/vite/bin/vite.js', '--port', '3001', '--host', '127.0.0.1'], {
  cwd: 'C:/Users/Tyson/clawd/tidefall-phaser',
  stdio: 'inherit',
  shell: true
});
server.on('error', e => console.error('Error:', e));

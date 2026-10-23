import { spawn } from 'node:child_process';

console.log('🚀 Starting Symposium Backend & Frontend dev servers...\n');

const backend = spawn('npm', ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn('npm', ['--prefix', 'frontend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const cleanup = () => {
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

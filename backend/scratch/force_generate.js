const { spawn } = require('child_process');
const p = spawn('npx.cmd', ['drizzle-kit', 'generate'], { shell: true, stdio: ['pipe', 'pipe', 'pipe'] });
p.stdout.on('data', d => {
  console.log(d.toString());
  p.stdin.write('\n'); // send enter
});
p.stderr.on('data', d => console.error(d.toString()));
p.on('close', c => process.exit(c));

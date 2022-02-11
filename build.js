const fs = require('fs');
const path = require('path');
const cp = require('child_process');

if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true });
}
fs.mkdirSync('./dist');

for (const publicFile of fs.readdirSync('./public')) {
  fs.copyFileSync(path.join('public', publicFile), path.join('dist', publicFile));
}

const watFiles = [];
for (const sourceFile of fs.readdirSync('./src')) {
  if (sourceFile.endsWith('wat')) {
    watFiles.push(sourceFile);
    continue;
  }

  fs.copyFileSync(path.join('src', sourceFile), path.join('dist', sourceFile));
}

for (const watFile of watFiles) {
  const fullWatPath = path.join('src', watFile);
  const fullWasmPath = path.join('dist', watFile.slice(0, watFile.length - 'wat'.length) + 'wasm');
  cp.execSync(`wat2wasm ${fullWatPath} --output ${fullWasmPath}`);
}

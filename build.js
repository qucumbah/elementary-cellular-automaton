const fs = require('fs');
const path = require('path');
const cp = require('child_process');

if (fs.existsSync('./dist')) {
  fs.rmSync('./dist', { recursive: true });
}
fs.mkdirSync('./dist');

fs.readdirSync('./public').forEach((publicFile) => {
  fs.copyFileSync(path.join('public', publicFile), path.join('dist', publicFile));
});

const watFiles = [];
fs.readdirSync('./src').forEach((sourceFile) => {
  if (sourceFile.endsWith('wat')) {
    watFiles.push(sourceFile);
    return;
  }

  fs.copyFileSync(path.join('src', sourceFile), path.join('dist', sourceFile));
});

watFiles.forEach((watFile) => {
  const fullWatPath = path.join('src', watFile);
  const fullWasmPath = path.join('dist', `${watFile.slice(0, watFile.length - 'wat'.length)}wasm`);
  cp.execSync(`wat2wasm ${fullWatPath} --output ${fullWasmPath}`);
});

import * as wasmBinding from './wasmBinding.js';

const mainCanvas = document.getElementById('mainCanvas');
const ctx = mainCanvas.getContext('2d');

function updateCanvasSize() {
  const canvasClientRect = mainCanvas.getBoundingClientRect();
  mainCanvas.width = canvasClientRect.width;
  mainCanvas.height = canvasClientRect.height;
}
window.addEventListener('resize', updateCanvasSize);
updateCanvasSize();

const memory = new Uint8Array(wasmBinding.memory.buffer);

let width;
let height;

const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
function updateSize() {
  width = widthInput.value;
  height = heightInput.value;
}
widthInput.addEventListener('change', updateSize);
heightInput.addEventListener('change', updateSize);

let rule;

const ruleInput = document.getElementById('ruleInput');
function updateRule() {
  rule = ruleInput.value;
}
ruleInput.addEventListener('change', updateRule);

updateRule();
updateSize();

let initializationMethod = 'one';

const initializationMethodInput = document.getElementById('initializationMethodInput');
function updateInitializationMethod() {
  initializationMethod = initializationMethodInput.value;
}
initializationMethodInput.addEventListener('change', updateInitializationMethod);

async function generate() {
  initializeMemory();
  await wasmBinding.executeRule(rule, width, height);

  const imageData = ctx.createImageData(width, height);

  for (let i = 0; i < width * height; i += 1) {
    const intensity = (memory[i] === 0) ? 255 : 0;
    imageData.data[i * 4 + 0] = intensity; // R
    imageData.data[i * 4 + 1] = intensity; // G
    imageData.data[i * 4 + 2] = intensity; // B
    imageData.data[i * 4 + 3] = 255; // A
  }

  ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
  ctx.putImageData(imageData, 0, 0);
}

const generateButton = document.getElementById('generate');
generateButton.addEventListener('click', generate);
generate();

// TODO: move this to WASM
function initializeMemory() {
  switch (initializationMethod) {
    case 'one':
      for (let i = 0; i < width - 1; i += 1) {
        memory[i] = 0;
      }
      memory[width - 1] = 1;
      break;
    case 'random':
      for (let i = 0; i < width; i += 1) {
        memory[i] = (Math.random() > 0.5) ? 1 : 0;
      }
      break;
    case 'manual':
      // TODO: add manual initial condition setting
      break;
  }
}

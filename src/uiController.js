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

let memory;
let size;

const sizeInput = document.getElementById('sizeInput');
function updateMemory() {
  size = sizeInput.value;
  memory = new Uint8Array(size * size);
  memory[size - 1] = 1;
  console.log(memory);
}
sizeInput.addEventListener('change', updateMemory);

let rule;

const ruleInput = document.getElementById('ruleInput');
function updateRule() {
  rule = ruleInput.value;
}
ruleInput.addEventListener('change', updateRule);

updateRule();
updateMemory();

async function generate() {
  const newMemory = await wasmBinding.executeRule(memory, rule, size);
  const imageData = ctx.createImageData(size, size);

  for (let i = 0; i < newMemory.length; i += 1) {
    const intensity = (newMemory[i] === 0) ? 255 : 0;
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

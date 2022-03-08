import Controller from './Controller.js';
import Model from './Model.js';
import View from './View.js';
import WasmBinding from './WasmBinding.js';

async function main() {
  const wasmBinding = await WasmBinding.createInstance();
  const controller = new Controller(new Model(wasmBinding), new View(wasmBinding));
  controller.run();
}

main();

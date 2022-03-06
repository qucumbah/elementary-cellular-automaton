import Controller from './Controller.js';
import Model from './Model.js';
import View from './View.js';
import WasmBinding from './wasmBinding.js';

async function main() {
  const wasmBinding = await WasmBinding.createInstance();
  new Controller(new Model(wasmBinding), new View());
}

main();

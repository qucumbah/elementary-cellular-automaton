export async function executeRule(ruleNumber, width, height) {
  const wasmInstance = await lazyWasmInstance;

  wasmInstance.exports.rule_n(ruleNumber, width, height);
}

export const memory = new WebAssembly.Memory({ initial: 64 });

let lazyWasmInstance = getWasm();

async function getWasm(additionalImports) {
  const imports = {
    console,
    util: {
      memory,
    },
    ...additionalImports,
  };

  const { instance } = await WebAssembly.instantiateStreaming(await fetch('main.wasm'), imports);
  return instance;
}

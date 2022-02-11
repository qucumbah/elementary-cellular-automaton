export async function executeRule(initialMemory, ruleNumber, size) {
  const bytes = initialMemory.length;
  const pages = Math.ceil(bytes / 1024 / 64);
  const memory = new WebAssembly.Memory({ initial: pages });

  for (let i = 0; i < initialMemory.length; i += 1) {
    memory[i] = initialMemory[i];
  }

  const wasmInstance = await getWasm({
    util: {
      memory,
    },
  });

  wasmInstance.exports.rule_n(ruleNumber, size);

  return new Uint8Array(memory.buffer, 0, initialMemory.length);
}

async function getWasm(additionalImports) {
  const imports = {
    console,
    ...additionalImports,
  };

  const { instance } = await WebAssembly.instantiateStreaming(await fetch('main.wasm'), imports);
  return instance;
}

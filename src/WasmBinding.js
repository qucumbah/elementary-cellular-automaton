export default class WasmBinding {
  #wasmMemory = new WebAssembly.Memory({ initial: 1024 });

  #exportMemory = new Uint8Array(this.#wasmMemory.buffer);

  #wasmInstance;

  static _blockConstructor = true;
  constructor() {
    if (WasmBinding._blockConstructor) {
      throw new Error('Call WasmBinding.createInstance instead.');
    }
  }

  static async createInstance() {
    // We need to block constructor in case user tries to create an instance with it
    // Instance of this class can only be created asynchronously
    // But there are no async constructors
    // Thus, we use async factory method
    WasmBinding._blockConstructor = false;
    const instance = new WasmBinding();
    WasmBinding._blockConstructor = true;

    instance.#wasmInstance = await instance.#getWasm();
    return instance;
  }

  executeRule(ruleNumber, width, height) {
    this.#wasmInstance.exports.rule_n(ruleNumber, width, height);
  }

  renderToCanvas(boardWidth, boardHeight, canvasWidth, canvasHeight, centerX, centerY, zoom) {
    this.#wasmInstance.exports.render_to_canvas(boardWidth, boardHeight, canvasWidth, canvasHeight, centerX, centerY, zoom);
  }

  getMemory() {
    return this.#exportMemory;
  }

  async #getWasm() {
    const imports = {
      console,
      util: {
        memory: this.#wasmMemory,
      },
    };

    const { instance } = await WebAssembly.instantiateStreaming(await fetch('main.wasm'), imports);
    return instance;
  }
}

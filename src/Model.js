export default class Model {
  #wasmBinding;
  #wasmMemory;

  constructor(wasmBinding) {
    this.#wasmBinding = wasmBinding;
    this.#wasmMemory = this.#wasmBinding.getMemory();
  }

  generate({
    boardWidth,
    boardHeight,
    rule,
    initializationMethod,
  }) {
    this.#initializeMemory(initializationMethod, boardWidth);
    this.#wasmBinding.executeRule(rule, boardWidth, boardHeight);
  }

  #initializeMemory(initializationMethod, width) {
    switch (initializationMethod) {
      case 'one':
        for (let i = 0; i < width - 1; i += 1) {
          this.#wasmMemory[i] = 0;
        }
        this.#wasmMemory[width - 1] = 1;
        break;
      case 'random':
        for (let i = 0; i < width; i += 1) {
          this.#wasmMemory[i] = (Math.random() > 0.5) ? 1 : 0;
        }
        break;
    }
  }

  getMemory() {
    return this.#wasmMemory;
  }
}

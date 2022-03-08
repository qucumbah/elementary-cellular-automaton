export default class View {
  #mainCanvas = document.getElementById('mainCanvas');
  #ctx = this.#mainCanvas.getContext('2d');

  #wasmBinding;
  #wasmMemory;

  constructor(wasmBinding) {
    this.#wasmBinding = wasmBinding;
    this.#wasmMemory = this.#wasmBinding.getMemory();
  }

  redraw(boardWidth, boardHeight, panZoom) {
    const canvasWidth = this.#mainCanvas.width;
    const canvasHeight = this.#mainCanvas.height;

    this.#wasmBinding.renderToCanvas(
      boardWidth,
      boardHeight,
      canvasWidth,
      canvasHeight,
      panZoom.centerX,
      panZoom.centerY,
      panZoom.zoom,
    );

    // WASM memory map:
    // [0; board_width*board_height) - this is where the generated board is stored
    // After the board comes image data:
    // [board_width*board_height; board_width*board_height + canvas_width*canvas_height*4)
    const start = boardWidth * boardHeight;
    const length = canvasWidth * canvasHeight * 4;
    const imageDataBuffer = new Uint8ClampedArray(this.#wasmMemory.slice(start, start + length));
    const imageData = new ImageData(imageDataBuffer, canvasWidth, canvasHeight);
    this.#ctx.putImageData(imageData, 0, 0);
  }
}

export default class View {
  #mainCanvas = document.getElementById('mainCanvas');
  #ctx = this.#mainCanvas.getContext('2d');

  redraw(memory, boardWidth, boardHeight) {
    const imageData = this.#ctx.createImageData(boardWidth, boardHeight);
  
    for (let i = 0; i < boardWidth * boardHeight; i += 1) {
      const intensity = (memory[i] === 0) ? 255 : 0;
      imageData.data[i * 4 + 0] = intensity; // R
      imageData.data[i * 4 + 1] = intensity; // G
      imageData.data[i * 4 + 2] = intensity; // B
      imageData.data[i * 4 + 3] = 255; // A
    }
  
    this.#ctx.clearRect(0, 0, this.#mainCanvas.width, this.#mainCanvas.height);
    this.#ctx.putImageData(imageData, 0, 0);
  }
}

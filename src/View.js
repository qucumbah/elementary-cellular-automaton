export default class View {
  #mainCanvas = document.getElementById('mainCanvas');
  #ctx = this.#mainCanvas.getContext('2d');

  redraw(memory, boardWidth, boardHeight, panZoom) {
    console.time();
    const boardLeft = panZoom.centerX - this.#mainCanvas.width / 2 * panZoom.zoom;
    const boardRight = panZoom.centerX + this.#mainCanvas.width / 2 * panZoom.zoom;
    const boardTop = panZoom.centerY- this.#mainCanvas.height / 2 * panZoom.zoom;
    const boardBottom = panZoom.centerY + this.#mainCanvas.height / 2 * panZoom.zoom;

    const imageData = this.#ctx.createImageData(this.#mainCanvas.width, this.#mainCanvas.height);

    for (let x = 0; x < this.#mainCanvas.width; x += 1) {
      for (let y = 0; y < this.#mainCanvas.height; y += 1) {
        const boardX = Math.round(boardLeft + (boardRight - boardLeft) * (x / this.#mainCanvas.width));
        const boardY = Math.round(boardTop + (boardBottom - boardTop) * (y / this.#mainCanvas.height));

        let intensity;
        if (
          boardX < 0
          || boardX >= boardWidth
          || boardY < 0
          || boardY >= boardHeight
        ) {
          intensity = 100;
        } else {
          const memoryAddress = boardY * boardWidth + boardX;
          intensity = (memory[memoryAddress] === 0) ? 255 : 0;
        }

        const i = y * this.#mainCanvas.width + x;
        imageData.data[i * 4 + 0] = intensity; // R
        imageData.data[i * 4 + 1] = intensity; // G
        imageData.data[i * 4 + 2] = intensity; // B
        imageData.data[i * 4 + 3] = 255; // A
      }
    }

    this.#ctx.clearRect(0, 0, this.#mainCanvas.width, this.#mainCanvas.height);
    this.#ctx.putImageData(imageData, 0, 0);

    console.timeEnd();
  }
}

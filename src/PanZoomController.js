export default class PanZoomController {
  #mainCanvas = document.getElementById('mainCanvas');

  #centerX = 0;
  #centerY = 0;

  #zoom = 1;

  #isDragging = false;
  #prevDragX;
  #prevDragY;

  #panZoomHandler;

  constructor({
    panZoomHandler
  }) {
    // Drag can only be started on canvas
    this.#mainCanvas.addEventListener('mousedown', this.#handleMouseDown.bind(this));
    // But it can end anywhere on the screen
    window.addEventListener('mouseup', this.#handleMouseUp.bind(this));

    this.#mainCanvas.addEventListener('mousemove', this.#handleMouseMove.bind(this));

    this.#mainCanvas.addEventListener('wheel', this.#handleWheel.bind(this));

    this.#panZoomHandler = panZoomHandler;
  }

  #handleMouseDown(event) {
    // Only drag on left mouse button
    if (event.button !== 0) {
      return;
    }

    this.#isDragging = true;
    this.#prevDragX = event.x;
    this.#prevDragY = event.y;
  }

  #handleMouseUp(event) {
    // Only drag on left mouse button
    if (event.button !== 0) {
      return;
    }

    this.#isDragging = false;
  }

  #handleMouseMove(event) {
    if (!this.#isDragging) {
      return;
    }

    const newDragX = event.x;
    const newDragY = event.y;

    this.#centerX -= (newDragX - this.#prevDragX) * this.#zoom;
    this.#centerY -= (newDragY - this.#prevDragY) * this.#zoom;

    this.#prevDragX = newDragX;
    this.#prevDragY = newDragY;

    this.#callPanZoomHandler();
  }

  #handleWheel(event) {
    this.#zoom = this.#zoom * (1 + event.deltaY / 500);

    this.#callPanZoomHandler();
  }

  #callPanZoomHandler() {
    this.#panZoomHandler();
  }

  getPanZoom() {
    return {
      zoom: this.#zoom,
      centerX: this.#centerX,
      centerY: this.#centerY,
    };
  }
}

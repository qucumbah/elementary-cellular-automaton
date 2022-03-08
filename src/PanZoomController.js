export default class PanZoomController {
  #mainCanvas = document.getElementById('mainCanvas');

  #zoomInButton = document.getElementById('zoomIn');
  #zoomOutButton = document.getElementById('zoomOut');
  #zoomResetButton = document.getElementById('zoomReset');

  #centerX = 0;
  #centerY = 0;

  #zoom = 1;

  #isDragging = false;
  #prevDragX;
  #prevDragY;

  #panZoomHandler;

  constructor({
    panZoomHandler,
    initialCenterX,
    initialCenterY,
  }) {
    // Drag can only be started on canvas
    this.#mainCanvas.addEventListener('mousedown', this.#handleMouseDown.bind(this));
    // But it can end anywhere on the screen
    window.addEventListener('mouseup', this.#handleMouseUp.bind(this));

    this.#mainCanvas.addEventListener('mousemove', this.#handleMouseMove.bind(this));

    this.#mainCanvas.addEventListener('wheel', this.#handleWheel.bind(this));

    this.#zoomInButton.addEventListener('click', this.#changeZoom.bind(this, 0.9));
    this.#zoomOutButton.addEventListener('click', this.#changeZoom.bind(this, 1.1));
    this.#zoomResetButton.addEventListener('click', this.#resetZoom.bind(this));

    this.#panZoomHandler = panZoomHandler;

    if (initialCenterX !== undefined) {
      this.#centerX = initialCenterX;
    }
    if (initialCenterY !== undefined) {
      this.#centerY = initialCenterY;
    }
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
    this.#changeZoom(1 + event.deltaY / 500);
  }

  #changeZoom(amount) {
    this.#zoom *= amount;

    this.#callPanZoomHandler();
  }

  #resetZoom() {
    this.#zoom = 1;

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

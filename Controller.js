import PanZoomController from './PanZoomController.js';

export default class Controller {
  #model;
  #view;
  #panZoomController;

  #mainCanvas = document.getElementById('mainCanvas');

  #boardWidthInput = document.getElementById('widthInput');
  #boardHeightInput = document.getElementById('heightInput');
  #boardWidth;
  #boardHeight;

  #ruleInput = document.getElementById('ruleInput');
  #rule;

  #initializationMethodInput = document.getElementById('initializationMethodInput');
  #initializationMethod;

  #generateButton = document.getElementById('generate');

  constructor(model, view) {
    this.#model = model;
    this.#view = view;
  }

  run() {
    this.#updateCanvasSize();
    this.#boardWidthInput.value = this.#mainCanvas.width;
    this.#boardHeightInput.value = this.#mainCanvas.height;
    this.#updateBoardSize();

    this.#panZoomController = new PanZoomController({
      panZoomHandler: this.#redraw.bind(this),
      initialCenterX: this.#boardWidth / 2,
      initialCenterY: this.#boardHeight / 2,
    });

    this.#ruleInput.addEventListener('change', this.#updateRule.bind(this));
    this.#updateRule();

    this.#initializationMethodInput.addEventListener('change', this.#updateInitializationMethod.bind(this));
    this.#updateInitializationMethod();

    this.#generateButton.addEventListener('click', this.#generateAndRedraw.bind(this));
    this.#generate(); // Initial generate

    window.addEventListener('resize', this.#handleWindowResize.bind(this));
    this.#updateCanvasSize();
    this.#redraw(); // Initial draw
  }

  #handleWindowResize() {
    this.#updateCanvasSize();
    this.#redraw();
  }

  #updateCanvasSize() {
    const canvasClientRect = this.#mainCanvas.getBoundingClientRect();
    this.#mainCanvas.width = canvasClientRect.width;
    this.#mainCanvas.height = canvasClientRect.height;
  }

  #updateBoardSize() {
    this.#boardWidth = this.#boardWidthInput.value;
    this.#boardHeight = this.#boardHeightInput.value;
  }

  #updateRule() {
    this.#rule = this.#ruleInput.value;
  }

  #updateInitializationMethod() {
    this.#initializationMethod = this.#initializationMethodInput.value;
  }

  #generateAndRedraw() {
    this.#generate();
    this.#redraw();
  }

  #generate() {
    this.#updateBoardSize();
    this.#model.generate({
      boardWidth: this.#boardWidth,
      boardHeight: this.#boardHeight,
      rule: this.#rule,
      initializationMethod: this.#initializationMethod,
    });
  }

  #redraw() {
    this.#view.redraw(
      this.#boardWidth,
      this.#boardHeight,
      this.#panZoomController.getPanZoom(),
    );
  }
}

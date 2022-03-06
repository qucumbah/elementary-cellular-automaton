export default class Controller {
  #model;
  #view;

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

    this.#boardWidthInput.addEventListener('change', this.#updateBoardSize.bind(this));
    this.#boardHeightInput.addEventListener('change', this.#updateBoardSize.bind(this));
    this.#updateBoardSize();

    this.#ruleInput.addEventListener('change', this.#updateRule.bind(this));
    this.#updateRule();

    this.#initializationMethodInput.addEventListener('change', this.#updateInitializationMethod.bind(this));
    this.#updateInitializationMethod();

    this.#generateButton.addEventListener('click', this.#generateAndRedraw.bind(this));
    this.#generate(); // Initial generate

    window.addEventListener('resize', this.#updateCanvasSize.bind(this));
    this.#updateCanvasSize(); // Initial redraw
  }

  #updateCanvasSize() {
    const canvasClientRect = this.#mainCanvas.getBoundingClientRect();
    this.#mainCanvas.width = canvasClientRect.width;
    this.#mainCanvas.height = canvasClientRect.height;

    this.#redraw();
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
    this.#model.generate({
      boardWidth: this.#boardWidth,
      boardHeight: this.#boardHeight,
      rule: this.#rule,
      initializationMethod: this.#initializationMethod,
    });
  }

  #redraw() {
    this.#view.redraw(this.#model.getMemory(), this.#boardWidth, this.#boardHeight);
  }
}

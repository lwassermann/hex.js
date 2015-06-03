import R from 'ramda';
import {extend, applyToThis} from './util';

const Rx = global.Rx;

import draw from './canvas-draw';
import {Hex} from './hex';

// --------------------------------------------------------------------------------------------------------

const relativePtFromEvt = function(e) {
  return {x: (window.scrollX + e.clientX),
          y: (window.scrollY + e.clientY)};
};

const relativeHexFromEvt = R.compose(Hex.round, Hex.fromPoint, relativePtFromEvt);

function updateSize(fn, canvas) {
  const HDDPIPixelFactor = window && window.devicePixelRatio || 1;

  function resize() {
    const width = canvas.clientWidth * HDDPIPixelFactor;
    const height = canvas.clientHeight * HDDPIPixelFactor;

    canvas.width = width;
    canvas.height = height;

    fn(canvas);
  }

  Rx.Observable.fromEvent(window, 'resize').throttle(100).subscribe(resize);
  resize();
}

// --------------------------------------------------------------------------------------------------------

class _App {
  constructor(canvas) {
    this.context = canvas.getContext('2d');
    this.scene = [];
    this.objects = [{hex: Hex(3, 4), colors: {background: 'green'}}];

    this.render(canvas);
  }
}

// --------------------------------------------------------------------------------------------------------

const App = function(canvas) {
  return new _App(canvas);
};

function redraw(app) {
  draw.flush(app.context);
  app.scene.map(draw.defaultHex(app.context));
  app.objects.map(spec => draw.hex(app.context, spec.colors, spec.hex));
}

const targetHex = R.curry(function(app, hex) {
  draw.defaultHex(app.context, hex);
  return hex;
});

const toggleHex = R.curry(function(app, hex) {
  const hexes = app.scene;
  if (R.find(R.invoke('equals', [hex]), hexes)) {
    app.scene = R.reject(R.invoke('equals', [hex]), hexes);
  } else {
    app.scene.push(hex);
  }

  return hex;
});

const handlePointerMove = R.curry(function(app, pt) {
  if (app.moves) {
    app.moves.hex = Hex.fromPoint(pt);
    app.redraw();
  }
});
const handlePointerDown = R.curry(function(app, hex) {
  let targetObject = R.find(R.compose(Hex.equals(hex), R.prop('hex')), app.objects);
  if (targetObject) {
    app.moves = targetObject;
    targetObject.from = hex;
  } else {
    app.toggleHex(hex);
  }

  app.redraw();
});
const handlePointerUp = R.curry(function(app, hex) {
  if (app.moves) {
    if (R.any(Hex.equals(hex), app.objects)) {
      app.moves.hex = app.moves.from;
    } else {
      app.moves.hex = hex;
    }

    delete app.moves.from;
    delete app.moves;
  }

  redraw(app);
});

function render(app, canvas) {
  updateSize(app.redraw.bind(app), canvas);

  Rx.Observable.fromEvent(canvas, 'pointermove')
    .map(relativePtFromEvt)
    .subscribe(handlePointerMove(app));

  Rx.Observable.fromEvent(canvas, 'pointerdown')
    .map(relativeHexFromEvt)
    .subscribe(handlePointerDown(app));

  Rx.Observable.fromEvent(canvas, 'pointerup')
    .map(relativeHexFromEvt)
    .subscribe(handlePointerUp(app));

  return canvas;
}

// --------------------------------------------------------------------------------------------------------

const behaviour = {
  render,
  targetHex,
  redraw,
  toggleHex,
};
extend(App, behaviour);
extend(_App.prototype, R.mapObj(applyToThis, behaviour));

export default App;
export {render};

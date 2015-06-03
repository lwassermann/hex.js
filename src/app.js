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
    this.selectedHexes = [];
    this.objects = [Hex(3, 4)];

    this.render(canvas);
  }
}

// --------------------------------------------------------------------------------------------------------

const App = function(canvas) {
  return new _App(canvas);
};

function redraw(app) {
  draw.flush(app.context);
  app.selectedHexes.map(draw.hex(app.context));
  app.objects.map(draw.hex(app.context));
}

const targetHex = R.curry(function(app, hex) {
  draw.hex(app.context, hex);
  return hex;
});

const toggleHex = R.curry(function(app, hex) {
  const hexes = app.selectedHexes;
  if (R.find(R.invoke('equals', [hex]), hexes)) {
    app.selectedHexes = R.reject(R.invoke('equals', [hex]), hexes);
  } else {
    app.selectedHexes.push(hex);
  }

  return hex;
});

const handlePointerMove = R.curry(function(app, hex) {
  void hex;
  app.redraw();
  app.targetHex(hex);
});
const handlePointerDown = R.curry(function(app, hex) {
  void hex;
  app.toggleHex(hex);
  app.redraw();
});
const handlePointerUp = R.curry(function(app, hex) {
  void hex;
});

function render(app, canvas) {
  updateSize(app.redraw.bind(app), canvas);

  Rx.Observable.fromEvent(canvas, 'pointermove')
    .map(relativeHexFromEvt)
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

import R from 'ramda';
import { extend, applyToThis } from './util';

const Rx = global.Rx;
import synchronize from './sync';

import draw from './canvas-draw';
import { Hex } from './hex';
import { Maybe } from './contexts';
import { Pawn } from './pawns';

// -------------------------------------------------------------------------------------------------

const relativePtFromEvt = function(e) {
  return { x: (window.scrollX + e.clientX),
          y: (window.scrollY + e.clientY) };
};

const relativeHexFromEvt = R.compose(Hex.round, Hex.fromPoint, relativePtFromEvt);

function updateSize(fn, canvas) {
  const HDDPIPixelFactor = window && window.devicePixelRatio || 1;

  function resize() {
    // unfortunately we have to use the window height, because css respects the aspect ratio
    const width = window.innerWidth * HDDPIPixelFactor;
    const height = window.innerHeight * HDDPIPixelFactor;

    canvas.width = width;
    canvas.height = height;

    fn(canvas);
  }

  Rx.Observable.fromEvent(window, 'resize').throttle(100).subscribe(resize);
  resize();
}

// -------------------------------------------------------------------------------------------------

class _App {
  constructor(canvas) {
    this.context = canvas.getContext('2d');
    this.scene = [];
    this.hover = Maybe(null);
    this.objects = [Pawn({ color: 'red' }), Pawn({ color: 'green' }), Pawn({ color: 'blue' })];

    this.render(canvas);

    this.sync = synchronize('hex');
    this.sync.stream.subscribe(handleRemoteUpdate(this));
  }
}

// -------------------------------------------------------------------------------------------------

const App = function(canvas) {
  return new _App(canvas);
};

function redraw(app) {
  draw.flush(app.context);
  app.scene.map(draw.defaultHex(app.context));
  R.map(draw.hex(app.context, { background: 'rgba(128, 128, 128, 0.2)' }), app.hover);
  app.objects.map(item => draw.render(app.context, item));
}

const targetHex = R.curry(function(app, hex) {
  draw.defaultHex(app.context, hex);
  return hex;
});

const toggleHex = R.curry(function(app, hex) {
  const hexes = app.scene;
  if (R.find(Hex.equals(hex), hexes)) {
    app.scene = R.reject(Hex.equals(hex), hexes);
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

  app.hover = Maybe(Hex.round(Hex.fromPoint(pt)));
});
const handlePointerDown = R.curry(function(app, hex) {
  const targetObject = R.findLast(R.compose(Hex.equals(hex), R.prop('hex')), app.objects);
  if (targetObject) {
    app.moves = targetObject;
    targetObject.from = hex;
    app.objects.sort((a, b) => a === targetObject ? 1 : b === targetObject ? -1 : 0);
  } else {
    app.toggleHex(hex);
  }

  app.redraw();
});
const handlePointerUp = R.curry(function(app, hex) {
  if (app.moves) {
    if (R.any(R.compose(Hex.equals(hex), R.prop('hex')), app.objects)) {
      app.moves.hex = app.moves.from;
    } else {
      app.moves.hex = hex;
    }

    delete app.moves.from;
    delete app.moves;
  }

  redraw(app);
});

const handleRemoteUpdate = R.curry(function(app, data) {
  extend(app, data);
  redraw(app);
});

const sync = function(app) {
  return () => {
    extend(app.sync.client.getData(), R.pick(['scene', 'objects'], app));
    app.sync.sync();
  };
};

function render(app, canvas) {
  updateSize(app.redraw.bind(app), canvas);

  const pointermove = Rx.Observable.fromEvent(canvas, 'pointermove')
    .map(relativePtFromEvt);
  pointermove.subscribe(handlePointerMove(app));
  pointermove.subscribe(sync(app));

  const pointerdown = Rx.Observable.fromEvent(canvas, 'pointerdown')
    .map(relativeHexFromEvt);
  pointerdown.subscribe(handlePointerDown(app));
  pointerdown.subscribe(sync(app));

  const pointerup = Rx.Observable.fromEvent(canvas, 'pointerup')
    .map(relativeHexFromEvt);
  pointerup.subscribe(handlePointerUp(app));
  pointerup.subscribe(sync(app));

  return canvas;
}

// -------------------------------------------------------------------------------------------------

const behaviour = {
  render,
  targetHex,
  redraw,
  toggleHex
};
extend(App, behaviour);
extend(_App.prototype, R.map(applyToThis, behaviour));

export default App;
export { render };

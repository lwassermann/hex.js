import R from 'ramda';

const Rx = global.Rx;

import draw from './canvas-draw';
import {Hex} from './hex';

const applicationState = [];

// --------------------------------------------------------------------------------------------------------

const redraw = R.curry(function(ctxt) {
  draw.flush(ctxt);
  let content = applicationState[ctxt.canvas.id];
  content.map(draw.hex(ctxt));
});

const targetHex = R.curry(function(ctxt, hex) {
  redraw(ctxt);
  draw.hex(ctxt, hex);
});

const toggleHex = R.curry(function(id, hex) {
  const hexes = applicationState[id];
  if (R.find(R.invoke('equals', [hex]), hexes)) {
    applicationState[id] = R.reject(R.invoke('equals', [hex]), hexes);
  } else {
    applicationState[id].push(hex);
  }
});

// --------------------------------------------------------------------------------------------------------

const relativePtFromEvt = function(e) {
  return {x: (window.scrollX + e.clientX),
          y: (window.scrollY + e.clientY)};
};

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

function initCanvas(canvas) {
  const ctxt = canvas.getContext('2d');
  if (!canvas.id) { canvas.id = 1; }

  applicationState[canvas.id] = [];

  updateSize(R.compose(redraw, R.invoke('getContext', ['2d'])), canvas);

  Rx.Observable.fromEvent(canvas, 'pointermove')
    .map(R.compose(Hex.round, Hex.fromPoint, relativePtFromEvt))
    .subscribe(targetHex(ctxt));

  Rx.Observable.fromEvent(canvas, 'pointerdown')
    .map(R.compose(Hex.round, Hex.fromPoint, relativePtFromEvt))
    .subscribe(R.compose(redraw, R.always(ctxt), toggleHex(canvas.id)));
}

// --------------------------------------------------------------------------------------------------------

const app = {
  initCanvas,
};

export default app;
export {initCanvas};

import R from 'ramda';

const Rx = global.Rx;

import draw from './canvas-draw';
import {Hex} from './hex';

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

  updateSize(canvas => {
    void canvas;
  }, canvas);

  Rx.Observable.fromEvent(canvas, 'pointermove')
    .map(e => {
      return {x: (window.scrollX + e.clientX),
              y: (window.scrollY + e.clientY)};
    })
    .map(R.compose(Hex.round, Hex.fromPoint))
    .subscribe(R.compose(draw.hex(ctxt), draw.flush(ctxt)));
}

const app = {
  initCanvas,
};

export default app;
export {initCanvas};

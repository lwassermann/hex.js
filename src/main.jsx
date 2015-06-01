'use strict';
import R from 'ramda';
const Rx = global.Rx;

import {Hex} from './hex';
import draw from './canvas-draw';

void Hex;

const MaybeProto = {map: R.curry(function(fn) {
    if (!R.isNil(this.value)) { return Maybe(fn(this.value)); }

    return this;
  })
};

const Maybe = function(c) {
  const newMaybe = Object.create(MaybeProto);
  newMaybe.value = c;
  return newMaybe;
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

function createCanvas(selector) {
  return R.pipe(
                document.getElementById.bind(document),
                Maybe,
                R.map(element => element.appendChild(document.createElement('canvas')))
  )(selector);
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

R.pipe(
       createCanvas,
       R.map(initCanvas)
       )('content');

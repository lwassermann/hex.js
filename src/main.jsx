'use strict';
import R from 'ramda';
const Rx = global.Rx;

import {Cube} from './cube';

void Cube;

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

const HDDPIPixelFactor = window.devicePixelRatio || 1;

function updateSize(fn, canvas) {
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

const drawPoint = R.curry(function(canvas, {x, y}) {
  const drawingContext = canvas.getContext('2d');
  drawingContext.fillRect(x - 5, y - 5, 10, 10);
});

function initCanvas(canvas) {
  updateSize(canvas => {
    void canvas;
  }, canvas);
  Rx.Observable.fromEvent(canvas, 'pointermove')
    .map(e => {
      return {x: e.clientX * HDDPIPixelFactor,
              y: e.clientY * HDDPIPixelFactor};
    })
    .map(R.compose(Cube.toPoint, Cube.round, Cube.fromPoint))
    .subscribe(drawPoint(canvas));
}

R.pipe(
       createCanvas,
       R.map(initCanvas)
       )('content');

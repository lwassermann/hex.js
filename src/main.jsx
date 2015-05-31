'use strict';
import R from 'ramda';

import {Cube} from './cube';
import Functions from './functions';

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

  global.Rx.Observable.fromEvent(window, 'resize').throttle(100).subscribe(resize);
  resize();
}

function createCanvas(selector) {
  return R.pipe(
                document.getElementById.bind(document),
                Maybe,
                R.map(element => element.appendChild(document.createElement('canvas')))
  )(selector);
}

const drawCenter = R.curry(function drawCenter(canvas, evt) {
  const hexMid = R.compose(Cube.toPoint,
                           Cube.round,
                           Cube.fromPoint)(evt.clientX * HDDPIPixelFactor,
                                           evt.clientY * HDDPIPixelFactor);
  const drawingContext = canvas.getContext('2d');
  drawingContext.fillRect(hexMid.x - 5, hexMid.y - 5, 10, 10);
});

function initCanvas(canvas) {
  updateSize(canvas => {
    void canvas;
  }, canvas);
  canvas.addEventListener('pointermove', drawCenter(canvas));
}

R.pipe(
       createCanvas,
       R.map(initCanvas)
       )('content');

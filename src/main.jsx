'use strict';

import {Cube} from './cube';
import R from 'ramda';

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

function resize(canvas) {
  const HDDPIPixelFactor = window.devicePixelRatio || 1;

  canvas.width = canvas.clientWidth * HDDPIPixelFactor;
  canvas.height = canvas.clientHeight * HDDPIPixelFactor;
}

const canvas = document.createElement('canvas');
R.pipe(
       document.getElementById.bind(document),
       Maybe,
       R.tap(R.map(element => element.appendChild(canvas)))
)('content');

const drawingContext = canvas.getContext('2d');
resize(canvas);
drawingContext.fillRect(50, 25, 150, 100);

window.addEventListener('resize', function() {
  resize(canvas);
});

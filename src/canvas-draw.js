'use strict';

import R from 'ramda';
import C from './cube';

const drawCube = R.curry(function(canvas, cube) {
  const {x, y} = C.toPoint(cube);
  const drawingContext = canvas.getContext('2d');
  drawingContext.fillRect(x - 5, y - 5, 10, 10);
});

const drawPoint = R.curry(function(canvas, {x, y}) {
  const drawingContext = canvas.getContext('2d');
  drawingContext.fillRect(x - 5, y - 5, 10, 10);
});

export default {drawPoint, drawCube};
export {drawPoint, drawCube};

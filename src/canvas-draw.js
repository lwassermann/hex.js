'use strict';

import R from 'ramda';
import Cube from './cube';

const drawPoint = R.curry(function(context, {x, y}) {
  context.fillRect(x - 5, y - 5, 10, 10);
});

const drawCube = R.curry(function(context, cube) {
  const {x, y} = cube.toPoint();
  context.fillRect(x - 5, y - 5, 10, 10);
});

const drawCubeOutline = R.curry(function(context, cube) {
  context.beginPath();

  const vertices = Cube.corners(cube);
  context.moveTo(vertices[5].x, vertices[5].y);
  vertices.map(({x, y}) => context.lineTo(x, y));

  context.stroke();
});

const drawCubeCenter = R.curry(function(context, cube) {
  drawPoint(context, cube.toPoint());
});

export default {
  point: drawPoint,
  cubeCenter: drawCubeCenter,
  cube: drawCube,
  cubeOutline: drawCubeOutline
};
export {drawPoint, drawCubeCenter, drawCube, drawCubeOutline};

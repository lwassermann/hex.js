'use strict';

import R from 'ramda';
import Cube from './cube';

const beginPath = R.tap(function(ctxt) { ctxt.beginPath(); });
const setProp = R.curry(function(name, value, obj) {
  obj[name] = value;
  return obj;
});
const fillStyle = setProp('fillStyle');
const strokeStyle = setProp('strokeStyle');

const drawPoint = R.curry(function(context, {x, y}) {
  context.arc(x, y, 5, 0, 2 * Math.PI);
  context.fill();

  return arguments[1];
});

const cubePath = function(context, cube) {
  const vertices = Cube.corners(cube);
  context.moveTo(vertices[5].x, vertices[5].y);
  vertices.map(({x, y}) => context.lineTo(x, y));

  return arguments[1];
};

const drawCubeFill = R.curry(function(context, cube) {
  cubePath(context, cube);
  context.fill();

  return arguments[1];
});

const drawCubeOutline = R.curry(function(context, cube) {
  cubePath(context, cube);
  context.stroke();

  return arguments[1];
});

const drawCubeCenter = R.curry(function(context, cube) {
  drawPoint(context, cube.toPoint());

  return arguments[1];
});

const drawCube = R.curry(function(context, cube) {
  R.pipe(beginPath,
         fillStyle('#efefef'),
         R.tap(drawCubeFill(R.__, cube)),
         beginPath,
         strokeStyle('black'),
         R.tap(drawCubeOutline(R.__, cube)),
         beginPath,
         fillStyle('white'),
         R.tap(drawCubeCenter(R.__, cube))
         )(context);
  return cube;
});

const flush = function(context) {
  context.save();
  context.filLStyle = 'white';
  context.fillRect(0, 0, context.width, context.height);
  context.restore();

  return context;
};

export default {
  cube: drawCube,
  cubeCenter: drawCubeCenter,
  fillCube: drawCubeFill,
  outlineCube: drawCubeOutline,

  flush,

  point: drawPoint,
};
export {drawPoint, drawCubeCenter, drawCube, drawCubeOutline, flush};

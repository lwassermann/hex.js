'use strict';

import R from 'ramda';
import Hex from './hex';

const pixelFactor = window && window.devicePixelRatio || 1;

const beginPath = R.tap(function(ctxt) { ctxt.beginPath(); });
const setProp = R.curry(function(name, value, obj) {
  obj[name] = value;
  return obj;
});
const fillStyle = setProp('fillStyle');
const strokeStyle = setProp('strokeStyle');

const drawPoint = R.curry(function(context, {x, y}) {
  context.arc(x * pixelFactor, y * pixelFactor, 2 * pixelFactor, 0, 2 * Math.PI);
  context.fill();

  return arguments[1];
});

const hexPath = function(context, hex) {
  const vertices = Hex.corners(hex);
  context.moveTo(vertices[5].x * pixelFactor, vertices[5].y * pixelFactor);
  vertices.map(({x, y}) => context.lineTo(x * pixelFactor, y * pixelFactor));

  return arguments[1];
};

const drawHexFill = R.curry(function(context, hex) {
  hexPath(context, hex);
  context.fill();

  return arguments[1];
});

const drawHexOutline = R.curry(function(context, hex) {
  hexPath(context, hex);
  context.stroke();

  return arguments[1];
});

const drawHexCenter = R.curry(function(context, hex) {
  drawPoint(context, hex.toPoint());

  return arguments[1];
});

const drawHex = R.curry(function(context, options, hex) {
  if (R.has('background', options)) {
    beginPath(context);
    fillStyle(options.background, context);
    drawHexFill(context, hex);
  }

  if (R.has('outline', options)) {
    beginPath(context);
    strokeStyle(options.outline, context);
    drawHexOutline(context, hex);
  }

  if (R.has('center', options)) {
    beginPath(context);
    fillStyle(options.center, context);
    drawHexCenter(context, hex);
  }

  return hex;
});

const flush = function flush(context) {
  const tapFlush = function(hex) {
    context.fillStyle = 'white';

    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    return hex;
  };
  return tapFlush(tapFlush);
};

export default {
  hex: drawHex,
  defaultHex: drawHex(R.__, {background: '#efefef', outline: '#333333'}),
  hexCenter: drawHexCenter,
  fillHex: drawHexFill,
  outlineHex: drawHexOutline,

  flush,

  point: drawPoint,
};
export {drawPoint, drawHexCenter, drawHex, drawHexOutline, flush};

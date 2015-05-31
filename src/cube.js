'use strict';

import R from 'ramda';

const extend = function(destination, ...sources) {
  sources.forEach(source => {
    for (let property in source) {
      if (destination === window && window.hasOwnProperty(property)) {
        global.console.warn('window already has a property "' + property + '". If needed, it should be '
                     + 'set directly and explicitly, not through the use of extend()');
      }

      const getter = source.__lookupGetter__(property);
      if (getter) { destination.__defineGetter__(property, getter); }

      const setter = source.__lookupSetter__(property);
      if (setter) { destination.__defineSetter__(property, setter); }

      if (getter || setter) { continue; }

      destination[property] = source[property];
    }
  });

  return destination;
};

const applyToThis = fn => R.curryN(fn.length - 1, function() {
  return fn.call(this, this, ...arguments);
});

class _Cube {
  constructor(q, r, s) {
    this.q = q;
    this.r = r;
    this.s = R.defaultTo(-q - r, s);
  }

  equals({q, r, s}) {
    return this.q === q && this.r === r && this.s === s;
  }
}

const Cube = R.curryN(2, function(q, r, s) { return new _Cube(q, r, s); });

const gridDistance = R.curry(({q: aq, r: ar, s: az}, {q: bq, r: br, s: bs}) =>
                             Math.max(Math.abs(aq - bq),
                                      Math.abs(ar - br),
                                      Math.abs(az - bs)));

const add = R.curry((a, b) => Cube(a.q + b.q, a.r + b.r));
const sub = R.curry((a, b) => Cube(a.q - b.q, a.r - b.r));
const scale = R.curry((a, k) => Cube(a.q * k, a.r * k));

const round = R.curry(function(h) {
  // rX means rounded X, short for glanceability (otherwise the rounded dominates the word)
  const rQ = Math.round(h.q);
  const rR = Math.round(h.r);
  const rS = Math.round(h.s);

  const dQ = Math.abs(rQ - h.q);
  const dR = Math.abs(rR - h.r);
  const dS = Math.abs(rS - h.s);

  if (dQ > dR && dQ > dS) {
    return Cube(-rR - rS, rR, rS);
  } else if (dR > dS) {
    return Cube(rQ, -rQ - rS, rS);
  }

  return Cube(rQ, rR, -rQ - rR);
});

const cubeCorner = R.curry(function({x, y}, i) {
  const angleDeg = 60 * i + 30;
  const angleRad = Math.PI / 180 * angleDeg;
  const s = Cube.size - 2;
  return {x: x + s * Math.cos(angleRad),
          y: y + s * Math.sin(angleRad)};
});

const corners = cube => R.range(0, 6).map(cubeCorner(cube.toPoint()));

const directions = [
  Cube(+1, -1, 0), Cube(+1, 0, -1), Cube(0, +1, -1),
  Cube(-1, +1, 0), Cube(-1, 0, +1), Cube(0, -1, +1)
];

const line = (a, b) => {
  const {q: dq, r: dr} = sub(b, a);
  const N = gridDistance(a, b);
  const dN = 1.0 / N;
  return R.map(i => Cube(a.q + dq * dN * i,
                         a.r + dr * dN * i),
               R.range(0, N + 1));
};

// pointy top variant
const fromPoint = R.curry(function({x, y}) {
  const q = (x * Math.sqrt(3) / 3 - y / 3) / Cube.size;
  const r = y * 2 / 3 / Cube.size;
  return Cube(q, r);
});

const toPoint = R.curry(function(cube) {
  const x = Cube.size * Math.sqrt(3) * (cube.q + cube.r / 2);
  const y = Cube.size * 3 / 2 * cube.r;
  return {x, y};
});

const h = {
  add,
  sub,
  scale,
  round,
  gridDistance,
  len: gridDistance(Cube(0, 0, 0)),

  line,
  gridLine: R.curryN(2, R.compose(R.map(round), line)),

  corners,
  directions,

  toPoint,
};

extend(Cube, h, {fromPoint, size: 40});
extend(_Cube.prototype, R.mapObj(applyToThis, h));

export default Cube;
export {Cube};

'use strict';

import R from 'ramda';
import {extend, applyToThis} from './util';

class _Hex {
  constructor(q, r, s) {
    this.q = q;
    this.r = r;
    this.s = R.defaultTo(-q - r, s);
  }
}

const Hex = R.curryN(2, function(q, r, s) { return new _Hex(q, r, s); });

const gridDistance = R.curry(({q: aq, r: ar, s: az}, {q: bq, r: br, s: bs}) =>
                             Math.max(Math.abs(aq - bq),
                                      Math.abs(ar - br),
                                      Math.abs(az - bs)));

const add = R.curry((a, b) => Hex(a.q + b.q, a.r + b.r));
const sub = R.curry((a, b) => Hex(a.q - b.q, a.r - b.r));
const scale = R.curry((a, k) => Hex(a.q * k, a.r * k));

/* eslint-disable no-dupe-args */
const equals = R.curry(function({q: q1, r: r1, s: s1}, {q: q2, r: r2, s: s2}) {
  return q1 === q2 && r1 === r2 && s1 === s2;
});
/* eslint-enable no-dupe-args */

const round = R.curry(function(h) {
  // rX means rounded X, short for glanceability (otherwise the rounded dominates the word)
  const rQ = Math.round(h.q);
  const rR = Math.round(h.r);
  const rS = Math.round(h.s);

  const dQ = Math.abs(rQ - h.q);
  const dR = Math.abs(rR - h.r);
  const dS = Math.abs(rS - h.s);

  if (dQ > dR && dQ > dS) {
    return Hex(-rR - rS, rR, rS);
  } else if (dR > dS) {
    return Hex(rQ, -rQ - rS, rS);
  }

  return Hex(rQ, rR, -rQ - rR);
});

const hexCorner = R.curry(function({x, y}, i) {
  const angleDeg = 60 * i + 30;
  const angleRad = Math.PI / 180 * angleDeg;
  const s = Hex.size - Hex.spacing / 2;
  return {x: x + s * Math.cos(angleRad),
          y: y + s * Math.sin(angleRad)};
});

const corners = hex => R.range(0, 6).map(hexCorner(hex.toPoint()));

const directions = [
  Hex(+1, -1, 0), Hex(+1, 0, -1), Hex(0, +1, -1),
  Hex(-1, +1, 0), Hex(-1, 0, +1), Hex(0, -1, +1)
];

const line = (a, b) => {
  const {q: dq, r: dr} = sub(b, a);
  const N = gridDistance(a, b);
  const dN = 1.0 / N;
  return R.map(i => Hex(a.q + dq * dN * i,
                         a.r + dr * dN * i),
               R.range(0, N + 1));
};

// pointy top variant
const fromPoint = R.curry(function({x, y}) {
  const q = (x * Math.sqrt(3) / 3 - y / 3) / Hex.size;
  const r = y * 2 / 3 / Hex.size;
  return Hex(q, r);
});

const toPoint = R.curry(function(hex) {
  const x = Hex.size * Math.sqrt(3) * (hex.q + hex.r / 2);
  const y = Hex.size * 3 / 2 * hex.r;
  return {x, y};
});

const h = {
  add,
  sub,
  scale,
  round,
  equals,
  gridDistance,
  len: gridDistance(Hex(0, 0, 0)),

  line,
  gridLine: R.curryN(2, R.compose(R.map(round), line)),

  corners,
  directions,

  toPoint,
};

extend(Hex, h, {fromPoint, size: 20, spacing: 2});
extend(_Hex.prototype, R.mapObj(applyToThis, h));

export default Hex;
export {Hex};

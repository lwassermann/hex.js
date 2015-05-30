'use strict';

import R from 'ramda';
void R;

const applyToThis = fn => function() {
  return fn.call(this, this, ...arguments);
};

class _Cube {
  constructor(q, r, s) {
    this.q = q;
    this.r = r;
    this.s = s;
  }

  equals({q, r, s}) {
    return this.q === q && this.r === r && this.s === s;
  }
}

const Cube = R.curry(function(q, r, s) { return new _Cube(q, r, s); });

const gridDistance = R.curry(({q: aq, r: ar, s: as}, {q: bq, r: br, s: bs})
                             => Math.max(Math.abs(aq - bq),
                                         Math.abs(ar - br),
                                         Math.abs(as - bs)));

const h = {
  gridDistance,
  add: (a, b) => Cube(a.q + b.q, a.r + b.r, a.s + b.s),
  sub: (a, b) => Cube(a.q - b.q, a.r - b.r, a.s - b.s),
  scale: (a, k) => Cube(a.q * k, a.r * k, a.s * k),
  length: gridDistance(Cube(0, 0, 0)),
};

R.extend(Cube, h);
R.extend(_Cube.prototype, R.mapObj(applyToThis, h));

export default Cube;
export {Cube};

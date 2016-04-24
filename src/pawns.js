import R from 'ramda';

import draw from './canvas-draw';
import Hex from './hex';

let id = 0;

const Pawn = function(config) {
  return R.merge({ id: ++id, hex: Hex(id + 1, 3), color: 'green', type: 'pawn' }, config);
};

draw.registerRenderer('pawn', function(canvas, pawn) {
  draw.hex(canvas, { background: pawn.color }, pawn.hex);
});

export { Pawn };

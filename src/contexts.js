import R from 'ramda';

const Nothing = {};
Nothing.map = R.always(Nothing);

const Maybe = function(c) {
  if (R.isNil(c)) { return Nothing; }

  return Object.create(Just, { value: { value: c } });
};

const Just = {
  map: R.curry(function(fn) {
    return Maybe(fn(this.value));
  })
};

const Either = function(e) {
  return R.is(Error, e)
    ? Left(e)
    : Right(e);
};

const Left = function(v) {
  return Object.create(Left, { value: { value: v } });
};
Left.prototype = {
  map: function() { return this; }
};
const Right = function(v) {
  return Object.create(Right, { value: { value: v } });
};
Right.prototype = {
  map: function(f) { return Either(f(this.value)); }
};

export default {};
export {Maybe, Either};

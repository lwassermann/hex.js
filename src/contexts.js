import R from 'ramda';

const Nothing = {};
Nothing.map = R.always(Nothing);

const Maybe = function(c) {
  if (R.isNil(c)) { return Nothing; }

  return Object.create(Just, {value: c});
};

const Just = {
  map: R.curry(function(fn) {
    return Maybe(fn(this.value));
  })
};

export default {};
export {Maybe};

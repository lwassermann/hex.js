import R from 'ramda';

const Nothing = {};
Nothing.map = R.always(Nothing);

const Maybe = function(c) {
  if (R.isNil(c)) { return Nothing; }

  const newMaybe = Object.create(MaybeProto);
  newMaybe.value = c;
  return newMaybe;
};

const MaybeProto = {
  map: R.curry(function(fn) {
    return Maybe(fn(this.value));
  })
};

export default {};
export {Maybe};

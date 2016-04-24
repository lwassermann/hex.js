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

export { extend, applyToThis };

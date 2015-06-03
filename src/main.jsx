'use strict';
import R from 'ramda';

import {Maybe} from './contexts';
import app from './app';

function createCanvas(selector) {
  return R.pipe(
                document.getElementById.bind(document),
                Maybe,
                R.map(element => element.appendChild(document.createElement('canvas')))
  )(selector);
}

R.pipe(
       createCanvas,
       R.map(app)
       )('content');

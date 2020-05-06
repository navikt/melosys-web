import { isFunction, isNil, isUndefined, isString, isEmpty, isObject, isBoolean, toInteger, round, set, get, debounce, memoize, uniqBy, has } from 'lodash';

import throttle from 'lodash.throttle';

import * as adresse from './adresse';
import * as dato from './dato';
import * as streng from './streng';
import * as logger from './logger';
import * as queryString from './queryString';

import { buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt, erPropertyUnik, finnVerdierMedKey } from './utils';

const uuid = require('uuid/v4');

export {
  buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt, erPropertyUnik, finnVerdierMedKey,
  adresse,
  dato, streng,
  logger,
  queryString,
  isUndefined as _isUndefined,
  isFunction as _isFunction,
  isNil as _isNil,
  isString as _isString,
  throttle as _throttle,
  isEmpty as _isEmpty,
  isObject as _isObject,
  isBoolean as _isBoolean,
  toInteger as _toInteger,
  round as _round,
  uuid as _uuid,
  get as _get,
  set as _set,
  debounce as _debounce,
  memoize as _memoize,
  uniqBy as _uniqBy,
  has as _has,
};

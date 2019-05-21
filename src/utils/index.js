import { assign, cloneDeep, isFunction, isNil, isUndefined, isString, isEmpty, isObject, isBoolean, toInteger } from 'lodash';

import throttle from 'lodash.throttle';

import * as adresse from './adresse';
import * as dato from './dato';
import * as streng from './streng';
import * as logger from './logger';
import * as queryString from './queryString';

import { buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt } from './utils';

export {
  buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt,
  adresse,
  dato, streng,
  logger,
  queryString,
  isUndefined as _isUndefined,
  cloneDeep as _cloneDeep,
  assign as _assign,
  isFunction as _isFunction,
  isNil as _isNil,
  isString as _isString,
  throttle as _throttle,
  isEmpty as _isEmpty,
  isObject as _isObject,
  isBoolean as _isBoolean,
  toInteger as _toInteger,
};

import { assign, cloneDeep, isFunction, isNil, isUndefined, isString, isEmpty, isObject, isBoolean } from 'lodash';
import throttle from 'lodash.throttle';

import * as adresse from './adresse';
import * as dato from './dato';
import * as streng from './streng';
import * as logger from './logger';
import { buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt, erPropertyUnik } from './utils';

export {
  buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt, erPropertyUnik,
  adresse,
  dato, streng,
  logger,
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
};

import { assign, cloneDeep, isFunction, isNil, isUndefined, isString, isEmpty, isBoolean } from 'lodash';
import throttle from 'lodash.throttle';
import * as dato from './dato';
import * as streng from './streng';
import * as logger from './logger';
import { buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt } from './utils';

export {
  buildinfo, delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt,
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
  isBoolean as _isBoolean,
};

import { assign, cloneDeep, isFunction, isNil, isUndefined, isEmpty } from 'lodash';
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
  isEmpty as _isEmpty,
  isFunction as _isFunction,
  isNil as _isNil,
  throttle as _throttle,
};

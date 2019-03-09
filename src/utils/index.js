import { isUndefined, cloneDeep, assign } from 'lodash';
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
  throttle as _throttle,
};

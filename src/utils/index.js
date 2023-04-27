import {
  capitalize,
  isFunction,
  isNil,
  isNumber,
  isUndefined,
  isString,
  isEmpty,
  isObject,
  isBoolean,
  toInteger,
  round,
  set,
  get,
  debounce,
  memoize,
  uniqBy,
  has,
  merge,
  isEqual,
  throttle,
} from "lodash";

import * as adresse from "./adresse";
import * as dato from "./dato";
import * as streng from "./streng";
import * as object from "./object";
import * as queryString from "./queryString";
import * as testhelpers from "./testhelpers";
import * as person from "./person";
import * as land from "./land";
import * as organisasjon from "./organisasjon";
import * as feilmelding from "./feilmelding";
import * as mediaQuery from "./mediaQuery";
import * as navigasjon from "./navigasjon";

import { delay, fn, isJSON, verdiSomNullable, queryParamsTilObjekt, erPropertyUnik, finnVerdierMedKey } from "./utils";

const uuid = import("uuid/v4");

export {
  delay,
  fn,
  isJSON,
  verdiSomNullable,
  queryParamsTilObjekt,
  erPropertyUnik,
  finnVerdierMedKey,
  adresse,
  dato,
  object,
  streng,
  queryString,
  testhelpers,
  person,
  land,
  organisasjon,
  feilmelding,
  mediaQuery,
  navigasjon,
  capitalize as _capitalize,
  isUndefined as _isUndefined,
  isEqual as _isEqual,
  isFunction as _isFunction,
  isNil as _isNil,
  isNumber as _isNumber,
  isString as _isString,
  throttle as _throttle,
  // Merk at isEmpty returnerer true for alle numbers
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
  merge as _merge,
};

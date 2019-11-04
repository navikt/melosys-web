import moment from 'moment';
import { isUndefined as _isUndefined } from 'lodash';

const versjon = (process.env.REACT_APP_VERSION ? `v${process.env.REACT_APP_VERSION}` : '(ukjent)');
const byggTidspunkt = process.env.REACT_APP_BUILD_DATETIME || '(ukjent)';
const byggVersjon = process.env.REACT_APP_BUILD_VERSION || '(ukjent)';
const branchVersjon = process.env.REACT_APP_BRANCH_NAME || '(lokal)';

export function buildinfo() {
  if (byggVersjon === 'local') {
    return {
      versjon,
      byggTidspunkt: moment(),
      byggVersjon,
      branchVersjon,
    };
  }
  return {
    versjon,
    byggTidspunkt,
    byggVersjon,
    branchVersjon,
  };
}
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
/**
 * parser et funksjonsargument som funksjon.
 * @param value
 * @returns {*}
 */
export function fn(value) {
  return typeof value === 'function' ? value : () => value;
}

/**
 * Sjekker at input string er i JSON string format
 * @param str
 * @returns {*}
 */
export function isJSON(str) {
  try {
    return (JSON.parse(str) && !!str);
  } catch (e) {
    return false;
  }
}
export function verdiSomNullable(verdi) {
  return _isUndefined(verdi) ? null : verdi;
}
/**
 * Dekonstruerer querystring til object med props fra querystring
 * @param sporreStreng
 * @returns {*}
 */
export function queryParamsTilObjekt(sporreStreng) {
  return sporreStreng
    .replace('?', '')
    .split('&')
    .reduce((samling, enkeltSporring) => {
      const [key, value] = enkeltSporring.split('=');
      return key ? { ...samling, [key]: value } : { ...samling };
    }, {});
}

export function erPropertyUnik(array, mapper = x => x) {
  return array.length === [...new Set(array.map(mapper))].length;
}

function finnVerdierMedKeyHjelper(obj, key, list) {
  if (!obj) return list;

  let result = list;

  if (obj instanceof Array) {
    Object.keys(obj).forEach(objKey => {
      result = result.concat(finnVerdierMedKeyHjelper(obj[objKey], key, []));
    });
    return result;
  }

  if (obj[key]) result.push(obj[key]);

  if ((typeof obj === 'object')) {
    Object.keys(obj).forEach(objKey => {
      result = result.concat(finnVerdierMedKeyHjelper(obj[objKey], key, []));
    });
  }

  return result;
}

export function finnVerdierMedKey(obj, key) {
  return finnVerdierMedKeyHjelper(obj, key, []);
}

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

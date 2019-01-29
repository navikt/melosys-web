import qs from 'qs';

// Example: /journalforing/DOK_321/174464932/?:key=:val
// /journalforing/DOK_321/174464932/?kilde=GOSYS

export const queryParamLogger = (location, key, val) => {
  const qsParsed = qs.parse(location.search.slice(1));
  const urlQuery = `${location.pathname}${location.search}`;
  /* eslint-disable */
  if (qsParsed && qsParsed[key]) {
    if (qsParsed[key] === val) {
      const message = `Deeplinked from ${key}: ${urlQuery}`;
      window.frontendlogger.info(message);
    }
  }
  /* eslint-enable */
};

export const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  OK: 'OK',
  RELOADING: 'RELOADING',
  ERROR: 'ERROR',
};

export const sjekkStatuskode = response => {
  if (response.status >= 200 && response.status < 300 && response.ok && !response.redirected) {
    return response;
  }
  const error = new Error(response.statusText || response.type);
  error.response = response;
  throw error;
};

const toJson = async response => {
  if (response.status === 204) {
    return response;
  }
  try {
    return await response.json();
  } catch (res) {
    console.error(res); // eslint-disable-line no-console
    return {};
  }
};

export const sendResultatTilDispatch = (dispatch, action, validering) => (...data) => {
  const dataSomSkalDispatches = data.length === 1 ? data[0] : data;
  if (validering && typeof validering === 'function') {
    validering(dispatch, dataSomSkalDispatches);
  }
  return dispatch({ type: action, data: dataSomSkalDispatches });
};

export const handterFeil = (dispatch, action) => async error => {
  if (error.response) {
    const data = await error.response.text();

    window.frontendlogger.error({
      error,
      stack: error.stack,
      data,
    });

    dispatch({
      type: action,
      data: { response: error.response, data },
    });
  } else {
    window.frontendlogger.error({
      error,
      stack: error.stack,
      data: error.toString(),
    });
    dispatch({ type: action, data: error.toString() });
  }
};

export const getCookie = name => {
  const re = new RegExp(`${name}=([^;]+)`);
  const match = re.exec(document.cookie);
  return match !== null ? match[1] : '';
};

const getCacheTS = cacheKey => `${cacheKey}:ts`;
const getCachedItem = cacheKey => localStorage.getItem(cacheKey);
const getCachedItemTS = cacheKey => localStorage.getItem(getCacheTS(cacheKey));
const removeCachedItem = cacheKey => {
  localStorage.removeItem(cacheKey);
  localStorage.removeItem(getCacheTS(cacheKey));
};
const setCachedItem = (cacheKey, content) => {
  localStorage.setItem(cacheKey, content);
  localStorage.setItem(getCacheTS(cacheKey), Date.now());
};

const cachedFetch = async (url, cacheDurationSec) => {
  // Use the URL as the cache key to sessionStorage
  const cacheKey = url;

  const cachedItem = getCachedItem(cacheKey);
  const whenCached = getCachedItemTS(cacheKey);
  if (cachedItem !== null && whenCached !== null) {
    // it was in sessionStorage!
    // Even though 'whenCached' is a string, this operation
    // works because the minus sign tries to convert the
    // string to an integer and it will work.
    const age = (Date.now() - whenCached) / 1000;
    if (age < cacheDurationSec) {
      const response = new Response(new Blob([cachedItem]));
      console.log('cacheresponse', response); // eslint-disable-line no-console
      // --------------------------------------------
      // Return cached content
      console.log('cache hit for ', url); // eslint-disable-line no-console
      return response.json();
    }
    // --------------------------------------------
    // We need to clean up this old key, before fetching fresh data
    console.log('Delete/invalidate cache, due to stale cacheDuration'); // eslint-disable-line no-console
    removeCachedItem(cacheKey);
  }

  // --------------------------------------------
  // Prepare fetching fresh data with fetch
  // --------------------------------------------
  const now = new Date();
  const Expires = new Date(now.getSeconds() + 60).toUTCString();
  const headers = {
    Accept: 'application/json',
    'Accept-Charset': 'UTF-8',
    // 'Cache-control': 'no-store, must-revalidate, no-cache, max-age=0',
    // Expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
    Expires,
    // Pragma: 'no-cache',
    // Origin: window.location.origin, // Set by fetch() automagically
    // 'Access-Control-Request-Method': method, // Kun ved preflight
  };

  const fetchConfig = {
    // body: below, for POST, PUT
    credentials: 'include', // *same-origin, include, omit; NB! MUST use 'include' to pass fetchConfig to fetch(),
    cache: 'default', // *default, no-cache, force-cache, only-if-cached
    headers: new Headers(headers),
    method: 'GET',
    mode: 'same-origin', // *same-origin, no-cors, cors
    redirect: 'follow', // *manual, follow, error
    // referrer: // *client, no-referrer
  };

  const fetchResponse = await fetch(url, fetchConfig);
  // let's only store in cache if the content-type is
  // JSON or something non-binary
  if (fetchResponse.status === 200) {
    const ct = fetchResponse.headers.get('Content-Type');
    if (ct && (ct.match(/application\/json/i) || ct.match(/text\//i))) {
      // There is a .json() instead of .text() but
      // we're going to store it in sessionStorage as
      // string anyway.
      // If we don't clone the response, it will be
      // consumed by the time it's returned. This
      // way we're being un-intrusive.
      if (localStorage.getItem(cacheKey)) {
        console.log('Remove cache item', cacheKey); // eslint-disable-line no-console
        removeCachedItem(cacheKey);
      }
      console.log('Insert fresh content into cache item', url); // eslint-disable-line no-console
      const content = await fetchResponse.clone().text();
      setCachedItem(cacheKey, content);
    }
  }
  const sjekketResponse = sjekkStatuskode(fetchResponse);
  return toJson(sjekketResponse);
};

const toJsonExtended = async fetchResponse => {
  const contentType = fetchResponse.headers.get('content-type');
  const {
    ok, status, statusText, redirected,
  } = fetchResponse;

  const response = {
    ok,
    status,
    statusText,
    redirected,
    contentType,
  };
  if (!fetchResponse.ok) {
    const err = await fetchResponse.json();
    return {
      ...err,
      response,
    };
  } else if (contentType && contentType.startsWith('text')) {
    const txt = await fetchResponse.text();
    return {
      text: txt,
      response,
    };
  } else if (contentType && contentType.startsWith('application/json')) {
    const res = await fetchResponse.json();
    return {
      ...res,
      response,
    };
  }
  return fetchResponse;
};

export const fetchToJson = async (url, config = {}, extendResponse = false) => {
  /*
if (config.headers) {
  for (let entry of config.headers) {
    console.log(entry);
  }
}
*/

  const fetchResponse = await fetch(url, config); // eslint-disable-line no-undef

  if (extendResponse) {
    return toJsonExtended(fetchResponse);
  }

  const sjekketResponse = sjekkStatuskode(fetchResponse);
  return toJson(sjekketResponse);
};

const methodToJson = (method, url, data, extendResponse = false, accept = 'application/json') => {
  const headers = {
    Accept: accept,
    'Accept-Charset': 'UTF-8',
    // 'Cache-control': 'no-store, must-revalidate, no-cache, max-age=0',
    // Expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
    // Pragma: 'no-cache',
    // Origin: window.location.origin, // Set by fetch() automagically
    // 'Access-Control-Request-Method': method, // Kun ved preflight
  };

  const fetchConfig = {
    // body: below, for POST, PUT
    credentials: 'include', // *same-origin, include, omit; NB! MUST use 'include' to pass fetchConfig to fetch(),
    cache: 'no-cache', // *default, no-cache, force-cache, only-if-cached
    headers: new Headers(headers),
    method, // *GET, POST, ....
    mode: 'same-origin', // *same-origin, no-cors, cors
    redirect: 'follow', // *manual, follow, error
    // referrer: // *client, no-referrer
  };

  const httpVerbsWithBody = ['POST', 'PUT'];
  if (httpVerbsWithBody.includes(method)) {
    fetchConfig.body = JSON.stringify(data);
    fetchConfig.headers.append('Content-Type', 'application/json');
  }

  return fetchToJson(url, fetchConfig, extendResponse);
};

const methodToText = (method, url, data) => {
  const headers = {
    Accept: 'text/plain',
    'Accept-Charset': 'UTF-8',
    // 'Cache-control': 'no-store, must-revalidate, no-cache, max-age=0',
    // Expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
    // Pragma: 'no-cache',
    // Origin: window.location.origin, // Set by fetch() automagically
    // 'Access-Control-Request-Method': method, // Kun ved preflight
  };

  const fetchConfig = {
    // body: below, for POST, PUT
    credentials: 'include', // *same-origin, include, omit; NB! MUST use 'include' to pass fetchConfig to fetch(),
    cache: 'no-cache', // *default, no-cache, force-cache, only-if-cached
    headers: new Headers(headers),
    method, // *GET, POST, ....
    mode: 'same-origin', // *same-origin, no-cors, cors
    redirect: 'follow', // *manual, follow, error
    // referrer: // *client, no-referrer
  };

  const httpVerbsWithBody = ['POST', 'PUT'];
  if (httpVerbsWithBody.includes(method)) {
    fetchConfig.body = data;
    fetchConfig.headers.append('Content-Type', 'text/plain');
  }

  return fetchToJson(url, fetchConfig, true);
};

export const cachedGetAsJson = (url, cacheDurationSec = 60) => cachedFetch(url, cacheDurationSec);

export const deleteAsJson = (url, extendResponse = true) => methodToJson('DELETE', url, extendResponse);
export const getAsJson = (url, extendResponse = false) => methodToJson('GET', url, extendResponse);

// [post|put]AsJson, data MUST be a valid JSON object, ie. {} or []. Cannot be a empty "" string.
export const postAsJson = (url, data = {}, extendResponse = false) => methodToJson('POST', url, data, extendResponse);
// putAsText, data can be empty string.
export const putAsText = (url, data = '') => methodToText('PUT', url, data);

export const postAsJsonReceiveAsPDF = (url, data = {}, extendResponse = false) => methodToJson('POST', url, data, extendResponse, 'application/pdf');

export const getAsPDF = (url, extendResponse = false) => methodToJson('GET', url, null, extendResponse, 'application/pdf');

export function doThenDispatch(api, { OK, FEILET, PENDING }, validering) {
  return async (dispatch, getState) => {
    if (PENDING) {
      await dispatch({ type: PENDING });
    }
    return api(dispatch, getState)
      .then(sendResultatTilDispatch(dispatch, OK, validering))
      .catch(handterFeil(dispatch, FEILET));
  };
}

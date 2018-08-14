import * as Validering from '../felles-komponenter/skjema/validering';

export const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  OK: 'OK',
  RELOADING: 'RELOADING',
  ERROR: 'ERROR',
};

export function sjekkStatuskode(response) {
  if (response.status >= 200 && response.status < 300 && response.ok && !response.redirected) {
    return response;
  }
  const error = new Error(response.statusText || response.type);
  error.response = response;
  throw error;
}

export function toJson(response) {
  if (response.status !== 204) {
    // No content
    return response.json().catch(() => ({}));
  }
  return response;
}

export function print(response) {
  console.log(response); // eslint-disable-line no-console
  return response;
}

export function sendResultatTilDispatch(dispatch, action) {
  return (...data) => {
    const dataSomSkalDispatches = data.length === 1 ? data[0] : data;
    Validering.Felles.forsokValidering(dispatch, dataSomSkalDispatches);

    return dispatch({ type: action, data: dataSomSkalDispatches });
  };
}

export function handterFeil(dispatch, action) {
  return error => {
    if (error.response) {
      error.response.text().then(data => {
        window.frontendlogger.error(error);
        console.error(error, error.stack, data); // eslint-disable-line no-console
        dispatch({
          type: action,
          data: { response: error.response, data },
        });
      });
    } else {
      console.error(error, error.stack); // eslint-disable-line no-console
      window.frontendlogger.error(error);
      dispatch({ type: action, data: error.toString() });
    }
  };
}
/*
function parseError(errorData) {
  try {
    return JSON.parse(errorData);
  } catch (e) {
    console.error(e); // eslint-disable-line no-console
    return errorData;
  }
}

export function handterFeil(dispatch, FEILET_TYPE) {
  return error => {
    const { response } = error;
    if (response) {
      response.text().then(data => {
        console.error(error, error.stack, data); // eslint-disable-line no-console
        dispatch({
          type: FEILET_TYPE,
          data: {
            type: FEILET_TYPE,
            httpStatus: response.status,
            melding: parseError(data),
          },
        });
      });
    } else {
      console.error(error, error.stack); // eslint-disable-line no-console
      dispatch({
        type: FEILET_TYPE,
        data: {
          type: FEILET_TYPE,
          melding: error.toString(),
        },
      });
    }
    return Promise.reject(error);
  };
}
*/
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

const cachedFetch = (url, cacheDurationSec) => {
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

  return fetch(url, fetchConfig).then(response => {
    // let's only store in cache if the content-type is
    // JSON or something non-binary
    if (response.status === 200) {
      const ct = response.headers.get('Content-Type');
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
        response.clone().text().then(content => {
          setCachedItem(cacheKey, content);
        });
      }
    }
    return response;
  }).then(toJson);
};

export function fetchToJson(url, config = {}) {
  /*
if (config.headers) {
  for (let entry of config.headers) {
    console.log(entry);
  }
}
*/

  return fetch(url, config) // eslint-disable-line no-undef
    .then(sjekkStatuskode)
    .then(toJson);
}

function methodToJson(method, url, data) {
  const headers = {
    Accept: 'application/json',
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

  return fetchToJson(url, fetchConfig);
}
export function cachedGetAsJson(url, cacheDurationSec = 60) {
  return cachedFetch(url, cacheDurationSec);
}
export function getAsJson(url) {
  return methodToJson('GET', url);
}
export function postAsJson(url, data = {}) {
  return methodToJson('POST', url, data);
}

export function doThenDispatch(fn, { OK, FEILET, PENDING }) {
  return (dispatch, getState) => {
    if (PENDING) {
      dispatch({ type: PENDING });
    }
    return fn(dispatch, getState)
      .then(sendResultatTilDispatch(dispatch, OK))
      .catch(handterFeil(dispatch, FEILET));
  };
}

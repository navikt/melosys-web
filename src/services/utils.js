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
    return response.json();
  }
  return response;
}

export function print(response) {
  console.log(response); // eslint-disable-line no-console
  return response;
}

export function sendResultatTilDispatch(dispatch, action) {
  return (...data) => {
    if (data.length === 1) {
      return dispatch({ type: action, data: data[0] });
    }
    return dispatch({ type: action, data });
  };
}

// TODO Validate
export function handterFeil(dispatch, action) {
  return error => {
    if (error.response) {
      error.response.text().then(data => {
        console.error(error, error.stack, data); // eslint-disable-line no-console
        dispatch({
          type: action,
          data: { response: error.response, data },
        });
      });
    } else {
      console.error(error, error.stack); // eslint-disable-line no-console
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
    mode: 'no-cors', // *same-origin, no-cors, cors
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

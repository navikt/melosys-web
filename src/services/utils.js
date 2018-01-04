export const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  OK: 'OK',
  RELOADING: 'RELOADING',
  ERROR: 'ERROR',
};

export function sjekkStatuskode(response) {
  if (response.status >= 200 && response.status < 300 && response.ok) {
    return response;
  }
  if (response.status === 401) {
    window.location.href = 'feilsider/401.html'; // eslint-disable-line no-undef
  }
  const error = new Error(response.statusText);
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
    // Origin: window.location.origin, // Set by fetch() automagically
    // 'Access-Control-Request-Method': method, // Kun ved preflight
  };

  const fetchConfig = {
    // method: Set by fetch() automagically
    method,
    headers: new Headers(headers),
    // credentials: 'include',
    // mode: 'cors',
    // cache: 'default',
  };

  const httpVerbsWithBody = ['POST', 'PUT'];
  if (httpVerbsWithBody.includes(method)) {
    fetchConfig.body = JSON.stringify(data);
    fetchConfig.headers.append('Content-Type', 'text/plain');
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

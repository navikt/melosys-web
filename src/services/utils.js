import sjekkStatuskode from "./sjekkStatuskode";

export const STATUS = {
  NOT_STARTED: "NOT_STARTED",
  PENDING: "PENDING",
  OK: "OK",
  RELOADING: "RELOADING",
  ERROR: "ERROR",
};

const toJson = async (response) => {
  if (response.status === 204) {
    return null;
  }
  try {
    return await response.clone().json();
  } catch (res) {
    /* eslint-disable-next-line no-console */
    console.error(res);
    return {};
  }
};

export const sendResultatTilDispatch =
  (dispatch, action, { onDispatch, mapDispatchData }) =>
  (...data) => {
    const dataSomSkalDispatches = data.length === 1 ? data[0] : data;

    const dispatchedAction = dispatch({ type: action, data: dataSomSkalDispatches });

    if (onDispatch && typeof onDispatch === "function") {
      onDispatch(dispatch, dataSomSkalDispatches);
    }
    if (mapDispatchData && typeof mapDispatchData === "function") {
      return dispatch({ type: action, data: mapDispatchData(dataSomSkalDispatches) });
    }

    return dispatchedAction;
  };

export const handterFeil = (dispatch, action, callback) => async (error) => {
  const data = error.response ? await error.response.clone().json() : error.toString();

  if (callback && typeof callback === "function") {
    callback(dispatch, data);
  }

  if (error.response) {
    return dispatch({
      type: action,
      data: {
        response: error.response,
        data,
      },
    });
  }

  return dispatch({
    type: action,
    data,
  });
};

export const getCookie = (name) => {
  const re = new RegExp(`${name}=([^;]+)`);
  const match = re.exec(document.cookie);
  return match !== null ? match[1] : "";
};

const getCacheTS = (cacheKey) => `${cacheKey}:ts`;
export const getCachedItem = (cacheKey) => sessionStorage.getItem(cacheKey);
const getCachedItemTS = (cacheKey) => sessionStorage.getItem(getCacheTS(cacheKey));
export const removeCachedItem = (cacheKey) => {
  sessionStorage.removeItem(cacheKey);
  sessionStorage.removeItem(getCacheTS(cacheKey));
};
export const setCachedItem = (cacheKey, content) => {
  sessionStorage.setItem(cacheKey, content);
  sessionStorage.setItem(getCacheTS(cacheKey), Date.now());
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
      /* eslint-disable-next-line no-console */
      console.log("cacheresponse", response);
      // --------------------------------------------
      // Return cached content
      /* eslint-disable-next-line no-console */
      console.log("cache hit for ", url);
      return response.clone().json();
    }
    // --------------------------------------------
    // We need to clean up this old key, before fetching fresh data
    removeCachedItem(cacheKey);
  }

  // --------------------------------------------
  // Prepare fetching fresh data with fetch
  // --------------------------------------------
  const now = new Date();
  const Expires = new Date(now.getSeconds() + 60).toUTCString();
  const headers = {
    Accept: "application/json",
    "Accept-Charset": "UTF-8",
    // 'Cache-control': 'no-store, must-revalidate, no-cache, max-age=0',
    // Expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
    Expires,
    // Pragma: 'no-cache',
    // Origin: window.location.origin, // Set by fetch() automagically
    // 'Access-Control-Request-Method': method, // Kun ved preflight
  };

  const fetchConfig = {
    // body: below, for POST, PUT
    credentials: "include", // *same-origin, include, omit; NB! MUST use 'include' to pass fetchConfig to fetch(),
    cache: "default", // *default, no-cache, force-cache, only-if-cached
    headers: new Headers(headers),
    method: "GET",
    mode: "same-origin", // *same-origin, no-cors, cors
    redirect: "follow", // *manual, follow, error
    // referrer: // *client, no-referrer
  };

  const fetchResponse = await fetch(url, fetchConfig);
  // let's only store in cache if the content-type is
  // JSON or something non-binary
  if (fetchResponse.status === 200) {
    const ct = fetchResponse.headers.get("Content-Type");
    if (ct && (ct.match(/application\/json/i) || ct.match(/text\//i))) {
      // There is a .json() instead of .text() but
      // we're going to store it in sessionStorage as
      // string anyway.
      // If we don't clone the response, it will be
      // consumed by the time it's returned. This
      // way we're being un-intrusive.
      if (sessionStorage.getItem(cacheKey)) {
        /* eslint-disable-next-line no-console */
        console.log("Remove cache item", cacheKey);
        removeCachedItem(cacheKey);
      }
      /* eslint-disable-next-line no-console */
      console.log("Insert fresh content into cache item", url);
      const content = await fetchResponse.clone().text();
      setCachedItem(cacheKey, content);
    }
  }
  const sjekketResponse = await sjekkStatuskode(fetchResponse);
  return toJson(sjekketResponse);
};

const toJsonExtended = async (fetchResponse) => {
  const contentType = fetchResponse.headers.get("content-type");
  const { ok, status, statusText, redirected } = fetchResponse;

  const response = {
    ok,
    status,
    statusText,
    redirected,
    contentType,
  };
  if (!fetchResponse.ok) {
    const err = await fetchResponse.clone().json();
    return {
      ...err,
      response,
    };
  }
  if (contentType && contentType.startsWith("text")) {
    const txt = await fetchResponse.clone().text();
    return {
      text: txt,
      response,
    };
  }
  if (contentType && contentType.startsWith("application/json")) {
    const res = await fetchResponse.clone().json();
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
  const fetchResponse = await fetch(url, config);

  const sjekketResponse = await sjekkStatuskode(fetchResponse);

  if (extendResponse) {
    return toJsonExtended(sjekketResponse);
  }

  return toJson(sjekketResponse);
};

const methodToJson = (method, url, data, extendResponse = false, accept = "application/json") => {
  const headers = {
    Accept: accept,
    "Accept-Charset": "UTF-8",
    // 'Cache-control': 'no-store, must-revalidate, no-cache, max-age=0',
    // Expires: 'Mon, 01 Jan 1990 00:00:00 GMT',
    // Pragma: 'no-cache',
    // Origin: window.location.origin, // Set by fetch() automagically
    // 'Access-Control-Request-Method': method, // Kun ved preflight
  };

  const fetchConfig = {
    // body: below, for POST, PUT
    credentials: "include", // *same-origin, include, omit; NB! MUST use 'include' to pass fetchConfig to fetch(),
    cache: "no-cache", // *default, no-cache, force-cache, only-if-cached
    headers: new Headers(headers),
    method, // *GET, POST, ....
    mode: "same-origin", // *same-origin, no-cors, cors
    redirect: "follow", // *manual, follow, error
    // referrer: // *client, no-referrer
  };

  const httpVerbsWithBody = ["POST", "PUT"];
  if (httpVerbsWithBody.includes(method)) {
    fetchConfig.body = JSON.stringify(data);
    fetchConfig.headers.append("Content-Type", "application/json");
  }

  return fetchToJson(url, fetchConfig, extendResponse);
};

export const cachedGetAsJson = (url, cacheDurationSec = 60) => cachedFetch(url, cacheDurationSec);

export const deleteAsJson = (url, extendResponse = true) => methodToJson("DELETE", url, extendResponse);
export const getAsJson = (url, extendResponse = false) => methodToJson("GET", url, extendResponse);

// [post|put]AsJson, data MUST be a valid JSON object, ie. {} or []. Cannot be a empty "" string.
export const postAsJson = (url, data = {}, extendResponse = false) => methodToJson("POST", url, data, extendResponse);
export const putAsJson = (url, data, extendResponse = false) => methodToJson("PUT", url, data, extendResponse);

export const postAsJsonReceiveAsPDF = (url, data = {}, extendResponse = false) =>
  methodToJson("POST", url, data, extendResponse, "application/pdf, application/json");

export const fetchAsPDFBlob = (url) =>
  fetch(url, { credentials: "include" })
    .then(sjekkStatuskode)
    .then((response) => response.blob())
    .then((blob) => new Blob([blob], { type: "application/pdf" }));

export const apnePdfINyFane = async (url) => {
  fetchAsPDFBlob(url).then((pdfBlob) => {
    const _url = window.URL.createObjectURL(pdfBlob);
    window.open(_url, "_blank")?.focus();
  });
};

export function doThenDispatch(api, { OK, FEILET, PENDING }, callbacks = {}) {
  return async (dispatch, getState) => {
    if (PENDING) {
      await dispatch({ type: PENDING });
    }
    return api(dispatch, getState)
      .then(
        sendResultatTilDispatch(dispatch, OK, {
          onDispatch: callbacks.success,
          mapDispatchData: callbacks.mapDispatchData,
        }),
      )
      .catch(handterFeil(dispatch, FEILET, callbacks.error));
  };
}

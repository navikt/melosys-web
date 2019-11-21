import { useEffect, useState } from 'react';

import * as Utils from '../utils';

export const useCallbackState = (callback, defaultState = null, errorHandler = Utils.logger.error, deps = []) => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    try {
      setState(callback());
    } catch (e) {
      errorHandler(e);
    }
  }, deps);

  return [state, setState];
};

export const useAsyncCallbackState = (asyncCallback, defaultState = null, errorHandler = Utils.logger.error, deps = []) => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    try {
      (async () => setState(await asyncCallback()))();
    } catch (e) {
      errorHandler(e);
    }
  }, deps);

  return [state, setState];
};


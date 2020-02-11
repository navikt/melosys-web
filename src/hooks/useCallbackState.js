import { useEffect, useState } from 'react';

import * as Utils from '../utils';

export const useCallbackState = (callback, defaultState = null, errorHandler = Utils.logger.error, deps = []) => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    // Kaller callback og oppdaterer state dersom alle dependencies finnes
    if (deps.every(dep => !Utils._isEmpty(dep))) {
      try {
        setState(callback());
      } catch (e) {
        errorHandler(e);
      }
    }
  }, deps);

  return [state, setState];
};

export const useAsyncCallbackState = (asyncCallback, defaultState = null, errorHandler = Utils.logger.error, deps = []) => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    let isMounted = true;

    // Kaller callback og oppdaterer state dersom alle dependencies finnes
    if (deps.every(dep => !Utils._isEmpty(dep))) {
      try {
        asyncCallback().then(result => {
          if (isMounted) {
            setState(result);
          }
        });
      } catch (e) {
        errorHandler(e);
      }
    }

    return () => {
      isMounted = false;
    };
  }, deps);

  return [state, setState];
};


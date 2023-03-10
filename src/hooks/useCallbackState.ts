import { useEffect, useState, SetStateAction, Dispatch } from "react";

import * as Utils from "../utils";

const dependencyFinnes = (dep: any) => {
  if (typeof dep === "number") {
    return dep !== 0;
  }
  return !Utils._isEmpty(dep);
};

export const useCallbackState = <StateType>(
  callback: () => StateType,
  defaultState: StateType,
  deps: any[],
  errorHandler?: (e: Error) => void
): [StateType, Dispatch<SetStateAction<StateType>>] => {
  const [state, setState] = useState<StateType>(defaultState);

  useEffect(() => {
    // Kaller callback og oppdaterer state dersom alle dependencies finnes
    if (deps.every((dep) => dependencyFinnes(dep))) {
      try {
        setState(callback());
      } catch (e: any) {
        if (errorHandler) errorHandler(e);
      }
    }
  }, deps);

  return [state, setState];
};

export const useAsyncCallbackState = <StateType>(
  asyncCallback: () => Promise<StateType>,
  defaultState: StateType,
  deps: any[],
  errorHandler?: (e: Error) => void
): [StateType, Dispatch<SetStateAction<StateType>>] => {
  const [state, setState] = useState(defaultState);

  useEffect(() => {
    let isMounted = true;

    // Kaller callback og oppdaterer state dersom alle dependencies finnes
    if (deps.every((dep) => dependencyFinnes(dep))) {
      asyncCallback()
        .then((result) => {
          if (isMounted) {
            setState(result);
          }
        })
        .catch((e) => {
          if (errorHandler) errorHandler(e);
        });
    }

    return () => {
      isMounted = false;
    };
  }, deps);

  return [state, setState];
};

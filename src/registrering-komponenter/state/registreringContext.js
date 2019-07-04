import React from 'react';

export const RegistreringContext = React.createContext({});

export const useRegistreringContext = () => {
  const [state, dispatch] = React.useContext(RegistreringContext);
  return ([
    state,
    arg => (typeof arg === 'function'
      ? arg(dispatch)
      : dispatch(arg)),
  ]);
};

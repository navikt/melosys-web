import React from 'react';
import PT from 'prop-types';
import * as RegistreringContext from './registreringContext';

export const RegistreringStateProvider = ({ reducer, initialState, children }) => (
  <RegistreringContext.Context.Provider value={React.useReducer(reducer, initialState)}>
    { children }
  </RegistreringContext.Context.Provider>
);

RegistreringStateProvider.propTypes = {
  reducer: PT.func.isRequired,
  initialState: PT.object.isRequired,
  children: PT.object,
};

RegistreringStateProvider.defaultProps = {
  children: null,
};

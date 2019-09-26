import React from 'react';
import PT from 'prop-types';
import * as RegistreringContext from './registreringContext';
import { initialState as registreringInitialState, reducer as registreringReducer } from './reducer';

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

export const RegistreringStateProviderWrapper = (mapStateToProps, mapDispatchToProps) => component => props => (
  <RegistreringStateProvider initialState={registreringInitialState} reducer={registreringReducer}>
    { RegistreringContext.connect(mapStateToProps, mapDispatchToProps)(component)(props) }
  </RegistreringStateProvider>
);

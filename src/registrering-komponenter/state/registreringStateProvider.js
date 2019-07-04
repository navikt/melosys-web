import React from 'react';
import PT from 'prop-types';
import { RegistreringContext, useRegistreringContext } from './registreringContext';

export const RegistreringStateProvider = ({ reducer, initialState, children }) => (
  <RegistreringContext.Provider value={React.useReducer(reducer, initialState)}>
    { children }
  </RegistreringContext.Provider>
);

RegistreringStateProvider.propTypes = {
  reducer: PT.func.isRequired,
  initialState: PT.object.isRequired,
  children: PT.object,
};

RegistreringStateProvider.defaultProps = {
  children: null,
};

const ContextComponent = ({
  stateToProps, dispatchToProps, childProps, children,
}) => {
  const [state, dispatch] = useRegistreringContext();
  const mappedProps = { ...childProps, ...stateToProps(state), ...dispatchToProps(dispatch) };
  const Child = children;
  return <Child {...mappedProps} />;
};

ContextComponent.propTypes = {
  stateToProps: PT.func,
  dispatchToProps: PT.func,
  childProps: PT.object,
  children: PT.func.isRequired,
};

ContextComponent.defaultProps = {
  stateToProps: () => {},
  dispatchToProps: () => {},
  childProps: {},
};

export const connectRegistreringContext = (stateToProps, dispatchToProps) => component => props => (
  <ContextComponent stateToProps={stateToProps} dispatchToProps={dispatchToProps} childProps={props}>
    { component }
  </ContextComponent>
);

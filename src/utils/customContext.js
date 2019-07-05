import React from 'react';
import PT from 'prop-types';

export const useCustomContext = context => {
  const [state, dispatch] = React.useContext(context);
  return ([
    state,
    arg => (typeof arg === 'function'
      ? arg(dispatch)
      : dispatch(arg)),
  ]);
};

const ContextMapper = ({
  stateToProps, dispatchToProps, childProps, children: Child, context,
}) => {
  const [state, dispatch] = useCustomContext(context);
  const mappedProps = { ...childProps, ...stateToProps(state), ...dispatchToProps(dispatch) };
  return <Child {...mappedProps} />;
};

ContextMapper.propTypes = {
  stateToProps: PT.func,
  dispatchToProps: PT.func,
  childProps: PT.object,
  children: PT.func.isRequired,
  context: PT.object.isRequired,
};

ContextMapper.defaultProps = {
  stateToProps: () => {},
  dispatchToProps: () => {},
  childProps: {},
};

export const connectCustomContext = (stateToProps, dispatchToProps) => component => props => context => (
  <ContextMapper stateToProps={stateToProps} dispatchToProps={dispatchToProps} childProps={props} context={context}>
    { component }
  </ContextMapper>
);

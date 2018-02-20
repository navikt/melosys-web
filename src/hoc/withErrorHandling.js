import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import { SaksbehandlerSelector } from '../ducks/saksbehandler';

const withErrorHandling = WrappedComponent => props => {
  const { children } = props;

  const ErrorComponent = errorProps => {
    const { saksbehandler} = errorProps;

    return (<WrappedComponent {...props}>
      <div className="error-message">Feilmelding her:</div>
      {children}
    </WrappedComponent>)
  }

  const mapStateToProps = state => ({
    saksbehandler: SaksbehandlerSelector(state),
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};

withErrorHandling.propTypes = ({
  children: PT.node.isRequired,
});

export default withErrorHandling;

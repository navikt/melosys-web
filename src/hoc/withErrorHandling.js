import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import { SaksbehandlerSelector, SaksbehandlerStatusSelector } from '../ducks/saksbehandler';

const withErrorHandling = WrappedComponent => props => {
  const { children } = props;

  const ErrorComponent = errorProps => {
    const { saksbehandlerStatus, saksbehandler } = errorProps;

    const saksbehandlerError = saksbehandlerStatus === 'ERROR' ? 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' : null;
    const saksbehandlerFeilObjekt = saksbehandler.data && JSON.parse(saksbehandler.data);
    const saksbehandlerErrorMeldig = saksbehandlerStatus === 'ERROR' ? `Årsak: ${saksbehandlerFeilObjekt.error} Tidspunkt: ${saksbehandlerFeilObjekt.timestamp}` : null;

    return saksbehandlerStatus !== 'ERROR' ?
      (<WrappedComponent {...props} />)
      :
      <div className="error-message">
        <Nav.AlertStripeAdvarsel>{saksbehandlerError} {saksbehandlerErrorMeldig}</Nav.AlertStripeAdvarsel>
      </div>;
  }

  const mapStateToProps = state => ({
    saksbehandler: SaksbehandlerSelector(state),
    saksbehandlerStatus: SaksbehandlerStatusSelector(state),
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};

withErrorHandling.propTypes = ({
  children: PT.node.isRequired,
});

export default withErrorHandling;

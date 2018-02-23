import React from 'react';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';
import { SaksbehandlerSelector, SaksbehandlerStatusSelector } from '../ducks/saksbehandler';


const withErrorHandling = (kontekster, WrappedComponent) => props => {
  const ErrorComponent = errorProps => {
    const { state } = errorProps;
    const { status: saksbehandlerStatus, data: saksbehandler } = state.saksbehandler;
    const { status: nyesakerStatus, data: nyesaker } = state.nyesaker;

    // 1. Har vi en feilsituasjon?
    // 2. Hva er kontekst?
    // 3. Hva er feilstatus?
    let feilStatus = null;

    kontekster.forEach(kontekst => {
      //console.log(state[kontekst]);
      if (state[kontekst].status === 'ERROR') {
        const response = state[kontekst].response;
        feilStatus = response.statusText;
      }
    });


    // 4. Hva slags feilmelding skal vi vise?

    //const saksbehandlerError = saksbehandlerStatus === 'ERROR' ? 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' : null;
    //const saksbehandlerFeilObjekt = saksbehandler.data && JSON.parse(saksbehandler.data);
    //const saksbehandlerErrorMeldig = saksbehandlerStatus === 'ERROR' ? `Årsak: ${saksbehandlerFeilObjekt.error} Tidspunkt: ${saksbehandlerFeilObjekt.timestamp}` : null;


    if (feilStatus) {
      return (<div className="error-message">
        <Nav.AlertStripeAdvarsel>{feilStatus} {feilStatus}</Nav.AlertStripeAdvarsel>
      </div>
      )
    }

      return (<WrappedComponent {...props} />)

  };

  const mapStateToProps = state => ({
    saksbehandler: SaksbehandlerSelector(state),
    saksbehandlerStatus: SaksbehandlerStatusSelector(state),
    state,
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};

export default withErrorHandling;

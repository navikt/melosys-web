import React from 'react';
import { connect } from 'react-redux';

import * as Nav from '../utils/navFrontend';

const withErrorHandling = (kontekster, WrappedComponent) => props => {
  const ErrorComponent = errorProps => {
    const { state } = errorProps;

    // 1. Har vi en feilsituasjon?
    // 2. Hva er kontekst?
    // 3. Hva er feilstatus?
    let feilObjekt = null;

    kontekster.forEach(kontekst => {
      console.log(state[kontekst]);
      if (state[kontekst].status === 'ERROR') {
        const { response } = state[kontekst];
        feilObjekt = { status: response.status, statusText: response.statusText }; //{ statusText: response.statusText() };
      }
    });



    // 4. Hva slags feilmelding skal vi vise?

    //const saksbehandlerError = saksbehandlerStatus === 'ERROR' ? 'Det har oppstått en feil: Kunne ikke hente saksbehandler.' : null;
    //const saksbehandlerFeilObjekt = saksbehandler.data && JSON.parse(saksbehandler.data);
    //const saksbehandlerErrorMeldig = saksbehandlerStatus === 'ERROR' ? `Årsak: ${saksbehandlerFeilObjekt.error} Tidspunkt: ${saksbehandlerFeilObjekt.timestamp}` : null;

    const feilKomponent = feilObjekt && (<div className="error-message">
        <Nav.AlertStripeAdvarsel>{feilObjekt.status}: {feilObjekt.statusText}</Nav.AlertStripeAdvarsel>
      </div>
      );

    if(feilObjekt) {
      const { status } = feilObjekt;
      if (status === 404) {
        return (<div  {...props} ><WrappedComponent {...props} />{feilKomponent}</div>);
      }
    }

     return (<WrappedComponent {...props} />);

  };

  const mapStateToProps = state => ({
    state,
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};

export default withErrorHandling;

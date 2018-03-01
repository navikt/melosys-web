import React from 'react';
import { connect } from 'react-redux';
import * as Nav from '../utils/navFrontend';
import { isJSON } from '../utils/utils';

const withErrorHandling = (kontekster, WrappedComponent) => props => {
  const ErrorComponent = errorProps => {
    const { state } = errorProps;
    const feilObjekter = [];

    kontekster.forEach(kontekst => {
      const { name, message } = kontekst;
      const { status: feilstatus } = state[name];
      if (feilstatus === 'ERROR') {
        const { response, data: fetch } = state[name].data;
        const fetchdata = isJSON(fetch) ? JSON.parse(fetch) : fetch;
        const { status, statusText } = response;
        feilObjekter.push({
          status, statusText, message, fetchdata,
        });
      }
    });

    // Dersom ingen feilstatus er funnet returner wrappet component.
    if (feilObjekter.length === 0) {
      return (<WrappedComponent {...props} />);
    }

    // Finn hvilke feil kode(r) som finnes og legg til kun 1 alert stripe.
    // Sorter feilkoder med synkende verdi
    feilObjekter.sort((a, b) => b.status - a.status);

    const feilKomponent = (
      <div className="error-message">
        <Nav.AlertStripeAdvarsel>{ feilObjekter[0].status } : { feilObjekter[0].statusText }<br />{ feilObjekter[0].fetchdata.timestamp}<br />{ feilObjekter[0].message }</Nav.AlertStripeAdvarsel>
      </div>
    );

      // Dersom 404 så skal både alertstripe og kompoonent vises.
    if (feilObjekter[0].status === 404) {
      return (<div {...props} ><WrappedComponent {...props} />{feilKomponent}</div>);
    }
    // alle andre feilkoder gir full stopp uten å vise komponenten.
    return (<div>{feilKomponent}</div>);
  };

  const mapStateToProps = state => ({
    state,
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};
export default withErrorHandling;

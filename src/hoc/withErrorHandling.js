import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import { isJSON } from '../utils/utils';

import './withErrorHandling.css';

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

    const FeilKomponent = ({ feilobjekt }) => (
      <div className="error-message">
        <Nav.AlertStripeAdvarsel>{ feilobjekt.status } : { feilobjekt.statusText }<br />{ feilobjekt.fetchdata.timestamp}<br />{ feilobjekt.message }</Nav.AlertStripeAdvarsel>
      </div>
    );
    FeilKomponent.propTypes = {
      feilobjekt: PT.shape({
        status: PT.number,
        statusText: PT.string,
        fetchdata: PT.object,
      }).isRequired,
    };

    // Dersom 404 så skal både alertstripe og kompoonent vises.
    if (feilObjekter[0].status === 404) {
      return (<div {...props} className="errorContainer"><WrappedComponent {...props} /><FeilKomponent feilobjekt={feilObjekter[0]} /></div>);
    }
    // alle andre feilkoder gir full stopp uten å vise komponenten.
    return (<div className="errorContainer"><FeilKomponent feilobjekt={feilObjekter[0]} /></div>);
  };

  const mapStateToProps = state => ({
    state,
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};
export default withErrorHandling;

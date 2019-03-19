import React from 'react';
import { connect } from 'react-redux';
import PT from 'prop-types';

import * as Nav from '../utils/navFrontend';
import * as Utils from '../utils';

import './withErrorHandling.css';

/** Dette er komponenten for selve feilmeldingsgrensesnittet. Det kan teknisk sett være flere av denne i en view,
 * men Melosys viser den feilen som ansees som mest alvorlig.
 *
 * @param feilobjekt Inneholder all hensiktsmessig informasjon og data.
 */
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

const parseMockErrorObject = (kontekst, currentReduxState) => {
  const { melding } = kontekst;
  // Siden fetch-APIet resulterer i en modell med strukturen 'data.data', lager vi aliaset 'payload'.
  const { data: payload } = currentReduxState;

  // Deretter kan vi bruke 'data' slik vi mener å bruke den.
  const { data } = payload;
  const fetchdata = Utils.isJSON(data) ? JSON.parse(data) : data;

  const { status, message: statusText } = fetchdata;
  return {
    status, statusText, melding, fetchdata,
  };
};
const parseErrorObject = (kontekst, currentReduxState) => {
  debugger;
  // TODO under er kun eksempel på errorObject properties.
  return {
    status: '403', statusText: 'statusText', melding: 'melding', fetchdata: { timestamp: Date() },
  };
};

/** Dette er en HOC som benyttes til å wrappe rundt alle komponenter som
 * skal støttes av en feilhåndtering.
 *
 * @param kontekster Array av reducer-modeller ('fagsak', 'saksbehandler' etc) som instansen skal ta hensyn til og sjekke for feil.
 * @param WrappedComponent React-komponenten som wrappes.
 */

const withErrorHandling = (kontekster, WrappedComponent) => props => {
  const NODE_ENV = `${process.env.NODE_ENV}`; // default =>  'development' : 'production'

  const ErrorComponent = errorProps => {
    const { reduxRootState } = errorProps;
    const feilSamling = [];

    kontekster.forEach(kontekst => {
      const currentReduxState = reduxRootState[kontekst.navn];
      const { status: feilStatus } = currentReduxState;
      if (feilStatus === 'ERROR') {
        if (NODE_ENV === 'development') {
          const emo = parseMockErrorObject(kontekst, currentReduxState);
          feilSamling.push(emo);
        } else {
          const eobj = parseErrorObject(kontekst, currentReduxState);
          feilSamling.push(eobj);
        }
      }
    });

    // Dersom ingen feilstatus er funnet returner wrappet component.
    if (feilSamling.length === 0) {
      return (<WrappedComponent {...props} />);
    }

    // Finn hvilke feil kode(r) som finnes og legg til kun 1 alert stripe.
    // Sorter feilkoder med synkende verdi
    feilSamling.sort((a, b) => b.status - a.status);

    // Dersom 404 så skal både alertstripe og kompoonent vises.
    if (feilSamling[0].status === 404) {
      return (<div {...props} className="errorContainer"><FeilKomponent feilobjekt={feilSamling[0]} /></div>);
    }
    // alle andre feilkoder gir full stopp uten å vise komponenten.
    return (<div className="errorContainer"><FeilKomponent feilobjekt={feilSamling[0]} /></div>);
  };

  const mapStateToProps = state => ({
    reduxRootState: state,
  });

  const ReturnComponent = connect(mapStateToProps)(ErrorComponent);

  return (<ReturnComponent />);
};
export default withErrorHandling;

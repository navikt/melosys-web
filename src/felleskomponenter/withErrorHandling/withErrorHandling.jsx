import { connect } from "react-redux";
import PT from "prop-types";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import "./withErrorHandling.css";

/** Dette er komponenten for selve feilmeldingsgrensesnittet. Det kan teknisk sett være flere av denne i en view,
 * men Melosys viser den feilen som ansees som mest alvorlig.
 *
 * @param feilobjekt Inneholder all hensiktsmessig informasjon og data.
 */
const FeilKomponent = ({ feilobjekt }) => (
  <div className="error-message">
    <Nav.AlertStripeAdvarsel>
      {feilobjekt.status} : {feilobjekt.statusText}
      <br />
      {feilobjekt.fetchdata.timestamp}
      <br />
      {feilobjekt.message}
    </Nav.AlertStripeAdvarsel>
  </div>
);

FeilKomponent.propTypes = {
  feilobjekt: PT.shape({
    message: PT.string,
    status: PT.oneOfType([PT.string, PT.number]),
    statusText: PT.string,
    fetchdata: PT.object,
  }).isRequired,
};

const parseStructuredPayload = (melding, payload) => {
  const { data } = payload;
  const fetchdata = Utils.isJSON(data) ? JSON.parse(data) : data;

  const { status, message: statusText } = fetchdata;
  return {
    status,
    statusText,
    melding,
    fetchdata,
  };
};
const parseErrorObject = (kontekst, currentReduxState) => {
  const { data: payload, status } = currentReduxState;
  const { melding } = kontekst;

  if (Utils._isString(payload)) {
    return {
      status,
      statusText: payload,
      melding,
      fetchdata: { timestamp: Date() },
    };
  }

  return parseStructuredPayload(melding, payload);
};

const ErrorComponentInner = ({ kontekster, WrappedComponent, reduxRootState, ...props }) => {
  const feilSamling = [];

  kontekster.forEach((kontekst) => {
    const currentReduxState = reduxRootState[kontekst.navn];
    const { status: feilStatus } = currentReduxState;
    if (feilStatus === "ERROR") {
      const eobj = parseErrorObject(kontekst, currentReduxState);
      feilSamling.push(eobj);
    }
  });

  if (feilSamling.length === 0) {
    return <WrappedComponent {...props} />;
  }

  feilSamling.sort((a, b) => b.status - a.status);

  if (feilSamling[0].status === 404) {
    return (
      <div {...props} className="errorContainer">
        <FeilKomponent feilobjekt={feilSamling[0]} />
      </div>
    );
  }

  return (
    <div className="errorContainer">
      <FeilKomponent feilobjekt={feilSamling[0]} />
    </div>
  );
};

ErrorComponentInner.propTypes = {
  kontekster: PT.any.isRequired,
  WrappedComponent: PT.any.isRequired,
  reduxRootState: PT.any.isRequired,
};

const mapStateToProps = (state) => ({
  reduxRootState: state,
});

const ErrorComponent = connect(mapStateToProps)(ErrorComponentInner);

/** Dette er en HOC som benyttes til å wrappe rundt alle komponenter som
 * skal støttes av en feilhåndtering.
 *
 * @param kontekster Array av reducer-modeller ('fagsak', 'saksbehandler' etc) som instansen skal ta hensyn til og sjekke for feil.
 * @param WrappedComponent React-komponenten som wrappes.
 */

const withErrorHandling = (kontekster, WrappedComponent) => (props) => {
  return <ErrorComponent kontekster={kontekster} WrappedComponent={WrappedComponent} {...props} />;
};
export default withErrorHandling;

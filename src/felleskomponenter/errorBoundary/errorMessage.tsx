import * as Nav from "../../navFrontend";

interface ErrorMessageProps {
  feilobjekt: {
    varselTekst: string;
    status: string | number;
    statusTekst: string;
    fetchdata: any;
  };
}
const ErrorMessage = ({ feilobjekt }: ErrorMessageProps) => (
  <div className="error-message">
    <Nav.AlertStripeAdvarsel>
      {feilobjekt.status} : {feilobjekt.statusTekst}
      <br />
      {feilobjekt.fetchdata.timestamp}
      <br />
      {feilobjekt.varselTekst}
    </Nav.AlertStripeAdvarsel>
  </div>
);
export default ErrorMessage;

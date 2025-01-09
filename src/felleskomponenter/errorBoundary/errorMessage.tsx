import * as Nav from "../../navFrontend";

interface ErrorMessageProps {
  feilobjekt: {
    varselTekst: string;
    status: string | number;
    statusTekst: string;
    fetchdata: any;
  };
}
function ErrorMessage({ feilobjekt }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <Nav.Alert variant="warning">
        {feilobjekt.status} : {feilobjekt.statusTekst}
        <br />
        {feilobjekt.fetchdata.timestamp}
        <br />
        {feilobjekt.varselTekst}
      </Nav.Alert>
    </div>
  );
}
export default ErrorMessage;

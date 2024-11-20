import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import StrukturertAdresse from "../../../../adresser/strukturertAdresse";

interface EnkeltArbeidsforholdUtlandRedigeringUtfortProps {
  verdier: KV.Form.ArbeidsforholdUtland;
}

const EnkeltArbeidsforholdUtlandRedigeringUtfort = ({ verdier }: EnkeltArbeidsforholdUtlandRedigeringUtfortProps) => (
  <Nav.Row>
    <Nav.Column xs="5">{verdier.adresse && <StrukturertAdresse adresse={verdier.adresse} />}</Nav.Column>
    <Nav.Column xs="4">
      {verdier.orgnr && (
        <>
          <Nav.BodyLong size="small">Registreringsnummer</Nav.BodyLong>
          <Nav.BodyLong weight="semibold" size="small">
            {verdier.orgnr}
          </Nav.BodyLong>
        </>
      )}
    </Nav.Column>
  </Nav.Row>
);

export default EnkeltArbeidsforholdUtlandRedigeringUtfort;

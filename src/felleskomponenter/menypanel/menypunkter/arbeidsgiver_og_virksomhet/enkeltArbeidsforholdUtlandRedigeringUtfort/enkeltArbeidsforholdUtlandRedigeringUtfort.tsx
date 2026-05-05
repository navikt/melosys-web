import * as KV from "../../../../../kodeverk";
import * as Nav from "../../../../../navFrontend";

import StrukturertAdresse from "../../../../adresser/strukturertAdresse";

interface EnkeltArbeidsforholdUtlandRedigeringUtfortProps {
  verdier: KV.Form.ArbeidsforholdUtland;
}

function EnkeltArbeidsforholdUtlandRedigeringUtfort({ verdier }: EnkeltArbeidsforholdUtlandRedigeringUtfortProps) {
  return (
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
      {verdier.tilhorerSammeKonsern != null && (
        <Nav.Column xs="12">
          <Nav.BodyLong size="small">Tilhører samme konsern som norsk arbeidsgiver</Nav.BodyLong>
          <Nav.BodyLong weight="semibold" size="small">
            {verdier.tilhorerSammeKonsern ? "Ja" : "Nei"}
          </Nav.BodyLong>
        </Nav.Column>
      )}
    </Nav.Row>
  );
}

export default EnkeltArbeidsforholdUtlandRedigeringUtfort;

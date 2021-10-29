import React from "react";

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
          <Nav.Typo.Normaltekst>Registreringsnummer</Nav.Typo.Normaltekst>
          <Nav.Typo.Element>{verdier.orgnr}</Nav.Typo.Element>
        </>
      )}
    </Nav.Column>
  </Nav.Row>
);

export default EnkeltArbeidsforholdUtlandRedigeringUtfort;

import React from 'react';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';

import StrukturertAdresse from '../../../../adresser/strukturertAdresse';

interface EnkeltArbeidsforholdUtlandRedigeringUtfortProps {
  verdier: KV.Form.ArbeidsforholdUtland,
}

const EnkeltArbeidsforholdUtlandRedigeringUtfort = ({
  verdier,
}: EnkeltArbeidsforholdUtlandRedigeringUtfortProps) => (
  <Nav.Row>
    <Nav.Column xs="4">
      {
        verdier.adresse &&
        <StrukturertAdresse adresse={verdier.adresse} />
      }
    </Nav.Column>
    <Nav.Column xs="4">
      {
        verdier.orgnr &&
        <>
          <Nav.typo.Normaltekst>Registreringsnummer</Nav.typo.Normaltekst>
          <Nav.typo.Element>{verdier.orgnr}</Nav.typo.Element>
        </>
      }
    </Nav.Column>
  </Nav.Row>
);

export default EnkeltArbeidsforholdUtlandRedigeringUtfort;

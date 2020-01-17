import React from 'react';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import { BOOLSK } from '../../../constants';

const SendForvaltningsMelding = () => (
  <div className="sendForvaltningsmelding">
    <Nav.typo.Element>Skal melding om saksbehandlingtid sendes automatisk?</Nav.typo.Element>

    <Skjema.RadioGruppe feltNavn="ikkeSendForvaltingsmelding" label="">
      <Skjema.Radio
        feltNavn="ikkeSendForvaltingsmelding"
        label="Ja, melding skal sendes automatisk"
        value={BOOLSK.USANN}
      />
      <Skjema.Radio
        feltNavn="ikkeSendForvaltingsmelding"
        label="Nei, jeg vil sende melding senere eller behandle saken innen kort tid"
        value={BOOLSK.SANN}
      />
      <Nav.typo.Element>Oppgi kontaktperson hos fullmektig som skal motta meldingen hvis dette er oppgitt</Nav.typo.Element>
      <Skjema.Input
        feltNavn="representantKontaktPerson"
        label=""
        placeholder="Skriv inn..."
      />
    </Skjema.RadioGruppe>
  </div>
);

export default SendForvaltningsMelding;

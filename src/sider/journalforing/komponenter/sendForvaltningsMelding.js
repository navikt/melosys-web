import React, { Fragment, useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../../felleskomponenter/skjema';
import * as KV from '../../../kodeverk';
import { BOOLSK } from '../../../constants';

const SendForvaltningsMelding = ({ avsenderType, settFeltInnhold }) => {
  const avsenderErFullmelktig = (avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG || avsenderType === KV.AvsenderTyper.FULLMEKTIG);

  useEffect(() =>
    () => {
      if (!avsenderErFullmelktig) {
        settFeltInnhold('representantKontaktPerson', '');
      }
    }, [avsenderType]);

  return (
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
        { avsenderErFullmelktig &&
        <Fragment>
          <Nav.typo.Element>Oppgi kontaktperson hos fullmektig som skal motta meldingen hvis dette er oppgitt</Nav.typo.Element>
          <Skjema.Input
            feltNavn="representantKontaktPerson"
            label=""
            placeholder="Skriv inn..."
          />
        </Fragment>
        }
      </Skjema.RadioGruppe>
    </div>
  );
};

SendForvaltningsMelding.propTypes = {
  avsenderType: PT.string.isRequired,
  settFeltInnhold: PT.func.isRequired,
};

export default SendForvaltningsMelding;

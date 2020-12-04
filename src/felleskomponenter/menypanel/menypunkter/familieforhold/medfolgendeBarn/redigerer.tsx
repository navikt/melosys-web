import React, { useState, useEffect, ChangeEventHandler } from 'react';

import * as KV from '../../../../../kodeverk';
import * as Nav from '../../../../../utils/navFrontend';
import * as Skjema from '../../../../skjema';
import * as Utils from '../../../../../utils';
import * as Api from '../../../../../services/api';
import * as Symboler from '../../symboler';

import { EnRedigeringsknappListeRedigerer } from '../../editerbartElementListe';

import './redigerer.css';

const Redigerer = ({
  redigerbart,
  overordnetFeltNavn,
  slett,
  settVerdi,
  verdier,
}: EnRedigeringsknappListeRedigerer<KV.Form.MedfolgendeBarn>) => {
  const [idNummerErAutomatiskUtfylt, setIdNummerErAutomatiskUtfylt] = useState(false);

  const hentPerson = async (idNummer: string) => {
    setIdNummerErAutomatiskUtfylt(false);

    if (Utils.person.erGyldigFnr(idNummer) || Utils.person.erGyldigDnr(idNummer)) {
      try {
        const person = await Api.Personer.hentPerson(idNummer);
        settVerdi('navn', person.sammensattNavn);
        setIdNummerErAutomatiskUtfylt(true);
      } catch (e) {
        if (e.status !== 404) Utils.logger.error(e);
      }
    }
  };

  const idNummerChangeHandler: ChangeEventHandler<HTMLInputElement> = async event => {
    const idNummer = event.target.value;
    hentPerson(idNummer);
  };

  useEffect(() => {
    if (verdier.fnr) {
      hentPerson(verdier.fnr.toString());
    }
  }, []);

  return (
    <Nav.Row className="medfolgende-barn__redigerer">
      <Nav.Column xs="5">
        <Skjema.Input
          label="Fullt navn"
          feltNavn={`${overordnetFeltNavn}.navn`}
          disabled={!redigerbart || idNummerErAutomatiskUtfylt}
          bredde="fullbredde"
          datoFelt={false}
        />
      </Nav.Column>
      <Nav.Column xs="5">
        <Skjema.Input
          label="F.nr./d-nr."
          feltNavn={`${overordnetFeltNavn}.fnr`}
          disabled={!redigerbart}
          bredde="fullbredde"
          datoFelt={false}
          onChange={idNummerChangeHandler}
        />
      </Nav.Column>
      <Symboler.Slett
        onClick={slett}
        className="slett-symbol"
      />
    </Nav.Row>
  );
};

export default Redigerer;

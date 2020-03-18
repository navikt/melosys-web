import React, { useState, useEffect, Fragment } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Mui from '../../../felleskomponenter/ui';
import * as Utils from '../../../utils';
import * as Api from '../../../services/api';
import * as KV from '../../../kodeverk';

import MKV from '../../../melosyskodeverk';
import Notat from './notat';

import './sideDialogNotater.css';

const sortNotaterByOpprettetDato = (forsteNotat, andreNotat) => {
  const { endretDato: forsteEndretDato } = forsteNotat;
  const { endretDato: andreEndretDato } = andreNotat;

  const datoDiff = Utils.dato.datoDiffPure(forsteEndretDato, andreEndretDato, 'seconds');
  return -datoDiff;
};

const SideDialogNotater = ({
  saksnummer,
}) => {
  const [notater, setNotater] = useState([]);
  const [leggTilNotatDialogSynlig, setLeggTilNotatDialogSynlig] = useState(false);
  const [nyttNotatTekst, setNyttNotatTekst] = useState('');

  const hentNotater = async () => {
    try {
      const hentedeNotater = await Api.Fagsaker.notater.hent(saksnummer);
      setNotater(hentedeNotater);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  useEffect(() => {
    hentNotater();
  }, [saksnummer]);

  const maksTekstLengde = 500;
  const disableLagreKnapp = nyttNotatTekst.length > maksTekstLengde;

  const oppdaterNotatState = oppdatertNotat => {
    setNotater(prevNotater => prevNotater.map(notat => (
      notat.notatId === oppdatertNotat.notatId ? oppdatertNotat : notat
    )));
  };

  const leggTilNotatState = nyttNotat => {
    setNotater(prevNotater => [...prevNotater, nyttNotat]);
  };

  const oppdaterNotat = async (notatID, tekst) => {
    try {
      const oppdatertNotat = await Api.Fagsaker.notater.oppdater(saksnummer, notatID, { tekst });
      oppdaterNotatState(oppdatertNotat);
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  const visLeggTilNotatDialog = () => {
    setLeggTilNotatDialogSynlig(true);
  };

  const skjulLeggTilNotatDialog = () => {
    setLeggTilNotatDialogSynlig(false);
  };

  const avbrytLeggTilNotat = () => {
    skjulLeggTilNotatDialog();
    setNyttNotatTekst('');
  };

  const endreNyttNotatTekst = e => {
    setNyttNotatTekst(e.target.value);
  };

  const opprettNotat = async () => {
    try {
      const nyttNotat = await Api.Fagsaker.notater.opprett(saksnummer, { tekst: nyttNotatTekst });

      leggTilNotatState(nyttNotat);
      skjulLeggTilNotatDialog();
      setNyttNotatTekst('');
    } catch (e) {
      Utils.logger.error(e);
    }
  };

  /* eslint-disable-next-line max-len */
  const skrivInnNotatLabel = 'Her kan du notere særlige vurderinger eller handlinger du gjør, for eksempel at du innhenter opplysninger. Notater brukes for å holde oversikt over hva som er gjort i saken, men lagres ikke som saksdokumenter.';

  return (
    <Nav.Panel>
      <div className="notater">
        {
          notater
            .sort(sortNotaterByOpprettetDato)
            .map(notat => (
              <Notat
                key={Utils._uuid()}
                redigerbart={notat.redigerbar}
                tekst={notat.tekst}
                opprettetDato={notat.registrertDato}
                endretDato={notat.endretDato}
                forfatter={notat.registrertAvNavn}
                onUpdate={tekst => oppdaterNotat(notat.notatId, tekst)}
                overskrift={KV.kodeTilTerm(notat.behandlingstypeKode, MKV.KTObjects.behandlinger.behandlingstyper)}
                maksTekstLengde={maksTekstLengde}
              />
            ))
        }
      </div>
      <div className="leggTilNotat">
        {
          leggTilNotatDialogSynlig &&
          <Fragment>
            <Nav.Textarea
              label={skrivInnNotatLabel}
              placeholder="Skriv inn et notat"
              value={nyttNotatTekst}
              onChange={endreNyttNotatTekst}
              maxLength={500}
            />
            <Mui.Knapp disabled={disableLagreKnapp} type="hoved" onClick={opprettNotat}>LAGRE NOTAT</Mui.Knapp>
            <Mui.Knapp onClick={avbrytLeggTilNotat}>AVBRYT</Mui.Knapp>
          </Fragment>
        }
        {
          !leggTilNotatDialogSynlig &&
          <Mui.Knapp type="hoved" onClick={visLeggTilNotatDialog}>LEGG TIL NYTT NOTAT</Mui.Knapp>
        }
      </div>
    </Nav.Panel>
  );
};

SideDialogNotater.propTypes = {
  saksnummer: PT.string.isRequired,
};

export default SideDialogNotater;

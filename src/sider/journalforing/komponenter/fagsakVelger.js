import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as MPT from '../../../proptypes/';

import EnkeltSak from './enkeltSak';
import KnyttTilSak from './knyttTilSak';
import OpprettSak, { OpprettSakTittel } from './opprettSak';

import { JOURNALFORING_HENSIKT } from '../../../constants';
import './fagsakVelger.css';

const FagsakVelger = props => {
  const {
    sakstyper, behandlingstyper, behandlingstemaer, fagsakListe, settJournalforingHensikt,
  } = props;
  const notifier = async saksnummer => {
    const hensikt = (saksnummer === '-1') ? JOURNALFORING_HENSIKT.OPPRETT : JOURNALFORING_HENSIKT.KNYTT;
    await settJournalforingHensikt(hensikt);
  };
  const radioValg = fagsakListe.reduce((samling, sak) =>
    ([...samling, {
      value: sak.saksnummer,
      innhold: <EnkeltSak sak={sak} />,
      footer: <KnyttTilSak sak={sak} behandlingstyper={behandlingstyper} />,
    }]), []);
  radioValg.push({
    value: '-1',
    innhold: <OpprettSakTittel />,
    footer: <OpprettSak sakstyper={sakstyper} behandlingstemaer={behandlingstemaer} />,
  });
  return (
    <Fragment>
      <div className="eksisterendeSaker">
        {<Skjema.CustomRadioPanelGruppe
          feltNavn="saksnummer"
          radios={radioValg}
          notify={notifier}
        />}
        { fagsakListe.length === 0 && 'Ingen eksisterende saker funnet.'}
      </div>
    </Fragment>
  );
};

FagsakVelger.propTypes = {
  sakstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingstemaer: PT.arrayOf(MPT.Kodeverk).isRequired,
  fagsakListe: PT.array.isRequired,
  settJournalforingHensikt: PT.func.isRequired,
};


export default FagsakVelger;

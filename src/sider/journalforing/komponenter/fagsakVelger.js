import React, { Fragment } from 'react';
import PT from 'prop-types';

import * as Skjema from '../../../felleskomponenter/skjema/';
import * as MPT from '../../../proptypes/';

import EnkeltSak from './enkeltSak';
import KnyttTilSak from './knyttTilSak';
import OpprettSak, { OpprettSakTittel } from './opprettSak';

const FagsakVelger = props => {
  const {
    sakstyper, behandlingstyper, fagsakListe,
  } = props;

  const radioValg = fagsakListe.reduce((samling, sak) =>
    ([...samling, {
      value: sak.saksnummer,
      innhold: <EnkeltSak sak={sak} />,
      footer: <KnyttTilSak sak={sak} />,
    }]), []);
  radioValg.push({
    value: '-1',
    innhold: <OpprettSakTittel />,
    footer: <OpprettSak sakstyper={sakstyper} behandlingstyper={behandlingstyper} />,
  });
  return (
    <Fragment>
      <div className="eksisterendeSaker">
        {<Skjema.CustomRadioPanelGruppe
          feltNavn="saksnummer"
          radios={radioValg}
        />}
        { fagsakListe.length === 0 && 'Ingen eksisterende saker funnet.'}
      </div>
    </Fragment>
  );
};

FagsakVelger.propTypes = {
  sakstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  behandlingstyper: PT.arrayOf(MPT.Kodeverk).isRequired,
  fagsakListe: PT.array.isRequired,
};


export default FagsakVelger;

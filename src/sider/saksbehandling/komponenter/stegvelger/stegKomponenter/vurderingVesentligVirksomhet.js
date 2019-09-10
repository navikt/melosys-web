import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import { arrayTilKonjunksjon } from '../../../../../utils/streng';

import EnkeltVilkaar from './felles/enkeltVilkaar';

const VurderingVesentligVirksomhet = props => {
  const {
    bekreftOgFortsett, begrunnelser, tilstand, redigerbart, oppdaterData, slettData, valgteVirksomheter,
  } = props;
  const { vesentligVirksomhetVilkaar, harAvklaring } = tilstand;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  const arbeidsgivereTekst = valgteVirksomheter.length > 0 ? `${arrayTilKonjunksjon(valgteVirksomheter.map(virksomhet => virksomhet.navn))}` : '';

  return (
    <div>
      <Nav.Undertittel>Har {arbeidsgivereTekst} vesentlig virksomhet i Norge?</Nav.Undertittel>
      <EnkeltVilkaar
        redigerbart={redigerbart}
        begrunnelser={begrunnelser}
        vilkaar={vesentligVirksomhetVilkaar}
        vilkaarKode="vesentligVirksomhet"
        labelOppfylt="Ja"
        labelIkkeOppfylt="Nei"
        oppdaterData={oppdaterData}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVesentligVirksomhet.ID = 'VESENTLIG_VIRKSOMHET';

VurderingVesentligVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.arrayOf(MPT.Virksomhet),
  begrunnelser: PT.arrayOf(MPT.Kodeverk),
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingVesentligVirksomhet.defaultProps = {
  tilstand: {},
  valgteVirksomheter: [],
  begrunnelser: [],
};

export default VurderingVesentligVirksomhet;

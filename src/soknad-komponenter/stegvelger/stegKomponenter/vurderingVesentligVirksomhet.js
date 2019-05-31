import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as MPT from '../../../proptypes';

import { arrayTilKonjunksjon } from '../../../utils/streng';

import EnkeltVilkaar from './felles/enkeltVilkaar';

const VurderingVesentligVirksomhet = props => {
  const {
    bekreftOgFortsett, begrunnelser, tilstand, redigerbart, oppdaterData, slettData,
  } = props;
  const { vesentligVirksomhetVilkaar, harAvklaring } = tilstand;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  const arbeidsgivereTekst = props.valgteVirksomheter.length > 0 ? `til ${arrayTilKonjunksjon(props.valgteVirksomheter.map(arbeidsgiver => arbeidsgiver.navn))}` : '';
  return (
    <div>
      <Nav.Undertittel>Vurdering av vesentlig virksomhet {arbeidsgivereTekst}</Nav.Undertittel>
      <EnkeltVilkaar
        redigerbart={redigerbart}
        begrunnelser={begrunnelser}
        vilkaar={vesentligVirksomhetVilkaar}
        vilkaarKode="vesentligVirksomhet"
        tittel="Virksomheten har:"
        labelOppfylt="Vesentlig virksomhet"
        labelIkkeOppfylt="Ikke vesentlig virksomhet"
        oppdaterData={oppdaterData}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingVesentligVirksomhet.ID = 'VESENTLIG_VIRKSOMHET';

VurderingVesentligVirksomhet.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  valgteVirksomheter: PT.array,
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

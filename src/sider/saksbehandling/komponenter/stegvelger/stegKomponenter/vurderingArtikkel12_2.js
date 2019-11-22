import React, { useEffect } from 'react';
import PT from 'prop-types';

import MKV from '../../../../../melosyskodeverk';

import * as Nav from '../../../../../utils/navFrontend';
import * as MPT from '../../../../../proptypes';

import MultiVilkaar from './felles/multiVilkaar';

const VurderingArtikkel12_2 = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData,
  } = props;

  useEffect(() => (
    function cleanup() {
      slettData();
    }
  ), []);

  const {
    art12_2, art16_1, harAvklaring,
  } = tilstand;

  return (
    <div>
      <MultiVilkaar
        oppdaterData={oppdaterData}
        slettData={slettData}
        redigerbart={redigerbart}
        vilkaar12={art12_2}
        vilkaarNavn12="12.2"
        vilkaarKode12="art12_2"
        begrunnelser12={MKV.KTObjects.begrunnelser.art12_2_begrunnelser}
        vilkaar16={art16_1}
      />
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingArtikkel12_2.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  artikkel: MPT.Kodeverk,
  oppdaterData: PT.func.isRequired,
  slettData: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

VurderingArtikkel12_2.defaultProps = {
  tilstand: {},
  artikkel: {},
};

export default VurderingArtikkel12_2;

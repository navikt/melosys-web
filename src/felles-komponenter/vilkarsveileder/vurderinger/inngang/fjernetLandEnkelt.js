import PT from 'prop-types';
import React from 'react';

import { kodeverkObjektTilKode, kodeverkObjektTilTerm } from '../../../../utils/kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';

const FjernetLandEnkelt = props => {
  const {
    landKodeObjekt, angreFjern, begrunnelseTerm,
  } = props;

  return (
    <div>
      <div className="fjernetland__linje">
        <div className="fjernetland__landNavn">{kodeverkObjektTilTerm(landKodeObjekt)} ({kodeverkObjektTilKode(landKodeObjekt)})</div>
        <div className="fjernetland__begrunnelse">{begrunnelseTerm}</div>
        <div><Nav.Knapp mini onClick={() => angreFjern(kodeverkObjektTilKode(landKodeObjekt))}>Angre fjern</Nav.Knapp></div>
      </div>
    </div>
  );
};

FjernetLandEnkelt.propTypes = {
  landKodeObjekt: MPT.Kodeverk.isRequired,
  angreFjern: PT.func.isRequired,
  begrunnelseTerm: PT.string.isRequired,
};

export default FjernetLandEnkelt;

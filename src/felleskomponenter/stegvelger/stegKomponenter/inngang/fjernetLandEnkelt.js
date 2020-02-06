import PT from 'prop-types';
import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as KV from '../../../../kodeverk';

const FjernetLandEnkelt = props => {
  const {
    landkodeObjekt, angreFjern, begrunnelseTerm, redigerbart,
  } = props;

  const landTerm = KV.objektTilTerm(landkodeObjekt);
  const landkode = KV.objektTilKode(landkodeObjekt);

  return (
    <div>
      <div className="fjernetland__linje">
        <div className="linje__land">{landTerm} ({landkode})</div>
        <div className="linje__begrunnelse">{begrunnelseTerm}</div>
        <div className="linje__knapper"><Nav.Knapp disabled={!redigerbart} onClick={() => angreFjern(landkode)}>Angre fjern</Nav.Knapp></div>
      </div>
    </div>
  );
};

FjernetLandEnkelt.propTypes = {
  angreFjern: PT.func.isRequired,
  begrunnelseTerm: PT.string.isRequired,
  landkodeObjekt: MPT.Kodeverk.isRequired,
  redigerbart: PT.bool.isRequired,
};

export default FjernetLandEnkelt;

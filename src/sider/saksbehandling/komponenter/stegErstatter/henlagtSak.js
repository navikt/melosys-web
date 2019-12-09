import React from 'react';

import MKV from '../../../../melosyskodeverk';

import * as KV from '../../../../kodeverk';
import * as MPT from '../../../../proptypes';

import StegerstatterBase from './stegerstatterBase';

function hentBegrunnelse(begrunnelseKoder) {
  if (!begrunnelseKoder || begrunnelseKoder.length === 0) {
    return 'Ukjent grunn';
  }
  return KV.kodeTilTerm(begrunnelseKoder[0], MKV.KTObjects.begrunnelser.henleggelsesgrunner);
}

function hentBeskrivelse(behandlingsresultat) {
  const { begrunnelseKoder, begrunnelseFritekst } = behandlingsresultat;
  if (begrunnelseFritekst && begrunnelseFritekst.length > 1) {
    return begrunnelseFritekst;
  }
  return hentBegrunnelse(begrunnelseKoder);
}

const HenlagtSak = ({ behandlingsresultat }) => {
  const beskrivelse = hentBeskrivelse(behandlingsresultat);

  return (
    <StegerstatterBase
      tittel="Saken er henlagt:"
      beskrivelse={beskrivelse}
    />
  );
};

HenlagtSak.propTypes = {
  behandlingsresultat: MPT.Behandlingsresultat.isRequired,
};


export default HenlagtSak;

import React from 'react';
import PT from 'prop-types';
import * as MKV from 'melosys-kodeverk';

import * as KV from '../../../kodeverk';
import * as Nav from '../../../utils/navFrontend';

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.unntak_periode_begrunnelser);
};

const RegisterkontrollTreff = ({ begrunnelseKode }) => (
  <div className="registerkontroll-listeelement">
    <Nav.Ikoner kind="advarsel-sirkel-fyll" size="24" />
    <Nav.Normaltekst>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.Normaltekst>
  </div>
);

RegisterkontrollTreff.propTypes = {
  begrunnelseKode: PT.string.isRequired,
};

export default RegisterkontrollTreff;

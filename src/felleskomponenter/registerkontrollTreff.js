import React from 'react';
import PT from 'prop-types';

import MKV from '../melosyskodeverk';

import * as KV from '../kodeverk';
import * as Nav from '../utils/navFrontend';
import * as Utils from '../utils';

const UnntakPeriodeBegrunnelse = kode => {
  if (!kode) return '';
  return KV.kodeTilTerm(kode, MKV.KTObjects.begrunnelser.kontroll_begrunnelser);
};

const RegisterkontrollTreff = ({
  vurderingBegrunnelser,
}) => {
  if (!vurderingBegrunnelser.begrunnelseKoder) return null;

  return vurderingBegrunnelser.begrunnelseKoder.map(begrunnelseKode => (
    <div key={Utils._uuid()} className="registerkontroll-listeelement">
      <Nav.Ikoner kind="advarsel-sirkel-fyll" size="24" />
      <Nav.typo.Normaltekst>{UnntakPeriodeBegrunnelse(begrunnelseKode)}</Nav.typo.Normaltekst>
    </div>
  ));
};

RegisterkontrollTreff.propTypes = {
  vurderingBegrunnelser: PT.object,
};

RegisterkontrollTreff.defaultProps = {
  vurderingBegrunnelser: {},
};


export default RegisterkontrollTreff;

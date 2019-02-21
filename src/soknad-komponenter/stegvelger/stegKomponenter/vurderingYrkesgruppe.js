import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';

const VurderingYrkesgruppe = props => {
  const { bekreftOgFortsett, tilstand, redigerbart } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesgruppe</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.yrkesgruppe" value={KV.Koder.VurderingYrkesgruppeTyper.ORDINAER} label="Yrkesaktiv" />
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.yrkesgruppe" value={KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP} label="Yrkesaktiv på sokkel eller skip" />
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.yrkesgruppe" value={KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL} label="Yrkesaktiv som flyvende personell" />
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.yrkesgruppe" value={KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV} label="Ikke yrkesaktiv" />
        <Skjema.Radio disabled={!redigerbart} feltNavn="avklartefakta.yrkesgruppe" value={KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER} label="Kontantytelsesmottaker" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!(redigerbart && harAvklaring)} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesgruppe.ID = 'YRKESGRUPPE';


VurderingYrkesgruppe.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  tilstand: PT.object,
  redigerbart: PT.bool.isRequired,
};

VurderingYrkesgruppe.defaultProps = {
  tilstand: {},
};


export default VurderingYrkesgruppe;

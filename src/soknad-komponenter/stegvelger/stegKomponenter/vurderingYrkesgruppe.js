import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import { hentFaktaVerdi, lagAvklartfakta, konverterTilStegData } from '../../../regler/avklartefakta';

const VurderingYrkesgruppe = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettAllDataForSteg,
  } = props;
  const { harAvklaring, yrkesgruppe } = tilstand;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.YRKESGRUPPE, yrkesgruppe));
    return function cleanup() {
      slettAllDataForSteg();
    };
  }, []);

  const radioEndret = event => {
    oppdaterData(lagAvklartfakta(KV.Koder.YRKESGRUPPE, null, event.target.value));
  };

  const fakta = hentFaktaVerdi(yrkesgruppe);
  return (
    <div>
      <Nav.Undertittel>Vurdering av yrkesgruppe</Nav.Undertittel>
      <Nav.Fieldset legend="Vurder om søkeren er:">
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.ORDINAER}
          value={KV.Koder.VurderingYrkesgruppeTyper.ORDINAER}
          onChange={radioEndret}
          label="Yrkesaktiv" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP}
          value={KV.Koder.VurderingYrkesgruppeTyper.SOKKEL_ELLER_SKIP}
          onChange={radioEndret}
          label="Yrkesaktiv på sokkel eller skip" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL}
          value={KV.Koder.VurderingYrkesgruppeTyper.FLYENDE_PERSONELL}
          onChange={radioEndret}
          label="Yrkesaktiv som flyvende personell" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
          value={KV.Koder.VurderingYrkesgruppeTyper.IKKE_YRKESAKTIV}
          onChange={radioEndret}
          label="Ikke yrkesaktiv" />
        <Nav.Radio
          name="yrkesgruppe"
          disabled={!redigerbart}
          checked={fakta === KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
          value={KV.Koder.VurderingYrkesgruppeTyper.KONTANTYTELSESMOTTAKER}
          onChange={radioEndret}
          label="Kontantytelsesmottaker" />
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
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
};

VurderingYrkesgruppe.defaultProps = {
  tilstand: {},
};


export default VurderingYrkesgruppe;

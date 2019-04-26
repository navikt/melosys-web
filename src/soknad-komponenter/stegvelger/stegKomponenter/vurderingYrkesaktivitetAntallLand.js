import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as KV from '../../../kodeverk';
import { hentFaktaVerdi, lagAvklartfakta, konverterTilStegData } from '../../../regler/avklartefakta';

const VurderingYrkesaktivitetAntallLand = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettAllDataForSteg,
  } = props;
  const { harAvklaring, yrkesaktivitetAntallLand } = tilstand;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND, yrkesaktivitetAntallLand));
    return function cleanup() {
      slettAllDataForSteg();
    };
  }, []);

  const radioEndret = event => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND, null, event.target.value));
  };

  const fakta = hentFaktaVerdi(yrkesaktivitetAntallLand);
  return (
    <div>
      <Nav.Undertittel>Vurdering av antall land</Nav.Undertittel>
      <Nav.Fieldset disabled={!redigerbart} legend="Hvor mange land skal søker ha yrkesaktivitet i?">
        <Nav.Radio
          name="yrkesaktivitetAntallLand"
          checked={fakta === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.KUN_NORGE}
          value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.KUN_NORGE}
          onChange={radioEndret}
          label="Kun Norge" />
        <Nav.Radio
          name="yrkesaktivitetAntallLand"
          checked={fakta === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE}
          value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE}
          onChange={radioEndret}
          label="Ett land, ikke Norge" />
        <Nav.Radio
          name="yrkesaktivitetAntallLand"
          checked={fakta === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND}
          value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND}
          onChange={radioEndret}
          label="To eller flere land" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!redigerbart || !harAvklaring} type="hoved" className="fane__navigasjonsknapp" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
      </div>
    </div>
  );
};

VurderingYrkesaktivitetAntallLand.ID = 'YRKESAKTIVITET_ANTALL_LAND';

VurderingYrkesaktivitetAntallLand.propTypes = {
  bekreftOgFortsett: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
  tilstand: PT.object,
  oppdaterData: PT.func.isRequired,
  slettAllDataForSteg: PT.func.isRequired,
};

VurderingYrkesaktivitetAntallLand.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitetAntallLand;

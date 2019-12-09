import React, { useEffect } from 'react';
import PT from 'prop-types';

import * as Nav from '../../../../../utils/navFrontend';
import * as KV from '../../../../../kodeverk';
import { hentFaktaVerdi, lagAvklartfakta, konverterTilStegData } from '../../../../../regler/avklartefakta';
import { BOOLSK } from '../../../../../constants';

const VurderingYrkesaktivitetAntallLand = props => {
  const {
    bekreftOgFortsett, tilstand, redigerbart, oppdaterData, slettData,
  } = props;
  const { harAvklaring, yrkesaktivitetAntallLand } = tilstand;

  useEffect(() => {
    oppdaterData(konverterTilStegData(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND, yrkesaktivitetAntallLand));
    const cleanup = () => {
      slettData();
    };
    return cleanup;
  }, []);

  const radioEndret = event => {
    oppdaterData(lagAvklartfakta(KV.Koder.avklartefaktaKoder.YRKESAKTIVITET_ANTALL_LAND, null, event.target.value));
  };

  const fakta = hentFaktaVerdi(yrkesaktivitetAntallLand);
  return (
    <div>
      <Nav.typo.Undertittel>Skal søkeren ha yrkesaktivitet i ett eller flere land?</Nav.typo.Undertittel>
      <Nav.Fieldset disabled={!redigerbart} legend="">
        <Nav.Radio
          name="yrkesaktivitetAntallLand"
          checked={fakta === KV.Koder.VurderingYrkesaktivitetAntallLandTyper.KUN_NORGE}
          value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.KUN_NORGE}
          onChange={radioEndret}
          label="Ett land, Norge"
          disabled={BOOLSK.SANN} />
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
          label="To eller flere land (med regelmessig veksling)" />
      </Nav.Fieldset>
      <div className="fane__knapplinje">
        <Nav.Knapp disabled={!redigerbart || !harAvklaring} className="fane__navigasjonsknapp" data-cy-nesteknapp="knapp_steg2" onClick={bekreftOgFortsett}>Bekreft og fortsett</Nav.Knapp>
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
  slettData: PT.func.isRequired,
};

VurderingYrkesaktivitetAntallLand.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitetAntallLand;

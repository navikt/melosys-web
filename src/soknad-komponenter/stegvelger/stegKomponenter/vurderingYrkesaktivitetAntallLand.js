import React from 'react';
import PT from 'prop-types';

import * as Nav from '../../../utils/navFrontend';
import * as Skjema from '../../skjema';
import * as KV from '../../../kodeverk';

const VurderingYrkesaktivitetAntallLand = props => {
  const { bekreftOgFortsett, tilstand, redigerbart } = props;
  const { harAvklaring } = tilstand;

  return (
    <div>
      <Nav.Undertittel>Vurdering av antall land</Nav.Undertittel>
      <Nav.Fieldset disabled={!redigerbart} legend="Hvor mange land skal søker ha yrkesaktivitet i?">
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitetAntallLand" value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.KUN_NORGE} label="Kun Norge" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitetAntallLand" value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.ETT_LAND_IKKE_NORGE} label="Ett land, ikke Norge" />
        <Skjema.Radio feltNavn="avklartefakta.yrkesaktivitetAntallLand" value={KV.Koder.VurderingYrkesaktivitetAntallLandTyper.TO_ELLER_FLERE_LAND} label="To eller flere land" />
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
};

VurderingYrkesaktivitetAntallLand.defaultProps = {
  tilstand: {},
};

export default VurderingYrkesaktivitetAntallLand;

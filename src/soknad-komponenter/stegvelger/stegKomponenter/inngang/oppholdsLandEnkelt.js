import React, { useState } from 'react';
import PT from 'prop-types';
import Ikon from 'melosys-ikoner-assets';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as KV from '../../../../kodeverk';

import OppholdslandHandlingSlett from './oppholdslandHandlingSlett';

const EnkeltLand = ({ landKodeObjekt, settSlettIntensjon, redigerbart }) => (
  <div className="oppholdsland__linje">
    <div className="linje__land">{KV.objektTilTerm(landKodeObjekt)} ({KV.objektTilKode(landKodeObjekt)})</div>
    <div className="linje__knapper"><Nav.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={settSlettIntensjon} ><Ikon kind="minus" />Fjern</Nav.Knapp></div>
  </div>
);

EnkeltLand.propTypes = {
  landKodeObjekt: MPT.Kodeverk.isRequired,
  settSlettIntensjon: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

function OppholdsLandEnkelt(props) {
  const [erSlettingIntensjon, settSlettIntensjon] = useState(false);

  const avbryt = () => this.settSlettIntensjon(false);
  const {
    landKodeObjekt, bekreftFjern, oppholdBegrunnelser, redigerbart,
  } = props;
  return (
    <div>
      {erSlettingIntensjon ?
        <OppholdslandHandlingSlett
          oppholdBegrunnelser={oppholdBegrunnelser}
          landKodeObjekt={landKodeObjekt}
          bekreft={bekreftFjern}
          avbryt={avbryt}
          redigerbart={redigerbart}
        />
        :
        <EnkeltLand
          landKodeObjekt={landKodeObjekt}
          settSlettIntensjon={() => settSlettIntensjon(true)}
          redigerbart={redigerbart}
        />
      }
    </div>
  );
}

OppholdsLandEnkelt.propTypes = {
  bekreftFjern: PT.func.isRequired,
  landKodeObjekt: MPT.Kodeverk.isRequired,
  oppholdBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default OppholdsLandEnkelt;

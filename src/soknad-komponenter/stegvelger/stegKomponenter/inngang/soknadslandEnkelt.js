import React, { useState } from 'react';
import PT from 'prop-types';
import Ikon from 'melosys-ikoner-assets';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as KV from '../../../../kodeverk';

import SoknadslandHandlingSlett from './soknadslandHandlingSlett';

const EnkeltLand = ({ landKodeObjekt, settSlettIntensjon, redigerbart }) => (
  <div className="soknadsland__linje">
    <div className="linje__land">{KV.objektTilTerm(landKodeObjekt)} ({KV.objektTilKode(landKodeObjekt)})</div>
    <div className="linje__knapper"><Nav.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={settSlettIntensjon} ><Ikon kind="minus" />Fjern</Nav.Knapp></div>
  </div>
);

EnkeltLand.propTypes = {
  landKodeObjekt: MPT.Kodeverk.isRequired,
  settSlettIntensjon: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

function SoknadslandEnkelt(props) {
  const [erSlettingIntensjon, settSlettIntensjon] = useState(false);

  const avbryt = () => settSlettIntensjon(false);
  const {
    landKodeObjekt, bekreftFjern, soknadslandBegrunnelser, redigerbart,
  } = props;
  return (
    <div>
      {erSlettingIntensjon ?
        <SoknadslandHandlingSlett
          soknadslandBegrunnelser={soknadslandBegrunnelser}
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

SoknadslandEnkelt.propTypes = {
  bekreftFjern: PT.func.isRequired,
  landKodeObjekt: MPT.Kodeverk.isRequired,
  soknadslandBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default SoknadslandEnkelt;

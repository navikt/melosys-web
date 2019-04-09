import React, { useState } from 'react';
import PT from 'prop-types';
import Ikon from 'melosys-ikoner-assets';
import * as Nav from '../../../../utils/navFrontend';
import * as MPT from '../../../../proptypes';
import * as KV from '../../../../kodeverk';

import SoknadslandHandlingSlett from './soknadslandHandlingSlett';

const EnkeltLand = ({ landkodeObjekt, settSlettIntensjon, redigerbart }) => (
  <div className="soknadsland__linje">
    <div className="linje__land">{KV.objektTilTerm(landkodeObjekt)} ({KV.objektTilKode(landkodeObjekt)})</div>
    <div className="linje__knapper"><Nav.Knapp className="knappMedIkon" disabled={!redigerbart} onClick={settSlettIntensjon} ><Ikon kind="minus" />Fjern</Nav.Knapp></div>
  </div>
);

EnkeltLand.propTypes = {
  landkodeObjekt: MPT.Kodeverk.isRequired,
  settSlettIntensjon: PT.func.isRequired,
  redigerbart: PT.bool.isRequired,
};

function SoknadslandEnkelt(props) {
  const [erSlettingIntensjon, settSlettIntensjon] = useState(false);

  const avbryt = () => settSlettIntensjon(false);
  const {
    landkodeObjekt, bekreftFjern, soknadslandBegrunnelser, redigerbart,
  } = props;
  return (
    <div>
      {erSlettingIntensjon ?
        <SoknadslandHandlingSlett
          soknadslandBegrunnelser={soknadslandBegrunnelser}
          landkodeObjekt={landkodeObjekt}
          bekreft={bekreftFjern}
          avbryt={avbryt}
          redigerbart={redigerbart}
        />
        :
        <EnkeltLand
          landkodeObjekt={landkodeObjekt}
          settSlettIntensjon={() => settSlettIntensjon(true)}
          redigerbart={redigerbart}
        />
      }
    </div>
  );
}

SoknadslandEnkelt.propTypes = {
  bekreftFjern: PT.func.isRequired,
  landkodeObjekt: MPT.Kodeverk.isRequired,
  soknadslandBegrunnelser: PT.arrayOf(MPT.Kodeverk).isRequired,
  redigerbart: PT.bool.isRequired,
};

export default SoknadslandEnkelt;

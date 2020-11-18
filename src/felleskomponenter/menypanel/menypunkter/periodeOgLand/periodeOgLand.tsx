import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../etiketter';
import * as KV from '../../../../kodeverk';

import Soknadsperiode from './soknadsperiode';

interface PeriodeOgLandProps {
  visArbeidsforholdRolleEtiketter: boolean,
  redigerbart: boolean,
  lagreSoknadOgOppfriskSaksopplysninger: () => void,
}

const PeriodeOgLand = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
  lagreSoknadOgOppfriskSaksopplysninger,
}: PeriodeOgLandProps) => {
  return (
    <div>
      <div style={{ marginBottom: '1em' }}>
        <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.PeriodeOgLand.tittel}</Nav.typo.Undertittel>
        <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
        {
          visArbeidsforholdRolleEtiketter &&
          <Etiketter.ArbeidsgiversDel />
        }
      </div>
      <Soknadsperiode
        redigerbart={redigerbart}
        lagreSoknadOgOppfriskSaksopplysninger={lagreSoknadOgOppfriskSaksopplysninger}
      />
    </div>
  );
};

export default PeriodeOgLand;

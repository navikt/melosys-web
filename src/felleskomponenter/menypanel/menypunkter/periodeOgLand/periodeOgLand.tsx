import React from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../etiketter';
import * as KV from '../../../../kodeverk';

interface PeriodeOgLandProps {
  visArbeidsforholdRolleEtiketter: boolean,
  redigerbart: boolean,
}

const PeriodeOgLand = ({
  visArbeidsforholdRolleEtiketter,
  redigerbart,
}: PeriodeOgLandProps) => {
  return (
    <div>
      <div>
        <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.PeriodeOgLand.tittel}</Nav.typo.Undertittel>
        <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
        {
          visArbeidsforholdRolleEtiketter &&
          <Etiketter.ArbeidsgiversDel />
        }
      </div>
    </div>
  );
};

export default PeriodeOgLand;

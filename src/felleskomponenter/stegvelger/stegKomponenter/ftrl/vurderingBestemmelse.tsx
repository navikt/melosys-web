import React, { useState } from 'react';
import { KTObject } from '@navikt/melosys-kodeverk';

import MKV from '../../../../melosyskodeverk';

import * as Nav from '../../../../utils/navFrontend';

interface Props {
  bekreft: () => void,
  oppdater: () => void,
  tilbake: () => void,
  redigerbart: boolean,
}

const VurderingBestemmelse =
  ({
    bekreft,
    oppdater,
    tilbake,
    redigerbart,
  } : Props) => {
    const [valgtBestemmelse, setValgtBestemmelse] = useState('');
    const bestemmelser = MKV.KTObjects.folketrygdloven_kap2_bestemmelser.filter((ktobject: KTObject) => ['FTRL_KAP2_2_8_FØRSTE_LEDD_A', 'FTRL_KAP2_2_8_ANDRE_LEDD'].includes(ktobject.kode));

    return (
      <div>
        <Nav.typo.Undertittel className="undertittel">Hvilken bestemmelse skal søknaden vurderes etter?</Nav.typo.Undertittel>

        <Nav.Row>
          <Nav.Column xs="7">
            <Nav.Select label="Velg bestemmelse" disabled={!redigerbart} onChange={event => setValgtBestemmelse(event.target.value)}>
              <option disabled={!!valgtBestemmelse} value="">Velg</option>
              {bestemmelser.map((bestemmelse: KTObject) => <option key={bestemmelse.kode} value={bestemmelse.kode}>{bestemmelse.term}</option>)}
            </Nav.Select>
          </Nav.Column>
        </Nav.Row>

        <div className="fane__knapplinje">
          <Nav.Knapp
            mini
            disabled={false}
            className="fane__navigasjonsknapp"
            onClick={tilbake}>Tilbake
          </Nav.Knapp>
          <Nav.Hovedknapp
            mini
            disabled={!valgtBestemmelse}
            className="fane__navigasjonsknapp"
            onClick={bekreft}>Fortsett
          </Nav.Hovedknapp>
        </div>
      </div>
    );
  };


export default VurderingBestemmelse;

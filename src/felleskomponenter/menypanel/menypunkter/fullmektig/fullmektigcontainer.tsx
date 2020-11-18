import React from 'react';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../etiketter';

import Fullmektige from './fullmektige';

import './fullmektigcontainer.css';

interface FullmektigProps {
  redigerbart: boolean,
  visArbeidsforholdRolleEtiketter: boolean,
}

const Fullmektig = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
}: FullmektigProps) => (
  <div className="fullmektig__container">
    <div className="tittel">
      <Nav.typo.Undertittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Fullmektig.tittel}</Nav.typo.Undertittel>
      <Etiketter.FraSoknad style={{ marginRight: '0.3em' }} />
      {
        visArbeidsforholdRolleEtiketter &&
        <Etiketter.ArbeidsgiversDel />
      }
    </div>
    <Fullmektige redigerbart={redigerbart} />
  </div>
);

export default Fullmektig;

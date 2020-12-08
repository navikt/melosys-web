import React, { ReactNode } from 'react';

import * as KV from '../../../../kodeverk';
import * as Nav from '../../../../utils/navFrontend';
import * as Etiketter from '../../etiketter';

import Fullmektige from './fullmektige';

import './fullmektigcontainer.css';

interface FullmektigProps {
  redigerbart: boolean,
  visArbeidsforholdRolleEtiketter: boolean,
  behandlingsgrunnlagEtikett: ReactNode,
}

const Fullmektig = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  behandlingsgrunnlagEtikett,
}: FullmektigProps) => (
  <div className="fullmektig__container">
    <div className="tittel">
      <Nav.typo.Innholdstittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Fullmektig.tittel}</Nav.typo.Innholdstittel>
      <span>{behandlingsgrunnlagEtikett}</span>
      {
        visArbeidsforholdRolleEtiketter &&
        <Etiketter.ArbeidsgiversDel style={{ marginLeft: '0.3em' }} />
      }
    </div>
    <Fullmektige redigerbart={redigerbart} />
  </div>
);

export default Fullmektig;

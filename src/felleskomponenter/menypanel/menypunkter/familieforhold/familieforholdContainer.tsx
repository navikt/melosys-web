import React, { ReactNode } from 'react';

import * as Nav from '../../../../utils/navFrontend';
import * as Utils from '../../../../utils';
import * as KV from '../../../../kodeverk';
import * as Ikoner from '../../../../resources/images';
import * as Etiketter from '../../etiketter';
import * as MedfolgendeBarn from './medfolgendeBarn';

import Familiemedlemmer from './familiemedlemmer';
import EditerbartElementListe from '../editerbartElementListe';

import './familieforholdContainer.css';

interface FamilieforholdContainerProps {
  redigerbart: boolean,
  visArbeidsforholdRolleEtiketter: boolean,
  behandlingsgrunnlagEtikett: ReactNode,
}

const FamilieforholdContainer = ({
  redigerbart,
  visArbeidsforholdRolleEtiketter,
  behandlingsgrunnlagEtikett,
}: FamilieforholdContainerProps) => (
  <Nav.Container fluid className="familieforhold-container">
    <Nav.Row>
      <Nav.Column xs="12">
        <Nav.typo.Innholdstittel style={{ display: 'inline', marginRight: '1em' }}>{KV.Menypunkter.Familieforhold.tittel}</Nav.typo.Innholdstittel>
      </Nav.Column>
    </Nav.Row>
    <Nav.Row className="familiemedlemmer-row">
      <Nav.Column xs="12">
        <Familiemedlemmer />
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12" className="etikett-container">
        <span>{behandlingsgrunnlagEtikett}</span>
        {
          visArbeidsforholdRolleEtiketter &&
          <Etiketter.ArbeidstakersDel style={{ marginLeft: '0.3em' }} />
        }
      </Nav.Column>
    </Nav.Row>
    <Nav.Row>
      <Nav.Column xs="12">
        <EditerbartElementListe
          redigerbart={redigerbart}
          feltNavn="medfolgendeBarn"
          redigererKomponent={MedfolgendeBarn.Redigerer}
          redigeringUtfortKomponent={MedfolgendeBarn.RedigeringUtfort}
          ingenDataKomponent={MedfolgendeBarn.IngenData}
          leggTilTekst={elementer => (elementer.length > 0 ? 'Legg til ny rad' : 'Legg til barn')}
          hentDefaultElement={() => ({ uuid: Utils._uuid() })}
          tittelTekst={KV.Menypunkter.Familieforhold.undertitler.barnMedPaReisen}
          tittelIkon={Ikoner.ParentAndKid}
          tittelUnderstrek
          harData={elementListe => (
            (elementListe.length !== 0) && elementListe.every(v => v)
          )}
          flereRedigeringsknapper={false}
        />
      </Nav.Column>
    </Nav.Row>
  </Nav.Container>
);

export default FamilieforholdContainer;
